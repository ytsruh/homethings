import { Hono } from "hono";
import { createDBClient } from "../db";
import { usersTable } from "../db/schema";
import type { SelectUser } from "../db/schema";
import { eq } from "drizzle-orm";
import type { UserToken, GlobalVariables, GlobalBindings } from "../types";

const app = new Hono<{ Bindings: GlobalBindings; Variables: GlobalVariables }>();

app.get("/", async (c) => {
  try {
    const storedUser = c.get("user");
    const user: UserToken = JSON.parse(storedUser);
    const db = await createDBClient(c.env.TURSO_DATABASE_URL, c.env.TURSO_AUTH_TOKEN);

    const data: SelectUser[] = await db.select().from(usersTable).where(eq(usersTable.id, user.id));

    return c.json({
      data: {
        id: data[0].id,
        email: data[0].email,
        profileImage: data[0].profileImage,
        showBooks: data[0].showBooks,
        showDocuments: data[0].showDocuments,
        accountId: data[0].accountId,
        created_at: data[0].createdAt,
        updated_at: data[0].updatedAt,
      },
    });
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
    if (!body) {
      return c.json({ error: "No body" }, { status: 400 });
    }

    await db
      .update(usersTable)
      .set({
        name: body.name,
        profileImage: body.profileImage,
        showDocuments: body.showDocuments,
        showBooks: body.showBooks,
      })
      .where(eq(usersTable.id, user.id));

    return c.json({ message: "Profile updated" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Something went wrong" }, { status: 500 });
  }
});

export default app;
