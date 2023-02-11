import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import Protected from "@/components/Protected";
import PageTitle from "@/lib/ui/PageTitle";
import { getFavourites } from "./api/favourite";
import Button from "@/lib/ui/Button";

export default function Home(props: any) {
  const { favourites } = props;
  const favemovies = favourites.movies.map((movie: any, i: number) => {
    return <Favourite key={i} data={movie} types="movies" />;
  });
  const faveShows = favourites.shows.map((show: any, i: number) => {
    return <Favourite key={i} data={show} types="shows" />;
  });
  return (
    <Protected>
      <div className="flex flex-col">
        <PageTitle title="Welcome to Homeflix" image={"img/home.jpg"} alt="Homepage Hero" />
        <div className="grid grid-cols-1 md:grid-cols-2 w-100 p-5 lg:px-10">
          <div className="m-5 w-100">
            <h2 className="text-center text-2xl underline">Favourite Movies</h2>
            {favemovies.length > 0 ? favemovies : <NoFavourites />}
          </div>
          <div className="m-5 w-100">
            <h2 className="text-center text-2xl underline">Favourite Shows</h2>
            {faveShows.length > 0 ? faveShows : <NoFavourites />}
          </div>
        </div>
      </div>
    </Protected>
  );
}

const Favourite = (props: any) => {
  const router = useRouter();
  return (
    <div className="flex justify-between py-2 w-100">
      <div className="flex place-items-center justify-start md:justify-center px-10 w-full">
        <h6 className="text-lg">{props.data.title}</h6>
      </div>
      <Button onClick={() => router.push(`/${props.types}/${props.data.id}`)}>Play</Button>
    </div>
  );
};

const NoFavourites = () => {
  return (
    <div className="flex justify-center py-5 w-100">
      <h6 className="text-lg">You have not created any favourites yet</h6>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const favourites = await getFavourites(context.req);
  // Have to stringify then parse otherwise date objects cannot be passed to page
  const stringify = JSON.stringify(favourites);
  const parsed = JSON.parse(stringify);
  return {
    props: { favourites: parsed }, // will be passed to the page component as props
  };
};
