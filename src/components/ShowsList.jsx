import React from "react";
import { Container, Row, Col } from "react-bootstrap";

export default function ShowsList(props) {
  const rows = props.data.data.map((x, i) => {
    return <Show key={i} data={x} />;
  });
  return (
    <Container className="">
      <Row>{rows}</Row>
    </Container>
  );
}

const Show = (props) => {
  const imageUrl = `https://homeflix-media.azureedge.net/images/shows/${props.data.imageName}`;
  return (
    <Col lg={4} md={6} className="my-3 showImageContainer">
      <a href={"/shows/" + props.data._id} style={styles}>
        <h4 className="text-primary text-center pb-2">{props.data.title}</h4>
        <img src={imageUrl} alt={props.data.title} className="showImageThumbnail" />
      </a>
    </Col>
  );
};

const styles = {
  textDecoration: "none",
};
