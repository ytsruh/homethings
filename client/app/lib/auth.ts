const API_BASE_URL =
	import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export interface User {
	id: string;
	email: string;
	name: string;
}

interface LoginResponse {
	message: string;
	user: User;
}

interface AuthError {
	error: string;
}

function getAuthUrl(endpoint: string): string {
	return `${API_BASE_URL}${endpoint}`;
}

async function handleResponse<T>(response: Response): Promise<T> {
	if (!response.ok) {
		const error = (await response.json().catch(() => ({
			error: "An unexpected error occurred",
		}))) as AuthError;
		throw new Error(error.error || "Request failed");
	}
	return response.json() as Promise<T>;
}

export async function login(
	email: string,
	password: string,
): Promise<LoginResponse> {
	const response = await fetch(getAuthUrl("/auth/login"), {
		method: "POST",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ email, password }),
	});

	return handleResponse<LoginResponse>(response);
}

export async function logout(): Promise<void> {
	await fetch(getAuthUrl("/auth/logout"), {
		method: "POST",
		credentials: "include",
	});
}

export async function getCurrentUser(): Promise<{ user: User }> {
	const response = await fetch(getAuthUrl("/auth/me"), {
		method: "GET",
		credentials: "include",
	});

	return handleResponse<{ user: User }>(response);
}

export async function checkAuth(): Promise<User | null> {
	try {
		const { user } = await getCurrentUser();
		return user;
	} catch {
		return null;
	}
}
