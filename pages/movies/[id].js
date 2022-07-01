import React, { useState, useEffect } from "react";
import { Card } from "react-bootstrap";
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
        console.log(id);
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
      <Card bg="dark" className="border border-dark m-3">
        <Card.Body>
          <Card.Title className="my-3 text-primary">
            <h1>{data.title}</h1>
          </Card.Title>
          <Card.Subtitle className="my-3 text-white">Duration: {data.duration}</Card.Subtitle>
          <Card.Text className="my-3 text-muted">
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
          </Card.Text>
        </Card.Body>
      </Card>
    </Protected>
  );
}
