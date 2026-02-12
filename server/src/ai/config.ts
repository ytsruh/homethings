import type { AIConfig } from "./types";

export const aiConfig: AIConfig = {
	defaultModel: "openai/gpt-5-nano",
	temperature: 0.7,
	maxTokens: 4096,
	availableModels: {
		openai: ["openai/gpt-5", "openai/gpt-5-mini", "openai/gpt-5-nano"],
		google: ["google/gemini-2.5-flash", "google/gemini-2.5-pro"],
		anthropic: [
			"anthropic/claude-3.5-sonnet",
			"anthropic/claude-3.7-sonnet",
			"anthropic/claude-opus-4",
			"anthropic/claude-sonnet-4",
		],
		xai: ["xai/grok-3", "xai/grok-3-mini", "xai/grok-4"],
	},
};

export const allModels = Object.values(aiConfig.availableModels).flat();

export function isModelAvailable(model: string): boolean {
	return allModels.includes(model);
}
