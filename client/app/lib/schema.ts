import { z } from "zod";

export const loginForm = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Please enter a password of at least 8 characters"),
});

export const createNoteForm = z.object({
  title: z.string().min(5, "Please enter a title of at least 5 characters"),
  body: z.string().nullish(), // string | null | undefined
});

export type User = {
  account: string;
  avatar: string;
  collectionId: string;
  collectionName: string;
  created: string;
  email: string;
  emailVisibility: boolean;
  id: string;
  name: string;
  showChat: boolean;
  showNotes: boolean;
  showTasks: boolean;
  updated: string;
};
