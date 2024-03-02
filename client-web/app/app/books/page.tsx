"use client";
import PageFrame from "@/components/PageFrame";
import { BooksNav } from "@/components/BooksNav";
import { useEffect, useState } from "react";
import { useLoadingContext } from "@/lib/LoadingContext";
import Loading from "@/components/Loading";
import { getLocalToken } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function Books() {
  const router = useRouter();
  const { loading } = useLoadingContext();
  const [loaded, setLoaded] = useState(loading);
  const [books, setBooks] = useState();
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    async function getData() {
      try {
        const token = await getLocalToken();
        const res = await fetch(`${baseUrl}/books`, {
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
    const booksData = (books as any).map((book: any, i: number) => {
      return <BookItem data={book} key={i} />;
    });
    return (
      <PageFrame title="Books">
        <BooksNav />
        <div className="grid w-full grid-cols-2 py-5 md:grid-cols-3 lg:grid-cols-4">
          {booksData}
        </div>
      </PageFrame>
    );
  }
}

function BookItem(props: { data: any }) {
  return (
    <a
      href={`/books/${props.data.id}`}
      className="p-2 hover:rounded-lg hover:border hover:border-zinc-500"
    >
      <img
        className="h-64 w-full object-contain "
        src={props.data.image || "https://fakeimg.pl/72x128?text=?&font=noto"}
        alt={props.data.name}
      />
    </a>
  );
}
