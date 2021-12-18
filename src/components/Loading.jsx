import React from "react";
import { Spinner } from "react-bootstrap";

export default function Navigation() {
  return (
    <div className="d-flex align-items-center justify-content-center" style={styles.div}>
      <Spinner className="mx-2" style={styles.spinner} animation="grow" variant="primary" />
      <Spinner className="mx-2" style={styles.spinner} animation="grow" variant="primary" />
      <Spinner className="mx-2" style={styles.spinner} animation="grow" variant="primary" />
    </div>
  );
}

const styles = {
  spinner: {
    width: "2.5 rem",
    height: "2.5 rem",
  },
  div: {
    minHeight: "100vh",
  },
};
