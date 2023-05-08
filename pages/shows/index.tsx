import { useEffect } from "react";
import { useRouter } from "next/router";
import Protected from "@/components/Protected";
import PageTitle from "@/lib/ui/PageTitle";
import ShowsList from "@/components/ShowsList";
import { getShows } from "../api/shows";
import { GetServerSideProps } from "next";

const desc = "Action, comedy & fantasy TV shows from 24 to Game of Thrones. Sit back & binge.";

export default function Shows(props: any) {
  const router = useRouter();
  const { shows } = props;

  useEffect(() => {
    if (router.isReady && !shows) {
      router.push("/404");
    }
  }, [router, shows]);

  if (shows) {
    return (
      <Protected>
        <div className="py-3">
          <PageTitle title="TV Shows" description={desc} image="img/showshero.jpg" alt="Shows Hero" />
          <ShowsList data={shows} />
        </div>
      </Protected>
    );
  }
}

export const getServerSideProps: GetServerSideProps = async () => {
  const shows = await getShows();
  // Have to stringify then parse otherwise date objects cannot be passed to page
  const stringify = JSON.stringify(shows);
  const parsed = JSON.parse(stringify);
  return {
    props: { shows: parsed }, // will be passed to the page component as props
  };
};
