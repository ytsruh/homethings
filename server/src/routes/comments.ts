import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { database } from "~/db";
import { notes, notesComments } from "~/db/schema";
import type { JWTPayload } from "~/middleware/jwt";
import { createValidator } from "~/middleware/validator";
import { CreateCommentRequestSchema } from "~/schemas";

const commentsRoutes = new Hono<{ Variables: { user: JWTPayload } }>();

commentsRoutes.post(
	"/notes/:id/comments",
	createValidator(CreateCommentRequestSchema),
	async (c) => {
		const user = c.get("user");
		const params = c.req.param();
		const body = c.req.valid("json");

		const note = await database.query.notes.findFirst({
			where: and(eq(notes.id, params.id), eq(notes.createdBy, user.userId)),
		});

		if (!note) {
			return c.json({ error: "Note not found" }, 404);
		}

		const now = new Date();
		const commentId = crypto.randomUUID();

		await database.insert(notesComments).values({
			id: commentId,
			comment: body.comment,
			noteId: note.id,
			createdAt: now,
		});

		const createdComment = await database.query.notesComments.findFirst({
			where: eq(notesComments.id, commentId),
		});

		if (!createdComment) {
			return c.json({ error: "Failed to create comment" }, 500);
		}

		return c.json(createdComment);
	},
);

commentsRoutes.delete("/notes/:id/comments/:commentId", async (c) => {
	const user = c.get("user");
	const params = c.req.param();

	const note = await database.query.notes.findFirst({
		where: and(eq(notes.id, params.id), eq(notes.createdBy, user.userId)),
	});

	if (!note) {
		return c.json({ error: "Note not found" }, 404);
	}

	const comment = await database.query.notesComments.findFirst({
		where: eq(notesComments.id, params.commentId),
	});

	if (!comment) {
		return c.json({ error: "Comment not found" }, 404);
	}

	if (comment.noteId !== params.id) {
		return c.json({ error: "Comment does not belong to this note" }, 400);
	}

	await database
		.delete(notesComments)
		.where(eq(notesComments.id, params.commentId));

	return c.json({ message: "Comment deleted" });
});

export default commentsRoutes;
