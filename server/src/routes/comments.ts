import { and, eq } from "drizzle-orm";
import { Elysia } from "elysia";
import { betterAuth } from "~/middleware/auth";
import {
	CommentPathSchema,
	CommentResponseSchema,
	CreateCommentRequestSchema,
	DeleteResponseSchema,
} from "~/schemas";
import { database } from "../db";
import { notes, notesComments } from "../db/schema";

const commentsRoutes = new Elysia({
	name: "comments",
	prefix: "/notes",
})
	.use(betterAuth)
	.post(
		"/:id/comments",
		async ({ user, params, body }) => {
			const note = await database.query.notes.findFirst({
				where: and(eq(notes.id, params.id), eq(notes.createdBy, user.id)),
			});

			if (!note) {
				throw new Error("Note not found");
			}

			const validated = CreateCommentRequestSchema.parse(body);
			const now = new Date();
			const commentId = crypto.randomUUID();

			await database.insert(notesComments).values({
				id: commentId,
				comment: validated.comment,
				noteId: note.id,
				createdAt: now,
			});

			const createdComment = await database.query.notesComments.findFirst({
				where: eq(notesComments.id, commentId),
			});

			if (!createdComment) {
				throw new Error("Failed to create comment");
			}

			return createdComment;
		},
		{
			params: CommentPathSchema.pick({ id: true }),
			body: CreateCommentRequestSchema,
			response: CommentResponseSchema,
			auth: true,
			detail: {
				tags: ["Comments"],
				description: "Create a comment on a note",
			},
		},
	)
	.delete(
		"/:id/comments/:commentId",
		async ({ user, params }) => {
			const note = await database.query.notes.findFirst({
				where: and(eq(notes.id, params.id), eq(notes.createdBy, user.id)),
			});

			if (!note) {
				throw new Error("Note not found");
			}

			const comment = await database.query.notesComments.findFirst({
				where: eq(notesComments.id, params.commentId),
			});

			if (!comment) {
				throw new Error("Comment not found");
			}

			if (comment.noteId !== params.id) {
				throw new Error("Comment does not belong to this note");
			}

			await database
				.delete(notesComments)
				.where(eq(notesComments.id, params.commentId));

			return { message: "Comment deleted" };
		},
		{
			params: CommentPathSchema,
			response: DeleteResponseSchema,
			auth: true,
			detail: {
				tags: ["Comments"],
				description: "Delete a comment from a note",
			},
		},
	);

export default commentsRoutes;
