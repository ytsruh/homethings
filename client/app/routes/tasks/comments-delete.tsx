import type { Route } from "./+types/comments-delete";
import { pb } from "~/lib/utils";
import { ZodError } from "zod";
import { toast } from "~/components/Toaster";

export async function clientAction({ params }: Route.ClientActionArgs) {
  try {
    const { taskid, commentid } = params;

    await pb.collection("tasks_comments").delete(commentid);
    await pb.collection("tasks").update(taskid, {
      // remove single comment
      "-comments": commentid,
      // remove multiple comment at once
      //'-comments': ['ID1', 'ID2'],
    });
    toast({
      description: "Comment deleted",
      title: "Success",
    });
    return { success: true, error: null };
  } catch (error) {
    if (error instanceof ZodError) {
      toast({
        description: error.errors[0].message,
        title: "Comment not created",
        type: "destructive",
      });
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: error as string };
  }
}
