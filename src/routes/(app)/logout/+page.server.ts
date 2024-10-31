import * as auth from "$lib/server/auth";
import { fail, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
  if (!event.locals.session) {
    return fail(401);
  }
  await auth.invalidateSession(event.locals.session.id);
  event.cookies.delete(auth.sessionCookieName, { path: "/" });

  return redirect(302, "/login");
};
