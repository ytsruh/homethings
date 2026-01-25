import { Elysia } from "elysia";
import { writeFileSync } from "fs";

export const errorHandler = new Elysia({ name: "error.handler" }).onError(
	({ code, error, set }) => {
		const errorDetails = {
			code,
			error:
				error instanceof Error
					? { message: error.message, stack: error.stack }
					: error,
		};
		console.error("Error:", JSON.stringify(errorDetails, null, 2));
		try {
			writeFileSync(
				"/tmp/auth-error.log",
				JSON.stringify(errorDetails, null, 2),
			);
		} catch {}
		if (error instanceof Error) {
			switch (error.message) {
				case "MISSING_TOKEN":
				case "INVALID_SESSION":
				case "INVALID_TOKEN":
				case "TOKEN_EXPIRED":
					set.status = 401;
					return { error: error.message };
				case "NOT_FOUND":
					set.status = 404;
					return { error: "Not Found" };
				default:
					break;
			}
		}
		if (code === "VALIDATION") {
			set.status = 400;
			return { error: "Validation Error", details: error.all };
		}
		if (code === "NOT_FOUND") {
			set.status = 404;
			return { error: "Not Found" };
		}
		set.status = 500;
		return {
			error: error instanceof Error ? error.message : "Internal Server Error",
		};
	},
);
