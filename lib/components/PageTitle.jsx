import React from "react";
import { Container, Row, Col } from "react-bootstrap";

export default function PageTitle(props) {
  return (
    <Container fluid className="py-3 px-4 bg-dark">
      <Container>
        <Row className="d-flex align-items-center">
          <Col lg="4" md="6" className="text-center">
            <h1 className="display-5 lh-1 mb-3 text-primary">{props.title}</h1>
            <p className="lead text-white">{props.description}</p>
          </Col>
          <Col lg="8" md="6">
            <img
              src={props.image}
              style={styles}
              className="img-fluid mx-auto d-block"
              alt={props.alt}
              loading="lazy"
            />
          </Col>
        </Row>
      </Container>
    </Container>
  );
}

const styles = {
  maxHeight: "400px",
};
