import { zValidator } from "@hono/zod-validator";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { z } from "zod";
import { type JWTPayload, signJWT, verifyJWT } from "~/auth/jwt";
import { database } from "~/db";
import { users } from "~/db/schema";

const loginSchema = z.object({
	email: z.string().email("Invalid email format"),
	password: z.string().min(1, "Password is required"),
});

export const auth = new Hono();

auth.use("/auth/*", async (c, next) => {
	const token = getCookie(c, "auth_token");
	if (token) {
		const payload = verifyJWT(token);
		if (payload) {
			c.set("user", payload);
		}
	}
	await next();
});

auth.post("/auth/login", zValidator("json", loginSchema), async (c) => {
	const body = c.req.valid("json");

	const user = await database.query.users.findFirst({
		where: eq(users.email, body.email),
	});

	if (!user) {
		return c.json({ error: "Invalid email or password" }, 401);
	}

	const validPassword = await bcrypt.compare(body.password, user.passwordHash);
	if (!validPassword) {
		return c.json({ error: "Invalid email or password" }, 401);
	}

	const token = signJWT({ userId: user.id, email: user.email });

	setCookie(c, "auth_token", token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		maxAge: 60 * 60 * 24 * 7,
		path: "/",
	});

	return c.json({
		message: "Login successful",
		user: { id: user.id, email: user.email, name: user.name },
	});
});

auth.post("/auth/logout", (c) => {
	deleteCookie(c, "auth_token");

	return c.json({ message: "Logout successful" });
});

auth.get("/auth/me", async (c) => {
	const userPayload = c.get("user");
	if (!userPayload) {
		return c.json({ error: "Not authenticated" }, 401);
	}

	const user = await database.query.users.findFirst({
		where: eq(users.id, userPayload.userId),
	});

	if (!user) {
		return c.json({ error: "User not found" }, 401);
	}

	return c.json({
		user: { id: user.id, email: user.email, name: user.name },
	});
});

declare module "hono" {
	interface ContextVariableMap {
		user: JWTPayload;
	}
}
