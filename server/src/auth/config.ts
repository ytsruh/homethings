import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { openAPI } from "better-auth/plugins";
import { database } from "../db";

export const auth = betterAuth({
	database: drizzleAdapter(database, {
		provider: "sqlite",
		usePlural: true,
	}),
	emailAndPassword: {
		enabled: true,
	},
	session: {
		expiresIn: 60 * 60 * 24 * 7,
		updateAge: 60 * 60 * 24,
	},
	advanced: {
		cookiePrefix: "homethings",
		cookie: {
			domain: process.env.COOKIE_DOMAIN,
			sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
			secure: process.env.NODE_ENV === "production",
		},
	},
	baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
	secret: process.env.BETTER_AUTH_SECRET || "dev-secret-change-in-production",
	debug: true,
	plugins: [openAPI({ path: "/api/auth/reference" })],
});
