import { z } from "zod";

export const loginFormSchema = z.object({
  email: z.string().min(2).max(50),
  password: z.string().min(2).max(50),
});
export type LoginFormSchema = typeof loginFormSchema;

export const profileFormSchema = z.object({
  name: z.string().min(2).max(50),
  showDocuments: z.boolean(),
  showNotes: z.boolean(),
  showBooks: z.boolean(),
  showChat: z.boolean(),
  showWealth: z.boolean(),
});
export type ProfileFormSchema = typeof profileFormSchema;

export const feedbackFormSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Title must be 3 or more characters long" })
    .max(50, { message: "Title must not be more than 50 characters long" }),
  body: z
    .string()
    .min(5, { message: "Your message must be 5 or more characters long" }),
});
export type FeedbackFormSchema = typeof feedbackFormSchema;

export const createNoteFormSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Title must be 3 or more characters long" })
    .max(50, { message: "Title must not be more than 50 characters long" }),
  body: z
    .string()
    .min(5, { message: "Your message must be 5 or more characters long" }),
});
export type CreateNoteFormSchema = typeof createNoteFormSchema;

export const updateNoteFormSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Title must be 3 or more characters long" })
    .max(50, { message: "Title must not be more than 50 characters long" }),
  body: z
    .string()
    .min(5, { message: "Your message must be 5 or more characters long" }),
});
export type UpdateNoteFormSchema = typeof updateNoteFormSchema;

export const updateDocumentFormSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Title must be 3 or more characters long" })
    .max(50, { message: "Title must not be more than 50 characters long" }),
  description: z.string().optional(),
});
export type UpdateDocumentFormSchema = typeof updateDocumentFormSchema;

export const uploadDocumentFormSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Title must be 3 or more characters long" })
    .max(50, { message: "Title must not be more than 50 characters long" }),
  file: z
    .instanceof(File, { message: "Please upload a file." })
    .refine((f) => f.size < 10_000_000, {
      message: "File size must be less than 10MB",
    }),
});
export type UploadDocumentFormSchema = typeof uploadDocumentFormSchema;

export const updateBookFormSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Title must be 3 or more characters long" })
    .max(100, { message: "Title must not be more than 100 characters long" }),
  author: z.string().optional(),
  genre: z.string().optional(),
  isbn: z.string().optional(),
  read: z.boolean(),
  wishlist: z.boolean(),
});
export type UpdateBookFormSchema = typeof updateBookFormSchema;

export const createBookFormSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Title must be 3 or more characters long" })
    .max(100, { message: "Title must not be more than 100 characters long" }),
  author: z.string().optional(),
  genre: z.string().optional(),
  image: z.string().optional(),
  isbn: z.string().optional(),
  read: z.boolean(),
  wishlist: z.boolean(),
});
export type CreateBookFormSchema = typeof createBookFormSchema;
