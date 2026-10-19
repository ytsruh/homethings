package ai

import (
	"context"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"ytsruh.com/homethings/internal/db"
)

// Handler serves the chat endpoints. Conversations persist as sessions:
// each streaming turn stores the user message before calling upstream and
// the assistant reply plus provider token usage after completion.
type Handler struct {
	db *db.DB
}

// NewHandler creates a chat Handler backed by the given database.
func NewHandler(database *db.DB) *Handler {
	return &Handler{db: database}
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

	modelEntry, err := GetChatModel(req.Model)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": err.Error()})
	}
	model := modelEntry.ID

	user, err := currentUser(c)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{"message": "Unauthorized"})
	}

	requestMessages, err := toModelMessages(req.Messages)
	if err != nil {
		if imgErr, ok := err.(*imageValidationError); ok {
			return c.JSON(http.StatusBadRequest, map[string]string{"message": imgErr.Message})
		}
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "Invalid messages"})
	}
	if hasImages(requestMessages) && !modelEntry.SupportsImages {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "This model does not support images. Pick a vision-capable model."})
	}

	sessionID, modelInput, err := h.resolveTurn(c.Request().Context(), user.UserID, model, strings.TrimSpace(req.SessionID), requestMessages)
	if err != nil {
		if he, ok := err.(*echo.HTTPError); ok {
			if msg, ok := he.Message.(string); ok {
				return c.JSON(he.Code, map[string]string{"message": msg})
			}
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Failed to prepare chat session"})
	}

	modelMessages := append(
		[]openAIMessage{{Role: "system", Content: SystemPrompt}},
		trimHistoryForModel(modelInput, modelEntry)...,
	)
	if len(modelMessages) <= 1 {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "At least one message is required"})
	}

	ctx := c.Request().Context()
	upstream, parseDeltas, err := cfg.streamChat(ctx, modelEntry, modelMessages)
	if err != nil {
		return writeChatUpstreamError(c, model, err)
	}
	defer upstream.Body.Close()

	res := c.Response()
	header := res.Header()
	header.Set("Content-Type", "text/event-stream")
	header.Set("Cache-Control", "no-cache")
	header.Set("Connection", "keep-alive")
	header.Set("X-Accel-Buffering", "no")
	header.Set("x-vercel-ai-ui-message-stream", "v1")
	header.Set("X-Chat-Session-Id", sessionID)

	flusher, ok := res.Writer.(http.Flusher)
	if !ok {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Streaming not supported"})
	}
	res.WriteHeader(http.StatusOK)

	messageID := uuid.NewString()
	textID := uuid.NewString()

	// All stream writes go through writeMu so keepalive pings cannot race
	// content frames.
	var writeMu sync.Mutex
	safeWrite := func(payload any) {
		writeMu.Lock()
		defer writeMu.Unlock()
		_ = writePart(res, flusher, payload)
	}
	safeDone := func() {
		writeMu.Lock()
		defer writeMu.Unlock()
		writeDone(res, flusher)
	}

	// Keep the stream alive through slow generations; stops on completion
	// or client disconnect.
	pingStop := make(chan struct{})
	defer close(pingStop)
	go func() {
		ticker := time.NewTicker(pingInterval)
		defer ticker.Stop()
		for {
			select {
			case <-pingStop:
				return
			case <-ctx.Done():
				return
			case <-ticker.C:
				writeMu.Lock()
				_ = writePing(res, flusher)
				writeMu.Unlock()
			}
		}
	}()

	safeWrite(map[string]string{"type": "start", "messageId": messageID})
	safeWrite(map[string]string{"type": "start-step"})
	safeWrite(map[string]string{"type": "text-start", "id": textID})

	var assistantText strings.Builder
	finishReason, usage, deltaErr := parseDeltas(upstream.Body, func(delta string) {
		assistantText.WriteString(delta)
		safeWrite(map[string]string{
			"type":  "text-delta",
			"id":    textID,
			"delta": delta,
		})
	})
	if deltaErr != nil {
		c.Logger().Warnf("chat stream interrupted: model=%s err=%v", model, deltaErr)
		h.persistAssistantTurn(context.Background(), user.UserID, model, sessionID, assistantText.String(), nil)
		safeWrite(map[string]string{
			"type":      "error",
			"errorText": "Connection interrupted. Please try again.",
		})
		safeDone()
		return nil
	}
	c.Logger().Infof("chat complete: model=%s finish_reason=%s", model, finishReason)

	if finishReason == "length" {
		safeWrite(map[string]string{
			"type":  "text-delta",
			"id":    textID,
			"delta": "\n\n*Response cut short at the model's length limit — try a shorter prompt or another model.*",
		})
	}

	h.persistAssistantTurn(context.Background(), user.UserID, model, sessionID, assistantText.String(), usage)

	safeWrite(map[string]string{"type": "text-end", "id": textID})
	safeWrite(map[string]string{"type": "finish-step"})
	safeWrite(map[string]string{"type": "finish"})
	safeDone()
	return nil
}

