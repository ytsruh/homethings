import { Hono } from "hono";
import { decode, verify } from "hono/jwt";
import { logger } from "hono/logger";
import { etag } from "hono/etag";
import { secureHeaders } from "hono/secure-headers";
import { timeout } from "hono/timeout";
import { trimTrailingSlash } from "hono/trailing-slash";
import auth from "./auth";
import profile from "./profile";
import feedback from "./feedback";
import notes from "./notes";
import documents from "./documents";
import chat from "./chat";
import book from "./books";

type Bindings = {
  AUTH_SECRET: string;
};

type Variables = {
  user: string;
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Setup middleware
app.use(logger());
app.use(etag());
app.use(secureHeaders());
app.use(timeout(7000));
app.use(trimTrailingSlash());

// Set auth route before checking auth in middleware
app.route("/auth", auth);

// Check auth
app.use(async (c, next) => {
  const authToken = c.req.header("Authorization");
  if (!authToken) {
    c.status(401);
    return c.json({ message: "Unauthorized" });
  }
  // Verify token
  const isValid = await verify(authToken, c.env.AUTH_SECRET);
  // Check for validity
  if (!isValid) {
    c.status(401);
    return c.json({ message: "Unauthorized" });
  }
  // Decode token
  const { payload } = decode(authToken);
  c.set("user", JSON.stringify(payload));
  await next();
});

app.route("/books", book);
app.route("/chat", chat);
app.route("/documents", documents);
app.route("/notes", notes);
app.route("/feedback", feedback);
app.route("/profile", profile);
app.get("/", (c) => c.json("Hello Homethings"));

export default app;
