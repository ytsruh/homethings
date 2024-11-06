import { Hono } from "hono";
import type { GlobalVariables } from "./";
import { createS3GetUrl, createS3PutUrl } from "$lib/server/storage";

const app = new Hono<{
  Variables: GlobalVariables;
}>();

app.get("/url", async (c) => {
  const { fileName } = c.req.query();
  try {
    const url = await createS3GetUrl(fileName);
    return c.json({ url: url });
  } catch (error) {
    // For errors, log to console and send a 500 response back
    console.log(error);
    return c.json({ error: "Something went wrong" }, { status: 500 });
  }
});

app.put("/url", async (c) => {
  const { fileName } = c.req.query();
  try {
    const url = await createS3PutUrl(fileName);
    return c.json({ url: url });
  } catch (error) {
    // For errors, log to console and send a 500 response back
    console.log(error);
    return c.json({ error: "Something went wrong" }, { status: 500 });
  }
});

export default app;
