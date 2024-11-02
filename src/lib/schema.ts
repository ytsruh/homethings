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
