import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Container, Row, Col, Button, Form } from "react-bootstrap";
import Loading from "../components/Loading";
import PageTitle from "../components/PageTitle";
import image from "../assets/img/settings.jpeg";
import Icon from "../components/Icon";

export default function Profile() {
  const [profile, setProfile] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);
  const [redirect, setRedirect] = useState(false);
  const user = JSON.parse(sessionStorage.getItem("user"));
  const desc = "Your profile & account settings";

  const submitData = async () => {
    const url = `${process.env.REACT_APP_HOST}/profile`;
    try {
      setSubmitting(true);
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: user.token,
        },
        body: JSON.stringify({
          profile,
        }),
      });
      //Check for ok response
      if (!response.ok) {
        //Throw error if not ok
        throw Error(response.statusText);
      }
      // Set to json, put token in storage & redirect
      const localStorage = JSON.parse(await sessionStorage.getItem("user"));
      localStorage.userData.darkMode = profile.darkMode;
      localStorage.userData.icon = profile.icon;
      await sessionStorage.setItem("user", JSON.stringify(localStorage));
      setSubmitting(false);
      setRedirect(true);
    } catch (err) {
      setSubmitting(false);
      console.log(err);
    }
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

  if (loading || submitting) {
    return <Loading />;
  }

  if (redirect) {
    return <Navigate replace to="/" />;
  }

  return (
    <div className="mb-3">
      <PageTitle title="Profile" description={desc} image={image} alt="Settings" />
      <Container className="bg-dark my-5">
        <Form>
          <Row className="p-5">
            <Col sm={12} md={6}>
              <h2 className="text-white pb-3 text-center">Account Settings</h2>
              <Form.Group className="mt-3">
                <Form.Label className="text-white">Name</Form.Label>
                <Form.Control
                  className="text-white"
                  type="email"
                  value={profile.name}
                  placeholder="name"
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mt-3">
                <Form.Label className="text-white">Dark Mode</Form.Label>
                <div onChange={(e) => setProfile({ ...profile, darkMode: e.target.value })}>
                  {["dark", "light", "system"].map((type, i) => (
                    <Form.Check
                      inline
                      value={type}
                      label={type}
                      name="darkMode"
                      type="radio"
                      defaultChecked={profile.darkMode === type}
                      key={i}
                      className="text-white text-capitalize"
                    />
                  ))}
                </div>
                <Form.Text muted>Note: This feature does not work at the moment :)</Form.Text>
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
                      label={<Icon icon={type} styles={iconStyles} />}
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
      <Container className="bg-dark my-5 py-3 text-white">
        <h5 className="text-center">App version: {process.env.REACT_APP_VERSION}</h5>
      </Container>
    </div>
  );
}

const iconStyles = {
  fontSize: "50px",
  margin: "0,0,0,50",
};
