import { Hono } from "hono";
import auth from "./auth";

const app = new Hono();

app.route("/auth", auth);
app.get("/", (c) => c.json("Hello Homethings"));

export default app;
