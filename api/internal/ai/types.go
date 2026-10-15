package ai

import "strings"

// chatRequest mirrors the JSON body sent by DefaultChatTransport.
// Extra fields (id, trigger, messageId) are intentionally ignored.
type chatRequest struct {
	Messages []uiMessage `json:"messages"`
	Model    string      `json:"model,omitempty"`
}

// uiMessage supports both the AI SDK v5 UIMessage shape
// ({role, parts:[{type:text, text}]}) and the classic {role, content} shape.
type uiMessage struct {
	Role    string          `json:"role"`
	Content *string         `json:"content,omitempty"`
	Parts   []uiMessagePart `json:"parts,omitempty"`
}

type uiMessagePart struct {
	Type string `json:"type"`
	Text string `json:"text,omitempty"`
}

// openAIMessage is a single message in OpenAI chat format.
type openAIMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

// openAIChatRequest is the body POSTed to Cloudflare's OpenAI-compatible endpoint.
type openAIChatRequest struct {
	Model    string          `json:"model"`
	Messages []openAIMessage `json:"messages"`
	Stream   bool            `json:"stream"`
}

// openAIChunk is one streamed SSE event from the upstream API.
type openAIChunk struct {
	Choices []struct {
		Delta struct {
			Content string `json:"content"`
		} `json:"delta"`
	} `json:"choices"`
}

// toModelMessages converts incoming UI messages to OpenAI chat messages,
// dropping empty or unusable entries. Text parts are joined with newlines.
func toModelMessages(messages []uiMessage) []openAIMessage {
	out := make([]openAIMessage, 0, len(messages))
	for _, m := range messages {
		role := strings.ToLower(strings.TrimSpace(m.Role))
		if role != "user" && role != "assistant" && role != "system" {
			continue
		}
		var text string
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
			text = sb.String()
		} else if m.Content != nil {
			text = strings.TrimSpace(*m.Content)
		}
		if strings.TrimSpace(text) == "" {
			continue
		}
		out = append(out, openAIMessage{Role: role, Content: text})
	}
	return out
}
