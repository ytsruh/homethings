import { zValidator } from "@hono/zod-validator";
import type { ZodSchema } from "zod";
import { throwBadRequest } from "./http-exception";

export function createValidator<T>(schema: T, mode: "json" | "query" = "json") {
	return zValidator(mode, schema as ZodSchema, (result, c) => {
		if (!result.success) {
			console.error("Validation error:", result.error);
			throw throwBadRequest("Validation failed", result.error);
		}
	});
}
