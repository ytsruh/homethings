import type { Route } from "./+types/notes-single";
import { Link, redirect, useFetcher } from "react-router";
import PageHeader from "~/components/PageHeader";
import { Button } from "~/components/ui/button";
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
import { Input } from "~/components/ui/input";
import { useEffect, useState } from "react";
import { Textarea } from "~/components/ui/textarea";
import { createNoteForm } from "~/lib/schema";
import { ZodError } from "zod";
import { toast } from "~/components/Toaster";
import { pb } from "~/lib/utils";
import { LuArrowLeft, LuTrash2 } from "react-icons/lu";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Notes | Homethings" },
    {
      name: "description",
      content: "A personal space to jot down your thoughts",
    },
  ];
}

export async function clientAction({
  request,
  params,
}: Route.ClientActionArgs) {
  try {
    const formData = await request.formData();
    const title = formData.get("title");
    const body = formData.get("body");
    const id = params.id as string;
    createNoteForm.parse({ title, body });
    const data = {
      title: title as string,
      body: body as string,
    };
    await pb.collection("notes").update(id, data);
    toast({
      description: "Note updated",
      title: "Success",
    });
    return { ok: true, error: null };
  } catch (error) {
    if (error instanceof ZodError) {
      toast({
        description: error.errors[0].message,
        title: "Note not updated",
        type: "destructive",
      });
      return { ok: false, error: error.errors[0].message };
    }
    return { ok: false, error: error as string };
  }
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  try {
    const user = pb.authStore.record;
    if (!user) {
      pb.authStore.clear();
      return redirect("/login");
    }
    const note = await pb.collection("notes").getOne(params.id as string);
    return note;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export default function SingleNote({ loaderData }: Route.ComponentProps) {
  const fetcher = useFetcher();
  const note = loaderData;
  if (!note) {
    return (
      <div className="w-full flex items-center justify-center">
        Note not found
      </div>
    );
  }
  return (
    <div>
      <PageHeader
        title="Notes"
        subtitle="A personal space to jot down your thoughts"
      />
      <div className="w-full flex items-center justify-between py-1">
        <Button asChild variant="secondary">
          <Link to="/app/notes">
            <LuArrowLeft className="size-4" />
          </Link>
        </Button>
        <DeleteNote id={note.id} />
      </div>
      <div className="w-full flex items-center justify-center">
        <fetcher.Form
          autoComplete="off"
          method="post"
          className="w-full md:w-2/3 lg:w-1/2"
        >
          <div className="flex flex-col space-y-5 my-5">
            <div className="grid w-full gap-2">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                name="title"
                placeholder="Note title"
                defaultValue={note?.title}
                className="w-full"
              />
            </div>
            <div className="grid w-full gap-2">
              <Label htmlFor="body" className="text-right">
                Body
              </Label>
              <Textarea
                name="body"
                placeholder="Note body"
                defaultValue={note?.body}
                className="w-full min-h-[calc(100vh-18rem)] md:min-h-96"
              />
            </div>
          </div>
          <DialogFooter>
            <Button className="cursor-pointer" type="submit">
              Update
            </Button>
          </DialogFooter>
        </fetcher.Form>
      </div>
    </div>
  );
}

function DeleteNote({ id }: { id: string }) {
  const fetcher = useFetcher();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (fetcher.data?.ok) {
      setOpen(false);
    }
  }, [fetcher.data?.ok]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild className="cursor-pointer">
        <Button variant="destructive">
          <LuTrash2 className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-destructive pb-2">
            Warning: Delete note
          </DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Are you sure you want to delete this note? This action cannot be
          undone.
        </DialogDescription>
        <DialogFooter>
          <div className="flex justify-between gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <fetcher.Form
              autoComplete="off"
              method="post"
              action={`/app/notes/${id}/delete`}
            >
              <Button
                className="cursor-pointer"
                variant="destructive"
                type="submit"
              >
                Delete
              </Button>
            </fetcher.Form>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
