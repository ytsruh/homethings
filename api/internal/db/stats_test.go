package db

import (
	"context"
	"database/sql"
	"os"
	"path/filepath"
	"testing"

	_ "turso.tech/database/tursogo"
)

// TestCountQueries seeds notes for two users plus shared recipes and checks
// that note counts are per-user while the recipe count is global.
func TestCountQueries(t *testing.T) {
	dir := t.TempDir()
	conn, err := sql.Open("turso", filepath.Join(dir, "stats-test.db"))
	if err != nil {
		t.Fatalf("open db: %v", err)
	}
	defer conn.Close()

	schema, err := os.ReadFile("schema.sql")
	if err != nil {
		t.Fatalf("read schema: %v", err)
	}
	for _, stmt := range splitStatements(string(schema)) {
		if _, err := conn.ExecContext(context.Background(), stmt); err != nil {
			t.Fatalf("apply schema %q: %v", stmt, err)
		}
	}

	q := New(conn)
	ctx := context.Background()
	notes := []struct {
		id        string
		completed int64
		createdBy string
	}{
		{"n1", 0, "user-1"},
		{"n2", 0, "user-1"},
		{"n3", 1, "user-1"},
		{"n4", 0, "user-2"},
	}
	for _, n := range notes {
		if _, err := conn.ExecContext(ctx,
			`INSERT INTO notes (id, title, body, priority, completed, created_by, created_at, updated_at)
			 VALUES (?, 't', NULL, 'medium', ?, ?, 1, 1)`,
			n.id, n.completed, n.createdBy); err != nil {
			t.Fatalf("seed note %s: %v", n.id, err)
		}
	}
	for _, id := range []string{"r1", "r2"} {
		if _, err := conn.ExecContext(ctx,
			`INSERT INTO recipes (id, title, created_at, updated_at) VALUES (?, 't', 1, 1)`,
			id); err != nil {
			t.Fatalf("seed recipe %s: %v", id, err)
		}
	}

	open, err := q.CountNotesByCompletion(ctx, CountNotesByCompletionParams{Completed: 0, CreatedBy: "user-1"})
	if err != nil {
		t.Fatalf("count open: %v", err)
	}
	if open != 2 {
		t.Fatalf("user-1 open notes = %d, want 2", open)
	}
	completed, err := q.CountNotesByCompletion(ctx, CountNotesByCompletionParams{Completed: 1, CreatedBy: "user-1"})
	if err != nil {
		t.Fatalf("count completed: %v", err)
	}
	if completed != 1 {
		t.Fatalf("user-1 completed notes = %d, want 1", completed)
	}
	other, err := q.CountNotesByCompletion(ctx, CountNotesByCompletionParams{Completed: 0, CreatedBy: "user-2"})
	if err != nil {
		t.Fatalf("count other user: %v", err)
	}
	if other != 1 {
		t.Fatalf("user-2 open notes = %d, want 1", other)
	}
	total, err := q.CountRecipes(ctx)
	if err != nil {
		t.Fatalf("count recipes: %v", err)
	}
	if total != 2 {
		t.Fatalf("recipes = %d, want 2", total)
	}
}
