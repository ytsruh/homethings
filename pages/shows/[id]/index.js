import React, { useState, useEffect } from "react";
import { Container, Row, Col, Table, Button } from "react-bootstrap";
import Loading from "@/components/Loading";
import Protected from "@/components/Protected";
import { useRouter } from "next/router";

export default function Show() {
  const router = useRouter();
  const { id } = router.query;
  const [show, setShow] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;
    const getData = async () => {
      try {
        const user = JSON.parse(sessionStorage.getItem("user"));
        const response = await fetch(`/api/shows/${id}`, {
          headers: { token: user.token },
        });
        if (!response.ok) {
          setError(true);
        }
        const data = await response.json();
        setShow(data);
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

  const episodes = show.episodes.map((episode, i) => {
    return <EpisodeRow key={i} episode={episode} show={show} />;
  });

  return (
    <Protected>
      <Container fluid>
        <div className="bg-dark my-3">
          <Row>
            <Col className="mx-5">
              <Row>
                <div className="my-3">
                  <h1 className="text-primary">{show.name}</h1>
                </div>
              </Row>
              <Row>
                <Col md="5" sm="6">
                  <div className="my-3">
                    <img
                      src={`https://homeflix-media.azureedge.net/images/shows/${show.imageName}`}
                      alt={show.name}
                      className="showImageThumbnail"
                    />
                  </div>
                </Col>
                <Col md="7" sm="6">
                  <h1 className="text-primary py-3">{show.title}</h1>
                </Col>
              </Row>

              <Row>
                <Col>
                  <Table variant="dark" size="sm" responsive className="my-3 text-center">
                    <thead>
                      <tr className="font-weight-bold text-uppercase">
                        <th className="w-10">Season</th>
                        <th className="w-10">Episode</th>
                        <th className="w-30">Title</th>
                        <th className="w-40">Description</th>
                        <th className="w-10" />
                      </tr>
                    </thead>
                    <tbody>{episodes}</tbody>
                  </Table>
                </Col>
              </Row>
            </Col>
          </Row>
        </div>
      </Container>
    </Protected>
  );
}

const EpisodeRow = (props) => {
  return (
    <tr className="font-weight-bold">
      <td>{props.episode.seasonNumber}</td>
      <td>{props.episode.episodeNumber}</td>
      <td>{props.episode.title}</td>
      <td>{props.episode.description}</td>
      <td>
        <Button
          color="primary"
          size="lg"
          className="mx-5 my-3"
          href={`/shows/${props.show._id}/episode/${props.episode._id}`}
        >
          Play
        </Button>
      </td>
    </tr>
  );
};

const styles = {
  textDecoration: "none",
  color: "white",
};