package ai

import (
	"bufio"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

// deltaParser parses one upstream SSE stream, invoking onDelta for each text
// chunk. It returns the terminal finish reason and normalized token usage.
type deltaParser func(upstream io.Reader, onDelta func(string)) (string, *openAIUsage, error)

// streamChat opens a streaming upstream response for the model's transport
// and returns the parser for that wire format. Responses-transport models
// are non-streaming; callers should use completeChat and emit a single delta.
func (c Config) streamChat(ctx context.Context, entry ChatModel, messages []openAIMessage) (*http.Response, deltaParser, error) {
	switch entry.Transport {
	case TransportAnthropicMessages:
		resp, err := c.anthropicMessagesStream(ctx, entry.ID, messages)
		if err != nil {
			return nil, nil, err
		}
		return resp, extractAnthropicDeltas, nil
	case TransportResponses:
		resp, err := c.responsesStream(ctx, entry.ID, messages)
		if err != nil {
			return nil, nil, err
		}
		return resp, extractResponsesDeltas, nil
	case TransportChatCompletions, "":
		resp, err := c.chatCompletionsStream(ctx, entry.ID, messages)
		if err != nil {
			return nil, nil, err
		}
		return resp, extractDeltas, nil
	default:
		return nil, nil, &chatError{
			Code:       codeModelUnavailable,
			Message:    "That model is currently unavailable. Pick another model and try again.",
			StatusCode: http.StatusBadGateway,
			detail:     fmt.Sprintf("unknown transport %q", entry.Transport),
		}
	}
}

// completeChat runs one non-streaming turn for the model's transport,
// returning the assistant text and normalized usage (usage may be nil).
func (c Config) completeChat(ctx context.Context, entry ChatModel, messages []openAIMessage, temperature *float64, maxTokens *int, jsonMode bool) (string, *openAIUsage, error) {
	switch entry.Transport {
	case TransportAnthropicMessages:
		return c.anthropicMessagesComplete(ctx, entry.ID, messages, temperature, maxTokens)
	case TransportResponses:
		return c.workersResponsesComplete(ctx, entry.ID, messages, temperature, maxTokens)
	case TransportChatCompletions, "":
		return c.chatCompletion(ctx, entry.ID, messages, temperature, maxTokens, jsonMode)
	default:
		return "", nil, &chatError{
			Code:       codeModelUnavailable,
			Message:    "That model is currently unavailable. Pick another model and try again.",
			StatusCode: http.StatusBadGateway,
			detail:     fmt.Sprintf("unknown transport %q", entry.Transport),
		}
	}
}

// postJSON POSTs a JSON body with the Cloudflare bearer token, mapping
// non-200 responses via mapUpstreamError. The caller closes the body on 200.
func (c Config) postJSON(ctx context.Context, url string, payload any) (*http.Response, error) {
	body, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("failed to encode request: %w", err)
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+c.APIToken)

	client := &http.Client{Timeout: 120 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, &chatError{
			Code:       codeProviderError,
			Message:    "The AI service failed. Please try again.",
			StatusCode: http.StatusBadGateway,
			detail:     err.Error(),
		}
	}
	if resp.StatusCode != http.StatusOK {
		defer resp.Body.Close()
		detail, _ := io.ReadAll(io.LimitReader(resp.Body, 4<<10))
		return nil, mapUpstreamError(resp.StatusCode, strings.TrimSpace(string(detail)))
	}
	return resp, nil
}

func (c Config) workersAIURL(path string) string {
	return fmt.Sprintf(
		"https://api.cloudflare.com/client/v4/accounts/%s/ai/%s",
		c.AccountID, strings.TrimPrefix(path, "/"),
	)
}

// --- Anthropic Messages transport (/ai/v1/messages) ---

// anthropicContentBlock is one element of a Messages API content array.
type anthropicContentBlock struct {
	Type   string                `json:"type"`
	Text   string                `json:"text,omitempty"`
	Source *anthropicImageSource `json:"source,omitempty"`
}

// anthropicImageSource carries base64 image data for the Messages API.
type anthropicImageSource struct {
	Type      string `json:"type"`
	MediaType string `json:"media_type"`
	Data      string `json:"data"`
}

