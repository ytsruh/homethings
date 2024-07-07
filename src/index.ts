import { Hono } from "hono";
import api from "./api";
import auth from "./auth";

type Env = {
  Bindings: {};
};

const app = new Hono<Env>();

app.route("/auth", auth);
app.route("/api", api);

app.get("/", (c) => {
  return c.json({ message: "Hello, Homethings!" });
});

export default app;
