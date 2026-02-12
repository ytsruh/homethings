import { zValidator } from "@hono/zod-validator";
import type { ZodSchema } from "zod";

export function createValidator<T>(schema: T) {
	return zValidator("json", schema as unknown as ZodSchema, (result, c) => {
		if (!result.success) {
			console.error("Zod validation error:", result.error);
			return c.json({ error: "Validation failed" }, 400);
		}
	});
}
