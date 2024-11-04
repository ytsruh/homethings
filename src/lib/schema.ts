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

export type Document = {
  id: string;
  title: string;
  description: string;
  accountId: string;
  fileName: string;
  createdAt: number;
  updatedAt: number;
};
