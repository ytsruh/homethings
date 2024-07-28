import { Hono } from "hono";
import { createDBClient } from "../db";
import { booksTable } from "../db/schema";
import { eq, and, asc } from "drizzle-orm";
import type { InsertBook, SelectBook } from "../db/schema";
import type { UserToken, GlobalVariables, GlobalBindings } from "../types";

const app = new Hono<{ Bindings: GlobalBindings; Variables: GlobalVariables }>();

app.get("/", async (c) => {
  try {
    const storedUser = c.get("user");
    const user: UserToken = JSON.parse(storedUser);
    const db = await createDBClient(c.env.TURSO_DATABASE_URL, c.env.TURSO_AUTH_TOKEN);

    const data: SelectBook[] = await db
      .select()
      .from(booksTable)
      .where(eq(booksTable.userId, user.id))
      .orderBy(asc(booksTable.name));

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
    const newBook: InsertBook = {
      name: body.name,
      isbn: body.isbn,
      author: body.author,
      genre: body.genre,
      wishlist: body.wishlist,
      read: body.read,
      rating: body.rating,
      image: body.image,
      userId: user.id,
    };
    const results: SelectBook[] = await db.insert(booksTable).values(newBook).returning();
    return c.json({ message: "success", data: results[0] });
  } catch (error) {
    // For errors, log to console and send a 500 response back
    console.log(error);
    return c.json({ error: "Something went wrong" }, { status: 500 });
  }
});

app.get("/wishlist", async (c) => {
  try {
    const storedUser = c.get("user");
    const user: UserToken = JSON.parse(storedUser);
    const db = await createDBClient(c.env.TURSO_DATABASE_URL, c.env.TURSO_AUTH_TOKEN);

    const data: SelectBook[] = await db
      .select()
      .from(booksTable)
      .where(and(eq(booksTable.userId, user.id), eq(booksTable.wishlist, true)))
      .orderBy(asc(booksTable.name));
    return c.json({ count: data.length, data: data });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Something went wrong" }, { status: 500 });
  }
});

app.get("/read", async (c) => {
  try {
    const storedUser = c.get("user");
    const user: UserToken = JSON.parse(storedUser);
    const db = await createDBClient(c.env.TURSO_DATABASE_URL, c.env.TURSO_AUTH_TOKEN);

    const data: SelectBook[] = await db
      .select()
      .from(booksTable)
      .where(and(eq(booksTable.userId, user.id), eq(booksTable.read, true)))
      .orderBy(asc(booksTable.name));
    return c.json({ count: data.length, data: data });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Something went wrong" }, { status: 500 });
  }
});

app.get("/unread", async (c) => {
  try {
    const storedUser = c.get("user");
    const user: UserToken = JSON.parse(storedUser);
    const db = await createDBClient(c.env.TURSO_DATABASE_URL, c.env.TURSO_AUTH_TOKEN);

    const data: SelectBook[] = await db
      .select()
      .from(booksTable)
      .where(and(eq(booksTable.userId, user.id), eq(booksTable.read, false)))
      .orderBy(asc(booksTable.name));
    return c.json({ count: data.length, data: data });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Something went wrong" }, { status: 500 });
  }
});

app.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const storedUser = c.get("user");
    const user: UserToken = JSON.parse(storedUser);
    const db = await createDBClient(c.env.TURSO_DATABASE_URL, c.env.TURSO_AUTH_TOKEN);

    const results: SelectBook[] = await db
      .select()
      .from(booksTable)
      .where(and(eq(booksTable.id, id), eq(booksTable.userId, user.id)))
      .orderBy(asc(booksTable.name));
    return c.json({ data: results[0] });
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
    const result: SelectBook[] = await db
      .update(booksTable)
      .set({
        name: body.name,
        isbn: body.isbn,
        author: body.author,
        genre: body.genre,
        wishlist: body.wishlist,
        read: body.read,
        rating: body.rating,
        image: body.image,
      })
      .where(and(eq(booksTable.id, id), eq(booksTable.userId, user.id)))
      .returning();
    const updatedBook = result[0];
    return c.json({ message: "success", data: updatedBook });
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

    const results: SelectBook[] = await db.delete(booksTable).where(eq(booksTable.id, id)).returning();

    if (results.length === 0) {
      return c.json({ error: "Book not found" }, { status: 404 });
    }

    return c.json({ message: "success" });
  } catch (error) {
    // For errors, log to console and send a 500 response back
    console.log(error);
    return c.json({ error: "Something went wrong" }, { status: 500 });
  }
});

export default app;
