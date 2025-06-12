import type { Route } from "./+types/profile";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import PageHeader from "~/components/PageHeader";
import { redirect, useFetcher } from "react-router";
import { Button } from "~/components/ui/button";
import { pb } from "~/lib/utils";
import { Switch } from "~/components/ui/switch";
import { toast } from "~/components/Toaster";
import { ZodError } from "zod";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Profile" }, { name: "description", content: "Welcome to Homethings" }];
}

export async function clientLoader({}: Route.ClientLoaderArgs) {
  try {
    const user = pb.authStore.record;
    if (!user) {
      pb.authStore.clear();
      return redirect("/login");
    }
    const record = await pb.collection("users").getOne(user?.id as string);
    return { user: record };
  } catch (error) {
    console.error(error);
    return { user: null };
  }
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  try {
    const formData = await request.formData();
    const name = formData.get("name");
    const showChat = formData.get("show_chat");
    const showNotes = formData.get("show_notes");
    const showTasks = formData.get("show_tasks");
    const user = pb.authStore.record;
    if (!user) {
      pb.authStore.clear();
      return redirect("/login");
    }
    await pb.collection("users").update(user?.id as string, {
      name,
      showChat: showChat === "on",
      showNotes: showNotes === "on",
      showTasks: showTasks === "on",
    });
    toast({
      description: "Profile updated",
      title: "Success",
    });
    return { ok: true, error: null };
  } catch (error) {
    if (error instanceof ZodError) {
      toast({
        description: error.errors[0].message,
        title: "Profile not updated",
        type: "destructive",
      });
      return { ok: false, error: error.errors[0].message };
    }
    return { ok: false, error: error as string };
  }
}

export default function Profile({ loaderData }: Route.ComponentProps) {
  const fetcher = useFetcher();
  const { user } = loaderData;
  return (
    <>
      <PageHeader title="Profile" subtitle="Manage your profile" />
      <fetcher.Form method="post" className="flex flex-col w-full max-w-xl items-center gap-4 py-2">
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input defaultValue={user?.email || ""} disabled />
        </div>
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="name">Name</Label>
          <Input type="text" name="name" placeholder="Name" defaultValue={user?.name || ""} />
        </div>
        <div className="grid w-full grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="w-full flex items-center justify-between">
            <Label htmlFor="show_chat">Show Chat</Label>
            <Switch defaultChecked={user?.showChat || false} id="show_chat" name="show_chat" />
          </div>
          <div className="w-full flex items-center justify-between">
            <Label htmlFor="show_notes">Show Notes</Label>
            <Switch defaultChecked={user?.showNotes || false} id="show_notes" name="show_notes" />
          </div>
          <div className="w-full flex items-center justify-between">
            <Label htmlFor="show_tasks">Show Tasks</Label>
            <Switch defaultChecked={user?.showTasks || false} id="show_tasks" name="show_tasks" />
          </div>
        </div>
        <div className="flex justify-end w-full gap-1.5">
          <Button type="submit">Update</Button>
        </div>
      </fetcher.Form>
    </>
  );
}
