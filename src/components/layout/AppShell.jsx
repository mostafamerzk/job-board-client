import Container from 'react-bootstrap/Container'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'

export function AppShell({ children }) {
  return (
    <>
      <Navbar expand="lg" className="app-nav" sticky="top">
        <Container>
          <Navbar.Brand href="#" className="brand-mark">
            Job Board Client
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="job-board-nav" />
          <Navbar.Collapse id="job-board-nav">
            <Nav className="ms-auto">
              <Nav.Link href="#workspaces">Workspaces</Nav.Link>
              <Nav.Link href="./docs/PROJECT-STRUCTURE.md">Structure</Nav.Link>
              <Nav.Link href="./docs/TESTING-STRATEGY.md">Tests</Nav.Link>
              <Nav.Link href="./DESIGN.md">Design</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      {children}
    </>
  )
}
