import type { PageServerLoad, Actions } from "./$types.js";
import { fail, redirect } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { createBookFormSchema } from "$lib/schema";
import { zod } from "sveltekit-superforms/adapters";
import { db } from "$lib/server/db";
import * as table from "$lib/server/db/schema";

export const load: PageServerLoad = async ({ locals, params }) => {
  if (!locals.user) {
    return redirect(302, "/login");
  }

  return {};
};

export const actions = {
  default: async (event) => {
    if (!event.locals.user) {
      return redirect(302, "/login");
    }
    const form = await superValidate(event, zod(createBookFormSchema));
    if (!form.valid) {
      return fail(400, {
        form,
      });
    }
    try {
      await db.insert(table.books).values({
        name: form.data.name,
        author: form.data.author,
        image: form.data.image,
        isbn: form.data.isbn,
        userId: event.locals.user.id,
      });
      return { form };
    } catch (error) {
      console.log(error);
      return fail(400, {
        message: "Something went wrong. Failed to add your new book ",
      });
    }
  },
} satisfies Actions;