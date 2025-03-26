import type { Route } from "./+types/notes-delete";
import { redirect } from "react-router";
import PocketBase from "pocketbase";
import { ZodError } from "zod";
import { toast } from "~/components/Toaster";
const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL);

export async function clientAction({ request, params }: Route.ClientActionArgs) {
  try {
    const id = params.id as string;
    await pb.collection("notes").delete(id);
    toast({
      description: "Note deleted",
      title: "Success",
    });
    return redirect("/notes");
  } catch (error) {
    if (error instanceof ZodError) {
      toast({
        description: error.errors[0].message,
        title: "Note not deleted",
        type: "destructive",
      });
      return { ok: false, error: error.errors[0].message };
    }
    return { ok: false, error: error as string };
  }
}
