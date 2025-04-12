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
	fmt.Println(Config.OPENROUTER_API_KEY)
	client = openai.NewClient(
		option.WithBaseURL("https://openrouter.ai/api/v1"),
		option.WithHeader("Authorization", fmt.Sprintf("Bearer %s", Config.OPENROUTER_API_KEY)),
	)
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

	// Create a pipe to connect the stream to the response
	pr, pw := io.Pipe()

	// Start streaming in a goroutine
	go func() {
		defer pw.Close()

		stream := client.Chat.Completions.NewStreaming(context.TODO(), openai.ChatCompletionNewParams{
			Messages: []openai.ChatCompletionMessageParamUnion{
				openai.UserMessage(requestBody.Messages[0].Content),
			},
			Model: "openai/gpt-4o",
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
