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

export default function SingleMovie() {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [data, setData] = useState();

  useEffect(() => {
    if (!router.isReady) return;
    const getData = async () => {
      try {
        const user = JSON.parse(sessionStorage.getItem("user"));
        const response = await fetch(`/api/movies/${id}`, {
          headers: { token: user.token },
        });

        if (!response.ok) {
          //setError(true);
        }
        const data = await response.json();
        setData(data);
        setLoading(false);
      } catch (err) {
        console.log(err);
        //setError(true);
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
        <div className="flex justify-between items-center my-2">
          <div className="space-y-2">
            <h1 className="text-primary text-3xl">{data.title}</h1>
            <p className="text-coal dark:text-salt">Duration: {data.duration}</p>
          </div>
          <a href="/movies">
            <Button color="bg-coal dark:bg-salt" text="text-salt dark:text-coal">
              Back
            </Button>
          </a>
        </div>
        <div>
          <VideoPlayer
            src={`https://homeflix-media.azureedge.net/movies/${data.fileName}`}
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
