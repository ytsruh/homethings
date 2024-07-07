import { Hono } from "hono";
import profile from "./profile";
import jwt from "@tsndr/cloudflare-worker-jwt";

type Bindings = {
  TURSO_DATABASE_URL: string;
  TURSO_AUTH_TOKEN: string;
  AUTH_SECRET: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// Check auth
app.use(async (c, next) => {
  const authToken = c.req.header("Authorization");
  if (!authToken) {
    c.status(401);
    return c.json({ message: "Unauthorized" });
  }
  // Verifing token
  const isValid = await jwt.verify(authToken, c.env.AUTH_SECRET);

  // Check for validity
  if (!isValid) return;

  // Decoding token
  const { payload } = jwt.decode(authToken);

  await next();
});

app.route("/profile", profile);

export default app;