// anthropicMessage is one Messages API turn.
type anthropicMessage struct {
	Role    string `json:"role"`
	Content any    `json:"content"`
}

// anthropicRequest is the body POSTed to /ai/v1/messages.
type anthropicRequest struct {
	Model     string             `json:"model"`
	MaxTokens int                `json:"max_tokens"`
	System    *string            `json:"system,omitempty"`
	Messages  []anthropicMessage `json:"messages"`
	Stream    bool               `json:"stream"`
}

// defaultAnthropicMaxTokens is sent when the caller sets no limit.
// The Messages API requires max_tokens; 4096 matches the recipe path budget.
const defaultAnthropicMaxTokens = 4096

// openAIMessagesToAnthropic converts internal messages to the Messages API
// shape. System prompts move to the top-level system field (Anthropic has no
// system role); image_url parts become base64 image blocks.
func openAIMessagesToAnthropic(messages []openAIMessage) (string, []anthropicMessage) {
	var systemParts []string
	out := make([]anthropicMessage, 0, len(messages))
	for _, m := range messages {
		switch m.Role {
		case "system":
			if text := messageText(m); strings.TrimSpace(text) != "" {
				systemParts = append(systemParts, text)
			}
			continue
		case "assistant", "user":
		default:
			continue
		}
		blocks := openAIContentToAnthropicBlocks(m.Content)
		if len(blocks) == 0 {
			continue
		}
		if len(blocks) == 1 && blocks[0].Type == "text" {
			out = append(out, anthropicMessage{Role: m.Role, Content: blocks[0].Text})
			continue
		}
		out = append(out, anthropicMessage{Role: m.Role, Content: blocks})
	}
	return strings.Join(systemParts, "\n\n"), out
}

// openAIContentToAnthropicBlocks maps one message content to Messages blocks.
func openAIContentToAnthropicBlocks(content any) []anthropicContentBlock {
	switch c := content.(type) {
	case string:
		if strings.TrimSpace(c) == "" {
			return nil
		}
		return []anthropicContentBlock{{Type: "text", Text: c}}
	case []openAIContentPart:
		var blocks []anthropicContentBlock
		for _, p := range c {
			switch p.Type {
			case "text":
				if p.Text == "" {
					continue
				}
				blocks = append(blocks, anthropicContentBlock{Type: "text", Text: p.Text})
			case "image_url":
				if p.ImageURL == nil {
					continue
				}
				mediaType, data, ok := splitDataURL(p.ImageURL.URL)
				if !ok {
					continue
				}
				blocks = append(blocks, anthropicContentBlock{
					Type:   "image",
					Source: &anthropicImageSource{Type: "base64", MediaType: mediaType, Data: data},
				})
			}
		}
		return blocks
	default:
		return nil
	}
}

// splitDataURL splits "data:<media>;base64,<data>" into its parts.
func splitDataURL(url string) (mediaType, data string, ok bool) {
	if !strings.HasPrefix(url, "data:") {
		return "", "", false
	}
	comma := strings.Index(url, ",")
	if comma < 0 {
		return "", "", false
	}
	header := url[len("data:"):comma]
	payload := url[comma+1:]
	if payload == "" {
		return "", "", false
	}
	mediaType = strings.Split(header, ";")[0]
	if mediaType == "" {
		return "", "", false
	}
	return mediaType, payload, true
}

// anthropicMessagesStream POSTs a streaming Messages API request.
func (c Config) anthropicMessagesStream(ctx context.Context, model string, messages []openAIMessage) (*http.Response, error) {
	system, converted := openAIMessagesToAnthropic(messages)
	payload := anthropicRequest{
		Model:     model,
		MaxTokens: defaultAnthropicMaxTokens,
		Messages:  converted,
		Stream:    true,
	}
	if strings.TrimSpace(system) != "" {
		payload.System = &system
	}
	return c.postJSON(ctx, c.workersAIURL("v1/messages"), payload)
}

