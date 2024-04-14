"use client";
import PageFrame from "@/components/PageFrame";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useLoadingContext } from "@/lib/LoadingContext";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import Loading from "@/components/Loading";
import type { Note } from "@/db/schema";
import Link from "next/link";

export default function Notes() {
  const { loading } = useLoadingContext();
  const [loaded, setLoaded] = useState(loading);
  const [notes, setNotes] = useState<Note[]>();
  const [filtered, setFiltered] = useState<Note[]>();

  function search(e: React.ChangeEvent<HTMLInputElement>) {
    const search = e.target.value.toLowerCase();
    const filteredData = notes?.filter((note) => {
      return note.title?.toLowerCase().includes(search) || note.body?.toLowerCase().includes(search);
    });
    setFiltered(filteredData);
  }

  useEffect(() => {
    async function getData() {
      const res = await fetch("/api/notes");
      if (!res.ok) {
        throw new Error("Failed to fetch data");
      }
      const data: Note[] = await res.json();
      setNotes(data);
      setFiltered(data);
      setLoaded(true);
    }
    getData();
  }, []);

  if (!loaded) {
    return <Loading />;
  }

  return (
    <PageFrame title="Notes">
      <div className="py-4">
        <h1 className="text-2xl">Notes</h1>
        <h2 className="text-sm text-zinc-500 dark:text-zinc-300 italic">
          A personal space to jot down your thoughts
        </h2>
      </div>
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
          {filtered?.map((note: Note) => (
            <NoteCard key={note.id} data={note} />
          ))}
        </div>
      )}
    </PageFrame>
  );
}

function NoteCard(props: { data: Note }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{props.data.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="min-h-12 sm:min-h-24 lg:min-h-32">
          {props.data.body!.length > 150 ? props.data.body?.substring(0, 150) + "..." : props.data.body}
        </CardDescription>
      </CardContent>
      <CardFooter>
        <Link href={`/notes/${props.data.id}`} className={buttonVariants({ variant: "default" })}>
          View
        </Link>
      </CardFooter>
    </Card>
  );
}

function CreateModal() {
  const { setLoading } = useLoadingContext();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const { toast } = useToast();

  async function create() {
    setLoading(true);
    try {
      if (!title || !body) {
        toast({
          variant: "destructive",
          title: "Something went wrong",
          description: "Please ensure that both a note title & body are set",
        });
        return;
      }
      const response = await fetch("/api/notes/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, body }),
      });
      //Check for ok response
      if (!response.ok) {
        //Throw error if not ok
        throw Error(response.statusText);
      }
      window.location.reload();
    } catch (error) {
      console.log(error);
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: "Your note could not be created. Please try again.",
      });
      setLoading(false);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="default">Create</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Create a new Note</AlertDialogTitle>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="title">Title</Label>
            <Input onChange={(e) => setTitle(e.target.value)} type="text" id="title" placeholder="Title..." />
          </div>
          <div className="grid w-full gap-1.5">
            <Label htmlFor="body">Note body</Label>
            <Textarea
              onChange={(e) => setBody(e.target.value)}
              id="body"
              rows={10}
              placeholder="Type your note here....."
            />
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => create()}>Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
