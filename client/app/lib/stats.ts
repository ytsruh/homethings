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

export interface Stats {
	notes: {
		open: number;
		completed: number;
	};
	recipes: {
		total: number;
	};
}

export async function getStats(): Promise<Stats> {
	const response = await fetch(getApiUrl("/api/stats"), {
		credentials: "include",
	});
	const data = await handleResponse<Stats>(response);
	return {
		notes: {
			open: data.notes?.open ?? 0,
			completed: data.notes?.completed ?? 0,
		},
		recipes: {
			total: data.recipes?.total ?? 0,
		},
	};
}
