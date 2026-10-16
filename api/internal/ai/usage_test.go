package ai

import (
	"database/sql"
	"testing"
)

func TestParseDaysParam(t *testing.T) {
	valid := map[string]int{"1": 1, "30": 30, "90": 90, "07": 7}
	for in, want := range valid {
		got, ok := parseDaysParam(in)
		if !ok || got != want {
			t.Fatalf("parseDaysParam(%q) = (%d, %v), want (%d, true)", in, got, ok, want)
		}
	}
	for _, in := range []string{"", "0", "91", "abc", "30d", "-5", " 30 "} {
		if _, ok := parseDaysParam(in); ok {
			t.Fatalf("parseDaysParam(%q) should be invalid", in)
		}
	}
}

func TestDayString(t *testing.T) {
	if got := dayString("2026-10-16"); got != "2026-10-16" {
		t.Fatalf("unexpected day string: %q", got)
	}
	if got := dayString([]byte("2026-10-15")); got != "2026-10-15" {
		t.Fatalf("unexpected day bytes: %q", got)
	}
	if got := dayString(sql.NullString{String: "2026-10-14", Valid: true}); got != "2026-10-14" {
		t.Fatalf("unexpected null string: %q", got)
	}
	if got := dayString(nil); got != "" {
		t.Fatalf("expected empty for nil, got %q", got)
	}
}
