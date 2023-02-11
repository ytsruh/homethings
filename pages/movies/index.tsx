import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Protected from "@/components/Protected";
import PageTitle from "@/components/PageTitle";
import MoviesList from "@/components/MoviesList";
import { getMovies } from "../api/movies";
import { GetServerSideProps } from "next";

export default function Movies(props: any) {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const { movies } = props;

  useEffect(() => {
    if (router.isReady && !movies) {
      router.push("/404");
    }
  }, [router, movies]);

  if (movies) {
    return (
      <Protected>
        <div className="py-3">
          <PageTitle title="Movies" description={desc} image={"img/movieshero1.jpeg"} alt="Movies Hero" />
          <FilterBar function={setSearchText} />
          <MoviesList data={filterMovies(movies, searchText)} />
        </div>
      </Protected>
    );
  }
}

const desc = "Find the best & most popular movies now available on Homeflix";

const filterMovies = (data: any, searchText: string) => {
  if (data.length > 0) {
    return data.filter((movie: any) => movie.title.toLowerCase().includes(searchText.toLowerCase()));
  }
  return [];
};

const FilterBar = (props: any) => {
  return (
    <div className="container mx-auto my-5 flex justify-center">
      <input
        type="search"
        name="filter"
        className="w-11/12 lg:w-8/12 dark:bg-coal border-2 dark:text-salt border-primary focus:outline-none p-2 m-1 rounded-md"
        placeholder="Search or filter movies"
        onChange={(e) => props.function(e.target.value)}
      />
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  const movies = await getMovies();
  // Have to stringify then parse otherwise date objects cannot be passed to page
  const stringify = JSON.stringify(movies);
  const parsed = JSON.parse(stringify);
  return {
    props: { movies: parsed }, // will be passed to the page component as props
  };
};
