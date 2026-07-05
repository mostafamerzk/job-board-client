import Container from 'react-bootstrap/Container'
import Card from 'react-bootstrap/Card'
import Alert from 'react-bootstrap/Alert'

export function AdminDashboard() {
  return (
    <Container className="py-5">
      <Card>
        <Card.Body className="p-4">
          <Card.Title>Admin console</Card.Title>
          <Alert variant="info" className="mt-3">
            Job moderation, user management, and comment moderation — coming soon.
            <br />
            See <code>docs/MODULE-ADMIN.md</code> for the implementation guide.
          </Alert>
        </Card.Body>
      </Card>
    </Container>
  )
}
