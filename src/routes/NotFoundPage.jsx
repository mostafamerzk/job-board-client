import Container from 'react-bootstrap/Container'
import Card from 'react-bootstrap/Card'
import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <Container className="py-5">
      <Card className="mx-auto" style={{ maxWidth: 500 }}>
        <Card.Body className="p-4 text-center">
          <Card.Title className="mb-3">Page not found</Card.Title>
          <p className="text-secondary">The page you are looking for does not exist.</p>
          <Link to="/" className="btn btn-outline-dark mt-2">Back to home</Link>
        </Card.Body>
      </Card>
    </Container>
  )
}
