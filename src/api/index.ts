import { Hono } from "hono";
import { getCookie } from "hono/cookie";
import { logger } from "hono/logger";
import { etag } from "hono/etag";
import { secureHeaders } from "hono/secure-headers";
import { timeout } from "hono/timeout";
import { trimTrailingSlash } from "hono/trailing-slash";
import chat from "./chat";
import * as auth from "$lib/server/auth.js";

export type GlobalVariables = {
  userid: string;
};

export const app = new Hono<{ Variables: GlobalVariables }>().basePath("/api");
export type Router = typeof app;

// Setup middleware
app.use(logger());
app.use(etag());
app.use(secureHeaders());
app.use(timeout(7000));
app.use(trimTrailingSlash());

// Check auth
app.use(async (c, next) => {
  const sessionId = getCookie(c, "auth-session");
  if (!sessionId) {
    c.status(401);
    return c.json({ message: "Unauthorized" });
  }
  const { user } = await auth.validateSession(sessionId);
  if (!user) {
    c.status(401);
    return c.json({ message: "Unauthorized" });
  }
  c.set("userid", user.id);
  await next();
});

// Setup routes
app.route("/chat", chat);
app.get("/", (c) => c.json("Hello Homethings"));
