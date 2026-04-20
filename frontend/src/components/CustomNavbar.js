// src/components/CustomNavbar.js
import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { getUser, logout } from '../utils/auth';
import './CustomNavbar.css';

const CustomNavbar = () => {
  const user = getUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/'); // redirect to home after logout
  };

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

            {/* Static Links */}
            <Nav.Link href="#about">About</Nav.Link>
            <Nav.Link href="#assist">How We Assist</Nav.Link>

            {/* Conditional Rendering based on login */}
            {!user ? (
              <>
                <Nav.Link as={Link} to="/login">
                  <Button variant="outline-warning" className="mx-2">Login</Button>
                </Nav.Link>
                <Nav.Link as={Link} to="/signup">
                  <Button variant="warning">Sign Up</Button>
                </Nav.Link>
              </>
            ) : (
              <>
                <span className="me-3 fw-semibold text-dark">Hey! {user.name}</span>
                <Button variant="outline-danger" onClick={handleLogout}>Logout</Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default CustomNavbar;
