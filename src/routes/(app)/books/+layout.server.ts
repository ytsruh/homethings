import { redirect } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { db } from "@server/db";
import * as table from "@server/db/schema";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async (event) => {
  if (!event.locals.user) {
    return redirect(302, "/login");
  }
  const results: table.SelectBook[] = await db
    .select()
    .from(table.books)
    .where(eq(table.books.userId, event.locals.user.id));

  return { books: results };
};
