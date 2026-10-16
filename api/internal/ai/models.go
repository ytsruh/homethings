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
var SupportedChatModels = []ChatModel{
	{
		ID:             "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
		Label:          "Llama 3.3 70B",
		Blurb:          "Most capable all-rounder, FP8 fast",
		ContextWindow:  128000,
		SupportsImages: false,
	},
	{
		ID:             "@cf/openai/gpt-oss-120b",
		Label:          "GPT-OSS 120B",
		Blurb:          "OpenAI open-weight, strong reasoning",
		ContextWindow:  128000,
		SupportsImages: false,
	},
	{
		ID:             "@cf/openai/gpt-oss-20b",
		Label:          "GPT-OSS 20B",
		Blurb:          "Smaller, lower-latency reasoning",
		ContextWindow:  128000,
		SupportsImages: false,
	},
	{
		ID:             "@cf/mistralai/mistral-small-3.1-24b-instruct",
		Label:          "Mistral Small 3.1 24B",
		Blurb:          "Strong text and vision, 128k context",
		ContextWindow:  128000,
		SupportsImages: true,
	},
	{
		ID:             "@cf/deepseek-ai/deepseek-r1-distill-qwen-32b",
		Label:          "DeepSeek R1 Distill 32B",
		Blurb:          "Reasoning-distilled problem solver",
		ContextWindow:  128000,
		SupportsImages: false,
	},
	{
		ID:             "@cf/meta/llama-3.1-8b-instruct-fp8",
		Label:          "Llama 3.1 8B",
		Blurb:          "Fast and cheap for simple chats",
		ContextWindow:  128000,
		SupportsImages: false,
	},
}

// DefaultChatModelID is used when the client does not request a model.
const DefaultChatModelID = "@cf/meta/llama-3.3-70b-instruct-fp8-fast"

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
