package ai

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/labstack/echo/v4"
	"ytsruh.com/homethings/internal/utils"
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

	got, err := toModelMessages(req.Messages)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(got) != 2 {
		t.Fatalf("expected 2 messages, got %d", len(got))
	}
	text, ok := got[0].Content.(string)
	if !ok {
		t.Fatalf("expected string content, got %T", got[0].Content)
	}
	if text != "Hello\nworld" {
		t.Fatalf("unexpected joined content: %q", text)
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

	got, err := toModelMessages(req.Messages)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(got) != 1 {
		t.Fatalf("expected 1 message, got %d", len(got))
	}
	text, ok := got[0].Content.(string)
	if !ok {
		t.Fatalf("expected string content, got %T", got[0].Content)
	}
	if text != "classic shape" {
		t.Fatalf("unexpected content: %q", text)
	}
}

func TestChatRequiresConfig(t *testing.T) {
	t.Setenv("CLOUDFLARE_ACCOUNT_ID", "")
	t.Setenv("CLOUDFLARE_API_TOKEN", "")

	e := echo.New()
	req := httptest.NewRequest(http.MethodPost, "/api/chat", strings.NewReader(`{"messages":[]}`))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	if err := NewHandler(nil).Chat(e.NewContext(req, rec)); err != nil {
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
	ctx := e.NewContext(req, rec)
	ctx.Set("user", &utils.UserPayload{UserID: "user-1", Email: "a@example.com"})

	if err := NewHandler(nil).Chat(ctx); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if rec.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d: %s", rec.Code, rec.Body.String())
	}
}

func TestChatRequiresAuth(t *testing.T) {
	t.Setenv("CLOUDFLARE_ACCOUNT_ID", "test-account")
	t.Setenv("CLOUDFLARE_API_TOKEN", "test-token")

	e := echo.New()
	req := httptest.NewRequest(http.MethodPost, "/api/chat", strings.NewReader(`{"messages":[{"role":"user","content":"hi"}]}`))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	if err := NewHandler(nil).Chat(e.NewContext(req, rec)); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if rec.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d: %s", rec.Code, rec.Body.String())
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

func TestMapUpstreamError(t *testing.T) {
	cases := []struct {
		name       string
		status     int
		detail     string
		wantCode   string
		wantStatus int
	}{
		{"deprecated model", 410, `{"errors":[{"message":"AiError: Model has been deprecated"}]}`, codeModelUnavailable, 502},
		{"deprecation text", 400, "model was deprecated on 2026-05-30", codeModelUnavailable, 502},
		{"renamed model", 400, `{"errors":[{"message":"AiError: No such model: No such model @cf/mistral/mistral-small-3.1","code":5007}]}`, codeModelUnavailable, 502},
		{"rate limited", 429, "slow down", codeRateLimited, 502},
		{"unauthorized", 401, "invalid token", codeProviderAuth, 502},
		{"forbidden", 403, "forbidden", codeProviderAuth, 502},
		{"server error", 500, "boom", codeProviderError, 502},
		{"other client error", 400, "bad stuff", codeProviderError, 502},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			got := mapUpstreamError(tc.status, tc.detail)
			if got.Code != tc.wantCode {
				t.Fatalf("expected code %q, got %q", tc.wantCode, got.Code)
			}
			if got.StatusCode != tc.wantStatus {
				t.Fatalf("expected status %d, got %d", tc.wantStatus, got.StatusCode)
			}
			if strings.Contains(got.Message, tc.detail) && tc.detail != "" && len(tc.detail) > 20 {
				t.Fatalf("user message leaks raw detail: %q", got.Message)
			}
		})
	}
}

