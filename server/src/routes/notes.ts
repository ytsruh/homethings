import { zValidator } from "@hono/zod-validator";
import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { database } from "~/db";
import { notes } from "~/db/schema";
import {
	CreateNoteRequestSchema,
	ListNotesQuerySchema,
	NotePathSchema,
	UpdateNoteRequestSchema,
} from "~/lib/schemas";
import { deleteFiles } from "~/lib/storage/r2";
import { throwNotFound, throwServerError } from "~/middleware/http-exception";
import type { JWTPayload } from "~/middleware/jwt";
import { createValidator } from "~/middleware/validator";

const notesRoutes = new Hono<{ Variables: { user: JWTPayload } }>();

notesRoutes.post(
	"/notes",
	createValidator(CreateNoteRequestSchema),
	async (c) => {
		const user = c.get("user");
		const body = c.req.valid("json");
		const now = new Date();
		const noteId = crypto.randomUUID();

		await database.insert(notes).values({
			id: noteId,
			title: body.title,
			body: body.body || "",
			priority: body.priority || "medium",
			completed: false,
			createdBy: user.userId,
			createdAt: now,
			updatedAt: now,
		});

		const createdNote = await database
			.select()
			.from(notes)
			.where(eq(notes.id, noteId))
			.limit(1);

		if (!createdNote[0]) {
			throwServerError();
			return;
		}

		return c.json(createdNote[0]);
	},
);

notesRoutes.get(
	"/notes",
	createValidator(ListNotesQuerySchema, "query"),
	async (c) => {
		const user = c.get("user");
		const query = c.req.valid("query");

		const userNotes = await database.query.notes.findMany({
			where: and(
				eq(notes.completed, query.completed),
				eq(notes.createdBy, user.userId),
			),
		});

		return c.json(userNotes);
	},
);

notesRoutes.get(
	"/notes/:id",
	zValidator("param", NotePathSchema),
	async (c) => {
		const user = c.get("user");
		const params = c.req.valid("param");

		const note = await database.query.notes.findFirst({
			where: and(eq(notes.id, params.id), eq(notes.createdBy, user.userId)),
		});

		if (!note) {
			throwNotFound("Note not found");
			return;
		}

		return c.json(note);
	},
);

notesRoutes.patch(
	"/notes/:id",
	zValidator("param", NotePathSchema),
	createValidator(UpdateNoteRequestSchema),
	async (c) => {
		const user = c.get("user");
		const params = c.req.valid("param");
		const body = c.req.valid("json");

		const note = await database.query.notes.findFirst({
			where: and(eq(notes.id, params.id), eq(notes.createdBy, user.userId)),
		});

		if (!note) {
			throwNotFound("Note not found");
			return;
		}

		await database
			.update(notes)
			.set({
				title: body.title ?? note.title,
				body: body.body ?? note.body,
				priority: body.priority ?? note.priority,
				completed: body.completed ?? note.completed,
			})
			.where(eq(notes.id, note.id));

		const updated = await database.query.notes.findFirst({
			where: eq(notes.id, note.id),
		});

		if (!updated) {
			throwServerError();
			return;
		}

		return c.json(updated);
	},
);

notesRoutes.delete(
	"/notes/:id",
	zValidator("param", NotePathSchema),
	async (c) => {
		const user = c.get("user");
		const params = c.req.param();

		const note = await database.query.notes.findFirst({
			where: and(eq(notes.id, params.id), eq(notes.createdBy, user.userId)),
			with: { attachments: true },
		});

		if (!note) {
			throwNotFound("Note not found");
			return;
		}

		const fileKeys = note.attachments.map((att) => att.fileKey);
		await deleteFiles(fileKeys);

		await database.delete(notes).where(eq(notes.id, params.id));

		return c.json({ message: "Note deleted" });
	},
);

export default notesRoutes;
