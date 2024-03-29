"use client";
import { useEffect, useState } from "react";
import PageFrame from "@/components/PageFrame";
import type { Book } from "@/db/schema";
import { BooksNav } from "@/components/BooksNav";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import FormError from "@/components/FormError";
import Link from "next/link";
import { useLoadingContext } from "@/lib/LoadingContext";
import { useRouter } from "next/navigation";
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

export default function SingleBook({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { loading, setLoading } = useLoadingContext();
  const [loaded, setLoaded] = useState(loading);
  const [error, setError] = useState(false);
  const [bookData, setBookData] = useState<Book>();

  useEffect(() => {
    async function getData() {
      const res = await fetch(`/api/books/${params.id}`);
      if (!res.ok) {
        throw new Error("Failed to fetch data");
      }
      const bookData = await res.json();
      setBookData(bookData.data as Book);
      setLoaded(true);
    }
    getData();
  }, []);

  async function submit(e: any) {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch(`/api/books/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookData),
      });
      //Check for ok response
      if (!response.ok) {
        //Throw error if not ok
        throw Error(response.statusText);
      }
      router.push("/books");
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log(error);
      setError(true);
    }
  }

  if (!loaded) {
    return <Loading />;
  }

  if (bookData) {
    return (
      <PageFrame title="Books">
        <BooksNav />
        <div className="py-5 flex w-full">
          <img src={bookData.image as string} alt="" className="md:basis-1/4 hidden md:block" />
          <div className="basis-full md:basis-3/4 flex justify-center px-2">
            {error ? (
              <FormError reset={setError} />
            ) : (
              <form
                onSubmit={(e) => submit(e)}
                className="w-full flex flex-col justify-center items-center gap-2 px-2 lg:px-5">
                <div className="w-full">
                  <Label>Title / Name:</Label>
                  <Input
                    className="my-2"
                    type="text"
                    placeholder="Name"
                    value={bookData.name || ""}
                    onChange={(e) => setBookData({ ...bookData, name: e.target.value })}
                  />
                </div>
                <div className="w-full">
                  <Label>Author:</Label>
                  <Input
                    className="my-2"
                    type="text"
                    placeholder="Author"
                    value={bookData.author || ""}
                    onChange={(e) => setBookData({ ...bookData, author: e.target.value })}
                  />
                </div>
                <div className="w-full">
                  <Label>Genre:</Label>
                  <Input
                    className="my-2"
                    type="text"
                    placeholder="Genre"
                    value={bookData.genre || ""}
                    onChange={(e) => setBookData({ ...bookData, genre: e.target.value })}
                  />
                </div>
                <div className="w-full">
                  <Label>ISBN:</Label>
                  <Input
                    className="my-2"
                    type="text"
                    placeholder="ISBN"
                    value={bookData.isbn || ""}
                    onChange={(e) => setBookData({ ...bookData, isbn: e.target.value })}
                  />
                </div>
                <div className="w-full flex justify-between items-center">
                  <div>
                    <Label>Read:</Label>
                  </div>
                  <Switch
                    checked={bookData.read as boolean}
                    onCheckedChange={(bool) => setBookData({ ...bookData, read: bool })}
                  />
                </div>
                <div className="w-full flex justify-between items-center">
                  <div>
                    <Label>Wishlist:</Label>
                  </div>
                  <Switch
                    checked={bookData.wishlist as boolean}
                    onCheckedChange={(bool) => setBookData({ ...bookData, wishlist: bool })}
                  />
                </div>
                <div className="flex justify-between w-full py-5">
                  <DeleteModal id={bookData.id as string} />
                  <div className="flex gap-2">
                    <Button asChild variant="secondary">
                      <Link href="/books">Cancel</Link>
                    </Button>
                    <Button type="submit">Update</Button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </PageFrame>
    );
  }
}

function DeleteModal(props: { id: string }) {
  const router = useRouter();
  const { setLoading } = useLoadingContext();
  async function deleteItem() {
    setLoading(true);
    try {
      const response = await fetch("/api/books/" + props.id, {
        method: "DELETE",
      });
      //Check for ok response
      if (!response.ok) {
        //Throw error if not ok
        throw Error(response.statusText);
      }
      router.push("/books");
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
          <TrashIcon className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete this book and it cannot be recovered.
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
