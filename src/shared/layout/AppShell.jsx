import { Link } from 'react-router-dom'
import Container from 'react-bootstrap/Container'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import Button from 'react-bootstrap/Button'

export function AppShell({ children }) {
  return (
    <>
      <Navbar expand="lg" className="app-nav" sticky="top">
        <Container>
          <Navbar.Brand as={Link} to="/" className="brand-mark">
            WazeefaMasr
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="wazeefa-nav" />
          <Navbar.Collapse id="wazeefa-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/jobs">Jobs</Nav.Link>
              <Nav.Link as={Link} to="/register?role=employer">For Employers</Nav.Link>
            </Nav>
            <Nav className="align-items-lg-center gap-lg-2">
              <Nav.Link as={Link} to="/login">Sign in</Nav.Link>
              <Link to="/register">
                <Button size="sm" className="btn-brand nav-cta">
                  Get started
                </Button>
              </Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      {children}
    </>
  )
}
