import React, { useState } from "react";
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";
import { useRouter } from "next/router";
import Loading from "@/components/Loading";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submitForm = async (e) => {
    e.preventDefault();
    const url = `/api/login`;
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
      router.push("/movies");
    } catch (err) {
      setSubmitting(false);
      setError("There has been an error. Please try to enter you email & password again.");
      console.log(err);
    }
  };

  if (submitting) {
    return <Loading />;
  }

  return (
    <Container fluid>
      <Row className="justify-content-md-center">
        <Col sm="10" md="6" lg="4" className="mt-5">
          <div className="text-primary text-center py-5">
            <h1>Welcome to Homeflix</h1>
            <h6 className="text-white">Please login to view awesome Movies & TV shows</h6>
          </div>
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
          {error ? <Error text={error} close={setError} /> : ""}
        </Col>
      </Row>
    </Container>
  );
}

const Error = (props) => {
  return (
    <Alert variant="primary" onClose={() => props.close(false)} dismissible className="my-5">
      <Alert.Heading>Oh snap! You got an error!</Alert.Heading>
      <p>{props.text}</p>
    </Alert>
  );
};
