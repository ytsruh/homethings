const API_BASE_URL =
	import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export interface ChatMessage {
	id: number;
	role: "user" | "assistant";
	content: string;
}

export interface ChatModel {
	id: string;
	name: string;
}

export interface ModelsResponse {
	models: string[];
	default: string;
}

interface ChatError {
	error: string;
}

function getApiUrl(endpoint: string): string {
	return `${API_BASE_URL}${endpoint}`;
}

async function handleResponse<T>(response: Response): Promise<T> {
	if (!response.ok) {
		const error = (await response.json().catch(() => ({
			error: "An unexpected error occurred",
		}))) as ChatError;
		throw new Error(error.error || "Request failed");
	}
	return response.json() as Promise<T>;
}

export async function getAvailableModels(): Promise<ModelsResponse> {
	const response = await fetch(getApiUrl("/api/chat/models"), {
		method: "GET",
		credentials: "include",
	});

	return handleResponse<ModelsResponse>(response);
}

export interface ChatRequest {
	message: string;
	model?: string;
}

export interface ChatResponse {
	response: string;
}

export async function sendChatMessage(
	message: string,
	model?: string,
): Promise<ChatResponse> {
	const response = await fetch(getApiUrl("/api/chat"), {
		method: "POST",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ message, model }),
	});

	return handleResponse<ChatResponse>(response);
}

export async function streamChatMessage(
	messages: ChatMessage[],
	model?: string,
): Promise<Response> {
	const lastMessage = messages[messages.length - 1];
	const response = await fetch(getApiUrl("/api/chat/stream"), {
		method: "POST",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			message: lastMessage.content,
			model,
		}),
	});

	if (!response.ok) {
		const contentType = response.headers.get("content-type");
		let errorMessage = "Chat request failed";

		if (contentType?.includes("application/json")) {
			const error = (await response.json().catch(() => ({
				error: "An unexpected error occurred",
			}))) as ChatError;
			errorMessage = error.error || errorMessage;
		} else {
			const text = await response.text().catch(() => "");
			errorMessage = text || errorMessage;
		}

		throw new Error(errorMessage);
	}

	return response;
}
