import { Hono } from "hono";
import { db } from "../db";
import { usersTable } from "../db/schema";
import type { SelectUser } from "../db/schema";
import { eq } from "drizzle-orm";
import jwt from "@tsndr/cloudflare-worker-jwt";
import { compareSync } from "bcrypt-edge";

const app = new Hono();

app.post("/login", async (c) => {
  const body = await c.req.json();

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
    const token = await jwt.sign(
      {
        id: foundUser.id,
        name: foundUser.name,
        exp: Math.floor(Date.now() / 1000) + 24 * (60 * 60), // Expires: Now + 24h
      },
      "secret"
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
    const isValid = await jwt.verify(authToken, "secret"); // false
    if (!isValid) {
      return c.json({ message: "error: invalid token" }, 401);
    }
    // Decoding token
    const { payload } = jwt.decode(authToken);
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
