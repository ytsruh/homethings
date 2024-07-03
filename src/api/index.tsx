import { Hono } from "hono";

type Env = {
  Bindings: {
    MY_VAR: string;
  };
};

const app = new Hono<Env>();

app.get("/", (c) => c.json("list authors"));
app.post("/", (c) => c.json("create an author", 201));
app.get("/clock", (c) => {
  return c.json({
    var: c.env.MY_VAR, // Cloudflare Bindings
    time: new Date().toLocaleTimeString(),
  });
});
app.get("/:id", (c) => c.json(`get ${c.req.param("id")}`));

export default app;
