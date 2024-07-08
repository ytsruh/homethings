import { Hono } from "hono";
import { createDBClient } from "../db";
import { documentsTable } from "../db/schema";
import { eq, and } from "drizzle-orm";
import type { InsertDocument, SelectDocument } from "../db/schema";
import type { UserToken, GlobalVariables, GlobalBindings } from "../types";
import { deleteFile, createS3GetUrl, createS3PutUrl } from "../lib/storage";

const app = new Hono<{ Bindings: GlobalBindings; Variables: GlobalVariables }>();

app.get("/", async (c) => {
  try {
    const storedUser = c.get("user");
    const user: UserToken = JSON.parse(storedUser);
    const db = await createDBClient(c.env.TURSO_DATABASE_URL, c.env.TURSO_AUTH_TOKEN);

    const data: SelectDocument[] = await db
      .select()
      .from(documentsTable)
      .where(eq(documentsTable.accountId, user.accountId));

    return c.json({ count: data.length, data: data });
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
    const newDocument: InsertDocument = {
      title: body.title,
      description: body.description,
      fileName: body.fileName,
      accountId: user.accountId,
    };
    const data: SelectDocument[] = await db.insert(documentsTable).values(newDocument).returning();
    return c.json({ message: "success", data: data });
  } catch (error) {
    // For errors, log to console and send a 500 response back
    console.log(error);
    return c.json({ error: "Something went wrong" }, { status: 500 });
  }
});

app.get("/url", async (c) => {
  const { fileName } = c.req.query();
  try {
    const url = await createS3GetUrl(c, fileName);
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
    const url = await createS3PutUrl(c, fileName);
    return c.json({ url: url });
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
    const data: SelectDocument[] = await db
      .select()
      .from(documentsTable)
      .where(and(eq(documentsTable.id, id), eq(documentsTable.accountId, user.accountId)));
    return c.json({ data: data[0] });
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
    const data: SelectDocument[] = await db
      .update(documentsTable)
      .set({ title: body.title, description: body.description })
      .where(and(eq(documentsTable.id, id), eq(documentsTable.accountId, user.accountId)))
      .returning();
    return c.json({ message: "success", data: data[0] });
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

    const results: SelectDocument[] = await db
      .delete(documentsTable)
      .where(eq(documentsTable.id, id))
      .returning();
    const deletedDoc = results[0];
    // Delete the file from storage
    const result = await deleteFile(c, deletedDoc.fileName as string);
    if (!result.success) {
      throw new Error(result.error as string);
    }
    return c.json({ deleted: "success" });
  } catch (error) {
    // For errors, log to console and send a 500 response back
    console.log(error);
    return c.json({ error: "Something went wrong" }, { status: 500 });
  }
});

export default app;
