import type { Route } from "./+types/complete";
import { redirect } from "react-router";
import { pb } from "~/lib/utils";
import { ZodError } from "zod";
import { toast } from "~/components/Toaster";

export async function clientAction({ params }: Route.ClientActionArgs) {
  const { id } = params;
  if (!id) {
    return { success: false, error: "Task not found" };
  }
  try {
    await pb.collection("tasks").update(id, { completed: true });
    toast({
      description: "Task completed",
      title: "Success",
    });
    return redirect("/tasks");
  } catch (error) {
    if (error instanceof ZodError) {
      toast({
        description: error.errors[0].message,
        title: "Task not completed",
        type: "destructive",
      });
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: error as string };
  }
}
