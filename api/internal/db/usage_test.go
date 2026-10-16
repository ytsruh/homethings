package db

import (
	"context"
	"database/sql"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	_ "turso.tech/database/tursogo"
)

// splitStatements splits a schema file on semicolons into executable parts.
func splitStatements(schema string) []string {
	var out []string
	for _, s := range strings.Split(schema, ";") {
		if s = strings.TrimSpace(s); s != "" {
			out = append(out, s)
		}
	}
	return out
}

// TestUsageRangeQueries exercises the real sqlc range queries against an
// embedded database: old rows must be excluded by the cutoff, recent rows
// aggregated per model and per UTC day.
func TestUsageRangeQueries(t *testing.T) {
	dir := t.TempDir()
	conn, err := sql.Open("turso", filepath.Join(dir, "usage-test.db"))
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
	now := time.Now().Unix()
	seed := []struct {
		id      string
		model   string
		prompt  int64
		created int64
	}{
		{"u-old", "model-a", 200, now - 40*86400}, // outside 30d window
		{"u-1a", "model-a", 100, now - 86400},     // yesterday
		{"u-1b", "model-a", 50, now - 3600},       // today
		{"u-2", "model-b", 10, now - 3600},        // today
	}
	for _, s := range seed {
		if _, err := conn.ExecContext(ctx,
			`INSERT INTO chat_token_usage (id, session_id, message_id, user_id, model, prompt_tokens, completion_tokens, total_tokens, created_at)
			 VALUES (?, 's1', NULL, 'user-1', ?, ?, 5, ?, ?)`,
			s.id, s.model, s.prompt, s.prompt+5, s.created); err != nil {
			t.Fatalf("seed %s: %v", s.id, err)
		}
	}

	since := now - 30*86400
	totals, err := q.SumTokenUsageSinceByUser(ctx, SumTokenUsageSinceByUserParams{
		UserID:    "user-1",
		CreatedAt: since,
	})
	if err != nil {
		t.Fatalf("sums: %v", err)
	}
	if len(totals) != 2 {
		t.Fatalf("expected 2 models, got %d: %+v", len(totals), totals)
	}
	byModel := map[string]SumTokenUsageSinceByUserRow{}
	for _, r := range totals {
		byModel[r.Model] = r
	}
	if got := byModel["model-a"].PromptTokens; got != 150 {
		t.Fatalf("model-a prompt = %d, want 150 (old row excluded)", got)
	}
	if got := byModel["model-a"].Turns; got != 2 {
		t.Fatalf("model-a turns = %d, want 2", got)
	}
	if got := byModel["model-b"].PromptTokens; got != 10 {
		t.Fatalf("model-b prompt = %d, want 10", got)
	}

	daily, err := q.DailyTokenUsageByUser(ctx, DailyTokenUsageByUserParams{
		UserID:    "user-1",
		CreatedAt: since,
	})
	if err != nil {
		t.Fatalf("daily: %v", err)
	}
	// Expect yesterday/model-a, today/model-a, today/model-b = 3 rows.
	if len(daily) != 3 {
		t.Fatalf("expected 3 daily rows, got %d: %+v", len(daily), daily)
	}
	yesterday := time.Unix(now-86400, 0).UTC().Format("2006-01-02")
	found := false
	for _, r := range daily {
		day, ok := r.Day.(string)
		if !ok {
			if b, ok := r.Day.([]byte); ok {
				day = string(b)
			} else {
				t.Fatalf("unexpected day type %T", r.Day)
			}
		}
		if r.Model == "model-a" && day == yesterday && r.PromptTokens == 100 {
			found = true
		}
	}
	if !found {
		t.Fatalf("yesterday model-a row missing in %+v", daily)
	}
}
