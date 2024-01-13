"use client";
import PageFrame from "@/components/PageFrame";
import type { Book } from "@/db/schema";
import { BooksNav } from "@/components/BooksNav";
import { useEffect, useState } from "react";
import { useLoadingContext } from "@/lib/LoadingContext";
import Loading from "@/components/Loading";

type BooksData = {
  count: number;
  data: Book[];
};

export default function Books() {
  const { loading } = useLoadingContext();
  const [loaded, setLoaded] = useState(loading);
  const [books, setBooks] = useState<BooksData>();

  useEffect(() => {
    async function getData() {
      const res = await fetch("/api/books");
      if (!res.ok) {
        throw new Error("Failed to fetch data");
      }
      const data: BooksData = await res.json();
      console.log(data);

      setBooks(data);
      setLoaded(true);
    }
    getData();
  }, []);

  if (!loaded) {
    return <Loading />;
  }

  if (books) {
    const booksData = books.data.map((book: Book, i: number) => {
      return <BookItem data={book} key={i} />;
    });
    return (
      <PageFrame title="Books">
        <BooksNav />
        <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 py-5">{booksData}</div>
      </PageFrame>
    );
  }
}

function BookItem(props: { data: Book }) {
  return (
    <a href={`/books/${props.data.id}`} className="p-2 hover:border-zinc-500 hover:border hover:rounded-lg">
      <img
        className="object-contain h-64 w-full "
        src={props.data.image || "https://fakeimg.pl/72x128?text=?&font=noto"}
        alt={props.data.name}
      />
    </a>
  );
}
