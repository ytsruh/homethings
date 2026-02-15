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

export type NotePriority = "low" | "medium" | "high" | "urgent";

export interface Note {
	id: string;
	title: string;
	body: string | null;
	priority: NotePriority;
	completed: boolean;
	createdAt: string;
	updatedAt: string;
	comments?: Comment[];
}

export interface Attachment {
	id: string;
	fileKey: string;
	fileName: string;
	fileType: string;
	fileSize: number;
	noteId: string;
	createdAt: string;
	presignedUrl?: string;
}

export interface Comment {
	id: string;
	comment: string;
	noteId: string;
	createdAt: string;
}

const mockAttachments: Attachment[] = [
	{
		id: "a1",
		fileKey: "notes/1/screenshot.png",
		fileName: "screenshot.png",
		fileType: "image/png",
		fileSize: 245000,
		noteId: "1",
		createdAt: "2026-02-15T11:00:00Z",
		presignedUrl: "#",
	},
	{
		id: "a2",
		fileKey: "notes/1/specs.pdf",
		fileName: "project-specs.pdf",
		fileType: "application/pdf",
		fileSize: 1250000,
		noteId: "1",
		createdAt: "2026-02-15T11:30:00Z",
		presignedUrl: "#",
	},
	{
		id: "a3",
		fileKey: "notes/3/error-log.txt",
		fileName: "error-log.txt",
		fileType: "text/plain",
		fileSize: 15000,
		noteId: "3",
		createdAt: "2026-02-15T14:30:00Z",
		presignedUrl: "#",
	},
];

export async function getNotes(completed?: boolean): Promise<Note[]> {
	let url = getApiUrl("/api/notes");
	if (completed !== undefined) {
		url += `?completed=${completed}`;
	}

	const response = await fetch(url, {
		method: "GET",
		credentials: "include",
	});

	const notes = await handleResponse<Note[]>(response);
	return notes.map((note) => ({
		...note,
		createdAt: note.createdAt.toString(),
		updatedAt: note.updatedAt.toString(),
	}));
}

export async function getNote(id: string): Promise<Note | null> {
	try {
		const response = await fetch(getApiUrl(`/api/notes/${id}`), {
			method: "GET",
			credentials: "include",
		});

		if (response.status === 404) {
			return null;
		}

		const note = await handleResponse<Note & { comments?: Comment[] }>(
			response,
		);
		return {
			...note,
			createdAt: note.createdAt.toString(),
			updatedAt: note.updatedAt.toString(),
			comments: note.comments?.map((c) => ({
				...c,
				createdAt: c.createdAt.toString(),
			})),
		};
	} catch {
		return null;
	}
}

export async function createNote(
	title: string,
	priority: NotePriority = "medium",
	body: string | null = null,
): Promise<Note> {
	const response = await fetch(getApiUrl("/api/notes"), {
		method: "POST",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ title, body, priority }),
	});

	const note = await handleResponse<Note>(response);
	return {
		...note,
		createdAt: note.createdAt.toString(),
		updatedAt: note.updatedAt.toString(),
	};
}

export async function updateNote(
	id: string,
	updates: Partial<Pick<Note, "title" | "body" | "priority" | "completed">>,
): Promise<Note> {
	const response = await fetch(getApiUrl(`/api/notes/${id}`), {
		method: "PATCH",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(updates),
	});

	const note = await handleResponse<Note>(response);
	return {
		...note,
		createdAt: note.createdAt.toString(),
		updatedAt: note.updatedAt.toString(),
	};
}

export async function deleteNote(id: string): Promise<{ message: string }> {
	const response = await fetch(getApiUrl(`/api/notes/${id}`), {
		method: "DELETE",
		credentials: "include",
	});

	return handleResponse<{ message: string }>(response);
}

export async function getAttachments(noteId: string): Promise<Attachment[]> {
	await new Promise((resolve) => setTimeout(resolve, 200));
	return mockAttachments.filter((att) => att.noteId === noteId);
}

export async function addComment(
	noteId: string,
	commentText: string,
): Promise<Comment> {
	const response = await fetch(getApiUrl(`/api/notes/${noteId}/comments`), {
		method: "POST",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ comment: commentText }),
	});

	const comment = await handleResponse<Comment>(response);
	return {
		...comment,
		createdAt: comment.createdAt.toString(),
	};
}

export async function deleteComment(
	noteId: string,
	commentId: string,
): Promise<{ message: string }> {
	const response = await fetch(
		getApiUrl(`/api/notes/${noteId}/comments/${commentId}`),
		{
			method: "DELETE",
			credentials: "include",
		},
	);

	return handleResponse<{ message: string }>(response);
}

export function formatFileSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
