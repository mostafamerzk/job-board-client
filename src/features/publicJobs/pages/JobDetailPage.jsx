import Container from 'react-bootstrap/Container'
import Card from 'react-bootstrap/Card'
import Alert from 'react-bootstrap/Alert'

export function JobDetailPage() {
  return (
    <Container className="py-5">
      <Card>
        <Card.Body className="p-4">
          <Card.Title>Job detail</Card.Title>
          <Alert variant="info" className="mt-3">
            Full job description, employer info, and apply CTA — coming soon.
            <br />
            See <code>docs/MODULE-PUBLIC-JOBS.md</code> for the implementation guide.
          </Alert>
        </Card.Body>
      </Card>
    </Container>
  )
}
