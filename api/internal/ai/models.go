package ai

import "fmt"

// ModelTransport selects which Cloudflare endpoint + wire format a model uses.
// Most models speak OpenAI Chat Completions; Anthropic-native models need
// /ai/v1/messages; Responses-only third-party models go through /ai/v1/responses.
type ModelTransport string

const (
	TransportChatCompletions   ModelTransport = "chat_completions"
	TransportAnthropicMessages ModelTransport = "anthropic_messages"
	TransportResponses         ModelTransport = "responses"
)

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
	// Transport selects the Cloudflare endpoint + parser. The frontend
	// ignores it; it only drives backend dispatch in transport.go.
	Transport ModelTransport `json:"transport"`
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
		Transport:      TransportChatCompletions,
	},
	{
		ID:             "google/gemini-4-argon",
		Label:          "Gemini 4 Argon",
		Blurb:          "Frontier model for complex coding and science tasks",
		ContextWindow:  1048576,
		SupportsImages: false,
		Transport:      TransportChatCompletions,
	},
	{
		ID:             "openai/gpt-6-luna",
		Label:          "GPT-6 Luna",
		Blurb:          "Efficient OpenAI model for focused high-volume tasks",
		ContextWindow:  1050000,
		SupportsImages: false,
		Transport:      TransportChatCompletions,
	},
	{
		ID:             "@cf/zai-org/glm-5.3-flash",
		Label:          "GLM 5.3 Flash",
		Blurb:          "Natively multimodal, strong coding and vision",
		ContextWindow:  1048576,
		SupportsImages: true,
		Transport:      TransportChatCompletions,
	},
	{
		ID:             "meta/muse-spark-1.3",
		Label:          "Muse Spark 1.3",
		Blurb:          "Agentic coding and tool loops, long-horizon reasoning",
		ContextWindow:  128000,
		SupportsImages: false,
		Transport:      TransportResponses,
	},
	{
		ID:             "meta/muse-wonder-1.0",
		Label:          "Muse Wonder 1.0",
		Blurb:          "Agentic coding for complex software engineering",
		ContextWindow:  128000,
		SupportsImages: false,
		Transport:      TransportResponses,
	},
	{
		ID:             "anthropic/claude-haiku-5.5",
		Label:          "Claude Haiku 5.5",
		Blurb:          "Fast and cheap for classification and subagents",
		ContextWindow:  1000000,
		SupportsImages: false,
		Transport:      TransportAnthropicMessages,
	},
}

// DefaultChatModelID is used when the client does not request a model.
const DefaultChatModelID = "meta/muse-spark-1.3"

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
