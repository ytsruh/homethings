export class AIError extends Error {
	constructor(
		message: string,
		public code: AIErrorCode,
		public statusCode: number = 500,
		public originalError?: unknown,
	) {
		super(message);
		this.name = "AIError";
	}
}

export type AIErrorCode =
	| "INVALID_MODEL"
	| "INVALID_MESSAGE"
	| "RATE_LIMITED"
	| "QUOTA_EXCEEDED"
	| "MODEL_UNAVAILABLE"
	| "CONTENT_FILTERED"
	| "TOKEN_LIMIT_EXCEEDED"
	| "API_ERROR"
	| "STREAMING_ERROR"
	| "IMAGE_GENERATION_FAILED";

export function normalizeError(error: unknown): AIError {
	if (error instanceof AIError) {
		return error;
	}

	const errorMessage = error instanceof Error ? error.message : "Unknown error";
	const errorCode = errorMessage.toLowerCase();

	if (errorCode.includes("model") && errorCode.includes("not found")) {
		return new AIError(errorMessage, "INVALID_MODEL", 400, error);
	}
	if (errorCode.includes("rate limit")) {
		return new AIError(errorMessage, "RATE_LIMITED", 429, error);
	}
	if (errorCode.includes("quota") || errorCode.includes("credits")) {
		return new AIError(errorMessage, "QUOTA_EXCEEDED", 402, error);
	}
	if (errorCode.includes("content filter") || errorCode.includes("safety")) {
		return new AIError(errorMessage, "CONTENT_FILTERED", 400, error);
	}
	if (
		errorCode.includes("context length") ||
		errorCode.includes("token limit")
	) {
		return new AIError(errorMessage, "TOKEN_LIMIT_EXCEEDED", 400, error);
	}

	return new AIError(errorMessage, "API_ERROR", 500, error);
}
