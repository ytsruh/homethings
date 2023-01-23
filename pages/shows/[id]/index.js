import React, { useState, useEffect } from "react";
import Loading from "@/components/Loading";
import Protected from "@/components/Protected";
import { useRouter } from "next/router";
import Button from "@/lib/ui/Button";

export default function Show() {
  const router = useRouter();
  const { id } = router.query;
  const [show, setShow] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;
    const getData = async () => {
      try {
        const user = JSON.parse(sessionStorage.getItem("user"));
        const response = await fetch(`/api/shows/${id}`, {
          headers: { token: user.token },
        });
        if (!response.ok) {
          setError(true);
        }
        const data = await response.json();
        setShow(data);
        setLoading(false);
      } catch (err) {
        console.log(err);
        setError(true);
        setLoading(false);
      }
    };
    getData();
  }, [router.isReady]);

  if (error) {
    router.push("/500");
  }

  if (loading) {
    return <Loading />;
  }

  const episodes = show.episodes.map((episode, i) => {
    return <EpisodeRow key={i} episode={episode} show={show} />;
  });

  return (
    <Protected>
      <div className="container mx-auto flex flex-col px-5 md:px-10">
        <div className="flex justify-between">
          <div className="w-full md:w-1/3 lg:w-1/2 flex flex-col items-center justify-center">
            <h1 className="text-primary text-5xl">{show.title}</h1>
            <h3 className="text-xl my-10">Episodes: {show.episodes.length}</h3>
          </div>
          <div className="w-0 md:w-2/3 lg:w-1/2">
            <img
              src={`${process.env.NEXT_PUBLIC_IMAGES_ENDPOINT}/images/shows/${show.imageName}`}
              alt={show.name}
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
          <tbody className="">{episodes}</tbody>
        </table>
      </div>
    </Protected>
  );
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
