import { z } from "zod/v4";

export const loginForm = z.object({
	email: z.email("Please enter a valid email address"),
	password: z
		.string()
		.min(6, "Please enter a password of at least 8 characters"),
});
