import { z } from "zod/v4";

export const FilePathSchema = z.object({
	id: z.uuid("Invalid file ID format"),
});

export const FileUploadRequestSchema = z.object({
	fileName: z.string().min(1, "File name is required"),
	fileType: z.string().min(1, "File type is required"),
	fileSize: z
		.number()
		.min(1, "File size is required")
		.max(10 * 1024 * 1024, "File size must be less than 10MB"),
});

export const FileResponseSchema = z.object({
	id: z.string(),
	fileKey: z.string(),
	fileName: z.string(),
	fileType: z.string(),
	fileSize: z.number(),
	createdAt: z.date(),
	presignedUrl: z.string().optional(),
});

export const FilesListResponseSchema = z.array(FileResponseSchema);

export const FileUploadResponseSchema = z.object({
	id: z.string(),
	fileKey: z.string(),
	fileName: z.string(),
	fileType: z.string(),
	fileSize: z.number(),
	createdAt: z.date(),
	presignedUrl: z.string(),
});
