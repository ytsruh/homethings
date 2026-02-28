const API_BASE_URL =
	import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

function getApiUrl(endpoint: string): string {
	return `${API_BASE_URL}${endpoint}`;
}

async function handleResponse<T>(response: Response): Promise<T> {
	if (!response.ok) {
		const error = (await response.json().catch(() => ({
			error: "An unexpected error occurred",
		}))) as { error: string };
		throw new Error(error.error || "Request failed");
	}
	return response.json() as Promise<T>;
}

export interface FileItem {
	id: string;
	fileKey: string;
	fileName: string;
	fileType: string;
	fileSize: number;
	createdAt: string;
	presignedUrl?: string;
}

export async function getFiles(): Promise<FileItem[]> {
	const response = await fetch(getApiUrl("/api/files"), {
		method: "GET",
		credentials: "include",
	});

	const files = await handleResponse<FileItem[]>(response);
	return files.map((file) => ({
		...file,
		createdAt: file.createdAt.toString(),
	}));
}

export async function getUploadUrl(
	fileName: string,
	fileType: string,
	fileSize: number,
): Promise<{ id: string; fileKey: string; presignedUrl: string }> {
	const response = await fetch(getApiUrl("/api/files/upload"), {
		method: "POST",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ fileName, fileType, fileSize }),
	});

	const result = await handleResponse<{
		id: string;
		fileKey: string;
		presignedUrl: string;
	}>(response);
	return result;
}

export async function uploadFile(
	presignedUrl: string,
	file: File,
): Promise<void> {
	const response = await fetch(presignedUrl, {
		method: "PUT",
		headers: {
			"Content-Type": file.type || "application/octet-stream",
		},
		body: file,
	});

	if (!response.ok) {
		throw new Error("Failed to upload file");
	}
}

export async function getFileDownloadUrl(
	id: string,
): Promise<{ presignedUrl: string }> {
	const response = await fetch(getApiUrl(`/api/files/${id}`), {
		method: "GET",
		credentials: "include",
	});

	const result = await handleResponse<{ presignedUrl: string }>(response);
	return result;
}

export async function deleteFile(id: string): Promise<{ message: string }> {
	const response = await fetch(getApiUrl(`/api/files/${id}`), {
		method: "DELETE",
		credentials: "include",
	});

	return handleResponse<{ message: string }>(response);
}
