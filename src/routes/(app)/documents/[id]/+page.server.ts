import type { PageServerLoad, Actions } from "./$types.js";
import { fail, redirect } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { updateDocumentFormSchema } from "$lib/schema";
import { zod } from "sveltekit-superforms/adapters";
import { db } from "$lib/server/db";
import { eq, and } from "drizzle-orm";
import * as table from "$lib/server/db/schema";

export const load: PageServerLoad = async ({ locals, params }) => {
  if (!locals.user) {
    return redirect(302, "/login");
  }
  const results: table.SelectDocument[] = await db
    .select()
    .from(table.documents)
    .where(
      and(
        eq(table.documents.accountId, locals.user.accountId as string),
        eq(table.documents.id, params.id),
      ),
    );
  const defaultFormData = {
    title: results[0]?.title || "",
    description: results[0]?.description || "",
  };
  return {
    form: await superValidate(defaultFormData, zod(updateDocumentFormSchema)),
    note: results,
  };
};

export const actions = {
  default: async (event) => {
    if (!event.locals.user) {
      return redirect(302, "/login");
    }
    const form = await superValidate(event, zod(updateDocumentFormSchema));
    if (!form.valid) {
      return fail(400, {
        form,
      });
    }
    try {
      await db
        .update(table.documents)
        .set({ title: form.data.title, description: form.data.description })
        .where(
          and(
            eq(table.documents.id, event.params.id),
            eq(
              table.documents.accountId,
              event.locals.user.accountId as string,
            ),
          ),
        );
      return { form };
    } catch (error) {
      console.log(error);
      return fail(400, {
        message: "Something went wrong. Failed to update document",
      });
    }
  },
} satisfies Actions;
