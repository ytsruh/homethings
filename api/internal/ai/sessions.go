package ai

import (
	"context"
	"database/sql"
	"encoding/json"
	"net/http"
	"strings"
	"time"
	"unicode/utf8"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"ytsruh.com/homethings/internal/db"
	"ytsruh.com/homethings/internal/utils"
)

// maxSessionTitleRunes caps auto-generated titles (first user message).
const maxSessionTitleRunes = 60

// currentUser extracts the authenticated user payload set by RequireAuth.
func currentUser(c echo.Context) (*utils.UserPayload, error) {
	payload, ok := c.Get("user").(*utils.UserPayload)
	if !ok || payload == nil || payload.UserID == "" {
		return nil, echo.NewHTTPError(http.StatusUnauthorized, "Unauthorized")
	}
	return payload, nil
}

// sessionTitle derives a title from the first user message, truncated to
// maxSessionTitleRunes with whitespace collapsed.
func sessionTitle(text string) string {
	collapsed := strings.Join(strings.Fields(strings.TrimSpace(text)), " ")
	if collapsed == "" {
		return "New chat"
	}
	if utf8.RuneCountInString(collapsed) <= maxSessionTitleRunes {
		return collapsed
	}
	runes := []rune(collapsed)
	return string(runes[:maxSessionTitleRunes-1]) + "…"
}

// encodeMessageContent serializes an OpenAI message for storage.
func encodeMessageContent(msg openAIMessage) string {
	raw, err := json.Marshal(msg)
	if err != nil {
		return ""
	}
	return string(raw)
}

// decodeStoredMessage parses a persisted message back to OpenAI form.
// Content may be a JSON string (text) or a list of content parts.
func decodeStoredMessage(raw string) (openAIMessage, error) {
	var wire struct {
		Role    string          `json:"role"`
		Content json.RawMessage `json:"content"`
	}
	if err := json.Unmarshal([]byte(raw), &wire); err != nil {
		return openAIMessage{}, err
	}
	var text string
	if err := json.Unmarshal(wire.Content, &text); err == nil {
		return openAIMessage{Role: wire.Role, Content: text}, nil
	}
	var parts []openAIContentPart
	if err := json.Unmarshal(wire.Content, &parts); err != nil {
		return openAIMessage{}, err
	}
	return openAIMessage{Role: wire.Role, Content: parts}, nil
}

// messageToUIParts converts a stored message to client display parts.
// Text becomes {type:text}; image_url parts become AI SDK file parts so the
// client can render thumbnails from the stored data URLs.
func messageToUIParts(msg openAIMessage) []map[string]any {
	switch c := msg.Content.(type) {
	case string:
		return []map[string]any{{"type": "text", "text": c}}
	case []openAIContentPart:
		parts := make([]map[string]any, 0, len(c))
		for _, p := range c {
			switch p.Type {
			case "text":
				parts = append(parts, map[string]any{"type": "text", "text": p.Text})
			case "image_url":
				if p.ImageURL == nil {
					continue
				}
				parts = append(parts, map[string]any{
					"type":      "file",
					"mediaType": mediaTypeFromDataURL(p.ImageURL.URL),
					"url":       p.ImageURL.URL,
				})
			}
		}
		if len(parts) == 0 {
			return []map[string]any{}
		}
		return parts
	default:
		return []map[string]any{}
	}
}

// mediaTypeFromDataURL extracts the MIME type from a data URL header.
func mediaTypeFromDataURL(url string) string {
	if !strings.HasPrefix(url, "data:") {
		return "image/jpeg"
	}
	comma := strings.Index(url, ",")
	header := url
	if comma >= 0 {
		header = url[:comma]
	}
	mediaType := strings.TrimPrefix(strings.Split(header, ";")[0], "data:")
	if mediaType == "" {
		return "image/jpeg"
	}
	return mediaType
}

// nullInt converts an optional token count to sql.NullInt64 (NULL when absent).
func nullInt(v *int) sql.NullInt64 {
	if v == nil {
		return sql.NullInt64{}
	}
	return sql.NullInt64{Int64: int64(*v), Valid: true}
}

// dbStringNull converts a string to sql.NullString, invalid when empty and
// link is false (e.g. usage rows without a stored assistant message).
func dbStringNull(s string, link bool) sql.NullString {
	if !link || s == "" {
		return sql.NullString{}
	}
	return sql.NullString{String: s, Valid: true}
}

type sessionResponse struct {
	ID        string `json:"id"`
	Model     string `json:"model"`
	Title     string `json:"title"`
	CreatedAt string `json:"createdAt"`
	UpdatedAt string `json:"updatedAt"`
}

func toSessionResponse(s db.ChatSession) sessionResponse {
	return sessionResponse{
		ID:        s.ID,
		Model:     s.Model,
		Title:     s.Title,
		CreatedAt: time.Unix(s.CreatedAt, 0).UTC().Format(time.RFC3339),
		UpdatedAt: time.Unix(s.UpdatedAt, 0).UTC().Format(time.RFC3339),
	}
}

