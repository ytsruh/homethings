import { Hono } from "hono";
import { cors } from "hono/cors";
import { authMiddleware } from "./middleware/auth";
import { routes } from "./routes";
import { auth } from "./routes/auth";

const app = new Hono();

app.use(
	"*",
	cors({
		origin: process.env.CLIENT_URL || "http://localhost:3000",
		credentials: true,
		allowMethods: ["GET", "POST", "PATCH", "DELETE"],
		allowHeaders: ["Content-Type", "Authorization"],
	}),
);

app.use("/api/*", authMiddleware);

app.route("/api", routes);
app.route("/", auth);

console.log(`🦊 Hono is running on port ${process.env.PORT || 3000}`);

export default {
	port: parseInt(process.env.PORT || "3000", 10),
	fetch: app.fetch,
};
