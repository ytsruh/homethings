import { Hono } from "hono";
import api from "./api";

type Env = {
  Bindings: {};
};

const app = new Hono<Env>();

app.route("/api", api);

app.get("*", (c) => {
  return c.json({ message: "Hello, World!" });
});

export default app;
