import React from "react";
import { Card } from "react-bootstrap";
import { Navigate, useLocation } from "react-router-dom";
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

export default function MoviePlayer(props) {
  let location = useLocation();
  const data = location.state;

  if (!data) {
    return <Navigate replace to="/500" />;
  }

  return (
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
  );
}
