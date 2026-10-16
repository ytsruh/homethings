package ai

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"regexp"
	"strings"
)

// Recipe extraction is deliberately self-contained: everything recipe-specific
// lives in this file. It shares only transport (client.go), message types and
// image validation (types.go), config (config.go), and error mapping
// (errors.go) with the chat feature.

// RecipeVisionModelID is the vision-capable model used for extraction.
// It must stay in the SupportedChatModels catalog (models.go) with
// SupportsImages=true; GetChatModel enforces this at call time.
const RecipeVisionModelID = "@cf/zai-org/glm-5.3-flash"

// RecipeIngredient is one extracted ingredient.
type RecipeIngredient struct {
	Name   string `json:"name"`
	Amount string `json:"amount"`
}

// ExtractedRecipe is the structured result parsed from a recipe image.
type ExtractedRecipe struct {
	Title       string             `json:"title"`
	Description string             `json:"description,omitempty"`
	Tags        []string           `json:"tags"`
	Ingredients []RecipeIngredient `json:"ingredients"`
	Steps       []string           `json:"steps"`
}

// openAICompletionResponse is the non-streaming chat completion payload.
// Recipe-only: the streaming chat path uses openAIChunk (stream.go) instead.
type openAICompletionResponse struct {
	Choices []struct {
		Message struct {
			Role    string `json:"role"`
			Content string `json:"content"`
		} `json:"message"`
		FinishReason *string `json:"finish_reason,omitempty"`
	} `json:"choices"`
	Usage *openAIUsage `json:"usage,omitempty"`
}

const recipeSystemPrompt = `You are a recipe extraction assistant. Your job is to review the image and extract the recipe information from the image. Do not guess what the recipe is, use only the image to extract the information. Analyze the provided image and extract all recipe information in a structured JSON format.
Return a structured JSON response with the following fields:
- title: The name of the recipe
- description: A brief description (optional)
- tags: Relevant tags for the recipe (e.g. 'breakfast', 'quick', 'vegetarian', 'dessert')
- ingredients: List of ingredients with name and amount
- steps: Ordered list of preparation steps

If the image does not clearly show a recipe, is unreadable, or contains no ingredients or steps, return exactly this object and nothing else: {"title": "", "description": "", "tags": [], "ingredients": [], "steps": []}. Never invent a recipe that is not visible in the image.

IMPORTANT: Return ONLY a raw JSON object. Do NOT wrap it in markdown code fences. Do NOT include any prose, preamble, or explanation before or after the JSON. Your entire response must be parseable as JSON starting with { and ending with }.`

// ExtractRecipeFromImage sends one image to the vision model and parses the
// structured recipe JSON it returns. Input validation failures come back as
// *imageValidationError (400); config/upstream/parse failures come back as
// *chatError with a user-safe message and HTTP status (see errors.go).
func ExtractRecipeFromImage(ctx context.Context, imageDataURI string) (*ExtractedRecipe, error) {
	if _, err := validateImageDataURL(imageDataURI); err != nil {
		return nil, err
	}

	cfg := LoadConfig()
	if err := cfg.Validate(); err != nil {
		return nil, &chatError{
			Code:       codeProviderAuth,
			Message:    "The AI service is not configured. Please tell the site owner.",
			StatusCode: http.StatusServiceUnavailable,
			detail:     err.Error(),
		}
	}

	modelEntry, err := GetChatModel(RecipeVisionModelID)
	if err != nil {
		return nil, &chatError{
			Code:       codeModelUnavailable,
			Message:    "That model is currently unavailable. Pick another model and try again.",
			StatusCode: http.StatusBadGateway,
			detail:     err.Error(),
		}
	}
	if !modelEntry.SupportsImages {
		return nil, &chatError{
			Code:       codeModelUnavailable,
			Message:    "That model is currently unavailable. Pick another model and try again.",
			StatusCode: http.StatusBadGateway,
			detail:     "recipe vision model does not support images",
		}
	}

	messages := []openAIMessage{
		{
			Role: "user",
			Content: []openAIContentPart{
				{Type: "text", Text: recipeSystemPrompt},
				{
					Type: "image_url",
					ImageURL: &struct {
						URL string `json:"url"`
					}{URL: imageDataURI},
				},
			},
		},
	}

	temperature := 0.3
	maxTokens := 2048
	content, err := cfg.chatCompletion(ctx, modelEntry.ID, messages, &temperature, &maxTokens, true)
	if err != nil {
		return nil, err
	}

	extracted, err := extractRecipeJSONObject(content)
	if err != nil {
		snippet := content
		if len(snippet) > 200 {
			snippet = snippet[:200] + "..."
		}
		return nil, &chatError{
			Code:       codeProviderError,
			Message:    "The AI service failed. Please try again.",
			StatusCode: http.StatusBadGateway,
			detail:     fmt.Sprintf("recipe JSON parse failure: %v (raw: %q)", err, snippet),
		}
	}

	var recipe ExtractedRecipe
	if err := json.Unmarshal([]byte(extracted), &recipe); err != nil {
		return nil, &chatError{
			Code:       codeProviderError,
			Message:    "The AI service failed. Please try again.",
			StatusCode: http.StatusBadGateway,
			detail:     fmt.Sprintf("recipe JSON unmarshal failure: %v", err),
		}
	}
	if recipe.Tags == nil {
		recipe.Tags = []string{}
	}
	if recipe.Ingredients == nil {
		recipe.Ingredients = []RecipeIngredient{}
	}
	if recipe.Steps == nil {
		recipe.Steps = []string{}
	}

	return &recipe, nil
}

var recipeMarkdownFenceRe = regexp.MustCompile("(?s)```(?:json)?\\s*(.*?)\\s*```")

// extractRecipeJSONObject tolerates models that wrap JSON in fences or add
// surrounding prose, returning the substring from the first { to the last }.
func extractRecipeJSONObject(content string) (string, error) {
	trimmed := strings.TrimSpace(content)
	trimmed = strings.Trim(trimmed, "\"'`")

	if m := recipeMarkdownFenceRe.FindStringSubmatch(trimmed); m != nil {
		trimmed = strings.TrimSpace(m[1])
	}

	start := strings.Index(trimmed, "{")
	end := strings.LastIndex(trimmed, "}")
	if start == -1 || end == -1 || end <= start {
		return "", fmt.Errorf("no JSON object found in response")
	}

	return trimmed[start : end+1], nil
}
