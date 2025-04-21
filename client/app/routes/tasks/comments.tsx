import type { Route } from "./+types/comments";
import { redirect } from "react-router";
import { pb } from "~/lib/utils";
import { ZodError } from "zod";
import { toast } from "~/components/Toaster";

export async function clientAction({
  request,
  params,
}: Route.ClientActionArgs) {
  try {
    const taskId = params.id as string;
    const formData = await request.formData();
    const comment = formData.get("comment");

    if (!comment) {
      toast({
        description: "Comment cannot be empty",
        title: "Comment not created",
        type: "destructive",
      });
      return { success: false, error: "Comment cannot be empty" };
    }

    const data = {
      comment: comment,
      task: taskId,
    };
    const commentRecord = await pb.collection("tasks_comments").create(data);
    await pb.collection("tasks").update(taskId, {
      // prepend single comment
      "comments+": commentRecord.id,
      // append multiple comment at once
      //'comment+': ['ID1', 'ID2'],
    });
    toast({
      description: "Task created",
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
