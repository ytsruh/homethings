import { and, eq } from "drizzle-orm";
import { Elysia } from "elysia";
import { z } from "zod";
import { betterAuth } from "~/middleware/auth";
import { deleteFiles, generatePresignedUrl, uploadFile } from "~/storage/r2";
import { database } from "../db";
import { noteAttachments, notes } from "../db/schema";

const CreateNoteSchema = z.object({
	title: z.string().min(1, "Title is required"),
});

const UpdateNoteSchema = z.object({
	title: z.string().optional(),
	body: z.string().optional(),
	priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
});

const CompleteNoteSchema = z.object({
	completed: z.boolean(),
});

const notesRoutes = new Elysia({ name: "notes", prefix: "/notes" })
	.use(betterAuth)
	.post(
		"/",
		async ({ user, body }) => {
			const validated = CreateNoteSchema.parse(body);
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

			return createdNote[0];
		},
		{
			body: CreateNoteSchema,
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
				with: { attachments: true },
			});

			const bucketName = process.env.R2_BUCKET_NAME ?? "";
			const notesWithUrls = await Promise.all(
				userNotes.map(async (note) => ({
					...note,
					attachments: await Promise.all(
						note.attachments.map(async (att) => ({
							...att,
							presignedUrl: await generatePresignedUrl(
								bucketName,
								att.fileKey,
								att.fileType,
							),
						})),
					),
				})),
			);

			return notesWithUrls;
		},
		{
			query: z.object({
				completed: z.coerce.boolean(),
			}),
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
				with: { attachments: true },
			});

			if (!note) {
				throw new Error("Note not found");
			}

			const bucketName = process.env.R2_BUCKET_NAME ?? "";
			const noteWithUrls = {
				...note,
				attachments: await Promise.all(
					note.attachments.map(async (att) => ({
						...att,
						presignedUrl: await generatePresignedUrl(
							bucketName,
							att.fileKey,
							att.fileType,
						),
					})),
				),
			};

			return noteWithUrls;
		},
		{
			auth: true,
			detail: {
				tags: ["Notes"],
				description: "Get single note",
			},
		},
	)
	.patch(
		"/:id",
		async ({ user, params, request }) => {
			const note = await database.query.notes.findFirst({
				where: and(eq(notes.id, params.id), eq(notes.createdBy, user.id)),
			});

			if (!note) {
				throw new Error("Note not found");
			}

			const formData = await request.formData();
			const files = formData.getAll("files");
			const validFiles = files.filter((file) => file instanceof File);

			if (validFiles.length === 0) {
				throw new Error("At least one file is required");
			}

			const title = formData.get("title");
			const body = formData.get("body");
			const priority = formData.get("priority");

			const validatedData = UpdateNoteSchema.parse({
				title: title ?? undefined,
				body: body ?? undefined,
				priority: priority ?? undefined,
			});

			const now = new Date();
			await Promise.all(
				validFiles.map(async (file) => {
					const attachmentId = crypto.randomUUID();
					const uploaded = await uploadFile(file, user.id);
					await database.insert(noteAttachments).values({
						id: attachmentId,
						noteId: note.id,
						fileKey: uploaded.fileKey,
						fileName: uploaded.fileName,
						fileType: uploaded.fileType,
						fileSize: uploaded.fileSize,
						createdAt: now,
					});
				}),
			);

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
				with: { attachments: true },
			});

			return updated;
		},
		{
			auth: true,
			detail: {
				tags: ["Notes"],
				description: "Update note (at least one file required)",
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

			const fileKeys = note.attachments.map((att) => att.fileKey);
			await deleteFiles(fileKeys);

			await database.delete(notes).where(eq(notes.id, params.id));

			return { message: "Note deleted" };
		},
		{
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
				with: { attachments: true },
			});

			return updated;
		},
		{
			body: CompleteNoteSchema,
			auth: true,
			detail: {
				tags: ["Notes"],
				description: "Toggle note completion",
			},
		},
	);

export default notesRoutes;