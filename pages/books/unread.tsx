import { GetServerSideProps, GetServerSidePropsContext } from "next";
import PageFrame from "@/components/PageFrame";
import { getUnreadBooks } from "pages/api/books/unread";
import { Book } from "@/lib/schema";
import { BooksNav } from "@/components/BooksNav";

type BooksProps = {
  count: number;
  data: Book[];
};

export default function BooksUnread(props: { books: BooksProps }) {
  const books = props.books.data.map((book, i) => {
    return <BookItem data={book} key={i} />;
  });
  return (
    <PageFrame title="Books">
      <BooksNav />
      <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 py-5">{books}</div>
    </PageFrame>
  );
}

function BookItem(props: { data: Book }) {
  return (
    <a href={`/book/${props.data.id}`} className="p-2 hover:border-zinc-500 hover:border hover:rounded-lg">
      <img className="object-contain h-64 w-full " src={props.data.image} alt={props.data.name} />
    </a>
  );
}

export const getServerSideProps: GetServerSideProps = async (context: GetServerSidePropsContext) => {
  const books = await getUnreadBooks(context);
  // Have to stringify then parse otherwise date objects cannot be passed to page
  const stringify = JSON.stringify(books);
  const parsed = JSON.parse(stringify);
  return {
    props: { books: parsed }, // will be passed to the page component as props
  };
};
