"use client";
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
import { getLocalToken } from "@/lib/utils";

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
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  async function submit(e: any) {
    e.preventDefault();
    try {
      setLoading(true);
      const token = await getLocalToken();
      const response = await fetch(`${baseUrl}/books`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: token as string },
        body: JSON.stringify(bookData),
      });
      if (response.status === 401) {
        throw Error("unauthorized");
      }
      router.push("/books");
      setLoading(false);
    } catch (error: any) {
      if (error.message === "unauthorized") {
        router.push("/login");
      }
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
