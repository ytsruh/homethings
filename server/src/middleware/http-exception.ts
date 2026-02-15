import { HTTPException } from "hono/http-exception";

export const throwUnauthorized = (
	message = "Unauthorized",
	cause?: unknown,
): never => {
	throw new HTTPException(401, { message, cause });
};

export const throwNotFound = (
	message = "Not found",
	cause?: unknown,
): never => {
	throw new HTTPException(404, { message, cause });
};

export const throwBadRequest = (
	message = "Bad request",
	cause?: unknown,
): never => {
	throw new HTTPException(400, { message, cause });
};

export const throwConflict = (message = "Conflict", cause?: unknown): never => {
	throw new HTTPException(409, { message, cause });
};

export const throwServerError = (cause?: unknown): never => {
	throw new HTTPException(500, { message: "Internal server error", cause });
};
