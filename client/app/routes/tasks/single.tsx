import { useEffect, useState } from "react";
import type { Route } from "./+types/single";
import { redirect, useFetcher } from "react-router";
import PageHeader from "~/components/PageHeader";
import { pb } from "~/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Button } from "~/components/ui/button";
import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { toast } from "~/components/Toaster";
import { ZodError } from "zod";
import { taskForm } from "~/lib/schema";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Manage Task" }, { name: "description", content: "Update & manage a task" }];
}

export async function clientAction({ request, params }: Route.ClientActionArgs) {
  const { id } = params;
  if (!id) {
    return { success: false, error: "Task not found" };
  }

  try {
    const formData = await request.formData();
    const title = formData.get("title");
    const description = formData.get("description");
    const priority = formData.get("priority");
    taskForm.parse({ title, description, priority });
    const data = {
      title: title as string,
      description: description as string,
      priority: priority as string,
    };
    await pb.collection("tasks").update(id, data);
    toast({
      description: "Task updated",
      title: "Success",
    });
    return { success: true, error: null };
  } catch (error) {
    if (error instanceof ZodError) {
      toast({
        description: error.errors[0].message,
        title: "Task not updated",
        type: "destructive",
      });
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: error as string };
  }
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  try {
    const user = pb.authStore.record;
    if (!user) {
      pb.authStore.clear();
      return redirect("/login");
    }
    const task = await pb.collection("tasks").getOne(params.id as string, {
      expand: "comments",
      sort: "-created",
    });
    return task;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export default function SingleTask({ loaderData }: Route.ComponentProps) {
  const fetcher = useFetcher();
  const task = loaderData;

  if (!task) {
    return <div className="w-full flex items-center justify-center">Task not found</div>;
  }

  return (
    <>
      <PageHeader title={task.title} subtitle="Manage this task" />
      <div className="flex items-center justify-between w-full">
        <Button variant="secondary" asChild>
          <Link to="/tasks">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="flex items-center gap-1.5">
          <CompleteTask id={task.id} />
          <DeleteTask id={task.id} />
        </div>
      </div>
      <fetcher.Form method="post" className="flex flex-col w-full max-w-xl items-center gap-4 py-5">
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="title">Title</Label>
          <Input name="title" defaultValue={task.title} />
        </div>
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="description">Description</Label>
          <Textarea
            rows={10}
            name="description"
            placeholder="Description"
            defaultValue={task.description || ""}
          />
        </div>
        <div className="grid w-full gap-2">
          <Label htmlFor="priority" className="text-right">
            Priority
          </Label>
          <Select defaultValue={task.priority || "medium"} name="priority">
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-full items-center justify-start gap-1.5">
          {fetcher.state === "submitting" ? <LoadingSpinner /> : <Button type="submit">Update</Button>}
        </div>
      </fetcher.Form>
      <div className="flex flex-col gap-2">
        <form action="">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="comment">Add a comment</Label>
            <Textarea name="comment" placeholder="Comment..." className="w-full" />
          </div>
          <div className="flex w-full items-center justify-end gap-1.5 py-2">
            <Button type="submit" variant="secondary">
              Add
            </Button>
          </div>
        </form>
        {task.comments.length > 0 &&
          task.expand?.comments.map((comment: any) => <CommentCard key={comment.id} comment={comment} />)}
      </div>
    </>
  );
}

function CommentCard({ comment }: { comment: any }) {
  return (
    <div className="flex flex-col w-full items-center justify-between gap-2 border rounded-md p-3 shadow-sm bg-zinc-100 dark:bg-zinc-800">
      <div className="w-full prose dark:prose-invert" dangerouslySetInnerHTML={{ __html: comment.comment }} />
      <div className="flex items-center justify-between w-full">
        <p className="text-muted-foreground italic">
          {new Date(comment.created).toLocaleString("en-Uk", {
            year: "2-digit",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
          })}
        </p>
        <Button variant="destructive" size="sm">
          Delete
        </Button>
      </div>
    </div>
  );
}

function DeleteTask({ id }: { id: string }) {
  const fetcher = useFetcher();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (fetcher.data?.success) {
      setOpen(false);
    }
  }, [fetcher.data?.success]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild className="cursor-pointer">
        <Button variant="destructive">Delete</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-theme pb-2">Warning: Delete task</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Are you sure you want to delete this task? This action cannot be undone.
        </DialogDescription>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <fetcher.Form autoComplete="off" method="post" action={`/tasks/${id}/delete`}>
            {fetcher.state === "submitting" ? (
              <LoadingSpinner />
            ) : (
              <Button className="cursor-pointer" variant="destructive" type="submit">
                Delete
              </Button>
            )}
          </fetcher.Form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CompleteTask({ id }: { id: string }) {
  const fetcher = useFetcher();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (fetcher.data?.success) {
      setOpen(false);
    }
  }, [fetcher.data?.success]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild className="cursor-pointer">
        <Button variant="secondary">Complete</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="pb-2">Complete task</DialogTitle>
        </DialogHeader>
        <DialogDescription>Confirm that you want to complete this task.</DialogDescription>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <fetcher.Form autoComplete="off" method="post" action={`/tasks/${id}/complete`}>
            {fetcher.state === "submitting" ? (
              <LoadingSpinner />
            ) : (
              <Button className="cursor-pointer" type="submit">
                Complete
              </Button>
            )}
          </fetcher.Form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
