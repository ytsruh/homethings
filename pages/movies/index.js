import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Loading from "@/components/Loading";
import Protected from "@/components/Protected";
import PageTitle from "@/components/PageTitle";
import MoviesList from "@/components/MoviesList";
import useFetchData from "@/lib/hooks/useFetchData";

export default function Movies() {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");

  const { isLoading, serverError, apiData } = useFetchData("/api/movies");

  if (isLoading) {
    return <Loading />;
  }
  if (serverError) {
    router.push("/500");
  }

  const filterMovies = (data) => {
    return data.filter((movie) => movie.title.toLowerCase().includes(searchText.toLowerCase()));
  };

  return (
    <Protected>
      <div className="py-3">
        <PageTitle title="Movies" description={desc} image={"img/movieshero1.jpeg"} alt="Movies Hero" />
        <FilterBar function={setSearchText} />
        <MoviesList data={filterMovies(apiData)} />
      </div>
    </Protected>
  );
}

const desc = "Find the best & most popular movies now available on Homeflix";

const FilterBar = (props) => {
  return (
    <div className="container mx-auto my-5 flex justify-center">
      <input
        type="search"
        name="filter"
        className="w-11/12 lg:w-8/12 dark:bg-coal border dark:text-salt border-primary focus:outline-none p-2 m-1 rounded-md"
        placeholder="Search or filter movies"
        onChange={(e) => props.function(e.target.value)}
      />
    </div>
  );
};
