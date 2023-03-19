import React from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../shared/authContext';
import Button from 'react-bootstrap/Button';
import { removeUserSession } from '../shared/common';
import { useNavigate } from 'react-router-dom';


function NavBar() {
  const auth = useAuth();
  const navigate = useNavigate();
  const logout = () => {
    removeUserSession();
    auth.logout();
    navigate('/login', {replace: true})
  }
  return (
    <>
      <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
        <Container>
          <Navbar.Brand as={NavLink} to="/">VendorWise</Navbar.Brand>
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="me-auto">
              {auth.user && <Nav.Link as={NavLink} to="workers">Workers</Nav.Link>}
              {auth.user && <Nav.Link as={NavLink} to="contracts">Contracts</Nav.Link>}
            </Nav>
            <Nav>
              {auth.user && <Button variant='light' onClick={logout}>Logout</Button>}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
}

export default NavBar;