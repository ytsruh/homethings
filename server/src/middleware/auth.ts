import type { MiddlewareHandler } from "hono";
import { getCookie } from "hono/cookie";
import { verifyJWT } from "~/middleware/jwt";

export const authMiddleware: MiddlewareHandler = async (c, next) => {
	const token = getCookie(c, "auth_token");
	if (!token) {
		return c.json({ error: "Unauthorized" }, 401);
	}

	const payload = await verifyJWT(token);
	if (!payload) {
		return c.json({ error: "Invalid token" }, 401);
	}

	c.set("user", payload);
	await next();
};
