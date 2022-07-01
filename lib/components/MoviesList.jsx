import React, { useState } from "react";
import { Container, Row, Col, Button, Modal } from "react-bootstrap";
import { useRouter } from "next/router";

export default function MoviesList(props) {
  const rows = props.data.map((x, i) => {
    return <Movie key={i} data={x} />;
  });
  return (
    <div className="container mx-auto px-5 md:px-0">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{rows}</div>
    </div>
  );
}

const Movie = (props) => {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const imageUrl = `https://homeflix-media.azureedge.net/images/movies/${props.data.imageName}`;
  return (
    <div className="my-3">
      <div onClick={handleShow} className="cursor-pointer">
        <img className="h-120 w-full" src={imageUrl} alt={props.data.title} />
      </div>
      <Modal show={show} onHide={handleClose} centered size="lg" className="border border-dark">
        <Modal.Header className="bg-dark border border-dark">
          <Modal.Title className="text-primary">{props.data.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark border border-dark">
          <Row className="text-white my-3">
            <Col sm="3">
              <img className="movieThumbnail" src={imageUrl} alt={props.data.title} />
            </Col>
            <Col sm="9">
              <h6 className="my-2">Duration: {props.data.duration}</h6>
              <h6 className="my-2">Genre: Comedy</h6>
              <h6 className="my-2">Year: {props.data.releaseYear}</h6>
              <p className="my-5">{props.data.description}</p>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer className="bg-dark border border-dark">
          <Button variant="light" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleClose}>
            <a href={`/movies/${props.data._id}`} style={styles}>
              Play
            </a>
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

const styles = {
  textDecoration: "none",
  color: "white",
};
