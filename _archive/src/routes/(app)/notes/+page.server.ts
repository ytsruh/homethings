import type { PageServerLoad, Actions } from "./$types.js";
import { fail, redirect } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { createNoteFormSchema } from "$lib/schema";
import { zod } from "sveltekit-superforms/adapters";
import { db } from "@server/db";
import { eq } from "drizzle-orm";
import * as table from "@server/db/schema";

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) {
    return redirect(302, "/login");
  }
  const results: table.SelectNote[] = await db
    .select()
    .from(table.notes)
    .where(eq(table.notes.userId, locals.user.id));

  return {
    form: await superValidate(zod(createNoteFormSchema)),
    notes: results,
  };
};

export const actions: Actions = {
  default: async (event) => {
    if (!event.locals.user) {
      return redirect(302, "/login");
    }
    const form = await superValidate(event, zod(createNoteFormSchema));
    if (!form.valid) {
      return fail(400, {
        form,
      });
    }
    try {
      await db.insert(table.notes).values({
        title: form.data.title,
        body: form.data.body,
        userId: event.locals.user.id,
      });
    } catch (error) {
      console.log(error);
      return fail(400, {
        form,
      });
    }

    return {
      form,
    };
  },
};
