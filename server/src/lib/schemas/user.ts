import { z } from "zod";

export const UpdateUserSchema = z
	.object({
		name: z.string().min(1).optional(),
		email: z.string().email().optional(),
		password: z.string().min(6).optional(),
	})
	.refine((data) => data.name || data.email || data.password, {
		message: "At least one field is required",
	});
