import { z } from "zod";

export const envVariables = z.object({
  NEXT_PUBLIC_VERSION: z.string(),
  DATABASE_URL: z.string(),
  NEXT_PUBLIC_IMAGES_ENDPOINT: z.string(),
  NEXTAUTH_SECRET: z.string(),
});

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envVariables> {}
  }
}

export const UserSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  password: z.string().optional(),
  icon: z.string().optional(),
  darkMode: z.string().optional(),
});

export type User = z.infer<typeof UserSchema>;

export const BookSchema = z.object({
  name: z.string().optional(),
  isbn: z.string().optional(),
  author: z.string().optional(),
  genre: z.string().optional(),
  rating: z.number().int().optional(),
  image: z.string().optional(),
  wishlist: z.boolean().optional(),
  read: z.boolean().optional(),
  userId: z.string().optional(),
});

export type Book = z.infer<typeof BookSchema>;

export const FeedbackSchema = z.object({
  title: z.string().optional(),
  body: z.string().optional(),
  userId: z.string().optional(),
});

export type Feedback = z.infer<typeof FeedbackSchema>;

export const DocumentSchema = z.object({
  id: z.string().optional(),
  accountId: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  fileName: z.string().optional(),
});

export type Document = z.infer<typeof DocumentSchema>;
