import { useEffect } from "react";
import Protected from "@/components/Protected";
import { useRouter } from "next/router";
import Button from "@/lib/ui/Button";
import FavouriteButton from "@/components/FavouriteButton";
import { GetServerSideProps } from "next";
import { getFavourites } from "../../api/favourite";
import { getShow } from "../../api/shows/[id]";

type Data = {
  favourites: any;
  show: any;
};

type Episode = {
  episode: any;
  show: any;
};

export default function Show(props: Data) {
  const router = useRouter();
  const { show, favourites } = props;

  useEffect(() => {
    if (router.isReady && !show) {
      router.push("/404");
    }
  }, [router, show]);

  if (show?.episodes) {
    const episodes = show.episodes.map((episode: any, i: any) => {
      return <EpisodeRow key={i} episode={episode} show={show} />;
    });

    return (
      <Protected>
        <div className="container mx-auto flex flex-col px-5 md:px-10">
          <div className="flex justify-between">
            <div className="w-full md:w-1/3 lg:w-1/2 flex flex-col items-center justify-center">
              <h1 className="text-primary text-5xl">{show.title}</h1>
              <h3 className="text-xl my-10">Episodes: {show.episodes.length}</h3>
              <FavouriteButton
                id={show.id}
                type="show"
                favourite={favourites.shows.find((f: any) => f.id === show.id)}
              />
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
            <tbody>{episodes}</tbody>
          </table>
        </div>
      </Protected>
    );
  }
}

const EpisodeRow = (props: Episode) => {
  return (
    <tr>
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

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.query;
  const favourites = await getFavourites(context.req);
  const show = await getShow(id);
  // Have to stringify then parse otherwise date objects cannot be passed to page
  const stringify = JSON.stringify({ favourites, show });
  const parsed = JSON.parse(stringify);
  return {
    props: parsed, // will be passed to the page component as props
  };
};
