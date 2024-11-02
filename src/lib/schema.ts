import { z } from "zod";

export const loginFormSchema = z.object({
  email: z.string().min(2).max(50),
  password: z.string().min(2).max(50),
});

export type LoginFormSchema = typeof loginFormSchema;
