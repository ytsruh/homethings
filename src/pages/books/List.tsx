import PageHeader from "@/components/PageHeader";
import PageTitle from "@/components/PageTitle";
import { useLoaderData } from "react-router-dom";
import { Book } from "@/types";
import { BooksNav } from "@/components/BooksNav";

type LoadedData = {
  count: number;
  data: Book[];
};

export default function BooksList({ title = "List" }: { title: string }) {
  const loadedData = useLoaderData() as LoadedData;
  if (loadedData.count > 0) {
    const readBooks = loadedData.data.map((book: Book, i) => {
      return <BookItem data={book} key={i} />;
    });
    return (
      <>
        <PageTitle title="Books | Homethings" />
        <PageHeader title={`${title} Books`} subtitle={`Your ${title} book collection`} />
        <BooksNav />
        <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 py-5">{readBooks}</div>
      </>
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
