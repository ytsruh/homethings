import { compareSync } from "bcrypt-edge";
import { fail, redirect } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { dev } from "$app/environment";
import * as auth from "$lib/server/auth";
import { db } from "$lib/server/db";
import * as table from "$lib/server/db/schema";
import type { Actions, PageServerLoad } from "./$types";
import { setError, superValidate } from "sveltekit-superforms";
import { formSchema } from "$lib/schema";
import { zod } from "sveltekit-superforms/adapters";

export const load: PageServerLoad = async (event) => {
  if (event.locals.user) {
    return redirect(302, "/");
  }
  return {
    form: await superValidate(zod(formSchema)),
  };
};

export const actions: Actions = {
  default: async (event) => {
    const form = await superValidate(event, zod(formSchema));
    if (!form.valid) {
      return fail(400, { form });
    }

    const results = await db.select().from(table.user).where(eq(table.user.username, form.data.username));

    const existingUser = results.at(0);
    if (!existingUser) {
      return setError(form, "username", "E-mail already exists.");
    }
    const validPassword = await compareSync(form.data.password, existingUser.passwordHash);

    if (!validPassword) {
      return setError(form, "password", "Incorrect Password");
    }

    const session = await auth.createSession(existingUser.id);
    event.cookies.set(auth.sessionCookieName, session.id, {
      path: "/",
      sameSite: "lax",
      httpOnly: true,
      expires: session.expiresAt,
      secure: !dev,
    });

    return redirect(302, "/");
  },
};