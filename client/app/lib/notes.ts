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

const mockNotes: Note[] = [
	{
		id: "1",
		title: "Project Planning",
		body: "Need to outline the scope for the Q2 project. Key stakeholders: marketing, engineering, product. Timeline: 6 weeks.",
		priority: "high",
		completed: false,
		createdAt: "2026-02-15T10:00:00Z",
		updatedAt: "2026-02-15T10:00:00Z",
	},
	{
		id: "2",
		title: "Buy groceries",
		body: "Milk, eggs, bread, butter, cheese, apples, bananas",
		priority: "low",
		completed: false,
		createdAt: "2026-02-14T08:30:00Z",
		updatedAt: "2026-02-14T08:30:00Z",
	},
	{
		id: "3",
		title: "Fix critical bug",
		body: "Users reporting login issues on mobile. Investigate OAuth flow.",
		priority: "urgent",
		completed: false,
		createdAt: "2026-02-15T14:00:00Z",
		updatedAt: "2026-02-15T14:00:00Z",
	},
	{
		id: "4",
		title: "Team meeting notes",
		body: "Discussed sprint planning. Action items: update Jira, schedule code review, review PRs.",
		priority: "medium",
		completed: true,
		createdAt: "2026-02-13T11:00:00Z",
		updatedAt: "2026-02-14T09:00:00Z",
	},
	{
		id: "5",
		title: "Research new tools",
		body: "Look into alternatives for current analytics platform. Options: Mixpanel, Amplitude, PostHog.",
		priority: "medium",
		completed: false,
		createdAt: "2026-02-12T16:00:00Z",
		updatedAt: "2026-02-12T16:00:00Z",
	},
	{
		id: "6",
		title: "Book flight",
		body: null,
		priority: "low",
		completed: false,
		createdAt: "2026-02-10T12:00:00Z",
		updatedAt: "2026-02-10T12:00:00Z",
	},
];

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

const mockComments: Comment[] = [
	{
		id: "c1",
		comment: "Let's schedule a meeting to discuss this further.",
		noteId: "1",
		createdAt: "2026-02-15T12:00:00Z",
	},
	{
		id: "c2",
		comment: "I've updated the priority based on latest feedback.",
		noteId: "1",
		createdAt: "2026-02-15T13:00:00Z",
	},
	{
		id: "c3",
		comment: "This is blocking the release, please prioritize.",
		noteId: "3",
		createdAt: "2026-02-15T15:00:00Z",
	},
	{
		id: "c3",
		comment: "This is blocking the release, please prioritize.",
		noteId: "3",
		createdAt: "2026-02-15T15:00:00Z",
	},
	{
		id: "c3",
		comment: "This is blocking the release, please prioritize.",
		noteId: "3",
		createdAt: "2026-02-15T15:00:00Z",
	},
	{
		id: "c3",
		comment: "This is blocking the release, please prioritize.",
		noteId: "3",
		createdAt: "2026-02-15T15:00:00Z",
	},
	{
		id: "c3",
		comment: "This is blocking the release, please prioritize.",
		noteId: "3",
		createdAt: "2026-02-15T15:00:00Z",
	},
	{
		id: "c3",
		comment: "This is blocking the release, please prioritize.",
		noteId: "3",
		createdAt: "2026-02-15T15:00:00Z",
	},
];

const notes = [...mockNotes];

function generateId(): string {
	return Math.random().toString(36).substring(2, 15);
}

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

		const note = await handleResponse<Note>(response);
		return {
			...note,
			createdAt: note.createdAt.toString(),
			updatedAt: note.updatedAt.toString(),
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
	updates: Partial<Pick<Note, "title" | "body" | "priority">>,
): Promise<Note> {
	await new Promise((resolve) => setTimeout(resolve, 300));
	const index = notes.findIndex((note) => note.id === id);
	if (index === -1) {
		throw new Error("Note not found");
	}
	notes[index] = {
		...notes[index],
		...updates,
		updatedAt: new Date().toISOString(),
	};
	return notes[index];
}

export async function setNoteComplete(
	id: string,
	completed: boolean,
): Promise<Note> {
	await new Promise((resolve) => setTimeout(resolve, 200));
	const index = notes.findIndex((note) => note.id === id);
	if (index === -1) {
		throw new Error("Note not found");
	}
	notes[index] = {
		...notes[index],
		completed,
		updatedAt: new Date().toISOString(),
	};
	return notes[index];
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

export async function getNoteComments(noteId: string): Promise<Comment[]> {
	await new Promise((resolve) => setTimeout(resolve, 200));
	return mockComments
		.filter((comment) => comment.noteId === noteId)
		.sort(
			(a, b) =>
				new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
		);
}

export async function addComment(
	noteId: string,
	commentText: string,
): Promise<Comment> {
	await new Promise((resolve) => setTimeout(resolve, 300));
	const newComment: Comment = {
		id: generateId(),
		comment: commentText,
		noteId,
		createdAt: new Date().toISOString(),
	};
	mockComments.push(newComment);
	return newComment;
}

export async function deleteComment(
	noteId: string,
	commentId: string,
): Promise<{ message: string }> {
	await new Promise((resolve) => setTimeout(resolve, 200));
	const index = mockComments.findIndex(
		(comment) => comment.id === commentId && comment.noteId === noteId,
	);
	if (index === -1) {
		throw new Error("Comment not found");
	}
	mockComments.splice(index, 1);
	return { message: "Comment deleted" };
}

export function formatFileSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getFileIcon(fileType: string): string {
	if (fileType.startsWith("image/")) return "🖼️";
	if (fileType === "application/pdf") return "📄";
	if (fileType.includes("word") || fileType.includes("document")) return "📝";
	if (fileType.includes("spreadsheet") || fileType.includes("excel"))
		return "📊";
	if (fileType.includes("text")) return "📃";
	if (fileType.includes("zip") || fileType.includes("archive")) return "📦";
	return "📎";
}
