import type { PageServerLoad, Actions } from "./$types.js";
import { redirect, fail } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { createWealthAccountSchema } from "$lib/schema";
import { zod } from "sveltekit-superforms/adapters";

export const load: PageServerLoad = async ({ locals, params }) => {
  if (!locals.user) {
    return redirect(302, "/login");
  }

  return {
    form: await superValidate(zod(createWealthAccountSchema)),
  };
};

export const actions: Actions = {
  default: async (event) => {
    if (!event.locals.user) {
      return redirect(302, "/login");
    }
    const form = await superValidate(event, zod(createWealthAccountSchema));
    if (!form.valid) {
      return fail(400, {
        form,
      });
    }
    console.log(form);

    return {
      form,
    };
  },
};
