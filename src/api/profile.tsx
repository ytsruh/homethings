import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => c.json({ message: "Profile" }));

export default app;
