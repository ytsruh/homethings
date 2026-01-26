import { and, eq } from "drizzle-orm";
import { Elysia } from "elysia";
import { betterAuth } from "~/middleware/auth";
import {
	CompleteNoteRequestSchema,
	CreateNoteRequestSchema,
	ListNotesQuerySchema,
	NotePathSchema,
	NoteResponseSchema,
	NotesListResponseSchema,
	UpdateNoteRequestSchema,
} from "~/schemas";
import { deleteFiles } from "~/storage/r2";
import { database } from "../db";
import { notes } from "../db/schema";

const notesRoutes = new Elysia({ name: "notes", prefix: "/notes" })
	.use(betterAuth)
	.post(
		"/",
		async ({ user, body }) => {
			const validated = CreateNoteRequestSchema.parse(body);
			const now = new Date();
			const noteId = crypto.randomUUID();
			await database.insert(notes).values({
				id: noteId,
				title: validated.title,
				priority: "medium",
				completed: false,
				createdBy: user.id,
				createdAt: now,
				updatedAt: now,
			});

			const createdNote = await database
				.select()
				.from(notes)
				.where(eq(notes.id, noteId))
				.limit(1);

			if (!createdNote[0]) {
				throw new Error("Failed to create note");
			}

			return createdNote[0];
		},
		{
			body: CreateNoteRequestSchema,
			response: NoteResponseSchema,
			auth: true,
			detail: {
				tags: ["Notes"],
				description: "Create a note",
			},
		},
	)
	.get(
		"/",
		async ({ user, query }) => {
			const userNotes = await database.query.notes.findMany({
				where: and(
					eq(notes.completed, query.completed),
					eq(notes.createdBy, user.id),
				),
			});

			return userNotes;
		},
		{
			query: ListNotesQuerySchema,
			response: NotesListResponseSchema,
			auth: true,
			detail: {
				tags: ["Notes"],
				description: "List notes (completed query parameter required)",
			},
		},
	)
	.get(
		"/:id",
		async ({ user, params }) => {
			const note = await database.query.notes.findFirst({
				where: and(eq(notes.id, params.id), eq(notes.createdBy, user.id)),
			});

			if (!note) {
				throw new Error("Note not found");
			}

			return note;
		},
		{
			params: NotePathSchema,
			response: NoteResponseSchema,
			auth: true,
			detail: {
				tags: ["Notes"],
				description: "Get single note",
			},
		},
	)
	.patch(
		"/:id",
		async ({ user, params, body }) => {
			const note = await database.query.notes.findFirst({
				where: and(eq(notes.id, params.id), eq(notes.createdBy, user.id)),
			});

			if (!note) {
				throw new Error("Note not found");
			}

			const validatedData = UpdateNoteRequestSchema.parse(body);

			await database
				.update(notes)
				.set({
					title: validatedData.title ?? note.title,
					body: validatedData.body ?? note.body,
					priority: validatedData.priority ?? note.priority,
				})
				.where(eq(notes.id, note.id));

			const updated = await database.query.notes.findFirst({
				where: eq(notes.id, note.id),
			});

			if (!updated) {
				throw new Error("Failed to update note");
			}

			return updated;
		},
		{
			params: NotePathSchema,
			body: UpdateNoteRequestSchema,
			response: NoteResponseSchema,
			auth: true,
			detail: {
				tags: ["Notes"],
				description: "Update note",
			},
		},
	)
	.delete(
		"/:id",
		async ({ user, params }) => {
			const note = await database.query.notes.findFirst({
				where: and(eq(notes.id, params.id), eq(notes.createdBy, user.id)),
				with: { attachments: true },
			});

			if (!note) {
				throw new Error("Note not found");
			}

			const fileKeys = note.attachments.map(
				(att: { fileKey: string }) => att.fileKey,
			);
			await deleteFiles(fileKeys);

			await database.delete(notes).where(eq(notes.id, params.id));

			return { message: "Note deleted" };
		},
		{
			params: NotePathSchema,
			auth: true,
			detail: {
				tags: ["Notes"],
				description: "Delete note",
			},
		},
	)
	.patch(
		"/:id/complete",
		async ({ user, params, body }) => {
			const note = await database.query.notes.findFirst({
				where: and(eq(notes.id, params.id), eq(notes.createdBy, user.id)),
			});

			if (!note) {
				throw new Error("Note not found");
			}

			await database
				.update(notes)
				.set({ completed: body.completed })
				.where(eq(notes.id, params.id));

			const updated = await database.query.notes.findFirst({
				where: eq(notes.id, params.id),
			});

			if (!updated) {
				throw new Error("Failed to update note");
			}

			return updated;
		},
		{
			params: NotePathSchema,
			body: CompleteNoteRequestSchema,
			response: NoteResponseSchema,
			auth: true,
			detail: {
				tags: ["Notes"],
				description: "Toggle note completion",
			},
		},
	);

export default notesRoutes;
