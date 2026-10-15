package ai

import "fmt"

// ChatModel describes one Workers AI chat model available to the chatbot.
// IDs follow the catalog convention and were last checked against
// https://developers.cloudflare.com/workers-ai/models/ in Oct 2026.
type ChatModel struct {
	ID    string `json:"id"`
	Label string `json:"label"`
	Blurb string `json:"blurb"`
}

// SupportedChatModels is the allowlist of models the chat endpoint accepts.
// The frontend fetches this list to render the model picker.
var SupportedChatModels = []ChatModel{
	{
		ID:    "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
		Label: "Llama 3.3 70B",
		Blurb: "Most capable all-rounder, FP8 fast",
	},
	{
		ID:    "@cf/openai/gpt-oss-120b",
		Label: "GPT-OSS 120B",
		Blurb: "OpenAI open-weight, strong reasoning",
	},
	{
		ID:    "@cf/openai/gpt-oss-20b",
		Label: "GPT-OSS 20B",
		Blurb: "Smaller, lower-latency reasoning",
	},
	{
		ID:    "@cf/mistral/mistral-small-3.1-24b-instruct",
		Label: "Mistral Small 3.1 24B",
		Blurb: "Strong text and vision, 128k context",
	},
	{
		ID:    "@cf/deepseek-ai/deepseek-r1-distill-qwen-32b",
		Label: "DeepSeek R1 Distill 32B",
		Blurb: "Reasoning-distilled problem solver",
	},
	{
		ID:    "@cf/meta/llama-3.1-8b-instruct-fp8",
		Label: "Llama 3.1 8B",
		Blurb: "Fast and cheap for simple chats",
	},
}

// DefaultChatModelID is used when the client does not request a model.
const DefaultChatModelID = "@cf/meta/llama-3.3-70b-instruct-fp8-fast"

// ResolveChatModel returns the requested model if it is supported,
// the default if requested is empty, or an error naming the valid options.
func ResolveChatModel(requested string) (string, error) {
	if requested == "" {
		return DefaultChatModelID, nil
	}
	for _, m := range SupportedChatModels {
		if m.ID == requested {
			return m.ID, nil
		}
	}
	return "", fmt.Errorf("unsupported model %q", requested)
}
