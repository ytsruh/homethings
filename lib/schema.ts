import { z } from "zod";

export const UserSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  password: z.string().optional(),
  icon: z.string().optional(),
  darkMode: z.string().optional(),
});

export type User = z.infer<typeof UserSchema>;
