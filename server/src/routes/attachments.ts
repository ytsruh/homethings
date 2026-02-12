import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import type { JWTPayload } from "~/auth/jwt";
import { database } from "~/db";
import { noteAttachments, notes } from "~/db/schema";
import { deleteFiles, generatePresignedUrl, uploadFile } from "~/storage/r2";

const attachmentsRoutes = new Hono();

attachmentsRoutes.post("/notes/:id/attachments", async (c) => {
	const user = c.get("user");
	const params = c.req.param();
	const request = c.req.raw;

	const note = await database.query.notes.findFirst({
		where: and(eq(notes.id, params.id), eq(notes.createdBy, user.userId)),
	});

	if (!note) {
		return c.json({ error: "Note not found" }, 404);
	}

	const formData = await request.formData();
	const files = formData.getAll("files");
	const validFiles = files.filter((file) => file instanceof File) as File[];

	if (validFiles.length === 0) {
		return c.json({ error: "At least one file is required" }, 400);
	}

	const now = new Date();
	const createdAttachments = await Promise.all(
		validFiles.map(async (file) => {
			const attachmentId = crypto.randomUUID();
			const uploaded = await uploadFile(file, user.userId);
			await database.insert(noteAttachments).values({
				id: attachmentId,
				noteId: note.id,
				fileKey: uploaded.fileKey,
				fileName: uploaded.fileName,
				fileType: uploaded.fileType,
				fileSize: uploaded.fileSize,
				createdAt: now,
			});

			return {
				id: attachmentId,
				fileKey: uploaded.fileKey,
				fileName: uploaded.fileName,
				fileType: uploaded.fileType,
				fileSize: uploaded.fileSize,
				createdAt: now,
			};
		}),
	);

	return c.json(createdAttachments);
});

attachmentsRoutes.get("/notes/:id/attachments", async (c) => {
	const user = c.get("user");
	const params = c.req.param();

	const note = await database.query.notes.findFirst({
		where: and(eq(notes.id, params.id), eq(notes.createdBy, user.userId)),
		with: { attachments: true },
	});

	if (!note) {
		return c.json({ error: "Note not found" }, 404);
	}

	const bucketName = process.env.R2_BUCKET_NAME ?? "";
	const attachmentsWithUrls = await Promise.all(
		note.attachments.map(async (att) => ({
			...att,
			presignedUrl: await generatePresignedUrl(
				bucketName,
				att.fileKey,
				att.fileType,
			),
		})),
	);

	return c.json(attachmentsWithUrls);
});

attachmentsRoutes.delete("/notes/:id/attachments/:attachmentId", async (c) => {
	const user = c.get("user");
	const params = c.req.param();

	const note = await database.query.notes.findFirst({
		where: and(eq(notes.id, params.id), eq(notes.createdBy, user.userId)),
	});

	if (!note) {
		return c.json({ error: "Note not found" }, 404);
	}

	const attachment = await database.query.noteAttachments.findFirst({
		where: eq(noteAttachments.id, params.attachmentId),
	});

	if (!attachment) {
		return c.json({ error: "Attachment not found" }, 404);
	}

	if (attachment.noteId !== params.id) {
		return c.json({ error: "Attachment does not belong to this note" }, 400);
	}

	await deleteFiles([attachment.fileKey]);

	await database
		.delete(noteAttachments)
		.where(eq(noteAttachments.id, params.attachmentId));

	return c.json({ message: "Attachment deleted" });
});

attachmentsRoutes.get(
	"/notes/:id/attachments/:attachmentId/presigned",
	async (c) => {
		const user = c.get("user");
		const params = c.req.param();

		const note = await database.query.notes.findFirst({
			where: and(eq(notes.id, params.id), eq(notes.createdBy, user.userId)),
		});

		if (!note) {
			return c.json({ error: "Note not found" }, 404);
		}

		const attachment = await database.query.noteAttachments.findFirst({
			where: eq(noteAttachments.id, params.attachmentId),
		});

		if (!attachment) {
			return c.json({ error: "Attachment not found" }, 404);
		}

		if (attachment.noteId !== params.id) {
			return c.json({ error: "Attachment does not belong to this note" }, 400);
		}

		const bucketName = process.env.R2_BUCKET_NAME ?? "";
		const presignedUrl = await generatePresignedUrl(
			bucketName,
			attachment.fileKey,
			attachment.fileType,
		);

		return c.json({
			...attachment,
			presignedUrl,
		});
	},
);

export default attachmentsRoutes;

declare module "hono" {
	interface ContextVariableMap {
		user: JWTPayload;
	}
}
