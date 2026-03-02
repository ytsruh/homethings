import { z } from "zod/v4";

export const LoginSchema = z.object({
	email: z.email("Invalid email format"),
	password: z.string().min(1, "Password is required"),
});

export const RegisterSchema = z.object({
	email: z.email("Invalid email format"),
	password: z.string().min(6, "Password must be at least 6 characters"),
	name: z.string().min(1, "Name is required"),
});
