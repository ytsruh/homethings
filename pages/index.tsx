import { GetServerSideProps } from "next";
import Protected from "@/components/Protected";
import { getFavourites } from "./api/favourite";

export default function Home(props: any) {
  console.log(props);
  return (
    <Protected>
      <div>
        <h1>Dashboard</h1>
      </div>
    </Protected>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  console.log(context);
  const favourites = await getFavourites(context);
  // Have to stringify then parse otherwise date objects cannot be passed to page
  const stringify = JSON.stringify(favourites);
  const parsed = JSON.parse(stringify);
  return {
    props: { favourites: parsed }, // will be passed to the page component as props
  };
};
