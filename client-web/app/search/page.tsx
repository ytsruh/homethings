import { redirect } from "next/navigation";
import dayjs from "dayjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";

import NavBar from "@/components/Navbar";

import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Search Engine Results | Homethings",
  description: "View the results of your search from the custom built search engine & index.",
};

type PageProps = {
  params: {};
  searchParams: {
    q: string;
    page: string;
  };
};

type ResultProps = {
  data: Result;
};

type SearchResponse = {
  amount: number;
  query: string;
  results: Result[];
  timeTaken: number;
};

type Result = {
  id: string;
  url: string;
  success: boolean;
  crawlDuration: number;
  responseCode: number;
  pageTitle: string;
  pageDescription: string;
  headings: string;
  lastTested: string;
  indexed: boolean;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string;
};

async function getData(query: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/search?query=${query}`, {
    method: "POST",
  });
  if (!response.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error("Failed to fetch data");
  }
  return response.json();
}

export default async function Page(props: PageProps) {
  const query: string = props.searchParams.q;
  if (query.length === 0 || !query) {
    redirect("/");
  }

  const data: SearchResponse = await getData(query);

  function convert(nanoseconds: number) {
    return (nanoseconds / 1_000_000_000).toFixed(5);
  }

  return (
    <div className="flex flex-col h-screen">
      <NavBar />
      <div className="grow px-2 md:px-0">
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <h1 className="py-2 text-3xl">
            Search results for "<span className="text-accent">{query}</span>"
          </h1>
          <div className="flex flex-col w-full md:w-1/2 justify-around items-center text-lg">
            <p>
              {data.amount} result{data.amount > 1 ? "s" : ""} found
            </p>
            <p>Results took {convert(data.timeTaken)} seconds</p>
          </div>
          <Link href="/" className="my-2">
            <Button variant="default">Search Again</Button>
          </Link>
        </div>
        <div className="flex">
          <div className="flex flex-col space-y-5 w-full md:w-2/3">
            {data.results.map((item: Result, i: number) => (
              <Result key={i} data={item} />
            ))}
          </div>
          <div className="md:flex md:flex-col hidden md:w-1/3"></div>
        </div>
      </div>
    </div>
  );
}

function Result(props: ResultProps) {
  const data = props.data;

  return (
    <a
      href={data.url}
      target="_blank"
      className="p-1 flex flex-col mx-0 md:mx-5 border border-transparent hover:border-gray-200 hover:dark:border-white hover:rounded-lg hover:cursor-pointer">
      <h2 className="py-2 text-lg text-accent">{data.pageTitle}</h2>
      <p>{data.pageDescription.substring(0, 150)}</p>
      <p className="py-2 italic">{data.url}</p>
      <p className="flex justify-end px-2">Last tested : {dayjs(data.lastTested).format("D-MM-YYYY")}</p>
    </a>
  );
}
