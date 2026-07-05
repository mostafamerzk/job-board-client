import Container from 'react-bootstrap/Container'
import Card from 'react-bootstrap/Card'
import Alert from 'react-bootstrap/Alert'

export function RegisterPage() {
  return (
    <Container className="py-5">
      <Card className="mx-auto" style={{ maxWidth: 440 }}>
        <Card.Body className="p-4">
          <Card.Title className="mb-3">Create account</Card.Title>
          <Alert variant="info">
            Registration form — coming soon.
          </Alert>
        </Card.Body>
      </Card>
    </Container>
  )
}
