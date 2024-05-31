"use client";
export const runtime = "edge";
import { useState } from "react";
import PageFrame from "@/components/PageFrame";
import { BooksNav } from "@/components/BooksNav";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import FormError from "@/components/FormError";
import Link from "next/link";
import { useLoadingContext } from "@/lib/LoadingContext";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";

export default function CreateBook() {
  const router = useRouter();
  const { setLoading } = useLoadingContext();
  const [error, setError] = useState(false);
  const [bookData, setBookData] = useState({
    name: "",
    isbn: "",
    author: "",
    genre: "",
    read: false,
    wishlist: false,
  });
  async function submit(e: any) {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch(`/api/books/`, {
        method: "POST",
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

  return (
    <PageFrame title="Books">
      <BooksNav />
      <div className="py-5 flex w-full">
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
                  required
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
                  required
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
                  checked={bookData.read}
                  onCheckedChange={(bool) => setBookData({ ...bookData, read: bool })}
                />
              </div>
              <div className="w-full flex justify-between items-center">
                <div>
                  <Label>Wishlist:</Label>
                </div>
                <Switch
                  checked={bookData.wishlist}
                  onCheckedChange={(bool) => setBookData({ ...bookData, wishlist: bool })}
                />
              </div>
              <div className="flex justify-between w-full py-5">
                <Button asChild variant="secondary">
                  <Link href="/books">Cancel</Link>
                </Button>
                <Button type="submit">Create</Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </PageFrame>
  );
}
