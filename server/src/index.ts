import { Scalar } from "@scalar/hono-api-reference";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { timeout } from "hono/timeout";
import { openApiSpec } from "./lib/openapi/spec";
import { envVarCheck } from "./lib/validator";
import { authMiddleware } from "./middleware/auth";
import { routes } from "./routes";
import { auth } from "./routes/auth";

// Check environment variables before starting the server
envVarCheck();

const app = new Hono();

app.onError((error, c) => {
	if (error instanceof HTTPException) {
		console.error(
			`[${error.status}] ${(error as any).code || "ERROR"}: ${error.message}`,
			error.cause ? `Cause: ${JSON.stringify(error.cause)}` : "",
		);
		const response = error.getResponse();
		return new Response(response.body, {
			status: error.status,
			headers: {
				...Object.fromEntries(c.res?.headers || []),
				...Object.fromEntries(response.headers),
			},
		});
	}
	console.error("Unexpected error:", error);
	return c.json(
		{ error: "Internal server error", code: "INTERNAL_ERROR" },
		500,
	);
});

app.use(
	"*",
	cors({
		origin: (origin) => {
			if (!origin) return "https://www.ytsruh.com";
			if (origin.startsWith("http://localhost")) return origin;
			if (origin.includes("ytsruh.workers.dev")) return origin;
			return "https://www.ytsruh.com";
		},
		credentials: true,
		allowMethods: ["GET", "POST", "PATCH", "DELETE"],
		allowHeaders: ["Content-Type", "Authorization"],
	}),
);
app.use("*", timeout(10000));
app.use("/api/*", authMiddleware);

app.route("/api", routes);
app.route("/", auth);

app.get("/openapi.json", (c) => c.json(openApiSpec));
app.get("/docs", Scalar({ url: "/openapi.json" }));

export default {
	idleTimeout: 30,
	port: parseInt(process.env.PORT || "3000", 10),
	fetch: app.fetch,
};
