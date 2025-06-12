import { pb } from "~/lib/utils";
import type { Route } from "./+types/all";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { Form, redirect, useFetcher } from "react-router";
import PageHeader from "~/components/PageHeader";
import { useEffect, useState, useRef } from "react";
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
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { toast } from "~/components/Toaster";
import { ZodError } from "zod";
import { taskForm, type Task } from "~/lib/schema";
import { LoadingSpinner } from "~/components/LoadingSpinner";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Tasks" }, { name: "description", content: "Welcome to Homethings" }];
}

export async function clientAction({ request }: Route.ClientActionArgs) {
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
      createdBy: (pb.authStore.record?.id as string) || "",
    };
    await pb.collection("tasks").create(data);
    toast({
      description: "Task created",
      title: "Success",
    });
    return { success: true, error: null };
  } catch (error) {
    if (error instanceof ZodError) {
      toast({
        description: error.errors[0].message,
        title: "Task not created",
        type: "destructive",
      });
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: error as string };
  }
}

export async function clientLoader({}: Route.ClientLoaderArgs) {
  try {
    const user = pb.authStore.record;
    if (!user) {
      pb.authStore.clear();
      return redirect("/login");
    }
    const records = await pb.collection("tasks").getFullList({
      sort: "-updated",
      filter: `createdBy = '${(user?.id as string) || ""}' && completed = false`,
    });
    return { tasks: records };
  } catch (error) {
    console.error(error);
    return { tasks: null };
  }
}

export default function Tasks({ loaderData }: Route.ComponentProps) {
  const { tasks } = loaderData;
  return (
    <>
      <PageHeader title="Tasks" subtitle="Manage your tasks" />
      <NewTask />
      <div className="container mx-auto py-0 md:py-5">
        <DataTable columns={columns} data={tasks as Task[]} />
      </div>
    </>
  );
}

function NewTask() {
  const fetcher = useFetcher();
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.success) {
      setOpen(false);
      formRef.current?.reset();
    }
  }, [fetcher.state, fetcher.data]);

  const handleSubmit = () => {
    if (formRef.current) {
      const formData = new FormData(formRef.current);
      fetcher.submit(formData, { method: "post" });
    }
  };

  return (
    <div className="flex items-center justify-end gap-x-2 py-2">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>Create</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]" aria-describedby="create-note">
          <fetcher.Form
            ref={formRef}
            autoComplete="off"
            method="post"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}>
            <DialogHeader>
              <DialogTitle>Create new task</DialogTitle>
            </DialogHeader>
            <DialogDescription></DialogDescription>
            <div className="flex flex-col space-y-5 my-5">
              <div className="grid w-full gap-2">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
                <Input name="title" placeholder="Title" className="w-full" />
              </div>
              <div className="grid w-full gap-2">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea rows={4} name="description" placeholder="Description" className="w-full" />
              </div>
              <div className="grid w-full gap-2">
                <Label htmlFor="priority" className="text-right">
                  Priority
                </Label>
                <Select defaultValue="medium" name="priority">
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
            </div>
            <DialogFooter>
              {fetcher.state === "submitting" ? <LoadingSpinner /> : <Button type="submit">Create</Button>}
            </DialogFooter>
          </fetcher.Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
