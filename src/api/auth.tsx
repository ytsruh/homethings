import { Hono } from "hono";
import { createDBClient } from "../db";
import { usersTable } from "../db/schema";
import type { SelectUser } from "../db/schema";
import { eq } from "drizzle-orm";
import { decode, sign, verify } from "hono/jwt";
import { compareSync } from "bcrypt-edge";
import type { GlobalBindings } from "../types";

const app = new Hono<{ Bindings: GlobalBindings }>();

app.post("/login", async (c) => {
  const body = await c.req.json();
  const db = await createDBClient(c.env.TURSO_DATABASE_URL, c.env.TURSO_AUTH_TOKEN);
  try {
    // Look up a user in the database based on the email field sumitted in the body
    const data: SelectUser[] = await db.select().from(usersTable).where(eq(usersTable.email, body.email));
    const foundUser = data[0];

    // If no user is found, return an error
    if (!foundUser) {
      return c.json({ message: "error: user not found" }, 401);
    }
    // Compare passwords
    if (!compareSync(body.password, foundUser.password)) {
      return c.json({ message: "error: password incorrect" }, 401);
    }

    // Create a JWT token
    const token = await sign(
      {
        id: foundUser.id,
        name: foundUser.name,
        accountId: foundUser.accountId,
        exp: Math.floor(Date.now() / 1000) + 24 * (60 * 60), // Expires: Now + 24h
      },
      c.env.AUTH_SECRET
    );

    return c.json({
      message: "authenticated",
      token: token,
    });
  } catch (error) {
    console.error(error);
    return c.json({ message: "error" }, 500);
  }
});

app.post("/verify", async (c) => {
  const authToken = c.req.header("Authorization");
  if (!authToken) {
    return c.json({ message: "error: no token" }, 401);
  }

  try {
    // Verifing token
    const isValid = await verify(authToken, c.env.AUTH_SECRET);
    if (!isValid) {
      return c.json({ message: "error: invalid token" }, 401);
    }
    // Decoding token
    const { payload } = decode(authToken);
    return c.json({
      message: "authenticated",
      payload,
    });
  } catch (error) {
    console.error(error);
    return c.json({ message: "error: invalid token" }, 401);
  }
});

export default app;
