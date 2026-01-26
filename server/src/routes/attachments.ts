import { and, eq } from "drizzle-orm";
import { Elysia } from "elysia";
import { betterAuth } from "~/middleware/auth";
import {
	AttachmentsListResponseSchema,
	AttachmentUploadResponseSchema,
	AttachmentWithUrlResponseSchema,
	DeleteResponseSchema,
} from "~/schemas";
import { deleteFiles, generatePresignedUrl, uploadFile } from "~/storage/r2";
import { database } from "../db";
import { noteAttachments, notes } from "../db/schema";

const attachmentsRoutes = new Elysia({
	name: "attachments",
	prefix: "/notes",
})
	.use(betterAuth)
	.post(
		"/:id/attachments/",
		async ({ user, params, request }) => {
			const note = await database.query.notes.findFirst({
				where: and(eq(notes.id, params.id), eq(notes.createdBy, user.id)),
			});

			if (!note) {
				throw new Error("Note not found");
			}

			const formData = await request.formData();
			const files = formData.getAll("files");
			const validFiles = files.filter((file) => file instanceof File) as File[];

			if (validFiles.length === 0) {
				throw new Error("At least one file is required");
			}

			const now = new Date();
			const createdAttachments = await Promise.all(
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

			return createdAttachments;
		},
		{
			response: AttachmentUploadResponseSchema,
			auth: true,
			detail: {
				tags: ["Attachments"],
				description: "Upload files to a note",
			},
		},
	)
	.get(
		"/:id/attachments/",
		async ({ user, params }) => {
			const note = await database.query.notes.findFirst({
				where: and(eq(notes.id, params.id), eq(notes.createdBy, user.id)),
				with: { attachments: true },
			});

			if (!note) {
				throw new Error("Note not found");
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

			return attachmentsWithUrls;
		},
		{
			response: AttachmentsListResponseSchema,
			auth: true,
			detail: {
				tags: ["Attachments"],
				description: "List all attachments for a note",
			},
		},
	)
	.delete(
		"/:id/attachments/:attachmentId",
		async ({ user, params }) => {
			const note = await database.query.notes.findFirst({
				where: and(eq(notes.id, params.id), eq(notes.createdBy, user.id)),
			});

			if (!note) {
				throw new Error("Note not found");
			}

			const attachment = await database.query.noteAttachments.findFirst({
				where: eq(noteAttachments.id, params.attachmentId),
			});

			if (!attachment) {
				throw new Error("Attachment not found");
			}

			if (attachment.noteId !== params.id) {
				throw new Error("Attachment does not belong to this note");
			}

			await deleteFiles([attachment.fileKey]);

			await database
				.delete(noteAttachments)
				.where(eq(noteAttachments.id, params.attachmentId));

			return { message: "Attachment deleted" };
		},
		{
			response: DeleteResponseSchema,
			auth: true,
			detail: {
				tags: ["Attachments"],
				description: "Delete single attachment",
			},
		},
	)
	.get(
		"/:id/attachments/:attachmentId/presigned",
		async ({ user, params }) => {
			const note = await database.query.notes.findFirst({
				where: and(eq(notes.id, params.id), eq(notes.createdBy, user.id)),
			});

			if (!note) {
				throw new Error("Note not found");
			}

			const attachment = await database.query.noteAttachments.findFirst({
				where: eq(noteAttachments.id, params.attachmentId),
			});

			if (!attachment) {
				throw new Error("Attachment not found");
			}

			if (attachment.noteId !== params.id) {
				throw new Error("Attachment does not belong to this note");
			}

			const bucketName = process.env.R2_BUCKET_NAME ?? "";
			const presignedUrl = await generatePresignedUrl(
				bucketName,
				attachment.fileKey,
				attachment.fileType,
			);

			return {
				...attachment,
				presignedUrl,
			};
		},
		{
			response: AttachmentWithUrlResponseSchema,
			auth: true,
			detail: {
				tags: ["Attachments"],
				description: "Generate fresh presigned URL",
			},
		},
	);

export default attachmentsRoutes;
