import type { Route } from "./+types/delete";
import { redirect } from "react-router";
import { pb } from "~/lib/utils";
import { ZodError } from "zod";
import { toast } from "~/components/Toaster";

export async function clientAction({ params }: Route.ClientActionArgs) {
  try {
    const id = params.id as string;
    await pb.collection("tasks").delete(id);
    toast({
      description: "Task deleted",
      title: "Success",
    });
    return redirect("/tasks");
  } catch (error) {
    if (error instanceof ZodError) {
      toast({
        description: error.errors[0].message,
        title: "Task not deleted",
        type: "destructive",
      });
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: error as string };
  }
}
