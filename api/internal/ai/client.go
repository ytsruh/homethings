package ai

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

// chatCompletionsStream POSTs to Cloudflare's OpenAI-compatible chat
// completions endpoint with streaming enabled. The caller owns the
// returned response body and must close it.
func (c Config) chatCompletionsStream(ctx context.Context, model string, messages []openAIMessage) (*http.Response, error) {
	url := fmt.Sprintf(
		"https://api.cloudflare.com/client/v4/accounts/%s/ai/v1/chat/completions",
		c.AccountID,
	)

	payload, err := json.Marshal(openAIChatRequest{
		Model:    model,
		Messages: messages,
		Stream:   true,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to encode chat request: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(payload))
	if err != nil {
		return nil, fmt.Errorf("failed to create chat request: %w", err)
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

// chatCompletion POSTs to Cloudflare's OpenAI-compatible chat completions
// endpoint without streaming and returns the assistant message content.
// Shared transport for non-chat features (e.g. recipe extraction) so they
// reuse the same credentials, error mapping, and message types as chat.
func (c Config) chatCompletion(ctx context.Context, model string, messages []openAIMessage, temperature *float64, maxTokens *int, jsonMode bool) (string, error) {
	url := fmt.Sprintf(
		"https://api.cloudflare.com/client/v4/accounts/%s/ai/v1/chat/completions",
		c.AccountID,
	)

	payload := openAIChatRequest{
		Model:       model,
		Messages:    messages,
		Stream:      false,
		Temperature: temperature,
		MaxTokens:   maxTokens,
	}
	if jsonMode {
		payload.ResponseFormat = &openAIResponseFormat{Type: "json_object"}
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return "", fmt.Errorf("failed to encode chat request: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(body))
	if err != nil {
		return "", fmt.Errorf("failed to create chat request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+c.APIToken)

	client := &http.Client{Timeout: 120 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", &chatError{
			Code:       codeProviderError,
			Message:    "The AI service failed. Please try again.",
			StatusCode: http.StatusBadGateway,
			detail:     err.Error(),
		}
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		detail, _ := io.ReadAll(io.LimitReader(resp.Body, 4<<10))
		return "", mapUpstreamError(resp.StatusCode, strings.TrimSpace(string(detail)))
	}

	var decoded openAICompletionResponse
	raw, err := io.ReadAll(io.LimitReader(resp.Body, 4<<20))
	if err != nil {
		return "", &chatError{
			Code:       codeProviderError,
			Message:    "The AI service failed. Please try again.",
			StatusCode: http.StatusBadGateway,
			detail:     err.Error(),
		}
	}
	if err := json.Unmarshal(raw, &decoded); err != nil {
		return "", &chatError{
			Code:       codeProviderError,
			Message:    "The AI service failed. Please try again.",
			StatusCode: http.StatusBadGateway,
			detail:     "invalid upstream JSON",
		}
	}
	if len(decoded.Choices) == 0 {
		return "", &chatError{
			Code:       codeProviderError,
			Message:    "The AI service failed. Please try again.",
			StatusCode: http.StatusBadGateway,
			detail:     "no choices in upstream response",
		}
	}
	return decoded.Choices[0].Message.Content, nil
}
