import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText, streamText } from "ai";
import { aiConfig, isModelAvailable } from "./config";
import { AIError, normalizeError } from "./errors";
import { defaultImageModel, isImageModel } from "./image-models";
import type {
	AIProvider,
	ChatMessage,
	ChatOptions,
	ImageOptions,
	ImageResponse,
} from "./types";

export type { AIProvider };

const openrouter = createOpenRouter({
	apiKey: process.env.OPENROUTER_API_KEY,
});

export const openrouterProvider: AIProvider = {
	async generateImage(
		prompt: string,
		options?: ImageOptions,
	): Promise<ImageResponse> {
		const model = options?.model || defaultImageModel;

		if (!isImageModel(model)) {
			throw new AIError(
				`Model '${model}' is not an image generation model`,
				"INVALID_MODEL",
				400,
			);
		}

		try {
			const apiKey = process.env.OPENROUTER_API_KEY;
			if (!apiKey) {
				throw new AIError(
					"OpenRouter API key not configured",
					"API_ERROR",
					503,
				);
			}

			const response = await fetch(
				"https://openrouter.ai/api/v1/chat/completions",
				{
					method: "POST",
					headers: {
						Authorization: `Bearer ${apiKey}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						model,
						messages: [{ role: "user", content: prompt }],
						modalities: ["image"],
					}),
				},
			);

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new AIError(
					errorData.error?.message ||
						`API request failed with status ${response.status}`,
					"API_ERROR",
					response.status,
				);
			}

			const data = await response.json();

			const images: string[] = [];
			let text: string | undefined;

			const choices = data.choices as Array<{
				message: {
					content?: string;
					images?: Array<{ image_url: { url: string } }>;
				};
			}>;

			if (choices && choices.length > 0) {
				const message = choices[0].message;
				if (message.content) {
					text = message.content;
				}
				if (message.images && message.images.length > 0) {
					for (const img of message.images) {
						images.push(img.image_url.url);
					}
				}
			}

			if (images.length === 0) {
				throw new AIError(
					"No images were generated",
					"IMAGE_GENERATION_FAILED",
					500,
				);
			}

			return { images, text };
		} catch (error) {
			if (error instanceof AIError) {
				throw error;
			}
			throw normalizeError(error);
		}
	},

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
