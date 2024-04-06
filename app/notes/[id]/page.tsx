"use client";
import PageFrame from "@/components/PageFrame";
import { Button, buttonVariants } from "@/components/ui/button";
import { TrashIcon, ArrowLeftIcon } from "@radix-ui/react-icons";
import { useLoadingContext } from "@/lib/LoadingContext";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import Loading from "@/components/Loading";
import type { Note } from "@/db/schema";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
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

export default function SingleNote(props: { params: { id: string } }) {
  const { loading, setLoading } = useLoadingContext();
  const [loaded, setLoaded] = useState(loading);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    async function getData() {
      try {
        const res = await fetch(`/api/notes/${props.params.id}`);
        if (!res.ok) {
          throw new Error("Failed to fetch data");
        }
        const response: Note = await res.json();
        setTitle(response.title as string);
        setBody(response.body as string);
        setLoaded(true);
      } catch (error) {
        router.push("/notes");
      }
    }
    getData();
  }, []);

  async function handleUpdate() {
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
      const response = await fetch(`/api/notes/${props.params.id}`, {
        method: "PATCH",
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
      router.push("/notes");
    } catch (error) {
      console.log(error);
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: "Your note could not be updated. Please try again.",
      });
      setLoading(false);
    }
  }

  if (!loaded) {
    return <Loading />;
  }

  return (
    <PageFrame title="Notes">
      <div className="flex justify-between items py-2">
        <Link href={`/notes/`} className={buttonVariants({ variant: "default", size: "sm" })}>
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back
        </Link>
        <DeleteModal id={props.params.id} />
      </div>
      <div className="w-full flex justify-center py-5">
        <div className="max-w-2xl w-full flex flex-col gap-5">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              type="text"
              id="title"
              placeholder="Title..."
            />
          </div>
          <div className="grid w-full gap-1.5">
            <Label htmlFor="body">Note body</Label>
            <Textarea
              rows={5}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              id="body"
              placeholder="Type your note here....."
            />
          </div>
          <div className="flex justify-between items-center">
            <Button onClick={handleUpdate} variant="default">
              Update
            </Button>
          </div>
        </div>
      </div>
    </PageFrame>
  );
}

function DeleteModal(props: { id: string }) {
  const { setLoading } = useLoadingContext();
  const router = useRouter();
  const { toast } = useToast();
  async function deleteItem() {
    setLoading(true);
    try {
      const response = await fetch("/api/notes/" + props.id, {
        method: "DELETE",
      });
      //Check for ok response
      if (!response.ok) {
        //Throw error if not ok
        throw Error(response.statusText);
      }
      router.push("/notes");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: "This note could not be deleted. Please try again.",
      });
      setLoading(false);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="destructive">
          <TrashIcon className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete this note and it cannot be recovered.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => deleteItem()}>Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