// anthropicMessagesComplete POSTs a non-streaming Messages API request.
func (c Config) anthropicMessagesComplete(ctx context.Context, model string, messages []openAIMessage, temperature *float64, maxTokens *int) (string, *openAIUsage, error) {
	system, converted := openAIMessagesToAnthropic(messages)
	max := defaultAnthropicMaxTokens
	if maxTokens != nil && *maxTokens > 0 {
		max = *maxTokens
	}
	_ = temperature // Messages API temperature passthrough is a future knob.
	payload := anthropicRequest{
		Model:     model,
		MaxTokens: max,
		Messages:  converted,
		Stream:    false,
	}
	if strings.TrimSpace(system) != "" {
		payload.System = &system
	}
	resp, err := c.postJSON(ctx, c.workersAIURL("v1/messages"), payload)
	if err != nil {
		return "", nil, err
	}
	defer resp.Body.Close()
	raw, err := io.ReadAll(io.LimitReader(resp.Body, 4<<20))
	if err != nil {
		return "", nil, &chatError{
			Code:       codeProviderError,
			Message:    "The AI service failed. Please try again.",
			StatusCode: http.StatusBadGateway,
			detail:     err.Error(),
		}
	}
	var decoded struct {
		Content []struct {
			Type string `json:"type"`
			Text string `json:"text,omitempty"`
		} `json:"content"`
		StopReason *string `json:"stop_reason,omitempty"`
		Usage      *struct {
			InputTokens  *int `json:"input_tokens,omitempty"`
			OutputTokens *int `json:"output_tokens,omitempty"`
		} `json:"usage,omitempty"`
	}
	if err := json.Unmarshal(raw, &decoded); err != nil {
		return "", nil, &chatError{
			Code:       codeProviderError,
			Message:    "The AI service failed. Please try again.",
			StatusCode: http.StatusBadGateway,
			detail:     "invalid upstream JSON",
		}
	}
	var sb strings.Builder
	for _, b := range decoded.Content {
		if b.Type == "text" && b.Text != "" {
			sb.WriteString(b.Text)
		}
	}
	var usage *openAIUsage
	if decoded.Usage != nil {
		usage = &openAIUsage{
			PromptTokens:     decoded.Usage.InputTokens,
			CompletionTokens: decoded.Usage.OutputTokens,
		}
		if usage.PromptTokens != nil && usage.CompletionTokens != nil {
			total := *usage.PromptTokens + *usage.CompletionTokens
			usage.TotalTokens = &total
		}
	}
	return sb.String(), usage, nil
}

// anthropicStreamEvent is one SSE data payload from /ai/v1/messages.
type anthropicStreamEvent struct {
	Type    string `json:"type"`
	Message *struct {
		Usage *struct {
			InputTokens int `json:"input_tokens"`
		} `json:"usage"`
	} `json:"message,omitempty"`
	Delta *struct {
		Type       string  `json:"type,omitempty"`
		Text       string  `json:"text,omitempty"`
		StopReason *string `json:"stop_reason,omitempty"`
	} `json:"delta,omitempty"`
	Usage *struct {
		OutputTokens int `json:"output_tokens"`
		InputTokens  int `json:"input_tokens"`
	} `json:"usage,omitempty"`
}

// extractAnthropicDeltas parses a Messages API SSE stream. It tolerates both
// `data:`-only streams and `event:`/`data:` pairs, stopping at [DONE] or
// message_stop. Anthropic stop reasons map onto chat finish reasons.
func extractAnthropicDeltas(upstream io.Reader, onDelta func(string)) (string, *openAIUsage, error) {
	scanner := bufio.NewScanner(upstream)
	scanner.Buffer(make([]byte, 64*1024), 1024*1024)

	finishReason := ""
	var promptTokens, completionTokens *int
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, ":") || strings.HasPrefix(line, "event:") {
			continue
		}
		if !strings.HasPrefix(line, "data:") {
			continue
		}
		data := strings.TrimSpace(strings.TrimPrefix(line, "data:"))
		if data == "[DONE]" {
			break
		}
		var event anthropicStreamEvent
		if err := json.Unmarshal([]byte(data), &event); err != nil {
			continue
		}
		switch event.Type {
		case "message_start":
			if event.Message != nil && event.Message.Usage != nil {
				v := event.Message.Usage.InputTokens
				promptTokens = &v
			}
		case "content_block_delta":
			if event.Delta != nil && event.Delta.Text != "" {
				onDelta(event.Delta.Text)
			}
		case "message_delta":
			if event.Delta != nil && event.Delta.StopReason != nil {
				finishReason = mapAnthropicStopReason(*event.Delta.StopReason)
			}
			if event.Usage != nil {
				v := event.Usage.OutputTokens
				completionTokens = &v
			}
		case "message_stop":
			if finishReason == "" {
				finishReason = "stop"
			}
		}
	}
	if err := scanner.Err(); err != nil {
		return finishReason, nil, fmt.Errorf("failed to read upstream stream: %w", err)
	}
	var usage *openAIUsage
	if promptTokens != nil || completionTokens != nil {
		usage = &openAIUsage{PromptTokens: promptTokens, CompletionTokens: completionTokens}
		if promptTokens != nil && completionTokens != nil {
			total := *promptTokens + *completionTokens
			usage.TotalTokens = &total
		}
	}
	return finishReason, usage, nil
}

