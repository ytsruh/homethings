import { hashSync, compareSync } from "bcrypt-edge";
import { generateRandomString } from "@oslojs/crypto/random";
import { fail, redirect } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { dev } from "$app/environment";
import * as auth from "$lib/server/auth";
import { db } from "$lib/server/db";
import * as table from "$lib/server/db/schema";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
  if (event.locals.user) {
    return redirect(302, "/demo/lucia");
  }
  return {};
};

export const actions: Actions = {
  login: async (event) => {
    const formData = await event.request.formData();
    const username = formData.get("username");
    const password = formData.get("password");

    if (!validateUsername(username)) {
      return fail(400, { message: "Invalid username" });
    }
    if (!validatePassword(password)) {
      return fail(400, { message: "Invalid password" });
    }

    const results = await db.select().from(table.user).where(eq(table.user.username, username));

    const existingUser = results.at(0);
    if (!existingUser) {
      return fail(400, { message: "Incorrect username or password" });
    }
    const validPassword = await compareSync(password, existingUser.passwordHash);

    if (!validPassword) {
      return fail(400, { message: "Incorrect username or password" });
    }

    const session = await auth.createSession(existingUser.id);
    event.cookies.set(auth.sessionCookieName, session.id, {
      path: "/",
      sameSite: "lax",
      httpOnly: true,
      expires: session.expiresAt,
      secure: !dev,
    });

    return redirect(302, "/demo/lucia");
  },
  register: async (event) => {
    const formData = await event.request.formData();
    const username = formData.get("username");
    const password = formData.get("password");

    if (!validateUsername(username)) {
      return fail(400, { message: "Invalid username" });
    }
    if (!validatePassword(password)) {
      return fail(400, { message: "Invalid password" });
    }

    const userId = generateUserId();
    const passwordHash = await hashSync(password, 10);

    try {
      await db.insert(table.user).values({ id: userId, username, passwordHash });

      const session = await auth.createSession(userId);
      event.cookies.set(auth.sessionCookieName, session.id, {
        path: "/",
        sameSite: "lax",
        httpOnly: true,
        expires: session.expiresAt,
        secure: !dev,
      });
    } catch (e) {
      return fail(500, { message: "An error has occurred" });
    }
    return redirect(302, "/demo/lucia");
  },
};

const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_";

function generateUserId(length = 21): string {
  return generateRandomString({ read: (bytes) => crypto.getRandomValues(bytes) }, alphabet, length);
}

function validateUsername(username: unknown): username is string {
  return (
    typeof username === "string" &&
    username.length >= 3 &&
    username.length <= 31 &&
    /^[a-z0-9_-]+$/.test(username)
  );
}

function validatePassword(password: unknown): password is string {
  return typeof password === "string" && password.length >= 6 && password.length <= 255;
}
