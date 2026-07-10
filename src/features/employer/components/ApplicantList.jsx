import { useState, useEffect, useCallback } from 'react'
import Card from 'react-bootstrap/Card'
import Table from 'react-bootstrap/Table'
import Button from 'react-bootstrap/Button'
import Nav from 'react-bootstrap/Nav'
import Badge from 'react-bootstrap/Badge'
import Spinner from 'react-bootstrap/Spinner'
import Alert from 'react-bootstrap/Alert'
import Form from 'react-bootstrap/Form'
import { Users, CheckCircle2, XCircle, FileText, ExternalLink } from 'lucide-react'
import { getJobApplications, updateApplicationStatus } from '../api/employerApi.js'
import { ConfirmModal } from './ConfirmModal.jsx'

const STATUS_TABS = [
  { key: '', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'rejected', label: 'Rejected' },
]

const STATUS_VARIANTS = {
  pending: { bg: 'warning', text: 'dark' },
  accepted: { bg: 'success', text: 'white' },
  rejected: { bg: 'danger', text: 'white' },
  withdrawn: { bg: 'secondary', text: 'white' },
}

export function ApplicantList({ jobId, jobTitle, onSuccess }) {
  const [applications, setApplications] = useState([])
  const [meta, setMeta] = useState(null)
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionTarget, setActionTarget] = useState(null) // { app, action: 'accept'|'reject' }
  const [actionLoading, setActionLoading] = useState(false)
  const [rejectNotes, setRejectNotes] = useState('')

  const fetchApplications = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = {}
      if (status) params.status = status
      const res = await getJobApplications(jobId, params)
      setApplications(res.data.data || [])
      // console.log("apps:", res.data.data)
      setMeta(res?.meta || null)
    } catch (err) {
      setError(err.body?.message || 'Failed to load applications')
    } finally {
      setLoading(false)
    }
  }, [jobId, status])

  useEffect(() => {
    fetchApplications()
  }, [])

  async function handleAction() {
    if (!actionTarget) return
    const { app, action } = actionTarget
    setActionLoading(true)
    try {
      const data = { status: action === 'accept' ? 'accepted' : 'rejected' }
      if (action === 'reject' && rejectNotes.trim()) {
        data.employer_notes = rejectNotes.trim()
      }
      await updateApplicationStatus(app.id, data)
      setActionTarget(null)
      setRejectNotes('')
      onSuccess?.(`Application ${action === 'accept' ? 'accepted' : 'rejected'} successfully`)
      fetchApplications()
    } catch (err) {
      if (err.status === 422) {
        setError(err.body?.message || 'This application has already been reviewed')
      } else {
        setError(err.body?.message || 'Failed to update application')
      }
      setActionTarget(null)
      setRejectNotes('')
    } finally {
      setActionLoading(false)
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <Card className="employer-panel">
      <Card.Body>
        <div className="panel-header">
          <Users size={21} aria-hidden="true" />
          <h3>Applications{jobTitle ? ` for "${jobTitle}"` : ''}</h3>
        </div>

        <Nav variant="tabs" className="employer-status-tabs mb-3">
          {STATUS_TABS.map((tab) => (
            <Nav.Item key={tab.key}>
              <Nav.Link
                active={status === tab.key}
                onClick={() => setStatus(tab.key)}
              >
                {tab.label}
              </Nav.Link>
            </Nav.Item>
          ))}
        </Nav>

        {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="success" role="status">
              <span className="visually-hidden">Loading applications…</span>
            </Spinner>
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-5">
            <Users size={48} className="text-secondary mb-3" aria-hidden="true" />
            <h4 style={{ fontWeight: 800 }}>No applications {status ? `with "${status}" status` : 'yet'}</h4>
            <p className="text-secondary">
              {status ? 'Try a different filter.' : 'Applications will appear here once candidates apply.'}
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <Table className="employer-table align-middle">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Headline</th>
                  <th>Resume</th>
                  <th>Status</th>
                  <th>Applied</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => {
                  const sv = STATUS_VARIANTS[app.status] || { bg: 'secondary', text: 'white' }
                  const isPending = app.status === 'pending'
                  const candidate = app.candidate || {}
                  const profile = candidate.candidate_profile || {}
                  return (
                    <tr key={app.id}>
                      <td data-label="Candidate">
                        <strong>{candidate.name || '—'}</strong>
                        <span className="d-block text-secondary" style={{ fontSize: '0.8rem' }}>
                          {candidate.email || ''}
                        </span>
                      </td>
                      <td data-label="Headline">
                        {profile.headline || <span className="text-tertiary">—</span>}
                      </td>
                      <td data-label="Resume">
                        {app.resume ? (
                          <a
                            href={app.resume.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="d-inline-flex align-items-center gap-1"
                            style={{ color: 'var(--accent-primary)', fontWeight: 600, fontSize: '0.875rem' }}
                          >
                            <FileText size={14} aria-hidden="true" />
                            {app.resume.original_name || 'Resume'}
                            <ExternalLink size={12} aria-hidden="true" />
                          </a>
                        ) : (
                          <span className="text-tertiary">—</span>
                        )}
                      </td>
                      <td data-label="Status">
                        <Badge bg={sv.bg} text={sv.text} className="status-pill">
                          {app.status}
                        </Badge>
                      </td>
                      <td data-label="Applied">{formatDate(app.created_at)}</td>
                      <td data-label="Actions">
                        {isPending ? (
                          <div className="d-flex gap-1">
                            <Button
                              variant="outline-success"
                              size="sm"
                              title="Accept application"
                              onClick={() => setActionTarget({ app, action: 'accept' })}
                            >
                              <CheckCircle2 size={14} aria-hidden="true" /> Accept
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              title="Reject application"
                              onClick={() => setActionTarget({ app, action: 'reject' })}
                            >
                              <XCircle size={14} aria-hidden="true" /> Reject
                            </Button>
                          </div>
                        ) : (
                          <span className="text-tertiary" style={{ fontSize: '0.8rem' }}>
                            {app.status === 'withdrawn' ? 'Withdrawn by candidate' : 'Reviewed'}
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </Table>
          </div>
        )}
      </Card.Body>

      {/* Accept confirmation */}
      <ConfirmModal
        show={actionTarget?.action === 'accept'}
        onCancel={() => setActionTarget(null)}
        onConfirm={handleAction}
        title="Accept application"
        body={`Accept ${actionTarget?.app?.candidate?.name || 'this candidate'}'s application? They will be notified.`}
        confirmLabel="Accept"
        variant="success"
        isLoading={actionLoading}
      />

      {/* Reject confirmation with notes */}
      <ConfirmModal
        show={actionTarget?.action === 'reject'}
        onCancel={() => { setActionTarget(null); setRejectNotes('') }}
        onConfirm={handleAction}
        title="Reject application"
        confirmLabel="Reject"
        variant="danger"
        isLoading={actionLoading}
      >
        <p>Reject {actionTarget?.app?.candidate?.name || 'this candidate'}'s application?</p>
        <Form.Group>
          <Form.Label>Notes (optional)</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={rejectNotes}
            onChange={(e) => setRejectNotes(e.target.value)}
            placeholder="Provide feedback to the candidate…"
            disabled={actionLoading}
          />
        </Form.Group>
      </ConfirmModal>
    </Card>
  )
}
