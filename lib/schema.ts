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

export const MovieSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  duration: z.string().optional(),
  fileName: z.string().optional(),
  imageName: z.string().optional(),
  releaseYear: z.string().optional(),
});

export type Movie = z.infer<typeof MovieSchema>;

export const EpisodeSchema = z.object({
  showId: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  fileName: z.string().optional(),
  seasonNumber: z.number().int().optional(),
  episodeNumber: z.number().int().optional(),
});

export type Episode = z.infer<typeof EpisodeSchema>;

export const ShowSchema = z.object({
  title: z.string().optional(),
  imageName: z.string().optional(),
  episodes: z.array(EpisodeSchema).optional(),
});

export type Show = z.infer<typeof ShowSchema>;

export const FavouriteSchema = z.object({
  favourite: z.string().optional(),
  type: z.string().optional(),
  userId: z.string().optional(),
});

export type Favourite = z.infer<typeof FavouriteSchema>;

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
