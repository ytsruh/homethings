import { fail, redirect } from "@sveltejs/kit";
import { eq, and } from "drizzle-orm";
import { db } from "@server/db";
import { superValidate } from "sveltekit-superforms";
import { updateBookFormSchema } from "$lib/schema";
import { zod } from "sveltekit-superforms/adapters";
import * as table from "@server/db/schema";
import type { PageServerLoad, Actions } from "./$types.js";

export const load: PageServerLoad = async (event) => {
  if (!event.locals.user) {
    return redirect(302, "/login");
  }
  const results: table.SelectBook[] = await db
    .select()
    .from(table.books)
    .where(
      and(
        eq(table.books.userId, event.locals.user.id),
        eq(table.books.id, event.params.id),
      ),
    );
  const defaultFormData = {
    name: results[0]?.name || "",
    author: results[0]?.author || "",
    genre: results[0]?.genre || "",
    isbn: results[0]?.isbn || "",
    read: results[0]?.read || false,
    wishlist: results[0]?.wishlist || false,
  };
  return {
    books: results,
    form: await superValidate(defaultFormData, zod(updateBookFormSchema)),
  };
};

export const actions = {
  delete: async ({ request, locals, params }) => {
    if (!locals.user) {
      return redirect(302, "/login");
    }
    const data = await request.formData();
    const id = data.get("id");
    const paramsId = params.id;
    if (id !== paramsId) {
      return fail(400, { message: "Invalid request" });
    }
    try {
      await db
        .delete(table.books)
        .where(
          and(eq(table.books.id, id), eq(table.books.userId, locals.user.id)),
        );
      return { success: true };
    } catch (error) {
      console.log(error);
      return fail(400, {
        message: "Something went wrong. Failed to delete note",
      });
    }
  },
  update: async (event) => {
    if (!event.locals.user) {
      return redirect(302, "/login");
    }
    const form = await superValidate(event, zod(updateBookFormSchema));
    if (!form.valid) {
      return fail(400, {
        form,
      });
    }
    try {
      await db
        .update(table.books)
        .set({
          name: form.data.name,
          author: form.data.author,
          genre: form.data.genre,
          isbn: form.data.isbn,
          read: form.data.read,
          wishlist: form.data.wishlist,
        })
        .where(
          and(
            eq(table.books.id, event.params.id),
            eq(table.books.userId, event.locals.user.id),
          ),
        );
      return { form };
    } catch (error) {
      console.log(error);
      return fail(400, {
        message: "Something went wrong. Failed to update note",
      });
    }
  },
} satisfies Actions;
