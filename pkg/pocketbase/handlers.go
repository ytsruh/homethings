package pocketbase

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"

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
		log.Printf("Error decoding request body: %v", err)
		return apis.NewBadRequestError("Invalid request body", err)
	}

	if requestBody.Model == "" {
		return apis.NewBadRequestError("Model is required", nil)
	}

	if !isValidModel(requestBody.Model) {
		return apis.NewBadRequestError("Invalid model specified", nil)
	}

	// Create a pipe to connect the stream to the response
	pr, pw := io.Pipe()

	// Start streaming in a goroutine
	go func() {
		defer pw.Close()

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
				log.Printf("Unsupported message role: %s", msg.Role)
				pw.CloseWithError(fmt.Errorf("unsupported message role: %s", msg.Role))
				return
			}
		}

		stream := client.Chat.Completions.NewStreaming(context.TODO(), openai.ChatCompletionNewParams{
			Messages: messages,
			Model:    requestBody.Model,
		})

		for stream.Next() {
			chunk := stream.Current()
			if len(chunk.Choices) > 0 && chunk.Choices[0].Delta.Content != "" {
				content := chunk.Choices[0].Delta.Content
				_, err := pw.Write([]byte(content))
				if err != nil {
					log.Printf("Error writing chunk: %v", err)
					pw.CloseWithError(err)
					return
				}
			}
		}

		if err := stream.Err(); err != nil {
			log.Printf("Stream error: %v", err)
			pw.CloseWithError(err)
			return
		}
	}()

	// Set streaming headers
	e.Response.Header().Set("Content-Type", "text/plain; charset=utf-8")
	e.Response.Header().Set("Cache-Control", "no-cache")
	e.Response.Header().Set("Connection", "keep-alive")
	e.Response.Header().Set("Transfer-Encoding", "chunked")
	e.Response.Header().Set("X-Content-Type-Options", "nosniff")

	return e.Stream(200, "text/plain", pr)
}
