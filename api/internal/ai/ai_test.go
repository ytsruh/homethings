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
		switch m.Transport {
		case TransportChatCompletions, TransportAnthropicMessages, TransportResponses:
		default:
			t.Fatalf("model %q has unknown transport %q", m.ID, m.Transport)
		}
		if m.SupportsImages {
			visionModels++
		}
	}
	if visionModels == 0 {
		t.Fatal("expected at least one vision-capable model")
	}
	vision, err := GetChatModel("@cf/zai-org/glm-5.3-flash")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !vision.SupportsImages {
		t.Fatal("expected GLM 5.3 Flash to support images")
	}
	plain, err := GetChatModel("google/gemini-3.8-flash")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if plain.SupportsImages {
		t.Fatal("expected Gemini 3.8 Flash to be text-only")
	}
	argon, err := GetChatModel("google/gemini-4-argon")
	if err != nil {
		t.Fatalf("expected Gemini 4 Argon in catalog: %v", err)
	}
	if argon.Transport != TransportChatCompletions {
		t.Fatalf("expected Argon on chat_completions, got %q", argon.Transport)
	}
	for _, tc := range []struct {
		id        string
		transport ModelTransport
	}{
		{"meta/muse-spark-1.3", TransportResponses},
		{"meta/muse-wonder-1.0", TransportResponses},
		{"anthropic/claude-haiku-5.5", TransportAnthropicMessages},
	} {
		entry, err := GetChatModel(tc.id)
		if err != nil {
			t.Fatalf("expected %q in catalog: %v", tc.id, err)
		}
		if entry.Transport != tc.transport {
			t.Fatalf("expected %q on %q, got %q", tc.id, tc.transport, entry.Transport)
		}
		if entry.SupportsImages {
			t.Fatalf("expected %q to be text-only until vision is verified", tc.id)
		}
	}
}

func TestOpenAIMessagesToAnthropic(t *testing.T) {
	msgs := []openAIMessage{
		{Role: "system", Content: "Be brief."},
		{Role: "user", Content: "Hello"},
		{Role: "assistant", Content: "Hi"},
	}
	system, converted := openAIMessagesToAnthropic(msgs)
	if system != "Be brief." {
		t.Fatalf("expected system extracted, got %q", system)
	}
	if len(converted) != 2 {
		t.Fatalf("expected 2 messages, got %d", len(converted))
	}
	if converted[0].Role != "user" {
		t.Fatalf("unexpected role %q", converted[0].Role)
	}
	if text, ok := converted[0].Content.(string); !ok || text != "Hello" {
		t.Fatalf("unexpected content %+v", converted[0].Content)
	}
}

func TestOpenAIMessagesToAnthropicImages(t *testing.T) {
	imgURL := "data:image/png;base64," + strings.Repeat("a", 20)
	msgs := []openAIMessage{{
		Role: "user",
		Content: []openAIContentPart{
			{Type: "text", Text: "What is this?"},
			{Type: "image_url", ImageURL: &struct {
				URL string `json:"url"`
			}{URL: imgURL}},
		},
	}}
	_, converted := openAIMessagesToAnthropic(msgs)
	if len(converted) != 1 {
		t.Fatalf("expected 1 message, got %d", len(converted))
	}
	blocks, ok := converted[0].Content.([]anthropicContentBlock)
	if !ok {
		t.Fatalf("expected blocks, got %T", converted[0].Content)
	}
	if len(blocks) != 2 || blocks[0].Type != "text" || blocks[1].Type != "image" {
		t.Fatalf("unexpected blocks %+v", blocks)
	}
	if blocks[1].Source == nil || blocks[1].Source.MediaType != "image/png" {
		t.Fatalf("bad image source %+v", blocks[1].Source)
	}
}

func TestExtractAnthropicDeltas(t *testing.T) {
	upstream := "event: message_start\n" +
		"data: {\"type\":\"message_start\",\"message\":{\"usage\":{\"input_tokens\":12}}}\n\n" +
		"event: content_block_delta\n" +
		"data: {\"type\":\"content_block_delta\",\"delta\":{\"type\":\"text_delta\",\"text\":\"Hello\"}}\n\n" +
		"data: {\"type\":\"content_block_delta\",\"delta\":{\"type\":\"text_delta\",\"text\":\" world\"}}\n\n" +
		"event: message_delta\n" +
		"data: {\"type\":\"message_delta\",\"delta\":{\"stop_reason\":\"end_turn\"},\"usage\":{\"output_tokens\":5}}\n\n" +
		"data: [DONE]\n\n"
	var deltas []string
	finish, usage, err := extractAnthropicDeltas(strings.NewReader(upstream), func(s string) {
		deltas = append(deltas, s)
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if got := strings.Join(deltas, ""); got != "Hello world" {
		t.Fatalf("unexpected deltas %q", got)
	}
	if finish != "stop" {
		t.Fatalf("expected stop, got %q", finish)
	}
	if usage == nil || usage.PromptTokens == nil || *usage.PromptTokens != 12 {
		t.Fatalf("bad prompt usage %+v", usage)
	}
	if usage.CompletionTokens == nil || *usage.CompletionTokens != 5 {
		t.Fatalf("bad completion usage %+v", usage)
	}
	if usage.TotalTokens == nil || *usage.TotalTokens != 17 {
		t.Fatalf("bad total usage %+v", usage)
	}
}

func TestMapAnthropicStopReason(t *testing.T) {
	if got := mapAnthropicStopReason("end_turn"); got != "stop" {
		t.Fatalf("expected stop, got %q", got)
	}
	if got := mapAnthropicStopReason("max_tokens"); got != "length" {
		t.Fatalf("expected length, got %q", got)
	}
}

func TestExtractResponsesDeltas(t *testing.T) {
	upstream := "event: response.output_text.delta\n" +
		"data: {\"type\":\"response.output_text.delta\",\"delta\":\"Hello\"}\n\n" +
		"data: {\"type\":\"response.output_text.delta\",\"delta\":\" world\"}\n\n" +
		"event: response.completed\n" +
		"data: {\"type\":\"response.completed\",\"response\":{\"status\":\"completed\",\"usage\":{\"input_tokens\":8,\"output_tokens\":4,\"total_tokens\":12}}}\n\n" +
		"data: [DONE]\n\n"
	var deltas []string
	finish, usage, err := extractResponsesDeltas(strings.NewReader(upstream), func(s string) {
		deltas = append(deltas, s)
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if got := strings.Join(deltas, ""); got != "Hello world" {
		t.Fatalf("unexpected deltas %q", got)
	}
	if finish != "stop" {
		t.Fatalf("expected stop, got %q", finish)
	}
	if usage == nil || usage.PromptTokens == nil || *usage.PromptTokens != 8 {
		t.Fatalf("bad prompt usage %+v", usage)
	}
	if usage.CompletionTokens == nil || *usage.CompletionTokens != 4 {
		t.Fatalf("bad completion usage %+v", usage)
	}
	if usage.TotalTokens == nil || *usage.TotalTokens != 12 {
		t.Fatalf("bad total usage %+v", usage)
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
