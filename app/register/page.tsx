import { db } from "@/db/index";
import { userTable } from "@/db/schema";
import { cookies } from "next/headers";
import { lucia, validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Form } from "@/lib/form";

import type { ActionResult } from "@/lib/form";
import { hashPassword } from "@/lib/utils";

export default async function Page() {
  const { user } = await validateRequest();
  if (user) {
    return redirect("/");
  }
  return (
    <>
      <h1>Create an account</h1>
      <Form action={signup}>
        <label htmlFor="username">Username</label>
        <input name="username" id="username" />
        <br />
        <label htmlFor="password">Password</label>
        <input type="password" name="password" id="password" />
        <br />
        <button>Register</button>
      </Form>
    </>
  );
}

async function signup(_: unknown, formData: FormData): Promise<ActionResult> {
  "use server";
  const username = formData.get("username");
  if (typeof username !== "string" || username.length < 3) {
    return {
      error: "Invalid username",
    };
  }
  const password = formData.get("password");
  if (typeof password !== "string" || password.length < 6 || password.length > 255) {
    return {
      error: "Invalid password",
    };
  }

  const hashedPassword = await hashPassword(password);

  try {
    const user = await db
      .insert(userTable)
      .values({ password: hashedPassword, accountId: "111", email: username, name: "name" })
      .returning();
    const session = await lucia.createSession(user[0].id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
  } catch (e) {
    console.log(e);
    return {
      error: "An unknown error occurred",
    };
  }
  return redirect("/");
}
