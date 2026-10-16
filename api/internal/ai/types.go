package ai

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"strings"
)

// chatRequest mirrors the JSON body sent by DefaultChatTransport.
// Extra fields (id, trigger, messageId) are intentionally ignored.
type chatRequest struct {
	Messages []uiMessage `json:"messages"`
	Model    string      `json:"model,omitempty"`
	// SessionID, when set, persists this turn to an existing chat session
	// owned by the caller. When empty, a new session is created.
	SessionID string `json:"sessionId,omitempty"`
}

// uiMessage supports both the AI SDK v5 UIMessage shape
// ({role, parts:[{type:text, text}]}) and the classic {role, content} shape.
// Image uploads arrive as AI SDK file parts:
// ({type:file, mediaType:image/..., url:data:...}).
type uiMessage struct {
	Role    string          `json:"role"`
	Content *string         `json:"content,omitempty"`
	Parts   []uiMessagePart `json:"parts,omitempty"`
}

type uiMessagePart struct {
	Type string `json:"type"`
	Text string `json:"text,omitempty"`
	// File part fields (type == "file").
	MediaType string `json:"mediaType,omitempty"`
	Filename  string `json:"filename,omitempty"`
	URL       string `json:"url,omitempty"`
}

// Image upload limits for chat. Images are sent base64 inline as data URLs.
const (
	// MaxImagesPerMessage caps how many images a single message may carry.
	MaxImagesPerMessage = 5
	// MaxImageBytes caps the decoded size of a single image (5MB).
	MaxImageBytes = 5 * 1024 * 1024
	// MaxImageDataURLChars caps the raw data URL length as a fast pre-check.
	// Base64 inflates by ~4/3, so 5MB decodes from ~7MB of characters.
	MaxImageDataURLChars = 8 * 1024 * 1024
)

// AllowedImageMediaTypes are the image MIME types accepted for chat uploads.
var AllowedImageMediaTypes = map[string]bool{
	"image/jpeg": true,
	"image/png":  true,
	"image/webp": true,
	"image/gif":  true,
}

// imageValidationError is a user-safe rejection of an image upload.
type imageValidationError struct {
	Message string
}

func (e *imageValidationError) Error() string { return e.Message }

// History window limits for the chat endpoint. The server forwards only the
// most recent window so long conversations stay within model context limits.
const (
	// MaxHistoryMessages caps how many past messages are forwarded.
	MaxHistoryMessages = 20
	// MaxHistoryChars caps the total characters forwarded (~6k tokens).
	// The system prompt is not counted against this budget.
	MaxHistoryChars = 24000
)

// historyCharBudget returns the character budget for a model. The catalog
// context window (tokens) is converted at ~4 chars/token and capped at the
// default window so behavior is unchanged for large-context models but
// shrinks safely if a small-context model is added later.
func historyCharBudget(model ChatModel) int {
	if model.ContextWindow > 0 {
		if budget := model.ContextWindow * 4 / 4; budget < MaxHistoryChars {
			return budget
		}
	}
	return MaxHistoryChars
}

// openAIContentPart is one element of a multimodal user message.
type openAIContentPart struct {
	Type     string `json:"type"`
	Text     string `json:"text,omitempty"`
	ImageURL *struct {
		URL string `json:"url"`
	} `json:"image_url,omitempty"`
}

// openAIMessage is a single message in OpenAI chat format. Content is either
// a plain string (text-only) or a list of content parts (multimodal).
type openAIMessage struct {
	Role    string `json:"role"`
	Content any    `json:"content"`
}

// MarshalJSON preserves the OpenAI convention: Content marshals as-is,
// whether string or []openAIContentPart.
func (m openAIMessage) MarshalJSON() ([]byte, error) {
	type wire openAIMessage
	return json.Marshal(wire(m))
}

// contentLength returns the approximate character size of a message for
// history budgeting. Image parts count a fixed estimate so a single
// image-heavy turn cannot evict the whole transcript.
func contentLength(content any) int {
	switch c := content.(type) {
	case string:
		return len(c)
	case []openAIContentPart:
		total := 0
		for _, p := range c {
			if p.Type == "text" {
				total += len(p.Text)
			} else if p.Type == "image_url" {
				total += 1500
			}
		}
		return total
	default:
		return 0
	}
}

// messageText extracts the readable text of a message, used for session
// titles and persistence summaries.
func messageText(m openAIMessage) string {
	switch c := m.Content.(type) {
	case string:
		return c
	case []openAIContentPart:
		var sb strings.Builder
		for _, p := range c {
			if p.Type != "text" || p.Text == "" {
				continue
			}
			if sb.Len() > 0 {
				sb.WriteString("\n")
			}
			sb.WriteString(p.Text)
		}
		return sb.String()
	default:
		return ""
	}
}

// openAIChatRequest is the body POSTed to Cloudflare's OpenAI-compatible endpoint.
type openAIChatRequest struct {
	Model    string          `json:"model"`
	Messages []openAIMessage `json:"messages"`
	Stream   bool            `json:"stream"`
}

// openAIUsage carries token counts reported by the provider. All fields are
// pointers so absent data stays nil and is stored as NULL.
type openAIUsage struct {
	PromptTokens     *int `json:"prompt_tokens,omitempty"`
	CompletionTokens *int `json:"completion_tokens,omitempty"`
	TotalTokens      *int `json:"total_tokens,omitempty"`
}

// openAIChunk is one streamed SSE event from the upstream API.
type openAIChunk struct {
	Choices []struct {
		Delta struct {
			Content string `json:"content"`
		} `json:"delta"`
		FinishReason *string `json:"finish_reason,omitempty"`
	} `json:"choices"`
	Usage *openAIUsage `json:"usage,omitempty"`
}

