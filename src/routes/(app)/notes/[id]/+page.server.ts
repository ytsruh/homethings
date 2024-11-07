import type { PageServerLoad, Actions } from "./$types.js";
import { fail, redirect } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { updateNoteFormSchema } from "$lib/schema";
import { zod } from "sveltekit-superforms/adapters";
import { db } from "$lib/server/db";
import { eq, and } from "drizzle-orm";
import * as table from "$lib/server/db/schema";

export const load: PageServerLoad = async ({ locals, params }) => {
  if (!locals.user) {
    return redirect(302, "/login");
  }
  const results: table.SelectNote[] = await db
    .select()
    .from(table.notes)
    .where(and(eq(table.notes.userId, locals.user.id), eq(table.notes.id, params.id)));
  const defaultFormData = {
    title: results[0]?.title || "",
    body: results[0]?.body || "",
  };
  return {
    form: await superValidate(defaultFormData, zod(updateNoteFormSchema)),
    note: results,
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
      await db.delete(table.notes).where(and(eq(table.notes.id, id), eq(table.notes.userId, locals.user.id)));
      return { success: true };
    } catch (error) {
      console.log(error);
      return fail(400, { message: "Something went wrong. Failed to delete note" });
    }
  },
  update: async (event) => {
    if (!event.locals.user) {
      return redirect(302, "/login");
    }
    const form = await superValidate(event, zod(updateNoteFormSchema));
    if (!form.valid) {
      return fail(400, {
        form,
      });
    }
    try {
      await db
        .update(table.notes)
        .set({ title: form.data.title, body: form.data.body })
        .where(and(eq(table.notes.id, event.params.id), eq(table.notes.userId, event.locals.user.id)));
      return { form };
    } catch (error) {
      console.log(error);
      return fail(400, { message: "Something went wrong. Failed to update note" });
    }
  },
} satisfies Actions;
