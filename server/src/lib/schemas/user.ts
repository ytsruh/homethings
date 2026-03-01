import { z } from "zod/v4";

export const UpdateUserSchema = z
	.object({
		name: z.string().min(1).optional(),
		email: z.email().optional(),
		password: z.string().min(6).optional(),
	})
	.refine((data) => data.name || data.email || data.password, {
		error: "At least one field is required",
	});
