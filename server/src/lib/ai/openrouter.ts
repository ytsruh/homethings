import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText, streamText } from "ai";
import { aiConfig, isModelAvailable } from "./config";
import { AIError, normalizeError } from "./errors";
import type { AIProvider, ChatMessage, ChatOptions } from "./types";

export type { AIProvider };

const openrouter = createOpenRouter({
	apiKey: process.env.OPENROUTER_API_KEY,
});

export const openrouterProvider: AIProvider = {
	async chat(messages: ChatMessage[], options?: ChatOptions): Promise<string> {
		const model = options?.model || aiConfig.defaultModel;

		if (!isModelAvailable(model)) {
			throw new AIError(
				`Model '${model}' is not available`,
				"INVALID_MODEL",
				400,
			);
		}

		try {
			const result = await generateText({
				model: openrouter(model) as any,
				messages: messages as any,
				maxOutputTokens: options?.maxTokens,
				temperature: options?.temperature,
			});
			return result.text;
		} catch (error) {
			throw normalizeError(error);
		}
	},

	async *chatStream(
		messages: ChatMessage[],
		options?: ChatOptions,
	): AsyncIterable<string> {
		const model = options?.model || aiConfig.defaultModel;

		if (!isModelAvailable(model)) {
			throw new AIError(
				`Model '${model}' is not available`,
				"INVALID_MODEL",
				400,
			);
		}

		try {
			const result = await streamText({
				model: openrouter(model) as any,
				messages: messages as any,
				maxOutputTokens: options?.maxTokens,
				temperature: options?.temperature,
			});

			for await (const chunk of result.textStream) {
				yield chunk;
			}
		} catch (error) {
			throw normalizeError(error);
		}
	},

	listModels(): string[] {
		return Object.values(aiConfig.availableModels).flat();
	},

	async countTokens(text: string): Promise<number> {
		return Math.ceil(text.length / 4);
	},
};
