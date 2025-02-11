import { fail, redirect } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { db } from "@server/db";
import * as table from "@server/db/schema";
import type { Actions, PageServerLoad } from "./$types";
import { profileFormSchema } from "$lib/schema";

export const load: PageServerLoad = async (event) => {
  if (!event.locals.user) {
    return redirect(302, "/login");
  }
  return { user: event.locals.user };
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    if (!locals.user) {
      return redirect(302, "/login");
    }
    const data = await request.formData();
    const name = data.get("name");
    const showDocuments = data.get("showDocuments") === "on";
    const showNotes = data.get("showNotes") === "on";
    const showBooks = data.get("showBooks") === "on";
    const showChat = data.get("showChat") === "on";
    const showWealth = data.get("showWealth") === "on";

    const input = await profileFormSchema.safeParse({
      name,
      showDocuments,
      showNotes,
      showBooks,
      showChat,
      showWealth,
    });
    if (!input.success) {
      return fail(400, { success: false });
    }

    try {
      // Update the user in the database
      await db
        .update(table.users)
        .set({
          name: input.data.name,
          showDocuments: input.data.showDocuments,
          showNotes: input.data.showNotes,
          showBooks: input.data.showBooks,
          showChat: input.data.showChat,
          showWealth: input.data.showWealth,
        })
        .where(eq(table.users.email, locals.user.email));
      // Update the user in the locals
      locals.user.name = input.data.name;
      locals.user.showDocuments = input.data.showDocuments;
      locals.user.showNotes = input.data.showNotes;
      locals.user.showBooks = input.data.showBooks;
      locals.user.showChat = input.data.showChat;
      locals.user.showWealth = input.data.showWealth;
      // Return success
      return { success: true };
    } catch (error) {
      console.log(error);
      return fail(500, { success: false });
    }
  },
};
