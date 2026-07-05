import Container from 'react-bootstrap/Container'
import Card from 'react-bootstrap/Card'
import Alert from 'react-bootstrap/Alert'
import { Link } from 'react-router-dom'

export function UnauthorizedPage() {
  return (
    <Container className="py-5">
      <Card className="mx-auto" style={{ maxWidth: 500 }}>
        <Card.Body className="p-4 text-center">
          <Card.Title className="mb-3">Access denied</Card.Title>
          <Alert variant="danger">
            You do not have the required role to view this page.
          </Alert>
          <Link to="/" className="btn btn-outline-dark mt-2">Back to home</Link>
        </Card.Body>
      </Card>
    </Container>
  )
}
