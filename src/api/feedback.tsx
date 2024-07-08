import { Hono } from "hono";
import { createDBClient } from "../db";
import { feedbackTable } from "../db/schema";
import type { InsertFeedback, SelectFeedback } from "../db/schema";
import type { UserToken, GlobalVariables, GlobalBindings } from "../types";

const app = new Hono<{ Bindings: GlobalBindings; Variables: GlobalVariables }>();

app.post("/", async (c) => {
  try {
    const storedUser = c.get("user");
    const user: UserToken = JSON.parse(storedUser);
    const db = await createDBClient(c.env.TURSO_DATABASE_URL, c.env.TURSO_AUTH_TOKEN);

    const body = await c.req.json();
    const newFeedback: InsertFeedback = {
      title: body.title,
      body: body.body,
      userId: user.id,
    };
    const data: SelectFeedback[] = await db.insert(feedbackTable).values(newFeedback).returning();
    return c.json({ message: "success", data: data });
  } catch (error) {
    // For errors, log to console and send a 500 response back
    console.log(error);
    return c.json({ error: "Something went wrong" }, { status: 500 });
  }
});

export default app;
