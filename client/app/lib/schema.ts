import { z } from "zod";

export const loginForm = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Please enter a password of at least 8 characters"),
});