// mapAnthropicStopReason maps Messages stop_reason onto chat finish reasons.
func mapAnthropicStopReason(reason string) string {
	switch reason {
	case "end_turn", "stop_sequence", "tool_use":
		return "stop"
	case "max_tokens":
		return "length"
	default:
		return reason
	}
}

// --- Responses transport (/ai/v1/responses, Responses-shaped models) ---

// responsesInputItem is one history turn in a Responses API input array.
type responsesInputItem struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

// responsesStream POSTs a streaming Responses API request (/ai/v1/responses).
func (c Config) responsesStream(ctx context.Context, model string, messages []openAIMessage) (*http.Response, error) {
	input := make([]responsesInputItem, 0, len(messages))
	for _, m := range messages {
		if m.Role != "user" && m.Role != "assistant" && m.Role != "system" {
			continue
		}
		text := messageText(m)
		if strings.TrimSpace(text) == "" {
			continue
		}
		input = append(input, responsesInputItem{Role: m.Role, Content: text})
	}
	return c.postJSON(ctx, c.workersAIURL("v1/responses"), map[string]any{
		"model":  model,
		"input":  input,
		"stream": true,
	})
}

// responsesStreamEvent is one SSE data payload from /ai/v1/responses.
// The event name arrives both as an `event:` line and as type in the JSON;
// parsing type from JSON keeps us working with either framing.
type responsesStreamEvent struct {
	Type     string `json:"type"`
	Delta    string `json:"delta,omitempty"`
	Response *struct {
		Status string `json:"status,omitempty"`
		Usage  *struct {
			InputTokens  *int `json:"input_tokens,omitempty"`
			OutputTokens *int `json:"output_tokens,omitempty"`
			TotalTokens  *int `json:"total_tokens,omitempty"`
		} `json:"usage,omitempty"`
		IncompleteDetails *struct {
			Reason *string `json:"reason,omitempty"`
		} `json:"incomplete_details,omitempty"`
	} `json:"response,omitempty"`
}

// extractResponsesDeltas parses a Responses API SSE stream, invoking onDelta
// for every output_text delta. Terminal events map onto chat finish reasons
// ("stop", "length") with normalized token usage.
func extractResponsesDeltas(upstream io.Reader, onDelta func(string)) (string, *openAIUsage, error) {
	scanner := bufio.NewScanner(upstream)
	scanner.Buffer(make([]byte, 64*1024), 1024*1024)

	finishReason := ""
	var usage *openAIUsage
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, ":") || strings.HasPrefix(line, "event:") {
			continue
		}
		if !strings.HasPrefix(line, "data:") {
			continue
		}
		data := strings.TrimSpace(strings.TrimPrefix(line, "data:"))
		if data == "[DONE]" {
			break
		}
		var event responsesStreamEvent
		if err := json.Unmarshal([]byte(data), &event); err != nil {
			continue
		}
		switch event.Type {
		case "response.output_text.delta":
			if event.Delta != "" {
				onDelta(event.Delta)
			}
		case "response.completed":
			finishReason = "stop"
			if event.Response != nil && event.Response.Usage != nil {
				u := event.Response.Usage
				usage = &openAIUsage{
					PromptTokens:     u.InputTokens,
					CompletionTokens: u.OutputTokens,
					TotalTokens:      u.TotalTokens,
				}
			}
		case "response.incomplete":
			reason := ""
			if event.Response != nil && event.Response.IncompleteDetails != nil && event.Response.IncompleteDetails.Reason != nil {
				reason = *event.Response.IncompleteDetails.Reason
			}
			if reason == "max_output_tokens" {
				finishReason = "length"
			} else {
				finishReason = "incomplete"
			}
		case "response.failed":
			return finishReason, usage, fmt.Errorf("responses stream failed")
		}
	}
	if err := scanner.Err(); err != nil {
		return finishReason, usage, fmt.Errorf("failed to read upstream stream: %w", err)
	}
	return finishReason, usage, nil
}

