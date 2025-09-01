import type { Route } from "./+types/notes-delete";
import { redirect } from "react-router";
import { pb } from "~/lib/utils";
import { ZodError } from "zod";
import { toast } from "~/components/Toaster";

export async function clientAction({ params }: Route.ClientActionArgs) {
  try {
    const id = params.id as string;
    await pb.collection("notes").delete(id);
    toast({
      description: "Note deleted",
      title: "Success",
    });
    return redirect("/app/notes");
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
