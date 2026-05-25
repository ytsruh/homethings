package db

import (
	"context"
	"database/sql"
	"embed"
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
	"time"

	"github.com/pressly/goose/v3"
	turso "turso.tech/database/tursogo"
)

const syncInterval = 30 * time.Second

type DB struct {
	conn    *sql.DB
	syncDb  *turso.TursoSyncDb
	closeCh chan struct{}
}

func NewConnection(dbPath, tursoURL, tursoAuthToken string) (*DB, error) {
	ctx := context.Background()

	resolvedPath, err := resolveDBPath(dbPath)
	if err != nil {
		return nil, fmt.Errorf("failed to resolve database path: %w", err)
	}

	if err := ensureDatabaseDir(resolvedPath); err != nil {
		return nil, fmt.Errorf("failed to initialize database directory: %w", err)
	}

	syncDb, err := turso.NewTursoSyncDb(ctx, turso.TursoSyncDbConfig{
		Path:      resolvedPath,
		RemoteUrl: tursoURL,
		AuthToken: tursoAuthToken,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create turso sync db: %w", err)
	}

	conn, err := syncDb.Connect(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	if err := conn.Ping(); err != nil {
		_ = conn.Close()
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	db := &DB{
		conn:    conn,
		syncDb:  syncDb,
		closeCh: make(chan struct{}),
	}

	if err := db.migrate(); err != nil {
		_ = db.Close()
		return nil, fmt.Errorf("failed to run migrations: %w", err)
	}

	if _, err := db.syncDb.Pull(ctx); err != nil {
		fmt.Printf("warning: failed to pull remote changes on startup: %v\n", err)
	}

	db.startBackgroundSync()

	return db, nil
}

func (d *DB) Conn() *sql.DB {
	return d.conn
}

func (d *DB) Close() error {
	if d.closeCh != nil {
		close(d.closeCh)
	}
	return d.conn.Close()
}

func resolveDBPath(dbPath string) (string, error) {
	if dbPath == ":memory:" || filepath.IsAbs(dbPath) {
		return dbPath, nil
	}

	cwd, err := os.Getwd()
	if err != nil {
		return "", fmt.Errorf("failed to get current working directory: %w", err)
	}

	return filepath.Join(cwd, dbPath), nil
}

func ensureDatabaseDir(dbPath string) error {
	dir := filepath.Dir(dbPath)

	info, err := os.Stat(dir)
	if err == nil {
		if info.IsDir() {
			return nil
		}
		return fmt.Errorf("database path parent %q exists but is not a directory", dir)
	}

	if !os.IsNotExist(err) {
		return fmt.Errorf("failed to check database directory %q: %w", dir, err)
	}

	if err := os.MkdirAll(dir, 0755); err != nil {
		return fmt.Errorf("database directory %q does not exist and could not be created: %w", dir, err)
	}
	return nil
}

//go:embed migrations/*.sql
var migrationsFS embed.FS

func (d *DB) migrate() error {
	fsys, err := fs.Sub(migrationsFS, "migrations")
	if err != nil {
		return fmt.Errorf("failed to open embedded migrations: %w", err)
	}

	provider, err := goose.NewProvider(goose.DialectSQLite3, d.conn, fsys)
	if err != nil {
		return fmt.Errorf("failed to create migration provider: %w", err)
	}

	ctx := context.Background()
	if _, err := provider.Up(ctx); err != nil {
		return fmt.Errorf("failed to apply migrations: %w", err)
	}

	return nil
}

func (d *DB) startBackgroundSync() {
	go func() {
		ticker := time.NewTicker(syncInterval)
		defer ticker.Stop()

		for {
			select {
			case <-ticker.C:
				ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
				if err := d.syncDb.Push(ctx); err != nil {
					fmt.Printf("warning: background sync push failed: %v\n", err)
				}
				if _, err := d.syncDb.Pull(ctx); err != nil {
					fmt.Printf("warning: background sync pull failed: %v\n", err)
				}
				cancel()
			case <-d.closeCh:
				return
			}
		}
	}()
}

func (d *DB) Transaction(fn func(*sql.Tx) error) error {
	tx, err := d.conn.Begin()
	if err != nil {
		return err
	}

	if err := fn(tx); err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit()
}

func (d *DB) Queries() *Queries {
	return New(d.conn)
}