// workersResponsesComplete POSTs a non-streaming request to /ai/v1/responses
// (see the curl example on the model docs pages, e.g. meta/muse-wonder-1.0)
// and extracts Responses output text. Kept as the transport's unary call;
// chat now prefers the streaming path above.
func (c Config) workersResponsesComplete(ctx context.Context, model string, messages []openAIMessage, temperature *float64, maxTokens *int) (string, *openAIUsage, error) {
	input := make([]responsesInputItem, 0, len(messages))
	for _, m := range messages {
		if m.Role != "user" && m.Role != "assistant" && m.Role != "system" {
			continue
		}
		text := messageText(m)
		if strings.TrimSpace(text) == "" {
			continue
		}
		input = append(input, responsesInputItem{Role: m.Role, Content: text})
	}
	payload := map[string]any{"model": model, "input": input, "stream": false}
	if maxTokens != nil && *maxTokens > 0 {
		payload["max_output_tokens"] = *maxTokens
	}
	if temperature != nil {
		payload["temperature"] = *temperature
	}
	resp, err := c.postJSON(ctx, c.workersAIURL("v1/responses"), payload)
	if err != nil {
		return "", nil, err
	}
	defer resp.Body.Close()
	raw, err := io.ReadAll(io.LimitReader(resp.Body, 4<<20))
	if err != nil {
		return "", nil, &chatError{
			Code:       codeProviderError,
			Message:    "The AI service failed. Please try again.",
			StatusCode: http.StatusBadGateway,
			detail:     err.Error(),
		}
	}
	// /ai/v1/* endpoints return the object directly, but tolerate the
	// /ai/run {result} wrapper in case the binding shape ever comes back.
	var bodyForParse = raw
	var wrapper struct {
		Result json.RawMessage `json:"result"`
	}
	if err := json.Unmarshal(raw, &wrapper); err == nil && len(wrapper.Result) > 0 {
		bodyForParse = wrapper.Result
	}
	var decoded struct {
		Output []struct {
			Type    string `json:"type"`
			Content []struct {
				Type string `json:"type"`
				Text string `json:"text,omitempty"`
			} `json:"content"`
		} `json:"output"`
		Status string `json:"status"`
		Usage  *struct {
			InputTokens  *int `json:"input_tokens,omitempty"`
			OutputTokens *int `json:"output_tokens,omitempty"`
			TotalTokens  *int `json:"total_tokens,omitempty"`
		} `json:"usage,omitempty"`
	}
	if err := json.Unmarshal(bodyForParse, &decoded); err != nil {
		return "", nil, &chatError{
			Code:       codeProviderError,
			Message:    "The AI service failed. Please try again.",
			StatusCode: http.StatusBadGateway,
			detail:     "invalid upstream JSON",
		}
	}
	var sb strings.Builder
	for _, item := range decoded.Output {
		for _, b := range item.Content {
			if b.Type == "output_text" && b.Text != "" {
				sb.WriteString(b.Text)
			}
		}
	}
	var usage *openAIUsage
	if decoded.Usage != nil {
		usage = &openAIUsage{
			PromptTokens:     decoded.Usage.InputTokens,
			CompletionTokens: decoded.Usage.OutputTokens,
			TotalTokens:      decoded.Usage.TotalTokens,
		}
	}
	return sb.String(), usage, nil
}