func TestTrimHistory(t *testing.T) {
	makeMsgs := func(n int, size int) []openAIMessage {
		msgs := make([]openAIMessage, n)
		for i := range msgs {
			msgs[i] = openAIMessage{Role: "user", Content: strings.Repeat("x", size)}
		}
		return msgs
	}

	t.Run("under budget unchanged", func(t *testing.T) {
		msgs := makeMsgs(3, 10)
		if got := trimHistory(msgs); len(got) != 3 {
			t.Fatalf("expected 3, got %d", len(got))
		}
	})

	t.Run("caps message count", func(t *testing.T) {
		msgs := makeMsgs(MaxHistoryMessages+5, 10)
		if got := trimHistory(msgs); len(got) != MaxHistoryMessages {
			t.Fatalf("expected %d, got %d", MaxHistoryMessages, len(got))
		}
	})

	t.Run("caps characters keeping newest", func(t *testing.T) {
		msgs := makeMsgs(5, MaxHistoryChars)
		got := trimHistory(msgs)
		if len(got) != 1 {
			t.Fatalf("expected only newest retained, got %d", len(got))
		}
		if &got[0] != &msgs[len(msgs)-1] {
			t.Fatal("expected the newest message to be retained")
		}
	})

	t.Run("single huge message retained", func(t *testing.T) {
		msgs := makeMsgs(1, MaxHistoryChars+100)
		if got := trimHistory(msgs); len(got) != 1 {
			t.Fatalf("expected 1, got %d", len(got))
		}
	})

	t.Run("empty stays empty", func(t *testing.T) {
		if got := trimHistory(nil); len(got) != 0 {
			t.Fatalf("expected 0, got %d", len(got))
		}
	})
}

