import { Scalar } from "@scalar/hono-api-reference";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { timeout } from "hono/timeout";
import { openApiSpec } from "./lib/openapi/spec";
import { authMiddleware } from "./middleware/auth";
import { routes } from "./routes";
import { auth } from "./routes/auth";

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
			if (!origin) return "https://www.ytsruh.com"; // Default for same-origin
			return origin.startsWith("http://localhost")
				? origin
				: "https://www.ytsruh.com";
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

console.log(`Hono is running on port ${process.env.PORT || 3000}`);

export default {
	idleTimeout: 30,
	port: parseInt(process.env.PORT || "3000", 10),
	fetch: app.fetch,
};
