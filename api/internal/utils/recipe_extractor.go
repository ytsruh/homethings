package utils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"regexp"
	"strings"
	"time"
)

const EXTRACTION_MODEL = "openai/gpt-4o-mini"

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
	Role    string              `json:"role"`
	Content []OpenRouterContent `json:"content"`
}

type OpenRouterImageURL struct {
	URL string `json:"url"`
}

type OpenRouterContent struct {
	Type     string             `json:"type"`
	Text     string             `json:"text,omitempty"`
	ImageURL *OpenRouterImageURL `json:"image_url,omitempty"`
}

type OpenRouterResponseFormat struct {
	Type string `json:"type"`
}

type OpenRouterRequest struct {
	Model          string                    `json:"model"`
	Messages       []OpenRouterMessage       `json:"messages"`
	MaxTokens      int                       `json:"max_output_tokens,omitempty"`
	Temperature    float64                   `json:"temperature,omitempty"`
	ResponseFormat *OpenRouterResponseFormat `json:"response_format,omitempty"`
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

	systemPrompt := `You are a recipe extraction assistant. Your job is to review the image and extract the recipe information from the image. Do not guess what the recipe is, use only the image to extract the information. Analyze the provided image and extract all recipe information in a structured JSON format.
	Return a structured JSON response with the following fields:
	- title: The name of the recipe
	- description: A brief description (optional)
	- tags: Relevant tags for the recipe (e.g. 'breakfast', 'quick', 'vegetarian', 'dessert')
	- ingredients: List of ingredients with name and amount
	- steps: Ordered list of preparation steps

	If the image does not clearly show a recipe, is unreadable, or contains no ingredients or steps, return exactly this object and nothing else: {"title": "", "description": "", "tags": [], "ingredients": [], "steps": []}. Never invent a recipe that is not visible in the image.

	IMPORTANT: Return ONLY a raw JSON object. Do NOT wrap it in markdown code fences. Do NOT include any prose, preamble, or explanation before or after the JSON. Your entire response must be parseable as JSON starting with { and ending with }.`

	reqBody := OpenRouterRequest{
		Model: EXTRACTION_MODEL,
		Messages: []OpenRouterMessage{
			{
				Role: "user",
				Content: []OpenRouterContent{
					{Type: "text", Text: systemPrompt},
					{Type: "image_url", ImageURL: &OpenRouterImageURL{URL: imageDataURI}},
				},
			},
		},
		MaxTokens:      4096,
		Temperature:    0.3,
		ResponseFormat: &OpenRouterResponseFormat{Type: "json_object"},
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
	extracted, err := extractJSONObject(content)
	if err != nil {
		snippet := content
		if len(snippet) > 200 {
			snippet = snippet[:200] + "..."
		}
		return nil, fmt.Errorf("failed to parse extracted recipe: %w (raw: %q)", err, snippet)
	}

	var recipe ExtractedRecipe
	if err := json.Unmarshal([]byte(extracted), &recipe); err != nil {
		return nil, fmt.Errorf("failed to parse extracted recipe: %w", err)
	}

	return &recipe, nil
}

var markdownFenceRe = regexp.MustCompile("(?s)```(?:json)?\\s*(.*?)\\s*```")

func extractJSONObject(content string) (string, error) {
	trimmed := strings.TrimSpace(content)
	trimmed = strings.Trim(trimmed, "\"'`")

	if m := markdownFenceRe.FindStringSubmatch(trimmed); m != nil {
		trimmed = strings.TrimSpace(m[1])
	}

	start := strings.Index(trimmed, "{")
	end := strings.LastIndex(trimmed, "}")
	if start == -1 || end == -1 || end <= start {
		return "", fmt.Errorf("no JSON object found in response")
	}

	return trimmed[start : end+1], nil
}
