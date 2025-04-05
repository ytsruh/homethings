import { pb } from "~/lib/utils";
import type { Route } from "../tasks/+types/page";
import { type Payment, columns } from "./columns";
import { DataTable } from "./data-table";
import { redirect, useFetcher } from "react-router";
import PageHeader from "~/components/PageHeader";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Tasks" }, { name: "description", content: "Welcome to Homethings" }];
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
      filter: `createdBy = '${(user?.id as string) || ""}'`,
    });
    return { tasks: records };
  } catch (error) {
    console.error(error);
    return { tasks: null };
  }
}

export default function Tasks({ loaderData }: Route.ComponentProps) {
  const { tasks } = loaderData;
  console.log(tasks);
  return (
    <>
      <PageHeader title="Tasks" subtitle="Manage your tasks" />
      <NewTask />
      {data?.length === 0 ? (
        <div className="w-full text-center py-5">
          <h2>No tasks have been created</h2>
        </div>
      ) : (
        <div className="container mx-auto py-10">
          <DataTable columns={columns} data={data} />
        </div>
      )}
    </>
  );
}

const data: Payment[] = [
  {
    id: "728ed52f",
    amount: 100,
    status: "pending",
    email: "m@example.com",
  },
  {
    id: "728ed52f",
    amount: 100,
    status: "pending",
    email: "m@example.com",
  },
  {
    id: "728ed52f",
    amount: 100,
    status: "pending",
    email: "m@example.com",
  },
  {
    id: "728ed52f",
    amount: 100,
    status: "pending",
    email: "m@example.com",
  },
  {
    id: "728ed52f",
    amount: 100,
    status: "pending",
    email: "m@example.com",
  },
  {
    id: "728ed52f",
    amount: 100,
    status: "pending",
    email: "m@example.com",
  },
  {
    id: "728ed52f",
    amount: 100,
    status: "pending",
    email: "m@example.com",
  },
  {
    id: "728ed52f",
    amount: 100,
    status: "pending",
    email: "m@example.com",
  },
  {
    id: "728ed52f",
    amount: 100,
    status: "pending",
    email: "m@example.com",
  },
  {
    id: "728ed52f",
    amount: 100,
    status: "pending",
    email: "m@example.com",
  },
  {
    id: "728ed52f",
    amount: 100,
    status: "pending",
    email: "m@example.com",
  },
  {
    id: "728ed52f",
    amount: 100,
    status: "pending",
    email: "m@example.com",
  },
  {
    id: "728ed52f",
    amount: 100,
    status: "pending",
    email: "m@example.com",
  },
  {
    id: "728ed52f",
    amount: 100,
    status: "pending",
    email: "m@example.com",
  },
  {
    id: "728ed52f",
    amount: 100,
    status: "pending",
    email: "m@example.com",
  },
];

function NewTask() {
  const fetcher = useFetcher();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (fetcher.data?.success) {
      setOpen(false);
    }
  }, [fetcher.data?.success]);

  return (
    <div className="flex items-center justify-end mb-5 gap-x-2">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>Create</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]" aria-describedby="create-note">
          <fetcher.Form autoComplete="off" method="post">
            <DialogHeader>
              <DialogTitle>Create new task</DialogTitle>
            </DialogHeader>
            <DialogDescription></DialogDescription>
            <div className="flex flex-col space-y-5 my-5">
              <div className="grid w-full gap-2">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
                <Input name="title" placeholder="Task title" className="w-full" />
              </div>
              <div className="grid w-full gap-2">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea name="description" placeholder="Task description" className="w-full" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Create</Button>
            </DialogFooter>
          </fetcher.Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