// validateImageDataURL checks a file part URL is an allowed image data URL
// within size limits, returning the media type.
func validateImageDataURL(url string) (string, error) {
	if !strings.HasPrefix(url, "data:image/") {
		return "", &imageValidationError{Message: "Images must be sent as data URLs"}
	}
	comma := strings.Index(url, ",")
	if comma < 0 {
		return "", &imageValidationError{Message: "Invalid image data"}
	}
	header := url[:comma]
	payload := url[comma+1:]
	mediaType := strings.TrimPrefix(strings.Split(header, ";")[0], "data:")
	if !AllowedImageMediaTypes[mediaType] {
		return "", &imageValidationError{Message: "Unsupported image type. Use JPEG, PNG, WebP or GIF."}
	}
	if len(url) > MaxImageDataURLChars {
		return "", &imageValidationError{Message: "Image is too large. Max 5MB per image."}
	}
	decodedLen := base64.StdEncoding.DecodedLen(len(payload))
	if decodedLen > MaxImageBytes {
		return "", &imageValidationError{Message: "Image is too large. Max 5MB per image."}
	}
	return mediaType, nil
}

// toModelMessages converts incoming UI messages to OpenAI chat messages,
// dropping empty or unusable entries. Text parts are joined with newlines.
// File parts carrying image data URLs become image_url content parts.
// An error is returned for invalid, oversized, or over-count images.
func toModelMessages(messages []uiMessage) ([]openAIMessage, error) {
	out := make([]openAIMessage, 0, len(messages))
	for _, m := range messages {
		role := strings.ToLower(strings.TrimSpace(m.Role))
		if role != "user" && role != "assistant" && role != "system" {
			continue
		}
		// Assistant history never carries images back to the model.
		if role != "user" {
			text := extractTextOnly(m)
			if strings.TrimSpace(text) == "" {
				continue
			}
			out = append(out, openAIMessage{Role: role, Content: text})
			continue
		}
		text, images, err := extractUserContent(m)
		if err != nil {
			return nil, err
		}
		if strings.TrimSpace(text) == "" && len(images) == 0 {
			continue
		}
		if len(images) == 0 {
			out = append(out, openAIMessage{Role: role, Content: text})
			continue
		}
		parts := make([]openAIContentPart, 0, len(images)+1)
		if strings.TrimSpace(text) != "" {
			parts = append(parts, openAIContentPart{Type: "text", Text: text})
		}
		for _, imgURL := range images {
			parts = append(parts, openAIContentPart{
				Type: "image_url",
				ImageURL: &struct {
					URL string `json:"url"`
				}{URL: imgURL},
			})
		}
		out = append(out, openAIMessage{Role: role, Content: parts})
	}
	return out, nil
}

// extractTextOnly joins text parts for non-user roles.
func extractTextOnly(m uiMessage) string {
	if len(m.Parts) > 0 {
		var sb strings.Builder
		for _, p := range m.Parts {
			if p.Type != "text" || p.Text == "" {
				continue
			}
			if sb.Len() > 0 {
				sb.WriteString("\n")
			}
			sb.WriteString(p.Text)
		}
		return sb.String()
	}
	if m.Content != nil {
		return strings.TrimSpace(*m.Content)
	}
	return ""
}

// extractUserContent splits a user message into text and validated image URLs.
func extractUserContent(m uiMessage) (string, []string, error) {
	if len(m.Parts) == 0 {
		if m.Content != nil {
			return strings.TrimSpace(*m.Content), nil, nil
		}
		return "", nil, nil
	}
	var sb strings.Builder
	var images []string
	for _, p := range m.Parts {
		switch p.Type {
		case "text":
			if p.Text == "" {
				continue
			}
			if sb.Len() > 0 {
				sb.WriteString("\n")
			}
			sb.WriteString(p.Text)
		case "file":
			if p.URL == "" {
				continue
			}
			if !strings.HasPrefix(strings.ToLower(p.MediaType), "image") &&
				!strings.HasPrefix(p.URL, "data:image/") {
				continue
			}
			if _, err := validateImageDataURL(p.URL); err != nil {
				return "", nil, err
			}
			images = append(images, p.URL)
		default:
			continue
		}
	}
	if len(images) > MaxImagesPerMessage {
		return "", nil, &imageValidationError{
			Message: fmt.Sprintf("Too many images. Max %d per message.", MaxImagesPerMessage),
		}
	}
	return sb.String(), images, nil
}

// trimHistory narrows past messages to the forwarding window: at most
// MaxHistoryMessages, at most MaxHistoryChars, always retaining the latest
// message so the current turn is never dropped.
func trimHistory(messages []openAIMessage) []openAIMessage {
	return trimHistoryWithBudget(messages, MaxHistoryChars)
}

// trimHistoryForModel applies the model's context-derived character budget.
func trimHistoryForModel(messages []openAIMessage, model ChatModel) []openAIMessage {
	return trimHistoryWithBudget(messages, historyCharBudget(model))
}

func trimHistoryWithBudget(messages []openAIMessage, maxChars int) []openAIMessage {
	if len(messages) > MaxHistoryMessages {
		messages = messages[len(messages)-MaxHistoryMessages:]
	}
	start := 0
	used := 0
	for i := len(messages) - 1; i >= 0; i-- {
		used += contentLength(messages[i].Content)
		if used > maxChars && i != len(messages)-1 {
			start = i + 1
			break
		}
	}
	return messages[start:]
}
