import PageHeader from "@/components/PageHeader";
import PageTitle from "@/components/PageTitle";
import { useLoaderData } from "react-router-dom";
import { Book } from "@/types";
import { BooksNav } from "@/components/BooksNav";

type LoadedData = {
  count: number;
  data: Book[];
};

export default function Books() {
  const loadedData = useLoaderData() as LoadedData;
  const books = loadedData.data.map((book: Book, i: number) => {
    return <BookItem data={book} key={i} />;
  });
  return (
    <>
      <PageTitle title="Books | Homethings" />
      <PageHeader title="Books" subtitle="Your book collection" />
      <BooksNav />
      <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 py-5">{books}</div>
    </>
  );
}

function BookItem(props: { data: Book }) {
  return (
    <a href={`/books/${props.data.id}`} className="p-2 hover:border-zinc-500 hover:border hover:rounded-lg">
      <img
        className="object-contain h-64 w-full "
        src={props.data.image || "https://fakeimg.pl/72x128?text=?&font=noto"}
        alt={props.data.name as string}
      />
    </a>
  );
}
