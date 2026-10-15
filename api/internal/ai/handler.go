package ai

import (
	"net/http"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

// Handler serves the chat endpoint. It is stateless: the client sends the
// full message history on every request.
type Handler struct{}

// NewHandler creates a chat Handler.
func NewHandler() *Handler {
	return &Handler{}
}

// Chat proxies the conversation to Cloudflare Workers AI and streams the
// response back using the Vercel AI SDK data stream protocol, so the
// frontend can consume it with useChat and DefaultChatTransport.
func (h *Handler) Chat(c echo.Context) error {
	cfg := LoadConfig()
	if err := cfg.Validate(); err != nil {
		return c.JSON(http.StatusServiceUnavailable, map[string]string{"message": err.Error()})
	}

	var req chatRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "Invalid request body"})
	}

	model, err := ResolveChatModel(req.Model)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": err.Error()})
	}

	modelMessages := append(
		[]openAIMessage{{Role: "system", Content: SystemPrompt}},
		toModelMessages(req.Messages)...,
	)
	if len(modelMessages) <= 1 {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "At least one message is required"})
	}

	ctx := c.Request().Context()
	upstream, err := cfg.chatCompletionsStream(ctx, model, modelMessages)
	if err != nil {
		return c.JSON(http.StatusBadGateway, map[string]string{"message": err.Error()})
	}
	defer upstream.Body.Close()

	res := c.Response()
	header := res.Header()
	header.Set("Content-Type", "text/event-stream")
	header.Set("Cache-Control", "no-cache")
	header.Set("Connection", "keep-alive")
	header.Set("X-Accel-Buffering", "no")
	header.Set("x-vercel-ai-ui-message-stream", "v1")

	flusher, ok := res.Writer.(http.Flusher)
	if !ok {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Streaming not supported"})
	}
	res.WriteHeader(http.StatusOK)

	messageID := uuid.NewString()
	textID := uuid.NewString()

	frames := []any{
		map[string]string{"type": "start", "messageId": messageID},
		map[string]string{"type": "start-step"},
		map[string]string{"type": "text-start", "id": textID},
	}
	for _, frame := range frames {
		if err := writePart(res, flusher, frame); err != nil {
			return nil
		}
	}

	deltaErr := extractDeltas(upstream.Body, func(delta string) {
		_ = writePart(res, flusher, map[string]string{
			"type":  "text-delta",
			"id":    textID,
			"delta": delta,
		})
	})
	if deltaErr != nil {
		_ = writePart(res, flusher, map[string]string{
			"type":      "error",
			"errorText": deltaErr.Error(),
		})
		writeDone(res, flusher)
		return nil
	}

	_ = writePart(res, flusher, map[string]string{"type": "text-end", "id": textID})
	_ = writePart(res, flusher, map[string]string{"type": "finish-step"})
	_ = writePart(res, flusher, map[string]string{"type": "finish"})
	writeDone(res, flusher)
	return nil
}

// Models lists the chat models the client may request.
func (h *Handler) Models(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]any{
		"default": DefaultChatModelID,
		"models":  SupportedChatModels,
	})
}