func TestExtractDeltas(t *testing.T) {
	upstream := "data: {\"choices\":[{\"delta\":{\"content\":\"Hello\"}}]}\n\n" +
		"data: {\"choices\":[{\"delta\":{\"content\":\" world\"}}]}\n\n" +
		"data: {\"choices\":[{\"delta\":{}}]}\n\n" +
		"data: [DONE]\n\n"

	var deltas []string
	finish, _, err := extractDeltas(strings.NewReader(upstream), func(s string) {
		deltas = append(deltas, s)
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if finish != "" {
		t.Fatalf("expected empty finish reason, got %q", finish)
	}

	got := strings.Join(deltas, "")
	if got != "Hello world" {
		t.Fatalf("unexpected deltas: %q", got)
	}
}

func TestExtractDeltasFinishReason(t *testing.T) {
	upstream := "data: {\"choices\":[{\"delta\":{\"content\":\"Hi\"},\"finish_reason\":\"length\"}]}\n\n" +
		"data: [DONE]\n\n"

	var deltas []string
	finish, _, err := extractDeltas(strings.NewReader(upstream), func(s string) {
		deltas = append(deltas, s)
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if finish != "length" {
		t.Fatalf("expected finish reason %q, got %q", "length", finish)
	}
	if strings.Join(deltas, "") != "Hi" {
		t.Fatalf("unexpected deltas: %q", deltas)
	}
}

func TestModelCatalogCapabilities(t *testing.T) {
	visionModels := 0
	for _, m := range SupportedChatModels {
		if m.ContextWindow <= 0 {
			t.Fatalf("model %q missing context window", m.ID)
		}
		if m.SupportsImages {
			visionModels++
		}
	}
	if visionModels == 0 {
		t.Fatal("expected at least one vision-capable model")
	}
	vision, err := GetChatModel("@cf/mistralai/mistral-small-3.1-24b-instruct")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !vision.SupportsImages {
		t.Fatal("expected Mistral Small 3.1 to support images")
	}
	plain, err := GetChatModel("@cf/meta/llama-3.3-70b-instruct-fp8-fast")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if plain.SupportsImages {
		t.Fatal("expected Llama 3.3 to be text-only")
	}
}

func TestToModelMessagesWithImages(t *testing.T) {
	imgURL := "data:image/png;base64," + strings.Repeat("a", 100)
	got, err := toModelMessages([]uiMessage{{
		Role: "user",
		Parts: []uiMessagePart{
			{Type: "text", Text: "What is this?"},
			{Type: "file", MediaType: "image/png", URL: imgURL},
		},
	}})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(got) != 1 {
		t.Fatalf("expected 1 message, got %d", len(got))
	}
	parts, ok := got[0].Content.([]openAIContentPart)
	if !ok {
		t.Fatalf("expected multimodal content, got %T", got[0].Content)
	}
	if len(parts) != 2 || parts[0].Type != "text" || parts[1].Type != "image_url" {
		t.Fatalf("unexpected parts: %+v", parts)
	}
	if parts[1].ImageURL == nil || parts[1].ImageURL.URL != imgURL {
		t.Fatal("image URL not preserved")
	}
}

func TestToModelMessagesRejectsTooManyImages(t *testing.T) {
	parts := []uiMessagePart{{Type: "text", Text: "hi"}}
	for i := 0; i < MaxImagesPerMessage+1; i++ {
		parts = append(parts, uiMessagePart{
			Type:      "file",
			MediaType: "image/png",
			URL:       "data:image/png;base64," + strings.Repeat("a", 10),
		})
	}
	if _, err := toModelMessages([]uiMessage{{Role: "user", Parts: parts}}); err == nil {
		t.Fatal("expected error for too many images")
	}
}

func TestToModelMessagesRejectsBadImageType(t *testing.T) {
	got, err := toModelMessages([]uiMessage{{
		Role:  "user",
		Parts: []uiMessagePart{{Type: "file", MediaType: "image/bmp", URL: "data:image/bmp;base64,aaaa"}},
	}})
	_ = got
	if err == nil {
		t.Fatal("expected error for unsupported image type")
	}
}

func TestExtractDeltasUsage(t *testing.T) {
	upstream := "data: {\"choices\":[{\"delta\":{\"content\":\"Hi\"}}]}\n\n" +
		"data: {\"choices\":[{\"delta\":{}}],\"usage\":{\"prompt_tokens\":10,\"completion_tokens\":5,\"total_tokens\":15}}\n\n" +
		"data: [DONE]\n\n"
	var deltas []string
	_, usage, err := extractDeltas(strings.NewReader(upstream), func(s string) {
		deltas = append(deltas, s)
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if usage == nil {
		t.Fatal("expected usage, got nil")
	}
	if usage.PromptTokens == nil || *usage.PromptTokens != 10 {
		t.Fatalf("unexpected prompt tokens: %+v", usage)
	}
	if usage.TotalTokens == nil || *usage.TotalTokens != 15 {
		t.Fatalf("unexpected total tokens: %+v", usage)
	}
}

func TestSessionTitle(t *testing.T) {
	if got := sessionTitle("  hello   world  "); got != "hello world" {
		t.Fatalf("unexpected title: %q", got)
	}
	if got := sessionTitle(""); got != "New chat" {
		t.Fatalf("unexpected title: %q", got)
	}
	long := strings.Repeat("a", maxSessionTitleRunes+20)
	if got := sessionTitle(long); len([]rune(got)) != maxSessionTitleRunes {
		t.Fatalf("expected truncated title of %d runes, got %q", maxSessionTitleRunes, got)
	}
}

func TestStoredMessageRoundTrip(t *testing.T) {
	original := openAIMessage{Role: "user", Content: []openAIContentPart{
		{Type: "text", Text: "look"},
		{Type: "image_url", ImageURL: &struct {
			URL string `json:"url"`
		}{URL: "data:image/png;base64,aaaa"}},
	}}
	encoded := encodeMessageContent(original)
	decoded, err := decodeStoredMessage(encoded)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	parts := messageToUIParts(decoded)
	if len(parts) != 2 {
		t.Fatalf("expected 2 display parts, got %v", parts)
	}
	if parts[1]["type"] != "file" || parts[1]["url"] != "data:image/png;base64,aaaa" {
		t.Fatalf("unexpected file part: %v", parts[1])
	}
}
