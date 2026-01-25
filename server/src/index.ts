import { cors } from "@elysiajs/cors";
import { openapi } from "@elysiajs/openapi";
import { Elysia } from "elysia";
import { auth } from "./auth/config";
import { betterAuth } from "./middleware/auth";
import { errorHandler } from "./middleware/error";
import { routes } from "./routes";

const app = new Elysia()
	.use(errorHandler)
	.use(
		cors({
			origin: process.env.CLIENT_URL || "http://localhost:3000",
			credentials: true,
			methods: ["GET", "POST", "PATCH", "DELETE"],
			allowedHeaders: ["Content-Type", "Authorization"],
		}),
	)
	.mount(auth.handler)
	.use(
		openapi({
			path: "/docs",
			specPath: "/json",
			documentation: {
				info: { title: "Homethings API", version: "1.0.0" },
			},
		}),
	)
	.group("/api", (route) =>
		route
			.get("/", () => ({ message: "Homethings API" }), {
				detail: { tags: ["Health"] },
			})
			.use(routes.notes),
	)
	.listen(process.env.PORT || 3000);

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
