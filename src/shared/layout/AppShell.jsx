import { Link } from 'react-router-dom'
import Container from 'react-bootstrap/Container'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import Button from 'react-bootstrap/Button'
import { useAuth } from '../../hooks/useAuth.js'

export function AppShell({ children }) {
  const { isAuthenticated, user, logout } = useAuth()

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
              {!isAuthenticated && (
                <Nav.Link as={Link} to="/register?role=employer">For Employers</Nav.Link>
              )}
              {isAuthenticated && user?.role === 'candidate' && (
                <Nav.Link as={Link} to="/candidate">Dashboard</Nav.Link>
              )}
              {isAuthenticated && user?.role === 'employer' && (
                <Nav.Link as={Link} to="/employer">Dashboard</Nav.Link>
              )}
              {isAuthenticated && user?.role === 'admin' && (
                <Nav.Link as={Link} to="/admin">Dashboard</Nav.Link>
              )}
            </Nav>
            <Nav className="align-items-lg-center gap-lg-2">
              {!isAuthenticated ? (
                <>
                  <Nav.Link as={Link} to="/login">Sign in</Nav.Link>
                  <Link to="/register">
                    <Button size="sm" className="btn-brand nav-cta">
                      Get started
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <span className="navbar-text me-3 d-none d-lg-block">
                    {user?.name}
                  </span>
                  <Button variant="outline-danger" size="sm" onClick={logout}>
                    Sign out
                  </Button>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      {children}
    </>
  )
}
