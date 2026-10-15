import { z } from "zod/v4";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export const loginForm = z.object({
  email: z.email("Please enter a valid email address"),
  password: z
    .string()
    .min(6, "Please enter a password of at least 8 characters"),
});

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
  error?: string;
  message?: string;
}

export class AuthHttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "AuthHttpError";
    this.status = status;
  }
}

function getAuthUrl(endpoint: string): string {
  return `${API_BASE_URL}${endpoint}`;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = (await response.json().catch(() => ({
      error: "An unexpected error occurred",
      message: "An unexpected error occurred",
    }))) as AuthError;
    throw new AuthHttpError(
      response.status,
      error.error || error.message || "Request failed",
    );
  }
  return response.json() as Promise<T>;
}

// Short-lived session snapshot of the authenticated user. sessionStorage (not
// localStorage) so the snapshot dies with the tab/browser and can never leak
// to the next user of a shared device. The HttpOnly auth cookie remains the
// source of truth; this only avoids blocking first paint on a network fetch.
const USER_CACHE_KEY = "ht:user-cache:v1";
const USER_CACHE_TTL_MS = 5 * 60 * 1000;

interface CachedUser {
  user: User;
  fetchedAt: number;
}

function readCache(): CachedUser | null {
  try {
    if (typeof sessionStorage === "undefined") return null;
    const raw = sessionStorage.getItem(USER_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedUser;
    if (!parsed?.user?.id || typeof parsed.fetchedAt !== "number") {
      sessionStorage.removeItem(USER_CACHE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function getCachedUser(): { user: User; fresh: boolean } | null {
  const cached = readCache();
  if (!cached) return null;
  return {
    user: cached.user,
    fresh: Date.now() - cached.fetchedAt < USER_CACHE_TTL_MS,
  };
}

export function setCachedUser(user: User): void {
  try {
    if (typeof sessionStorage === "undefined") return;
    sessionStorage.setItem(
      USER_CACHE_KEY,
      JSON.stringify({ user, fetchedAt: Date.now() } satisfies CachedUser),
    );
  } catch {
    // Storage full or unavailable (private mode) — caching is best-effort.
  }
}

export function clearCachedUser(): void {
  try {
    if (typeof sessionStorage === "undefined") return;
    sessionStorage.removeItem(USER_CACHE_KEY);
  } catch {
    // Ignore — see above.
  }
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

  const result = await handleResponse<LoginResponse>(response);
  setCachedUser(result.user);
  return result;
}

export async function logout(): Promise<void> {
  try {
    await fetch(getAuthUrl("/auth/logout"), {
      method: "POST",
      credentials: "include",
    });
  } finally {
    clearCachedUser();
  }
}

export async function getCurrentUser(): Promise<{ user: User }> {
  const response = await fetch(getAuthUrl("/auth/me"), {
    method: "GET",
    credentials: "include",
  });

  return handleResponse<{ user: User }>(response);
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  password?: string;
}

export async function updateUser(
  updates: UpdateUserRequest,
): Promise<{ message: string }> {
  const response = await fetch(getAuthUrl("/auth/me"), {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });

  return handleResponse<{ message: string }>(response);
}