// CreateSession starts a new chat session for the authenticated user.
func (h *Handler) CreateSession(c echo.Context) error {
	user, err := currentUser(c)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{"message": "Unauthorized"})
	}
	var req struct {
		Model string `json:"model"`
		Title string `json:"title"`
	}
	_ = c.Bind(&req)

	model, err := GetChatModel(req.Model)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": err.Error()})
	}
	title := strings.TrimSpace(req.Title)
	if title == "" {
		title = "New chat"
	}
	now := time.Now().Unix()
	session, err := h.db.Queries().CreateChatSession(context.Background(), db.CreateChatSessionParams{
		ID:        uuid.NewString(),
		UserID:    user.UserID,
		Model:     model.ID,
		Title:     title,
		CreatedAt: now,
		UpdatedAt: now,
	})
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Failed to create chat session"})
	}
	return c.JSON(http.StatusCreated, toSessionResponse(session))
}

// ListSessions returns the caller's non-deleted sessions, newest first.
func (h *Handler) ListSessions(c echo.Context) error {
	user, err := currentUser(c)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{"message": "Unauthorized"})
	}
	sessions, err := h.db.Queries().ListChatSessions(context.Background(), user.UserID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Failed to list chat sessions"})
	}
	out := make([]sessionResponse, 0, len(sessions))
	for _, s := range sessions {
		out = append(out, toSessionResponse(s))
	}
	return c.JSON(http.StatusOK, out)
}

// GetSession returns one session with its messages in display form.
func (h *Handler) GetSession(c echo.Context) error {
	user, err := currentUser(c)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{"message": "Unauthorized"})
	}
	session, err := h.db.Queries().GetChatSession(context.Background(), db.GetChatSessionParams{
		ID:     c.Param("id"),
		UserID: user.UserID,
	})
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"message": "Chat session not found"})
	}
	messages, err := h.sessionUIMessages(context.Background(), session.ID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Failed to load chat messages"})
	}
	return c.JSON(http.StatusOK, map[string]any{
		"session":  toSessionResponse(session),
		"messages": messages,
	})
}

// sessionUIMessages loads stored messages as client display messages.
func (h *Handler) sessionUIMessages(ctx context.Context, sessionID string) ([]map[string]any, error) {
	stored, err := h.db.Queries().ListChatMessages(ctx, sessionID)
	if err != nil {
		return nil, err
	}
	out := make([]map[string]any, 0, len(stored))
	for _, m := range stored {
		msg, err := decodeStoredMessage(m.Content)
		if err != nil {
			continue
		}
		out = append(out, map[string]any{
			"id":        m.ID,
			"role":      m.Role,
			"parts":     messageToUIParts(msg),
			"createdAt": time.Unix(m.CreatedAt, 0).UTC().Format(time.RFC3339),
		})
	}
	return out, nil
}

// RenameSession updates a session title.
func (h *Handler) RenameSession(c echo.Context) error {
	user, err := currentUser(c)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{"message": "Unauthorized"})
	}
	var req struct {
		Title string `json:"title"`
	}
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "Invalid request body"})
	}
	title := strings.TrimSpace(req.Title)
	if title == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "Title is required"})
	}
	session, err := h.db.Queries().UpdateChatSessionTitle(context.Background(), db.UpdateChatSessionTitleParams{
		Title:     title,
		UpdatedAt: time.Now().Unix(),
		ID:        c.Param("id"),
		UserID:    user.UserID,
	})
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"message": "Chat session not found"})
	}
	return c.JSON(http.StatusOK, toSessionResponse(session))
}

// DeleteSession soft-deletes a session, retaining messages and token usage.
func (h *Handler) DeleteSession(c echo.Context) error {
	user, err := currentUser(c)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{"message": "Unauthorized"})
	}
	now := time.Now().Unix()
	_, err = h.db.Queries().SoftDeleteChatSession(context.Background(), db.SoftDeleteChatSessionParams{
		DeletedAt: sql.NullInt64{Int64: now, Valid: true},
		UpdatedAt: now,
		ID:        c.Param("id"),
		UserID:    user.UserID,
	})
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"message": "Chat session not found"})
	}
	return c.JSON(http.StatusOK, map[string]string{"message": "Chat session deleted"})
}

// UsageSummary aggregates token usage per model for the caller (backend-only,
// no client UI yet; exposed for verification and future surfaces).
func (h *Handler) UsageSummary(c echo.Context) error {
	user, err := currentUser(c)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{"message": "Unauthorized"})
	}
	rows, err := h.db.Queries().SumTokenUsageByUser(context.Background(), user.UserID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Failed to load token usage"})
	}
	out := make([]map[string]any, 0, len(rows))
	for _, r := range rows {
		out = append(out, map[string]any{
			"model":            r.Model,
			"turns":            r.Turns,
			"promptTokens":     r.PromptTokens,
			"completionTokens": r.CompletionTokens,
			"totalTokens":      r.TotalTokens,
		})
	}
	return c.JSON(http.StatusOK, map[string]any{"models": out})
}
