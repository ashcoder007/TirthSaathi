// src/components/CustomNavbar.js
import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './CustomNavbar.css';

const CustomNavbar = () => {
  return (
    <Navbar expand="lg" className="custom-navbar" variant="light" fixed="top">
      <Container className="container-narrow">
        <Navbar.Brand as={Link} to="/" className="brand d-flex align-items-center">
          <img
            src={`${process.env.PUBLIC_URL}/assets/icons/logo.png`}
            alt="TirthSaathi"
            className="brand-logo"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <span className="brand-text ms-2">TirthSaathi</span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center">

            <Nav.Link href="#about">About</Nav.Link>
            <Nav.Link href="#assist">How We Assist</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default CustomNavbar;
