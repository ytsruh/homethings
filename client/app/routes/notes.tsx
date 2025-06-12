import type { Route } from "./+types/notes";
import { Link, redirect, useFetcher } from "react-router";
import PageHeader from "~/components/PageHeader";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
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
import { useEffect, useState, useRef } from "react";
import { Textarea } from "~/components/ui/textarea";
import { createNoteForm } from "~/lib/schema";
import { ZodError } from "zod";
import { toast } from "~/components/Toaster";
import { pb } from "~/lib/utils";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Notes | Homethings" },
    { name: "description", content: "A personal space to jot down your thoughts" },
  ];
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  try {
    const formData = await request.formData();
    const title = formData.get("title");
    const body = formData.get("body");
    createNoteForm.parse({ title, body });
    const data = {
      title: title as string,
      body: body as string,
      createdBy: (pb.authStore.record?.id as string) || "",
    };
    await pb.collection("notes").create(data);
    toast({
      description: "Note created",
      title: "Success",
    });
    return { ok: true, error: null };
  } catch (error) {
    if (error instanceof ZodError) {
      toast({
        description: error.errors[0].message,
        title: "Note not created",
        type: "destructive",
      });
      return { ok: false, error: error.errors[0].message };
    }
    return { ok: false, error: error as string };
  }
}

export async function clientLoader({}: Route.ClientLoaderArgs) {
  try {
    const user = pb.authStore.record;
    if (!user) {
      pb.authStore.clear();
      return redirect("/login");
    }
    const records = await pb.collection("notes").getFullList({
      sort: "-updated",
      filter: `createdBy = '${(user?.id as string) || ""}'`,
    });
    return { notes: records };
  } catch (error) {
    console.error(error);
    return { notes: [] };
  }
}

export default function Notes({ loaderData }: Route.ComponentProps) {
  const { notes } = loaderData;
  const [search, setSearch] = useState("");
  return (
    <>
      <PageHeader title="Notes" subtitle="A personal space to jot down your thoughts" />
      <div className="flex items-center justify-between my-2 gap-x-2">
        <Input placeholder="Search notes..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <NewNote />
      </div>
      {notes.length === 0 ? (
        <div className="w-full text-center py-5">
          <h2>No notes have been created</h2>
        </div>
      ) : (
        <div className="overflow-y-auto overscroll-contain scrollbar-hide pb-5 md:pb-40 max-h-[calc(100vh-6rem)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5">
            {notes
              .filter((note) => note.title.toLowerCase().includes(search.toLowerCase()))
              .map((note, i) => (
                <NoteCard key={i} data={note} />
              ))}
          </div>
        </div>
      )}
    </>
  );
}

function NewNote() {
  const fetcher = useFetcher();
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.ok) {
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
            <DialogTitle>Create new note</DialogTitle>
          </DialogHeader>
          <DialogDescription></DialogDescription>
          <div className="flex flex-col space-y-5 my-5">
            <div className="grid w-full gap-2">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input name="title" placeholder="Note title" className="w-full" />
            </div>
            <div className="grid w-full gap-2">
              <Label htmlFor="body" className="text-right">
                Body
              </Label>
              <Textarea name="body" placeholder="Note body" className="w-full" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Create</Button>
          </DialogFooter>
        </fetcher.Form>
      </DialogContent>
    </Dialog>
  );
}

function NoteCard({ data }: { data: any }) {
  return (
    <Card className="w-full flex flex-col justify-between p-2">
      <CardHeader className="p-1 md:p-2">
        <CardTitle>{data.title}</CardTitle>
      </CardHeader>
      <CardContent className="p-1 md:p-2">
        <CardDescription className="min-h-12 sm:min-h-24 lg:min-h-32 break-words">
          {data.body?.length > 150 ? data.body?.substring(0, 150) + "..." : data.body}
        </CardDescription>
      </CardContent>
      <CardFooter className="p-1 md:p-2">
        <Button asChild className="w-full">
          <Link to={`/notes/${data.id}`}>View</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
