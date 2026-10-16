const API_BASE_URL =
	import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

function getApiUrl(endpoint: string): string {
	return `${API_BASE_URL}${endpoint}`;
}

async function handleResponse<T>(response: Response): Promise<T> {
	if (!response.ok) {
		const error = (await response.json().catch(() => ({
			message: "Request failed",
		}))) as { message?: string };
		throw new Error(error.message || "Request failed");
	}
	return response.json() as Promise<T>;
}

export interface ChatModel {
	id: string;
	label: string;
	blurb: string;
	contextWindow: number;
	supportsImages: boolean;
}

export interface ChatModelsResponse {
	default: string;
	models: ChatModel[];
}

export interface ChatSession {
	id: string;
	model: string;
	title: string;
	createdAt: string;
	updatedAt: string;
}

export interface ChatMessagePart {
	type: string;
	text?: string;
	mediaType?: string;
	filename?: string;
	url?: string;
}

export interface ChatHistoryMessage {
	id: string;
	role: string;
	parts: ChatMessagePart[];
	createdAt: string;
}

export interface ChatSessionDetail {
	session: ChatSession;
	messages: ChatHistoryMessage[];
}

export async function getChatModels(): Promise<ChatModelsResponse> {
	const response = await fetch(getApiUrl("/api/chat/models"), {
		credentials: "include",
	});
	return handleResponse<ChatModelsResponse>(response);
}

export async function listChatSessions(): Promise<ChatSession[]> {
	const response = await fetch(getApiUrl("/api/chat/sessions"), {
		credentials: "include",
	});
	return handleResponse<ChatSession[]>(response);
}

export async function getChatSession(id: string): Promise<ChatSessionDetail> {
	const response = await fetch(getApiUrl(`/api/chat/sessions/${id}`), {
		credentials: "include",
	});
	return handleResponse<ChatSessionDetail>(response);
}

export async function renameChatSession(
	id: string,
	title: string,
): Promise<ChatSession> {
	const response = await fetch(getApiUrl(`/api/chat/sessions/${id}`), {
		method: "PATCH",
		credentials: "include",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ title }),
	});
	return handleResponse<ChatSession>(response);
}

export async function deleteChatSession(id: string): Promise<void> {
	const response = await fetch(getApiUrl(`/api/chat/sessions/${id}`), {
		method: "DELETE",
		credentials: "include",
	});
	if (!response.ok) {
		const error = (await response.json().catch(() => ({
			message: "Request failed",
		}))) as { message?: string };
		throw new Error(error.message || "Request failed");
	}
}

export interface ChatUsageByModel {
	model: string;
	turns: number;
	promptTokens: number;
	completionTokens: number;
	totalTokens: number;
}

export interface ChatDailyUsageRow extends ChatUsageByModel {
	date: string;
}

export interface ChatDailyUsage {
	days: number;
	since: number;
	totals: ChatUsageByModel[];
	daily: ChatDailyUsageRow[];
}

export async function getChatUsage(): Promise<ChatUsageByModel[]> {
	const response = await fetch(getApiUrl("/api/chat/usage"), {
		credentials: "include",
	});
	const data = await handleResponse<{ models: ChatUsageByModel[] }>(response);
	return data.models ?? [];
}

export async function getChatDailyUsage(days = 30): Promise<ChatDailyUsage> {
	const response = await fetch(
		getApiUrl(`/api/chat/usage/daily?days=${days}`),
		{
			credentials: "include",
		},
	);
	const data = await handleResponse<ChatDailyUsage>(response);
	return {
		days: data.days ?? days,
		since: data.since ?? 0,
		totals: data.totals ?? [],
		daily: data.daily ?? [],
	};
}
