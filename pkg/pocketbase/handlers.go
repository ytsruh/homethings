package pocketbase

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/openai/openai-go"
	"github.com/openai/openai-go/option"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
)

var client openai.Client

func initClient() {
	client = openai.NewClient(
		option.WithBaseURL("https://openrouter.ai/api/v1"),
		option.WithHeader("Authorization", fmt.Sprintf("Bearer %s", Config.OPENROUTER_API_KEY)),
	)
}

// Map of allowed models for O(1) lookup
var allowedModels = map[string]bool{
	"openai/gpt-4o":                       true,
	"openai/gpt-4o-mini":                  true,
	"google/gemini-2.0-flash-lite-001":    true,
	"google/gemini-2.0-flash-001":         true,
	"x-ai/grok-3-mini-beta":               true,
	"x-ai/grok-3-beta":                    true,
	"google/gemini-2.5-pro-preview-03-25": true,
	"deepseek/deepseek-chat-v3-0324":      true,
	"deepseek/deepseek-r1":                true,
	"openai/o3-mini":                      true,
	"anthropic/claude-3.5-sonnet":         true,
	"anthropic/claude-3.7-sonnet":         true,
}

func isValidModel(model string) bool {
	_, exists := allowedModels[model]
	return exists
}

func postChat(e *core.RequestEvent) error {
	var requestBody struct {
		Model    string `json:"model"`
		Messages []struct {
			Role    string `json:"role"`
			Content string `json:"content"`
		} `json:"messages"`
	}

	if err := json.NewDecoder(e.Request.Body).Decode(&requestBody); err != nil {
		return apis.NewBadRequestError("Invalid request body", err)
	}

	if requestBody.Model == "" {
		return apis.NewBadRequestError("Model is required", nil)
	}

	if !isValidModel(requestBody.Model) {
		return apis.NewBadRequestError("Invalid model specified", nil)
	}

	// Set streaming headers
	e.Response.Header().Set("Content-Type", "text/plain; charset=utf-8")
	e.Response.Header().Set("Cache-Control", "no-cache")
	e.Response.Header().Set("Connection", "keep-alive")
	e.Response.Header().Set("Transfer-Encoding", "chunked")
	e.Response.Header().Set("X-Content-Type-Options", "nosniff")

	// Convert request messages to OpenAI format
	messages := make([]openai.ChatCompletionMessageParamUnion, len(requestBody.Messages))
	for i, msg := range requestBody.Messages {
		switch msg.Role {
		case "user":
			messages[i] = openai.UserMessage(msg.Content)
		case "assistant":
			messages[i] = openai.AssistantMessage(msg.Content)
		case "system":
			messages[i] = openai.SystemMessage(msg.Content)
		default:
			return fmt.Errorf("unsupported message role: %s", msg.Role)
		}
	}

	stream := client.Chat.Completions.NewStreaming(context.TODO(), openai.ChatCompletionNewParams{
		Messages: messages,
		Model:    requestBody.Model,
	})

	// Use a standard response with a flusher and do not use e.Stream() which appears to buffer the response before returning
	flusher, ok := e.Response.(http.Flusher)
	if !ok {
		return fmt.Errorf("streaming not supported")
	}

	for stream.Next() {
		chunk := stream.Current()
		if len(chunk.Choices) > 0 && chunk.Choices[0].Delta.Content != "" {
			content := chunk.Choices[0].Delta.Content
			if _, err := e.Response.Write([]byte(content)); err != nil {
				return err
			}
			flusher.Flush()
		}
	}

	if err := stream.Err(); err != nil {
		return err
	}

	return nil
}
