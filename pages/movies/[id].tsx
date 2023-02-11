import { useEffect } from "react";
import { useRouter } from "next/router";
import {
  Player as VideoPlayer,
  BigPlayButton,
  LoadingSpinner,
  ControlBar,
  ReplayControl,
  ForwardControl,
  CurrentTimeDisplay,
  TimeDivider,
  VolumeMenuButton,
} from "video-react";
import "video-react/dist/video-react.css";
import Protected from "@/components/Protected";
import Button from "@/lib/ui/Button";
import { getMovie } from "../api/movies/[id]";
import { GetServerSideProps } from "next";

export default function SingleMovie(props: any) {
  const router = useRouter();
  const { movie } = props;

  useEffect(() => {
    if (router.isReady && !movie) {
      router.push("/404");
    }
  }, [router, movie]);

  if (movie) {
    return (
      <Protected>
        <div className="container mx-auto flex flex-col w-full py-10">
          <div className="flex justify-between items-center my-2">
            <div className="space-y-2">
              <h1 className="text-primary text-3xl">{movie.title}</h1>
              <p className="text-coal dark:text-salt">Duration: {movie.duration}</p>
            </div>
            <a href="/movies">
              <Button color="bg-coal dark:bg-salt" text="text-salt dark:text-coal">
                Back
              </Button>
            </a>
          </div>
          <div>
            <VideoPlayer
              src={`${process.env.NEXT_PUBLIC_IMAGES_ENDPOINT}/movies/${movie.fileName}`}
              aspectRatio="16:9"
              fluid={true}
              autoPlay={true}
            >
              <LoadingSpinner />
              <BigPlayButton position="center" />
              <ControlBar>
                <ReplayControl seconds={10} />
                <ForwardControl seconds={30} />
                <CurrentTimeDisplay order={4.1} />
                <TimeDivider order={4.2} />
                <VolumeMenuButton />
              </ControlBar>
            </VideoPlayer>
          </div>
        </div>
      </Protected>
    );
  }
}

export const getServerSideProps: GetServerSideProps = async (context: any) => {
  const { id } = context.query;
  const movie = await getMovie(id);
  // Have to stringify then parse otherwise date objects cannot be passed to page
  const stringify = JSON.stringify(movie);
  const parsed = JSON.parse(stringify);
  return {
    props: { movie: parsed }, // will be passed to the page component as props
  };
};
