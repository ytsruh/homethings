"use client";
export const runtime = "edge";
import PageFrame from "@/components/PageFrame";
import type { Book } from "@/db/schema";
import { BooksNav } from "@/components/BooksNav";
import { useLoadingContext } from "@/lib/LoadingContext";
import { useEffect, useState } from "react";
import Loading from "@/components/Loading";

type BooksData = {
  count: number;
  data: Book[];
};

export default function BooksRead() {
  const { loading } = useLoadingContext();
  const [loaded, setLoaded] = useState(loading);
  const [books, setBooks] = useState<BooksData>();

  useEffect(() => {
    async function getData() {
      const res = await fetch("/api/books/read");
      if (!res.ok) {
        throw new Error("Failed to fetch data");
      }
      const data: BooksData = await res.json();
      setBooks(data);
      setLoaded(true);
    }
    getData();
  }, []);

  if (!loaded) {
    return <Loading />;
  }

  if (books) {
    const readBooks = books.data.map((book: Book, i) => {
      return <BookItem data={book} key={i} />;
    });
    return (
      <PageFrame title="Books">
        <BooksNav />
        <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 py-5">{readBooks}</div>
      </PageFrame>
    );
  }
}

function BookItem(props: { data: Book }) {
  return (
    <a href={`/books/${props.data.id}`} className="p-2 hover:border-zinc-500 hover:border hover:rounded-lg">
      <img
        className="object-contain h-64 w-full "
        src={props.data.image as string}
        alt={props.data.name as string}
      />
    </a>
  );
}
