import { zValidator } from "@hono/zod-validator";
import type { z } from "zod";
import { throwBadRequest } from "./http-exception";

export function createValidator<T extends z.ZodType>(
	schema: T,
	mode: "json" | "query" = "json",
) {
	return zValidator(mode, schema, (result, _c) => {
		if (!result.success) {
			console.error("Validation error:", result.error);
			throw throwBadRequest("Validation failed", result.error);
		}
	});
}

export function createParamValidator<T extends z.ZodType>(schema: T) {
	return zValidator("param", schema, (result, _c) => {
		if (!result.success) {
			console.error("Validation error:", result.error);
			throw throwBadRequest("Validation failed", result.error);
		}
	});
}
