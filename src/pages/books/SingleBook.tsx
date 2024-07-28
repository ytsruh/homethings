import PageHeader from "@/components/PageHeader";
import PageTitle from "@/components/PageTitle";
import { Link, useLoaderData, useNavigate } from "react-router-dom";
import { Book } from "@/types";
import { BooksNav } from "@/components/BooksNav";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
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
import { TrashIcon } from "@radix-ui/react-icons";
import Loading from "@/components/Loading";
import { toast, useToast } from "@/components/ui/use-toast";
import { useMutation } from "@tanstack/react-query";
import { getToken, queryClient } from "@/lib/utils";

type LoadedData = { data: Book };

type UpdateBookResponse = {
  message: string;
  data: Book[];
};

type UpdateBookInput = {
  name: string;
  author: string;
  genre: string;
  isbn: string;
  read: boolean;
  wishlist: boolean;
};

export default function SingleBook() {
  const { data } = useLoaderData() as LoadedData;
  const { toast } = useToast();
  const navigate = useNavigate();

  const mutation = useMutation<UpdateBookResponse, Error, UpdateBookInput>({
    mutationFn: async (input) => {
      const response = await fetch(`/api/books/${data.id}`, {
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
      queryClient.invalidateQueries({ queryKey: ["books"] });
      toast({
        title: "Success",
        description: "Your book has been updated.",
      });
      navigate("/books", { replace: false });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: "Something went wrong. Please try again.",
      });
    },
  });

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fields = Object.fromEntries(new FormData(e.target as HTMLFormElement));

    if (!fields.name || !fields.isbn) {
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: "Please ensure that both a name and ISBN are provided.",
      });
      return;
    }
    mutation.mutate({
      name: fields.name as string,
      author: fields.author as string,
      genre: fields.genre as string,
      isbn: fields.isbn as string,
      read: fields.read === "on",
      wishlist: fields.wishlist === "on",
    });
  }
  return (
    <>
      <PageTitle title="Books | Homethings" />
      <PageHeader title="Book" subtitle="Update your book collection" />
      <BooksNav />
      <div className="py-5 flex w-full">
        <img src={data.image as string} alt="" className="md:basis-1/4 hidden md:block" />
        <div className="basis-full md:basis-3/4 flex justify-center px-2">
          <form
            onSubmit={(e) => submit(e)}
            className="w-full flex flex-col justify-center items-center gap-2 px-2 lg:px-5">
            <div className="w-full">
              <Label>Title / Name:</Label>
              <Input className="my-2" type="text" placeholder="Name" name="name" defaultValue={data.name} />
            </div>
            <div className="w-full">
              <Label>Author:</Label>
              <Input
                className="my-2"
                type="text"
                placeholder="Author"
                name="author"
                defaultValue={data.author}
              />
            </div>
            <div className="w-full">
              <Label>Genre:</Label>
              <Input
                className="my-2"
                type="text"
                placeholder="Genre"
                defaultValue={data.genre || ""}
                name="genre"
              />
            </div>
            <div className="w-full">
              <Label>ISBN:</Label>
              <Input
                className="my-2"
                type="text"
                placeholder="ISBN"
                defaultValue={data.isbn || ""}
                name="isbn"
              />
            </div>
            <div className="w-full flex justify-between items-center">
              <div>
                <Label>Read:</Label>
              </div>
              <Switch defaultChecked={data.read as boolean} name="read" />
            </div>
            <div className="w-full flex justify-between items-center">
              <div>
                <Label>Wishlist:</Label>
              </div>
              <Switch defaultChecked={data.wishlist as boolean} name="wishlist" />
            </div>
            <div className="flex justify-between w-full py-5">
              <DeleteModal id={data.id as string} />
              <div className="flex gap-2">
                <Button asChild variant="secondary">
                  <Link to="/books">Cancel</Link>
                </Button>
                <Button type="submit">Update</Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

type DeleteBookResponse = {
  message: string;
};

function DeleteModal(props: { id: string }) {
  const { toast } = useToast();
  const navigate = useNavigate();

  const mutation = useMutation<DeleteBookResponse, Error>({
    mutationFn: async (input) => {
      const response = await fetch(`/api/books/${props.id}`, {
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
      queryClient.invalidateQueries({ queryKey: ["books"] });
      toast({
        title: "Success",
        description: "Your book has been deleted successfully.",
      });
      navigate("/books", { replace: false });
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
        <Button variant="destructive">
          <TrashIcon className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="text-zinc-950 dark:text-zinc-50 bg-zinc-50 dark:bg-zinc-950">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete this book and it cannot be recovered.
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
