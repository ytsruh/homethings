import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { database } from "~/db";
import { noteAttachments, notes } from "~/db/schema";
import { throwBadRequest, throwNotFound } from "~/middleware/http-exception";
import type { JWTPayload } from "~/middleware/jwt";
import { deleteFiles, generatePresignedUrl, uploadFile } from "~/storage/r2";

const attachmentsRoutes = new Hono<{ Variables: { user: JWTPayload } }>();

attachmentsRoutes.post("/notes/:id/attachments", async (c) => {
	const user = c.get("user");
	const params = c.req.param();
	const request = c.req.raw;

	const note = await database.query.notes.findFirst({
		where: and(eq(notes.id, params.id), eq(notes.createdBy, user.userId)),
	});

	if (!note) {
		throwNotFound("Note not found");
		return;
	}

	const formData = await request.formData();
	const files = formData.getAll("files");
	const validFiles = files.filter((file) => file instanceof File) as File[];

	if (validFiles.length === 0) {
		throwBadRequest("At least one file is required");
		return;
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
		throwNotFound("Note not found");
		return;
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
		throwNotFound("Note not found");
		return;
	}

	const attachment = await database.query.noteAttachments.findFirst({
		where: eq(noteAttachments.id, params.attachmentId),
	});

	if (!attachment) {
		throwNotFound("Attachment not found");
		return;
	}

	if (attachment.noteId !== params.id) {
		throwBadRequest("Attachment does not belong to this note");
		return;
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
			throwNotFound("Note not found");
			return;
		}

		const attachment = await database.query.noteAttachments.findFirst({
			where: eq(noteAttachments.id, params.attachmentId),
		});

		if (!attachment) {
			throwNotFound("Attachment not found");
			return;
		}

		if (attachment.noteId !== params.id) {
			throwBadRequest("Attachment does not belong to this note");
			return;
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
