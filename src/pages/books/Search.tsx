import { useState } from "react";
import { BooksNav } from "@/components/BooksNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PageTitle from "@/components/PageTitle";
import PageHeader from "@/components/PageHeader";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Book } from "@/types";
import { queryClient } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";

export default function OpenBookSearch() {
  const [isbn, setISBN] = useState("");
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(false);
  const [results, setResults] = useState({});

  function reset() {
    setISBN("");
    setSearching(false);
    setError(false);
    setResults({});
  }

  async function search() {
    if (!isbn) {
      setError(true);
      return;
    }
    try {
      setResults({});
      setError(false);
      setSearching(true);
      const response = await fetch(`https://openlibrary.org/isbn/${isbn.trim()}.json`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Book not found");
        }
        throw new Error("Something went wrong");
      }
      const body = await response.json();
      setResults(body as unknown as {});
      setSearching(false);
    } catch (error) {
      console.log(error);
      setSearching(false);
      setError(true);
    }
  }
  return (
    <>
      <PageTitle title="Books | Homethings" />
      <PageHeader title="Books" subtitle="Search the OpenBooks library to add to your collection" />
      <BooksNav />
      <div className="flex flex-col sm:flex-row justify-center items-center gap-5">
        <Input
          className="my-2 basis-full sm:basis-3/4"
          type="text"
          placeholder="Search OpenBooks by ISBN"
          value={isbn}
          onChange={(e) => setISBN(e.target.value)}
        />
        <div className="basis-full sm:basis-1/4 flex justify-around items-center gap-2">
          <Button onClick={search}>Search</Button>
          <Button variant="secondary" onClick={reset}>
            Reset
          </Button>
        </div>
      </div>
      {searching && <Searching />}
      {error && <SearchError />}
      {Object.keys(results).length !== 0 && <SearchResults data={results} isbn={isbn} />}
    </>
  );
}

function Searching() {
  return (
    <div className="flex flex-col justify-center items-center py-10">
      <h2 className="text-xl py-5 ">Searching ... </h2>
    </div>
  );
}

function SearchError() {
  return (
    <div className="flex flex-col justify-center items-center py-10">
      <h2 className="text-xl py-5 text-accent">An Error Occured</h2>
      <p>Please use the reset button and try again</p>
    </div>
  );
}

type AddBookResponse = {
  message: string;
  data: Book[];
};

function SearchResults(props: any) {
  const navigate = useNavigate();

  const mutation = useMutation<AddBookResponse, Error>({
    mutationFn: async () => {
      const response = await fetch(`/api/books/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: props.data.title,
          author: props.data.by_statement,
          isbn: props.isbn,
          image: `https://covers.openlibrary.org/b/isbn/${props.isbn}-M.jpg`,
        }),
      });
      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }
      return await response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      toast({
        title: "Success",
        description: "Your book has been added to your collection.",
      });
      navigate("/books", { replace: false });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: "Something went wrong. Please try again.",
      });
    },
  });

  return (
    <div className="py-5 flex w-full justify-center items-center">
      <img
        src={`https://covers.openlibrary.org/b/isbn/${props.isbn}-M.jpg`}
        alt={props.data.title}
        className="hidden sm:block basis-1/4 h-72"
      />
      <div className="basis-3/4 flex flex-col md:flex-row justify-center px-2">
        <div className="basis-full md:basis-3/4 text-center md:text-left flex flex-col justify-center items-center gap-2 px-2 lg:px-5">
          <div className="w-full">
            <span className="text-xl">Title / Name :</span> {props.data.title}
          </div>
          <div className="w-full">
            <span className="text-xl">Author :</span> {props.data.by_statement}
          </div>
          <div className="w-full">
            <span className="text-xl">ISBN :</span> {props.isbn}
          </div>
        </div>
        <div className="basis-full md:basis-1/4 flex justify-center items-center py-5">
          <Button type="submit" onClick={() => mutation.mutate()}>
            Add to Library
          </Button>
        </div>
      </div>
    </div>
  );
}
