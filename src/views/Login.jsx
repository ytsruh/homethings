import React, { useState } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { Navigate } from "react-router-dom";
import Loading from "../components/Loading";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [redirect, setRedirect] = useState(false);

  const submitForm = async (e) => {
    e.preventDefault();
    const url = "https://homeflix-api.azurewebsites.net/login";
    try {
      setSubmitting(true);
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });
      //Check for ok response
      if (!response.ok) {
        //Throw error if not ok
        throw Error(response.statusText);
      }
      // Set to json, put token in storage & redirect
      const data = await response.json();
      await sessionStorage.setItem("user", JSON.stringify(data));
      setRedirect(true);
    } catch (err) {
      setSubmitting(false);
      console.log(err);
    }
  };

  if (redirect) {
    return <Navigate replace to="/movies" />;
  }

  if (submitting) {
    return <Loading />;
  }

  return (
    <Container fluid>
      <Row className="justify-content-md-center">
        <Col sm="10" md="6" lg="4" className="mt-5">
          <Form onSubmit={submitForm}>
            <Form.Group className="mb-3">
              <Form.Label className="text-primary">Email address</Form.Label>
              <Form.Control
                required
                type="email"
                name="email"
                className="bg-dark border border-primary text-white"
                placeholder="Email"
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="text-primary">Password</Form.Label>
              <Form.Control
                required
                type="password"
                name="password"
                className="bg-dark border border-primary text-white"
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              Submit
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}
