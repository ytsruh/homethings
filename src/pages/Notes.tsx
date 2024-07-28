import { useState } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import PageTitle from "@/components/PageTitle";
import PageHeader from "@/components/PageHeader";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useMutation } from "@tanstack/react-query";
import { getToken, queryClient } from "@/lib/utils";
import Loading from "@/components/Loading";

type Note = {
  id: string;
  title: string;
  body: string;
  userId: string;
  createdAt: number;
  updatedAt: number;
};

export default function Notes() {
  const data = useLoaderData() as Note[];
  const [notes, setnotes] = useState<Note[]>(data);

  function search(e: React.ChangeEvent<HTMLInputElement>) {
    const search = e.target.value.toLowerCase();
    const filteredData = data?.filter((note) => {
      return note.title?.toLowerCase().includes(search) || note.body?.toLowerCase().includes(search);
    });
    setnotes(filteredData);
  }
  return (
    <>
      <PageTitle title="Notes | Homethings" />
      <PageHeader title="Notes" subtitle="A personal space to jot down your thoughts" />
      <div className="w-full flex justify-between items-center gap-5 py-5">
        <Input placeholder="Filter notes..." className="" onChange={search} />
        <CreateModal />
      </div>
      {notes?.length === 0 ? (
        <div className="w-full text-center py-5">
          <h2>No notes have been created</h2>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {notes?.map((note: Note) => (
            <NoteCard key={note.id} data={note} />
          ))}
        </div>
      )}
    </>
  );
}

function NoteCard(props: { data: Note }) {
  return (
    <Card className="flex flex-col justify-between">
      <CardHeader>
        <CardTitle>{props.data.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="min-h-12 sm:min-h-24 lg:min-h-32 break-words">
          {props.data.body!.length > 150 ? props.data.body?.substring(0, 150) + "..." : props.data.body}
        </CardDescription>
      </CardContent>
      <CardFooter>
        <a href={`/notes/${props.data.id}`} className={buttonVariants({ variant: "default" })}>
          View
        </a>
      </CardFooter>
    </Card>
  );
}

type CreateNoteResponse = {
  message: string;
  data: Note;
};

type CreateNoteInput = {
  title: string;
  body: string;
};

function CreateModal() {
  const { toast } = useToast();
  const navigate = useNavigate();

  const mutation = useMutation<CreateNoteResponse, Error, CreateNoteInput>({
    mutationFn: async (input) => {
      const response = await fetch("/api/notes", {
        method: "POST",
        body: JSON.stringify(input),
        headers: {
          "Content-Type": "application/json",
          Authorization: getToken(),
        },
      });
      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }
      return await response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast({
        title: "Success",
        description: "Your note has been created successfully.",
      });
      navigate("/notes", { replace: false });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: "Something went wrong. Please try again.",
      });
    },
  });

  async function createNote(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fields = Object.fromEntries(new FormData(e.target as HTMLFormElement));

    if (!fields.title || !fields.body) {
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: "Please ensure that both a note title & body are set",
      });
      return;
    }
    mutation.mutate({
      title: fields.title as string,
      body: fields.body as string,
    });
  }

  if (mutation.isPending) {
    return <Loading />;
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="default">Create</Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="text-zinc-950 dark:text-zinc-50 bg-zinc-50 dark:bg-zinc-950">
        <form onSubmit={createNote}>
          <AlertDialogHeader>
            <AlertDialogTitle>Create a new Note</AlertDialogTitle>
            <AlertDialogDescription></AlertDialogDescription>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="title">Title</Label>
              <Input type="text" name="title" placeholder="Title..." />
            </div>
            <div className="grid w-full gap-1.5">
              <Label htmlFor="body">Note body</Label>
              <Textarea name="body" rows={10} placeholder="Type your note here....." />
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-5">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction type="submit">Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
