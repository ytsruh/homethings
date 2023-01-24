import React, { useState, useEffect } from "react";
import Loading from "@/components/Loading";
import Protected from "@/components/Protected";
import { useRouter } from "next/router";
import Button from "@/lib/ui/Button";
import useFetchData from "@/lib/hooks/useFetchData";

export default function Show() {
  const router = useRouter();
  const { id } = router.query;
  const { isLoading, serverError, apiData } = useFetchData(`/api/shows/${id}`);

  if (isLoading) {
    return <Loading />;
  }
  if (serverError) {
    router.push("/500");
  }

  if (apiData && apiData.episodes) {
    const episodes = apiData.episodes.map((episode, i) => {
      return <EpisodeRow key={i} episode={episode} show={apiData} />;
    });

    return (
      <Protected>
        <div className="container mx-auto flex flex-col px-5 md:px-10">
          <div className="flex justify-between">
            <div className="w-full md:w-1/3 lg:w-1/2 flex flex-col items-center justify-center">
              <h1 className="text-primary text-5xl">{apiData.title}</h1>
              <h3 className="text-xl my-10">Episodes: {apiData.episodes.length}</h3>
            </div>
            <div className="w-0 md:w-2/3 lg:w-1/2">
              <img
                src={`${process.env.NEXT_PUBLIC_IMAGES_ENDPOINT}/images/shows/${apiData.imageName}`}
                alt={apiData.name}
                className="w-full h-80 object-cover"
              />
            </div>
          </div>
          <table className="min-w-full table-auto text-center my-5">
            <thead>
              <tr className="font-bold border-b-4 border-salt">
                <th>Season</th>
                <th>Episode</th>
                <th>Title</th>
                <th className="hidden sm:block">Description</th>
                <th />
              </tr>
            </thead>
            <tbody>{episodes}</tbody>
          </table>
        </div>
      </Protected>
    );
  }
}

const EpisodeRow = (props) => {
  return (
    <tr className="">
      <td>{props.episode.seasonNumber}</td>
      <td>{props.episode.episodeNumber}</td>
      <td>{props.episode.title}</td>
      <td className="hidden sm:inline">{props.episode.description}</td>
      <td>
        <a href={`/shows/${props.show.id}/episode/${props.episode.id}`}>
          <Button>Play</Button>
        </a>
      </td>
    </tr>
  );
};

const styles = {
  textDecoration: "none",
  color: "white",
};
