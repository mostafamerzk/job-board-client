import Container from 'react-bootstrap/Container'
import Card from 'react-bootstrap/Card'
import Alert from 'react-bootstrap/Alert'

export function EmployerDashboard() {
  return (
    <Container className="py-5">
      <Card>
        <Card.Body className="p-4">
          <Card.Title>Employer workspace</Card.Title>
          <Alert variant="info" className="mt-3">
            Employer profile, job CRUD, and applicant review — coming soon.
            <br />
            See <code>docs/MODULE-EMPLOYER.md</code> for the implementation guide.
          </Alert>
        </Card.Body>
      </Card>
    </Container>
  )
}
