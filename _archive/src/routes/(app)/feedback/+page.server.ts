import type { PageServerLoad, Actions } from "./$types.js";
import { fail, redirect } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { feedbackFormSchema } from "$lib/schema";
import { zod } from "sveltekit-superforms/adapters";
import { db } from "@server/db";
import * as table from "@server/db/schema";

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) {
    return redirect(302, "/login");
  }
  return {
    form: await superValidate(zod(feedbackFormSchema)),
  };
};

export const actions: Actions = {
  default: async (event) => {
    if (!event.locals.user) {
      return redirect(302, "/login");
    }
    const form = await superValidate(event, zod(feedbackFormSchema));
    if (!form.valid) {
      return fail(400, {
        form,
      });
    }
    const newFeedback: table.InsertFeedback = {
      title: form.data.title,
      body: form.data.body,
      userId: event.locals.user.id,
    };
    try {
      await db.insert(table.feedback).values(newFeedback);
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
