import { z } from "zod";

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

export const loginForm = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Please enter a password of at least 8 characters"),
});

export const createNoteForm = z.object({
  title: z.string().min(5, "Please enter a title of at least 5 characters"),
  body: z.string().nullish(), // string | null | undefined
});

const PRIORITIES = ["low", "medium", "high", "urgent"] as const;
export const createTaskForm = z.object({
  title: z.string().min(5, "Please enter a title of at least 5 characters"),
  description: z.string().nullish(), // string | null | undefined
  priority: z.enum(PRIORITIES),
});

export type Task = {
  collectionId: string;
  collectionName: string;
  completed: boolean;
  created: string; // ISO datetime string
  createdBy: string;
  description: string;
  id: string;
  priority: "low" | "medium" | "high"; // assuming known values
  title: string;
  updated: string; // ISO datetime string
};
