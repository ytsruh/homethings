import { useEffect } from "react";
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
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import { getEpisode } from "../../../api/episodes/[id]";

export default function Episode(props: any) {
  const router = useRouter();
  const { episode } = props;

  useEffect(() => {
    if (router.isReady && !episode) {
      router.push("/404");
    }
  }, [router, episode]);

  if (episode) {
    return (
      <Protected>
        <div className="container mx-auto flex flex-col w-full py-10">
          <div className="flex justify-between my-2 items-center">
            <div className="space-y-2">
              <h1 className="text-primary text-3xl">{episode.title}</h1>
              <p className="text-coal dark:text-salt">
                Season: {episode.seasonNumber} | Episode: {episode.episodeNumber}
              </p>
            </div>
            <a href={`/shows/${episode.showId}`}>
              <Button color="bg-coal dark:bg-salt" text="text-salt dark:text-coal">
                Back
              </Button>
            </a>
          </div>
          <div>
            <VideoPlayer
              src={`${process.env.NEXT_PUBLIC_IMAGES_ENDPOINT}/shows/${episode.show.title}/Season ${episode.seasonNumber}/${episode.fileName}`}
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

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { episode } = context.query;
  const episodeData = await getEpisode(episode as string);
  // Have to stringify then parse otherwise date objects cannot be passed to page
  const stringify = JSON.stringify(episodeData);
  const parsed = JSON.parse(stringify);
  return {
    props: { episode: parsed }, // will be passed to the page component as props
  };
};
