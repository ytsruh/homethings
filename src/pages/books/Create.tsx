import { useState } from "react";
import { BooksNav } from "@/components/BooksNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PageTitle from "@/components/PageTitle";
import PageHeader from "@/components/PageHeader";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Book } from "@/types";
import { getToken, queryClient } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import Loading from "@/components/Loading";

type AddBookResponse = {
  message: string;
  data: Book[];
};

type BookInput = {
  name: string;
  isbn: string;
  author: string;
  image: string;
  genre: string;
  wishlist: boolean;
  read: boolean;
};

export default function CreateBook() {
  const navigate = useNavigate();

  const mutation = useMutation<AddBookResponse, Error, BookInput>({
    mutationFn: async (data) => {
      const response = await fetch(`/api/books`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: getToken(),
        },
        body: JSON.stringify(data),
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
        description: "Your book has been added to your collection.",
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

  async function submit(e: React.FormEvent<HTMLFormElement>) {
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
      isbn: fields.isbn as string,
      image: fields.image as string,
      genre: fields.genre as string,
      read: fields.read === "on",
      wishlist: fields.wishlist === "on",
    });
  }

  if (mutation.isPending) {
    return <Loading />;
  }

  return (
    <>
      <PageTitle title="Books | Homethings" />
      <PageHeader title="Books" subtitle="Manually add to your collection" />
      <BooksNav />
      <div className="py-5 flex w-full">
        <div className="basis-full md:basis-3/4 flex justify-center px-2">
          <form
            onSubmit={(e) => submit(e)}
            className="w-full flex flex-col justify-center items-center gap-2 px-2 lg:px-5">
            <div className="w-full">
              <Label>Title / Name:</Label>
              <Input className="my-2" type="text" name="name" required placeholder="Name" />
            </div>
            <div className="w-full">
              <Label>Author:</Label>
              <Input className="my-2" type="text" placeholder="Author" name="author" />
            </div>
            <div className="w-full">
              <Label>Genre:</Label>
              <Input className="my-2" type="text" placeholder="Genre" name="genre" />
            </div>
            <div className="w-full">
              <Label>ISBN:</Label>
              <Input className="my-2" type="text" required placeholder="ISBN" name="isbn" />
            </div>
            <div className="w-full flex justify-between items-center">
              <div>
                <Label>Read:</Label>
              </div>
              <Switch name="read" defaultChecked={false} />
            </div>
            <div className="w-full flex justify-between items-center">
              <div>
                <Label>Wishlist:</Label>
              </div>
              <Switch name="wishlist" defaultChecked={false} />
            </div>
            <div className="flex justify-between w-full py-5">
              <Button asChild variant="secondary">
                <Link to="/books">Cancel</Link>
              </Button>
              <Button type="submit">Create</Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
