import { useLoaderData, useNavigate, useParams } from "react-router-dom";
import PageTitle from "@/components/PageTitle";
import { Button, buttonVariants } from "@/components/ui/button";
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
import { ArrowLeftIcon, TrashIcon } from "@radix-ui/react-icons";

type Note = {
  id: string;
  title: string;
  body: string;
  userId: string;
  createdAt: number;
  updatedAt: number;
};

type UpdateNoteResponse = Note;

type UpdateNoteInput = {
  title: string;
  body: string;
};

export default function NoteSingle() {
  const data = useLoaderData() as Note;
  let { id } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();

  const mutation = useMutation<UpdateNoteResponse, Error, UpdateNoteInput>({
    mutationFn: async (input) => {
      const response = await fetch(`/api/notes/${id}`, {
        method: "PATCH",
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
      queryClient.invalidateQueries({ queryKey: ["notes", { id: id }] });
      toast({
        title: "Success",
        description: "Your note has been updated.",
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

  function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
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

  return (
    <>
      <PageTitle title="Notes | Homethings" />
      <div className="flex justify-between items py-2">
        <a href={`/notes`} className={buttonVariants({ variant: "default", size: "sm" })}>
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back
        </a>
        <DeleteModal id={id} />
      </div>
      <div className="w-full flex justify-center py-5">
        <form onSubmit={handleUpdate} className="max-w-2xl w-full flex flex-col gap-5">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="title">Title</Label>
            <Input defaultValue={data.title} type="text" name="title" placeholder="Title..." />
          </div>
          <div className="grid w-full gap-1.5">
            <Label htmlFor="body">Note body</Label>
            <Textarea rows={15} defaultValue={data.body} name="body" placeholder="Type your note here....." />
          </div>
          <div className="flex justify-end items-center">
            <Button type="submit" variant="default">
              Update
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}

type DeleteNoteResponse = {
  message: string;
};

function DeleteModal(props: { id: string | undefined }) {
  const { toast } = useToast();
  const navigate = useNavigate();

  const mutation = useMutation<DeleteNoteResponse, Error>({
    mutationFn: async (input) => {
      const response = await fetch(`/api/notes/${props.id}`, {
        method: "DELETE",
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
      queryClient.invalidateQueries({ queryKey: [`note-${props.id}`] });
      toast({
        title: "Success",
        description: "Your note has been deleted successfully.",
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

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="destructive">
          <TrashIcon className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="text-zinc-950 dark:text-zinc-50 bg-zinc-50 dark:bg-zinc-950">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete this note and it cannot be recovered.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => mutation.mutate()}>Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
