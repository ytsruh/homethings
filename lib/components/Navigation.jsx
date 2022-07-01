import React from "react";
import { Navbar, Container, Nav, NavDropdown } from "react-bootstrap";
import Icon from "./Icon";

export default function Navigation(props) {
  return (
    <Navbar bg="dark" variant="primary" sticky="top">
      <Container className="d-flex justify-content-between">
        <Navbar.Brand href="/">Homeflix</Navbar.Brand>
        <Nav className="flex-row">
          <Nav.Link className="px-2" href="/movies">
            Movies
          </Nav.Link>
          <Nav.Link className="px-2" href="/shows">
            Shows
          </Nav.Link>
        </Nav>
        <Nav>
          <NavDropdown
            title={<Icon icon={props.icon} color="primary" styles={iconStyles} />}
            menuVariant="dark"
          >
            <NavDropdown.Item href="/profile">Profile</NavDropdown.Item>
            <NavDropdown.Item href="/logout">Logout</NavDropdown.Item>
          </NavDropdown>
        </Nav>
      </Container>
    </Navbar>
  );
}

const iconStyles = {
  fontSize: "20px",
};
