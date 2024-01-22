"use client";
import PageFrame from "@/components/PageFrame";
import type { Book } from "@/db/schema";
import { BooksNav } from "@/components/BooksNav";
import { useEffect, useState } from "react";
import { useLoadingContext } from "@/lib/LoadingContext";
import Loading from "@/components/Loading";
import { getLocalToken } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function BooksWishlist() {
  const router = useRouter();
  const { loading } = useLoadingContext();
  const [loaded, setLoaded] = useState(loading);
  const [books, setBooks] = useState();
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    async function getData() {
      try {
        const token = await getLocalToken();
        const res = await fetch(`${baseUrl}/books/wishlist`, {
          headers: {
            Authorization: token as string,
          },
        });
        if (res.status === 401) {
          throw Error("unauthorized");
        }
        const data = await res.json();
        setBooks(data.books);
        setLoaded(true);
      } catch (error: any) {
        if (error.message === "unauthorized") {
          router.push("/login");
        }
        console.log(error);
      }
    }
    getData();
  }, []);

  if (!loaded) {
    return <Loading />;
  }

  if (books) {
    const wishlistBooks = (books as Book[]).map((book: Book, i: number) => {
      return <BookItem data={book} key={i} />;
    });
    return (
      <PageFrame title="Books">
        <BooksNav />
        <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 py-5">{wishlistBooks}</div>
      </PageFrame>
    );
  }
}

function BookItem(props: { data: Book }) {
  return (
    <a href={`/books/${props.data.id}`} className="p-2 hover:border-zinc-500 hover:border hover:rounded-lg">
      <img className="object-contain h-64 w-full " src={props.data.image as string} alt={props.data.name} />
    </a>
  );
}