// resolveTurn loads or creates the session for this turn, persists the new
// user message, and returns the session ID plus the model input messages
// (stored history plus the new turn). When the newest request message
// duplicates the stored tail (regenerate/retry), nothing is re-persisted and
// the stored history is returned as-is.
func (h *Handler) resolveTurn(ctx context.Context, userID, model, sessionID string, requestMessages []openAIMessage) (string, []openAIMessage, error) {
	if len(requestMessages) == 0 {
		return "", nil, echo.NewHTTPError(http.StatusBadRequest, "At least one message is required")
	}
	newest := requestMessages[len(requestMessages)-1]
	if newest.Role != "user" {
		return "", nil, echo.NewHTTPError(http.StatusBadRequest, "At least one message is required")
	}

	queries := h.db.Queries()
	now := time.Now().Unix()

	if strings.TrimSpace(sessionID) == "" {
		session, err := queries.CreateChatSession(ctx, db.CreateChatSessionParams{
			ID:        uuid.NewString(),
			UserID:    userID,
			Model:     model,
			Title:     sessionTitle(messageText(newest)),
			CreatedAt: now,
			UpdatedAt: now,
		})
		if err != nil {
			return "", nil, err
		}
		if err := h.storeUserMessage(ctx, session.ID, newest); err != nil {
			return "", nil, err
		}
		return session.ID, requestMessages, nil
	}

	session, err := queries.GetChatSession(ctx, db.GetChatSessionParams{ID: sessionID, UserID: userID})
	if err != nil {
		return "", nil, echo.NewHTTPError(http.StatusNotFound, "Chat session not found")
	}
	stored, err := queries.ListChatMessages(ctx, session.ID)
	if err != nil {
		return "", nil, err
	}
	history := make([]openAIMessage, 0, len(stored))
	for _, m := range stored {
		msg, err := decodeStoredMessage(m.Content)
		if err != nil {
			continue
		}
		history = append(history, msg)
	}

	if len(history) > 0 && sameMessage(history[len(history)-1], newest) {
		// Regenerate/retry: the user turn is already stored.
		return session.ID, history, nil
	}
	if err := h.storeUserMessage(ctx, session.ID, newest); err != nil {
		return "", nil, err
	}
	if _, err := queries.TouchChatSession(ctx, db.TouchChatSessionParams{
		Model:     model,
		UpdatedAt: now,
		ID:        session.ID,
		UserID:    userID,
	}); err != nil {
		return "", nil, err
	}
	return session.ID, append(history, newest), nil
}

// storeUserMessage persists one user turn.
func (h *Handler) storeUserMessage(ctx context.Context, sessionID string, msg openAIMessage) error {
	content := encodeMessageContent(msg)
	if content == "" {
		return nil
	}
	_, err := h.db.Queries().CreateChatMessage(ctx, db.CreateChatMessageParams{
		ID:        uuid.NewString(),
		SessionID: sessionID,
		Role:      msg.Role,
		Content:   content,
		CreatedAt: time.Now().Unix(),
	})
	return err
}

