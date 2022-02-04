import React from "react";
import { Navbar, Container, Nav, NavDropdown } from "react-bootstrap";

export default function Navigation() {
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
          <NavDropdown title="Account">
            <NavDropdown.Item href="/profile">Profile</NavDropdown.Item>
            <NavDropdown.Item href="/logout">Logout</NavDropdown.Item>
          </NavDropdown>
        </Nav>
      </Container>
    </Navbar>
  );
}
