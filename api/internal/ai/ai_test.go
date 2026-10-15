package ai

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/labstack/echo/v4"
)

func TestToModelMessagesUIMessageParts(t *testing.T) {
	req := chatRequest{
		Messages: []uiMessage{
			{
				Role: "user",
				Parts: []uiMessagePart{
					{Type: "text", Text: "Hello"},
					{Type: "text", Text: "world"},
				},
			},
			{Role: "assistant", Parts: []uiMessagePart{{Type: "text", Text: "Hi there"}}},
		},
	}

	got := toModelMessages(req.Messages)
	if len(got) != 2 {
		t.Fatalf("expected 2 messages, got %d", len(got))
	}
	if got[0].Content != "Hello\nworld" {
		t.Fatalf("unexpected joined content: %q", got[0].Content)
	}
}

func TestToModelMessagesClassicContent(t *testing.T) {
	content := "  classic shape  "
	req := chatRequest{
		Messages: []uiMessage{
			{Role: "user", Content: &content},
			{Role: "weird", Content: &content},
			{Role: "user"},
		},
	}

	got := toModelMessages(req.Messages)
	if len(got) != 1 {
		t.Fatalf("expected 1 message, got %d", len(got))
	}
	if got[0].Content != "classic shape" {
		t.Fatalf("unexpected content: %q", got[0].Content)
	}
}

func TestChatRequiresConfig(t *testing.T) {
	t.Setenv("CLOUDFLARE_ACCOUNT_ID", "")
	t.Setenv("CLOUDFLARE_API_TOKEN", "")

	e := echo.New()
	req := httptest.NewRequest(http.MethodPost, "/api/chat", strings.NewReader(`{"messages":[]}`))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	if err := NewHandler().Chat(e.NewContext(req, rec)); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if rec.Code != http.StatusServiceUnavailable {
		t.Fatalf("expected 503, got %d", rec.Code)
	}
}

func TestChatRejectsEmptyMessages(t *testing.T) {
	t.Setenv("CLOUDFLARE_ACCOUNT_ID", "test-account")
	t.Setenv("CLOUDFLARE_API_TOKEN", "test-token")

	e := echo.New()
	req := httptest.NewRequest(http.MethodPost, "/api/chat", strings.NewReader(`{"messages":[]}`))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	if err := NewHandler().Chat(e.NewContext(req, rec)); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if rec.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d: %s", rec.Code, rec.Body.String())
	}
}

func TestResolveChatModel(t *testing.T) {
	if got, err := ResolveChatModel(""); err != nil || got != DefaultChatModelID {
		t.Fatalf("expected default %q, got %q (err=%v)", DefaultChatModelID, got, err)
	}
	for _, m := range SupportedChatModels {
		if got, err := ResolveChatModel(m.ID); err != nil || got != m.ID {
			t.Fatalf("expected %q, got %q (err=%v)", m.ID, got, err)
		}
	}
	if _, err := ResolveChatModel("@cf/meta/nope"); err == nil {
		t.Fatal("expected error for unknown model")
	}
}

func TestExtractDeltas(t *testing.T) {
	upstream := "data: {\"choices\":[{\"delta\":{\"content\":\"Hello\"}}]}\n\n" +
		"data: {\"choices\":[{\"delta\":{\"content\":\" world\"}}]}\n\n" +
		"data: {\"choices\":[{\"delta\":{}}]}\n\n" +
		"data: [DONE]\n\n"

	var deltas []string
	if err := extractDeltas(strings.NewReader(upstream), func(s string) {
		deltas = append(deltas, s)
	}); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	got := strings.Join(deltas, "")
	if got != "Hello world" {
		t.Fatalf("unexpected deltas: %q", got)
	}
}
