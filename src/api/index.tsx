import { Hono } from "hono";
import jwt from "@tsndr/cloudflare-worker-jwt";
import auth from "./auth";
import profile from "./profile";

type Bindings = {
  VITE_AUTH_SECRET: string;
};

type Variables = {
  user: string;
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

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
  const isValid = await jwt.verify(authToken, c.env.VITE_AUTH_SECRET);
  // Check for validity
  if (!isValid) {
    c.status(401);
    return c.json({ message: "Unauthorized" });
  }
  // Decode token
  const { payload } = jwt.decode(authToken);
  c.set("user", JSON.stringify(payload));
  await next();
});

app.route("/profile", profile);
app.get("/", (c) => c.json("Hello Homethings"));

export default app;
