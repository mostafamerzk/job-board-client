import { useState } from 'react'
import Card from 'react-bootstrap/Card'
import Table from 'react-bootstrap/Table'
import Badge from 'react-bootstrap/Badge'
import Button from 'react-bootstrap/Button'
import Spinner from 'react-bootstrap/Spinner'
import Alert from 'react-bootstrap/Alert'
import { History, XCircle } from 'lucide-react'
import { PanelTitle } from './PanelTitle.jsx'
import { withdrawApplication } from '../api/candidateApi.js'

const statusVariants = {
  accepted: 'success',
  pending: 'warning',
  rejected: 'danger',
  withdrawn: 'secondary',
}

export function ApplicationHistory({ applications, onRefresh }) {
  const [withdrawing, setWithdrawing] = useState(null)
  const [msg, setMsg] = useState(null)

  async function handleWithdraw(id) {
    setWithdrawing(id)
    setMsg(null)
    try {
      await withdrawApplication(id)
      setMsg({ variant: 'success', text: 'Application withdrawn' })
      onRefresh?.()
    } catch {
      setMsg({ variant: 'danger', text: 'Failed to withdraw' })
    } finally {
      setWithdrawing(null)
    }
  }

  return (
    <Card className="candidate-panel application-history mt-4">
      <Card.Body>
        <PanelTitle icon={<History size={21} aria-hidden="true" />} title="Application history" />
        {msg && <Alert variant={msg.variant} dismissible onClose={() => setMsg(null)}>{msg.text}</Alert>}
        {applications.length === 0 ? (
          <p className="text-muted text-center my-3">No applications yet</p>
        ) : (
          <Table responsive className="candidate-table align-middle">
            <thead>
              <tr>
                <th>Job</th>
                <th>Company</th>
                <th>Status</th>
                <th>Created</th>
                <th>Action</th>
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
                  <td data-label="Action">
                    {app.status === 'pending' ? (
                      <Button variant="outline-danger" size="sm" onClick={() => handleWithdraw(app.id)} disabled={withdrawing === app.id}>
                        {withdrawing === app.id ? <Spinner animation="border" size="sm" /> : <><XCircle size={14} /> Withdraw</>}
                      </Button>
                    ) : (
                      <span className="text-muted small">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card.Body>
    </Card>
  )
}
