import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { database } from "~/db";
import { users } from "~/db/schema";
import { LoginSchema, RegisterSchema, UpdateUserSchema } from "~/lib/schemas";
import {
	throwBadRequest,
	throwConflict,
	throwServerError,
	throwUnauthorized,
} from "~/middleware/http-exception";
import { type JWTPayload, signJWT, verifyJWT } from "~/middleware/jwt";
import { createValidator } from "~/middleware/validator";

const loginSchema = LoginSchema;
const registerSchema = RegisterSchema;

export const auth = new Hono<{ Variables: { user: JWTPayload | null } }>();

auth.use("/auth/*", async (c, next) => {
	const token = getCookie(c, "auth_token");
	if (token) {
		const payload = await verifyJWT(token);
		if (payload) {
			c.set("user", payload);
		}
	}
	await next();
});

auth.post("/auth/login", createValidator(loginSchema), async (c) => {
	const body = c.req.valid("json");

	const user = await database.query.users.findFirst({
		where: eq(users.email, body.email),
	});

	if (!user) {
		throwUnauthorized("Invalid email or password");
		return;
	}

	const validPassword = await Bun.password.verify(
		body.password,
		user.passwordHash,
	);
	if (!validPassword) {
		throwUnauthorized("Invalid email or password");
		return;
	}

	const token = await signJWT({ userId: user.id, email: user.email });

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

auth.post("/auth/register", createValidator(registerSchema), async (c) => {
	const body = c.req.valid("json");

	const existing = await database.query.users.findFirst({
		where: eq(users.email, body.email),
	});

	if (existing) {
		throwConflict("Email already registered");
		return;
	}

	const passwordHash = await Bun.password.hash(body.password);
	const id = crypto.randomUUID();

	await database.insert(users).values({
		id,
		email: body.email,
		passwordHash,
		name: body.name,
		createdAt: new Date(),
	});

	const token = await signJWT({ userId: id, email: body.email });

	setCookie(c, "auth_token", token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		maxAge: 60 * 60 * 24 * 7,
		path: "/",
	});

	return c.json({
		message: "Registration successful",
		user: { id, email: body.email, name: body.name },
	});
});

auth.post("/auth/logout", (c) => {
	deleteCookie(c, "auth_token");

	return c.json({ message: "Logout successful" });
});

auth.get("/auth/me", async (c) => {
	const userPayload = c.get("user");
	if (!userPayload) {
		throwUnauthorized("Not authenticated");
		return;
	}

	const user = await database.query.users.findFirst({
		where: eq(users.id, userPayload.userId),
	});

	if (!user) {
		throwUnauthorized("User not found");
		return;
	}

	return c.json({
		user: { id: user.id, email: user.email, name: user.name },
	});
});

auth.patch("/auth/me", createValidator(UpdateUserSchema), async (c) => {
	const userPayload = c.get("user");
	if (!userPayload) {
		throwUnauthorized("Not authenticated");
		return;
	}
	const body = c.req.valid("json");

	const updates: Partial<typeof users.$inferInsert> = {};
	if (body.name) updates.name = body.name;
	if (body.email) updates.email = body.email;
	if (body.password)
		updates.passwordHash = await Bun.password.hash(body.password);

	await database
		.update(users)
		.set(updates)
		.where(eq(users.id, userPayload.userId));

	return c.json({ message: "Profile updated" });
});
