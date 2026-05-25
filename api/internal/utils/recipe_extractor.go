package utils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"
)

const EXTRACTION_MODEL = "google/gemini-3-flash-preview"

type Ingredient struct {
	Name   string `json:"name"`
	Amount string `json:"amount"`
}

type ExtractedRecipe struct {
	Title       string       `json:"title"`
	Description string       `json:"description,omitempty"`
	Tags        []string     `json:"tags"`
	Ingredients []Ingredient `json:"ingredients"`
	Steps       []string     `json:"steps"`
}

type OpenRouterMessage struct {
	Role    string          `json:"role"`
	Content []OpenRouterContent `json:"content"`
}

type OpenRouterContent struct {
	Type string `json:"type"`
	Text string `json:"text,omitempty"`
}

type OpenRouterRequest struct {
	Model    string                `json:"model"`
	Messages []OpenRouterMessage  `json:"messages"`
	MaxTokens int                  `json:"max_output_tokens,omitempty"`
	Temperature float64           `json:"temperature,omitempty"`
}

type OpenRouterResponse struct {
	ID      string   `json:"id"`
	Choices []Choice `json:"choices"`
}

type Choice struct {
	Message Message `json:"message"`
}

type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

func ExtractRecipeFromImage(imageDataURI string) (*ExtractedRecipe, error) {
	apiKey := os.Getenv("OPENROUTER_API_KEY")
	if apiKey == "" {
		return nil, fmt.Errorf("OpenRouter API key not configured")
	}

	systemPrompt := `You are a recipe extraction assistant. Analyze the provided image and extract all recipe information.
Return a structured JSON response with the following fields:
- title: The name of the recipe
- description: A brief description (optional)
- tags: Relevant tags for the recipe (e.g. 'breakfast', 'quick', 'vegetarian', 'dessert')
- ingredients: List of ingredients with name and amount
- steps: Ordered list of preparation steps

IMPORTANT: Return ONLY valid JSON matching this schema. No markdown code blocks, no explanations, just the raw JSON object.`

	reqBody := OpenRouterRequest{
		Model: EXTRACTION_MODEL,
		Messages: []OpenRouterMessage{
			{
				Role: "user",
				Content: []OpenRouterContent{
					{Type: "text", Text: systemPrompt},
					{Type: "image", Text: imageDataURI},
				},
			},
		},
		MaxTokens: 4096,
		Temperature: 0.3,
	}

	jsonBody, err := json.Marshal(reqBody)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	req, err := http.NewRequest("POST", "https://openrouter.ai/api/v1/chat/completions", bytes.NewBuffer(jsonBody))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+apiKey)

	client := &http.Client{Timeout: 60 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("API returned status %d", resp.StatusCode)
	}

	var openRouterResp OpenRouterResponse
	if err := json.NewDecoder(resp.Body).Decode(&openRouterResp); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	if len(openRouterResp.Choices) == 0 {
		return nil, fmt.Errorf("no choices returned from API")
	}

	content := openRouterResp.Choices[0].Message.Content
	content = string(bytes.Trim([]byte(content), "\"")) // Remove surrounding quotes if any

	var recipe ExtractedRecipe
	if err := json.Unmarshal([]byte(content), &recipe); err != nil {
		return nil, fmt.Errorf("failed to parse extracted recipe: %w", err)
	}

	return &recipe, nil
}
