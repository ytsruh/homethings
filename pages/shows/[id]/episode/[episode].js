import React, { useState, useEffect } from "react";
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
import Loading from "@/components/Loading";
import Protected from "@/components/Protected";
import Button from "@/lib/ui/Button";
import useFetchData from "@/lib/hooks/useFetchData";

export default function Episode() {
  const router = useRouter();
  const { episode } = router.query;
  const { isLoading, serverError, apiData } = useFetchData(`/api/episodes/${episode}`);

  if (isLoading) {
    return <Loading />;
  }
  if (serverError) {
    router.push("/500");
  }

  if (apiData && apiData.show) {
    return (
      <Protected>
        <div className="container mx-auto flex flex-col w-full py-10">
          <div className="flex justify-between my-2 items-center">
            <div className="space-y-2">
              <h1 className="text-primary text-3xl">{apiData.title}</h1>
              <p className="text-coal dark:text-salt">
                Season: {apiData.seasonNumber} | Episode: {apiData.episodeNumber}
              </p>
            </div>
            <a href={`/shows/${apiData.showId}`}>
              <Button color="bg-coal dark:bg-salt" text="text-salt dark:text-coal">
                Back
              </Button>
            </a>
          </div>
          <div>
            <VideoPlayer
              src={`${process.env.NEXT_PUBLIC_IMAGES_ENDPOINT}/shows/${apiData.show.title}/Season ${apiData.seasonNumber}/${apiData.fileName}`}
              aspectRatio="16:9"
              fluid={true}
              autoPlay={true}
            >
              <LoadingSpinner />
              <BigPlayButton position="center" />
              <ControlBar>
                <ReplayControl seconds={10} order={1.1} />
                <ForwardControl seconds={30} order={1.2} />
                <CurrentTimeDisplay order={4.1} />
                <TimeDivider order={4.2} />
                <VolumeMenuButton />
              </ControlBar>
            </VideoPlayer>
          </div>
        </div>
      </Protected>
    );
  } else {
    return null;
  }
}
