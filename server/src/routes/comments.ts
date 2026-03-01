import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { timeout } from "hono/timeout";
import { database } from "~/db";
import { notes, notesComments } from "~/db/schema";
import { CreateCommentRequestSchema } from "~/lib/schemas";
import {
	throwBadRequest,
	throwNotFound,
	throwServerError,
} from "~/middleware/http-exception";
import type { JWTPayload } from "~/middleware/jwt";
import { createValidator } from "~/middleware/validator";

const commentsRoutes = new Hono<{ Variables: { user: JWTPayload } }>();

commentsRoutes.use("*", timeout(10000));

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
			throwNotFound("Note not found");
			return;
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
			throwServerError();
			return;
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
		throwNotFound("Note not found");
		return;
	}

	const comment = await database.query.notesComments.findFirst({
		where: eq(notesComments.id, params.commentId),
	});

	if (!comment) {
		throwNotFound("Comment not found");
		return;
	}

	if (comment.noteId !== params.id) {
		throwBadRequest("Comment does not belong to this note");
		return;
	}

	await database
		.delete(notesComments)
		.where(eq(notesComments.id, params.commentId));

	return c.json({ message: "Comment deleted" });
});

export default commentsRoutes;
