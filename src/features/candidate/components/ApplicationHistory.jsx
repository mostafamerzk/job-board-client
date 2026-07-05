import Card from 'react-bootstrap/Card'
import Table from 'react-bootstrap/Table'
import Badge from 'react-bootstrap/Badge'
import { History } from 'lucide-react'
import { PanelTitle } from './PanelTitle.jsx'

const statusVariants = {
  accepted: 'success',
  pending: 'warning',
  rejected: 'danger',
  withdrawn: 'secondary',
}

export function ApplicationHistory({ applications }) {
  return (
    <Card className="candidate-panel application-history mt-4">
      <Card.Body>
        <PanelTitle icon={<History size={21} aria-hidden="true" />} title="Application history" />
        <Table responsive className="candidate-table align-middle">
          <thead>
            <tr>
              <th>Job</th>
              <th>Company</th>
              <th>Status</th>
              <th>Created</th>
              <th>Candidate action</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app.id}>
                <td data-label="Job">{app.jobTitle}</td>
                <td data-label="Company">{app.company}</td>
                <td data-label="Status">
                  <Badge bg={statusVariants[app.status]}>{app.status}</Badge>
                </td>
                <td data-label="Created">{app.createdAt}</td>
                <td data-label="Candidate action">
                  <code>{app.action}</code>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  )
}