// persistAssistantTurn stores the completed reply and its token usage.
// Usage columns stay NULL when the provider reports nothing.
func (h *Handler) persistAssistantTurn(ctx context.Context, userID, model, sessionID, text string, usage *openAIUsage) {
	if strings.TrimSpace(text) == "" && usage == nil {
		return
	}
	messageID := uuid.NewString()
	if strings.TrimSpace(text) != "" {
		content := encodeMessageContent(openAIMessage{Role: "assistant", Content: text})
		if _, err := h.db.Queries().CreateChatMessage(ctx, db.CreateChatMessageParams{
			ID:        messageID,
			SessionID: sessionID,
			Role:      "assistant",
			Content:   content,
			CreatedAt: time.Now().Unix(),
		}); err != nil {
			return
		}
	}
	var prompt, completion, total *int
	var messageIDNull = dbStringNull(messageID, strings.TrimSpace(text) != "")
	if usage != nil {
		prompt, completion, total = usage.PromptTokens, usage.CompletionTokens, usage.TotalTokens
	}
	_, _ = h.db.Queries().CreateChatTokenUsage(ctx, db.CreateChatTokenUsageParams{
		ID:               uuid.NewString(),
		SessionID:        sessionID,
		MessageID:        messageIDNull,
		UserID:           userID,
		Model:            model,
		PromptTokens:     nullInt(prompt),
		CompletionTokens: nullInt(completion),
		TotalTokens:      nullInt(total),
		CreatedAt:        time.Now().Unix(),
	})
	_, _ = h.db.Queries().TouchChatSession(ctx, db.TouchChatSessionParams{
		Model:     model,
		UpdatedAt: time.Now().Unix(),
		ID:        sessionID,
		UserID:    userID,
	})
}

func hasImages(messages []openAIMessage) bool {
	for _, m := range messages {
		if parts, ok := m.Content.([]openAIContentPart); ok {
			for _, p := range parts {
				if p.Type == "image_url" {
					return true
				}
			}
		}
	}
	return false
}

// sameMessage reports whether two messages carry the same role and text,
// used to detect regenerate/retry replays.
func sameMessage(a, b openAIMessage) bool {
	if a.Role != b.Role {
		return false
	}
	return messageText(a) == messageText(b)
}

// Models lists the chat models the client may request.
func (h *Handler) Models(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]any{
		"default": DefaultChatModelID,
		"models":  SupportedChatModels,
	})
}

// writeChatUpstreamError maps a transport failure to a user-safe JSON body.
func writeChatUpstreamError(c echo.Context, model string, err error) error {
	if chatErr, ok := err.(*chatError); ok {
		c.Logger().Warnf("chat upstream failure: model=%s code=%s detail=%s", model, chatErr.Code, chatErr.detail)
		return c.JSON(chatErr.StatusCode, map[string]string{
			"code":    chatErr.Code,
			"message": chatErr.Message,
		})
	}
	c.Logger().Warnf("chat upstream failure: model=%s err=%v", model, err)
	return c.JSON(http.StatusBadGateway, map[string]string{
		"code":    codeProviderError,
		"message": "The AI service failed. Please try again.",
	})
}

// writeSingleDeltaChat serves non-streaming transports (Responses via /ai/v1/responses)
// through the same Vercel AI SDK stream frames: one text-delta then finish.
// Usage persists exactly like the streaming path.
func writeSingleDeltaChat(c echo.Context, h *Handler, userID, model, sessionID, text string, usage *openAIUsage) error {
	res := c.Response()
	header := res.Header()
	header.Set("Content-Type", "text/event-stream")
	header.Set("Cache-Control", "no-cache")
	header.Set("Connection", "keep-alive")
	header.Set("X-Accel-Buffering", "no")
	header.Set("x-vercel-ai-ui-message-stream", "v1")
	header.Set("X-Chat-Session-Id", sessionID)

	flusher, ok := res.Writer.(http.Flusher)
	if !ok {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Streaming not supported"})
	}
	res.WriteHeader(http.StatusOK)

	messageID := uuid.NewString()
	textID := uuid.NewString()

	_ = writePart(res, flusher, map[string]string{"type": "start", "messageId": messageID})
	_ = writePart(res, flusher, map[string]string{"type": "start-step"})
	_ = writePart(res, flusher, map[string]string{"type": "text-start", "id": textID})
	if text != "" {
		_ = writePart(res, flusher, map[string]string{"type": "text-delta", "id": textID, "delta": text})
	}
	c.Logger().Infof("chat complete: model=%s finish_reason=stop (non-streaming)", model)
	h.persistAssistantTurn(context.Background(), userID, model, sessionID, text, usage)
	_ = writePart(res, flusher, map[string]string{"type": "text-end", "id": textID})
	_ = writePart(res, flusher, map[string]string{"type": "finish-step"})
	_ = writePart(res, flusher, map[string]string{"type": "finish"})
	writeDone(res, flusher)
	return nil
}
