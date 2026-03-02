export interface ChatMessage {
	role: "user" | "assistant" | "system";
	content: string;
}

export interface ChatOptions {
	model?: string;
	temperature?: number;
	maxTokens?: number;
}

export interface ImageOptions {
	model?: string;
	aspectRatio?: string;
	imageSize?: string;
}

export interface ImageResponse {
	images: string[];
	text?: string;
}

export interface AIProvider {
	generateImage(prompt: string, options?: ImageOptions): Promise<ImageResponse>;
	chat(messages: ChatMessage[], options?: ChatOptions): Promise<string>;
	chatStream(
		messages: ChatMessage[],
		options?: ChatOptions,
	): AsyncIterable<string>;
	listModels(): string[];
	countTokens(text: string): Promise<number>;
}

export interface AIConfig {
	defaultModel: string;
	temperature: number;
	maxTokens: number;
	availableModels: {
		openai: string[];
		google: string[];
		anthropic: string[];
		xai: string[];
	};
}
