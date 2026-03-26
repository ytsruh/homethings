import { z } from "zod/v4";

export { LoginSchema, RegisterSchema } from "./auth";
export {
	FilePathSchema,
	FileResponseSchema,
	FilesListResponseSchema,
	FileUploadRequestSchema,
	FileUploadResponseSchema,
} from "./files";
export { UpdateUserSchema } from "./user";

// ============ Path Parameter Schemas ============

export const NotePathSchema = z.object({
	id: z.uuid("Invalid note ID format"),
});

// ============ Request/Body Schemas ============

export const CreateNoteRequestSchema = z.object({
	title: z.string().min(1, "Title is required"),
	body: z.string().optional(),
	priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
});

export const UpdateNoteRequestSchema = z.object({
	title: z.string().optional(),
	body: z.string().optional(),
	priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
	completed: z.boolean().optional(),
});

export const CompleteNoteRequestSchema = z.object({
	completed: z.boolean(),
});

export const ListNotesQuerySchema = z.object({
	completed: z.preprocess((val) => val === "true", z.boolean()),
});

// ============ Response Schemas ============

export const NoteResponseSchema = z.object({
	id: z.string(),
	title: z.string(),
	body: z.string().nullable(),
	priority: z.enum(["low", "medium", "high", "urgent"]),
	completed: z.boolean(),
	createdBy: z.string(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const NotesListResponseSchema = z.array(NoteResponseSchema);

export const AttachmentWithUrlResponseSchema = z.object({
	id: z.string(),
	fileKey: z.string(),
	fileName: z.string(),
	fileType: z.string(),
	fileSize: z.number(),
	createdAt: z.date(),
	presignedUrl: z.string(),
});

export const AttachmentsListResponseSchema = z.array(
	AttachmentWithUrlResponseSchema,
);

export const AttachmentUploadResponseSchema = z.array(
	z.object({
		id: z.string(),
		fileKey: z.string(),
		fileName: z.string(),
		fileType: z.string(),
		fileSize: z.number(),
		createdAt: z.date(),
	}),
);

export const DeleteResponseSchema = z.object({
	message: z.string(),
});

export const CommentPathSchema = z.object({
	id: z.uuid("Invalid note ID format"),
	commentId: z.uuid("Invalid comment ID format"),
});

export const CreateCommentRequestSchema = z.object({
	comment: z.string().min(1, "Comment is required"),
});

export const CommentResponseSchema = z.object({
	id: z.string(),
	comment: z.string(),
	noteId: z.string(),
	createdAt: z.date(),
});

export const CreateFeedbackRequestSchema = z.object({
	title: z.string().min(5, "Title must be at least 5 characters"),
	body: z.string().min(5, "Body must be at least 5 characters"),
});

// ============ Recipe Schemas ============

export const RecipePathSchema = z.object({
	id: z.string().min(1, "Recipe ID required"),
});

export const CreateRecipeRequestSchema = z.object({
	title: z.string().min(1, "Title is required"),
	description: z.string().optional(),
	tags: z.array(z.string()).default([]),
	ingredients: z
		.array(
			z.object({ name: z.string().optional(), amount: z.string().optional() }),
		)
		.default([]),
	steps: z.array(z.string()).default([]),
	imageKey: z.string().optional().nullable(),
});

export const UpdateRecipeRequestSchema = CreateRecipeRequestSchema.partial();

export const RecipeImageUploadRequestSchema = z.object({
	fileType: z.enum(["image/jpeg", "image/png", "image/webp", "image/gif"]),
});

export const ListRecipesQuerySchema = z.object({
	tag: z.string().optional(),
});

export const RecipeResponseSchema = z.object({
	id: z.string(),
	title: z.string(),
	description: z.string().nullable(),
	tags: z.array(z.string()),
	ingredients: z.array(
		z.object({ name: z.string().nullable(), amount: z.string().nullable() }),
	),
	steps: z.array(z.string()),
	imageKey: z.string().nullable(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const RecipesListResponseSchema = z.array(RecipeResponseSchema);
