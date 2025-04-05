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
import { Button } from "~/components/ui/button";
import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Manage Task" }, { name: "description", content: "Update & manage a task" }];
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  try {
    const user = pb.authStore.record;
    if (!user) {
      pb.authStore.clear();
      return redirect("/login");
    }
    const task = await pb.collection("tasks").getOne(params.id as string);
    return task;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export default function SingleTask({ loaderData }: Route.ComponentProps) {
  const fetcher = useFetcher();
  const task = loaderData;
  console.log(task);
  if (!task) {
    return <div className="w-full flex items-center justify-center">Task not found</div>;
  }

  return (
    <>
      <PageHeader title={task.title} subtitle="Update & manage this task" />
      <div className="flex items-center justify-between w-full">
        <Button variant="secondary" asChild>
          <Link to="/tasks">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <DeleteTask id={task.id} />
      </div>
    </>
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
            <Button className="cursor-pointer" variant="destructive" type="submit">
              Delete
            </Button>
          </fetcher.Form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
