import { Hono } from "hono";
import { createDBClient } from "../db";
import { notesTable } from "../db/schema";
import { eq, and } from "drizzle-orm";
import type { InsertNote, SelectNote } from "../db/schema";
import type { UserToken, GlobalVariables, GlobalBindings } from "../types";

const app = new Hono<{ Bindings: GlobalBindings; Variables: GlobalVariables }>();

app.get("/", async (c) => {
  try {
    const storedUser = c.get("user");
    const user: UserToken = JSON.parse(storedUser);
    const db = await createDBClient(c.env.TURSO_DATABASE_URL, c.env.TURSO_AUTH_TOKEN);

    const data: SelectNote[] = await db.select().from(notesTable).where(eq(notesTable.userId, user.id));

    return c.json(data);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Something went wrong" }, { status: 500 });
  }
});

app.post("/", async (c) => {
  try {
    const storedUser = c.get("user");
    const user: UserToken = JSON.parse(storedUser);
    const db = await createDBClient(c.env.TURSO_DATABASE_URL, c.env.TURSO_AUTH_TOKEN);

    const body = await c.req.json();
    const newNote: InsertNote = {
      title: body.title,
      body: body.body,
      userId: user.id,
    };

    const data: SelectNote[] = await db.insert(notesTable).values(newNote).returning();
    return c.json({ message: "success", data: data });
  } catch (error) {
    // For errors, log to console and send a 500 response back
    console.log(error);
    return c.json({ error: "Something went wrong" }, { status: 500 });
  }
});

app.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const storedUser = c.get("user");
    const user: UserToken = JSON.parse(storedUser);
    const db = await createDBClient(c.env.TURSO_DATABASE_URL, c.env.TURSO_AUTH_TOKEN);

    const data: SelectNote[] = await db
      .select()
      .from(notesTable)
      .where(and(eq(notesTable.id, id), eq(notesTable.userId, user.id)));

    return c.json(data[0]);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Something went wrong" }, { status: 500 });
  }
});

app.patch("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const storedUser = c.get("user");
    const user: UserToken = JSON.parse(storedUser);
    const db = await createDBClient(c.env.TURSO_DATABASE_URL, c.env.TURSO_AUTH_TOKEN);

    const body = await c.req.json();
    const data: SelectNote[] = await db
      .update(notesTable)
      .set({ title: body.title, body: body.body })
      .where(and(eq(notesTable.id, id), eq(notesTable.userId, user.id)))
      .returning();

    return c.json(data[0]);
  } catch (error) {
    // For errors, log to console and send a 500 response back
    console.log(error);
    return c.json({ error: "Something went wrong" }, { status: 500 });
  }
});

app.delete("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const storedUser = c.get("user");
    const user: UserToken = JSON.parse(storedUser);
    const db = await createDBClient(c.env.TURSO_DATABASE_URL, c.env.TURSO_AUTH_TOKEN);

    const results: SelectNote[] = await db
      .delete(notesTable)
      .where(and(eq(notesTable.id, id), eq(notesTable.userId, user.id)))
      .returning();

    if (results.length === 0) {
      return c.json({ error: "Note not found" }, { status: 404 });
    }

    return c.json({ deleted: "success" });
  } catch (error) {
    // For errors, log to console and send a 500 response back
    console.log(error);
    return c.json({ error: "Something went wrong" }, { status: 500 });
  }
});

export default app;
