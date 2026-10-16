package ai

import "fmt"

// ChatModel describes one Workers AI chat model available to the chatbot.
// IDs follow the catalog convention and were last checked against
// https://developers.cloudflare.com/workers-ai/models/ in Oct 2026.
type ChatModel struct {
	ID    string `json:"id"`
	Label string `json:"label"`
	Blurb string `json:"blurb"`
	// ContextWindow is the model's context window in tokens.
	ContextWindow int `json:"contextWindow"`
	// SupportsImages reports whether the model accepts image input.
	// The client only offers image uploads for models with this set.
	SupportsImages bool `json:"supportsImages"`
}

// SupportedChatModels is the allowlist of models the chat endpoint accepts.
// The frontend fetches this list to render the model picker.
// IDs are the exact Workers AI run IDs from
// https://developers.cloudflare.com/ai/models/ .
var SupportedChatModels = []ChatModel{
	{
		ID:             "google/gemini-3.8-flash",
		Label:          "Gemini 3.8 Flash",
		Blurb:          "Fast Flash model for agents and enterprise workflows",
		ContextWindow:  1048576,
		SupportsImages: false,
	},
	{
		ID:             "openai/gpt-6-luna",
		Label:          "GPT-6 Luna",
		Blurb:          "Efficient OpenAI model for focused high-volume tasks",
		ContextWindow:  1050000,
		SupportsImages: false,
	},
	{
		ID:             "@cf/zai-org/glm-5.3-flash",
		Label:          "GLM 5.3 Flash",
		Blurb:          "Natively multimodal, strong coding and vision",
		ContextWindow:  1048576,
		SupportsImages: true,
	},
}

// DefaultChatModelID is used when the client does not request a model.
const DefaultChatModelID = "google/gemini-3.8-flash"

// ResolveChatModel returns the requested model if it is supported,
// the default if requested is empty, or an error naming the valid options.
func ResolveChatModel(requested string) (string, error) {
	model, err := GetChatModel(requested)
	if err != nil {
		return "", err
	}
	return model.ID, nil
}

// GetChatModel returns the catalog entry for the requested model,
// the default entry if requested is empty, or an error for unknown models.
func GetChatModel(requested string) (ChatModel, error) {
	if requested == "" {
		requested = DefaultChatModelID
	}
	for _, m := range SupportedChatModels {
		if m.ID == requested {
			return m, nil
		}
	}
	return ChatModel{}, fmt.Errorf("unsupported model %q", requested)
}
