import type { AIConfig } from "./types";

export const aiConfig: AIConfig = {
	defaultModel: "google/gemini-3-flash-preview",
	temperature: 0.7,
	maxTokens: 4096,
	availableModels: {
		openai: ["openai/gpt-5", "openai/gpt-5-mini", "openai/gpt-5-nano"],
		google: ["google/gemini-3-flash-preview", "google/gemini-3-pro-preview"],
		anthropic: [
			"anthropic/claude-3.5-sonnet",
			"anthropic/claude-3.7-sonnet",
			"anthropic/claude-opus-4",
			"anthropic/claude-sonnet-4",
		],
		xai: ["x-ai/grok-4", "x-ai/grok-4.1-fast"],
	},
};

export const allModels = Object.values(aiConfig.availableModels).flat();

export function isModelAvailable(model: string): boolean {
	return allModels.includes(model);
}
