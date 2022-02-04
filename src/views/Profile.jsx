import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Container, Row, Col, Button, Form, FormCheck } from "react-bootstrap";
import Loading from "../components/Loading";
import PageTitle from "../components/PageTitle";
import image from "../assets/img/settings.jpeg";
import * as Icons from "react-icons/bs";

export default function Profile() {
  const [profile, setProfile] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const user = JSON.parse(sessionStorage.getItem("user"));

  const submitData = () => {
    console.log(profile);
  };

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_HOST}/profile`, {
          headers: { token: user.token },
        });
        if (!response.ok) {
          setError(true);
        }
        const data = await response.json();
        setProfile(data);
        setLoading(false);
      } catch (err) {
        setError(true);
        setLoading(false);
      }
    };
    getData();
  }, [user.token]);

  if (error) {
    return <Navigate replace to="/500" />;
  }

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="mb-3">
      <PageTitle title="Profile" description={desc} image={image} alt="Settings" />
      <Container className="bg-dark my-5">
        <Form>
          <Row className="p-5">
            <Col sm={12} md={6}>
              <h2 className="text-white pb-3 text-center">Account Settings</h2>
              <Form.Group>
                <Form.Label className="text-white">Name</Form.Label>
                <Form.Control
                  className="text-white"
                  type="email"
                  value={profile.name}
                  placeholder="name"
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col sm={12} md={6} className="mt-5 mt-md-0">
              <h2 className="text-white pb-3 text-center">Profile Icon</h2>
              <Row onChange={(e) => setProfile({ ...profile, icon: e.target.value })}>
                {[
                  "BsFillEmojiSmileUpsideDownFill",
                  "BsTrophyFill",
                  "BsFillCameraReelsFill",
                  "BsHeartFill",
                ].map((type, i) => (
                  <Col key={i} className="" xs={6} sm={6} md={3}>
                    <Form.Check
                      inline
                      value={type}
                      label={<Icon icon={type} />}
                      name="icon"
                      type="radio"
                      defaultChecked={profile.icon === type}
                      id={i}
                    />
                  </Col>
                ))}
              </Row>
            </Col>
          </Row>
          <Row className="p-5">
            <Button variant="primary" onClick={() => submitData()}>
              Submit
            </Button>
          </Row>
        </Form>
      </Container>
    </div>
  );
}

const desc = "Your profile & account settings";
const styles = {
  icon: {
    fontSize: "50px",
    margin: "0,0,0,50",
  },
};

const Icon = (props) => {
  const icon = Icons[props.icon]();
  return (
    <div style={styles.icon} className="text-white">
      {icon}
    </div>
  );
};
