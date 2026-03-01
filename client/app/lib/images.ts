const API_BASE_URL =
	import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export interface ImageModelsResponse {
	models: string[];
	default: string;
}

export interface ImageGenerationResponse {
	images: string[];
	text?: string;
}

interface ImageError {
	error: string;
}

function getApiUrl(endpoint: string): string {
	return `${API_BASE_URL}${endpoint}`;
}

async function handleResponse<T>(response: Response): Promise<T> {
	if (!response.ok) {
		const error = (await response.json().catch(() => ({
			error: "An unexpected error occurred",
		}))) as ImageError;
		throw new Error(error.error || "Request failed");
	}
	return response.json() as Promise<T>;
}

export async function getImageModels(): Promise<ImageModelsResponse> {
	const response = await fetch(getApiUrl("/api/images/models"), {
		method: "GET",
		credentials: "include",
	});

	return handleResponse<ImageModelsResponse>(response);
}

export interface GenerateImageRequest {
	prompt: string;
	model?: string;
}

export async function generateImage(
	prompt: string,
	model?: string,
): Promise<ImageGenerationResponse> {
	const response = await fetch(getApiUrl("/api/images/generate"), {
		method: "POST",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ prompt, model }),
	});

	return handleResponse<ImageGenerationResponse>(response);
}
