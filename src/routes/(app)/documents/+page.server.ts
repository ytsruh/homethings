import type { Actions } from "./$types.js";
import { fail, redirect } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { eq, and } from "drizzle-orm";
import * as table from "$lib/server/db/schema";
import { deleteFile } from "@/lib/server/storage";

export async function load({ locals }) {
  if (!locals.user) {
    return redirect(302, "/login");
  }
  const data: table.SelectDocument[] = await db
    .select()
    .from(table.documents)
    .where(eq(table.documents.accountId, locals.user.accountId as string));

  return {
    documents: data,
  };
}

export const actions = {
  delete: async ({ request, locals }) => {
    if (!locals.user) {
      return redirect(302, "/login");
    }
    const data = await request.formData();
    const id = data.get("id");
    try {
      // Delete the file from database
      const deletedDoc = await db
        .delete(table.documents)
        .where(
          and(
            eq(table.documents.id, id as string),
            eq(table.documents.accountId, locals.user.accountId as string),
          ),
        )
        .returning();
      // Delete the file from storage
      if (deletedDoc[0]?.fileName) {
        const result = await deleteFile(deletedDoc[0].fileName as string);
        if (!result.success) {
          throw new Error(result.error as string);
        }
      }
      return { success: true };
    } catch (error) {
      console.log(error);
      return fail(400, {
        message: "Something went wrong. Failed to delete note",
      });
    }
  },
} satisfies Actions;
