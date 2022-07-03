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

export default function Episode() {
  const router = useRouter();
  const { episode } = router.query;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [data, setData] = useState();

  useEffect(() => {
    if (!router.isReady) return;
    const getData = async () => {
      try {
        const user = JSON.parse(sessionStorage.getItem("user"));
        const response = await fetch(`/api/episode/${episode}`, {
          headers: { token: user.token },
        });

        if (!response.ok) {
          setError(true);
        }
        const data = await response.json();
        setData(data);
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

  return (
    <Protected>
      <div className="container mx-auto flex flex-col w-full py-10">
        <div className="flex justify-between my-2 items-center">
          <div className="space-y-2">
            <h1 className="text-primary text-3xl">{data.show.title}</h1>
            <h2 className="text-xl">{data.title}</h2>
            <p className="text-coal dark:text-salt">
              Season: {data.seasonNumber} | Episode: {data.episodeNumber}
            </p>
          </div>
          <a href={`/shows/${data.show._id}`}>
            <Button color="bg-coal dark:bg-salt" text="text-salt dark:text-coal">
              Back
            </Button>
          </a>
        </div>
        <div>
          <VideoPlayer
            src={`https://homeflix-media.azureedge.net/shows/${data.show.title}/Season ${data.seasonNumber}/${data.fileName}`}
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
}
