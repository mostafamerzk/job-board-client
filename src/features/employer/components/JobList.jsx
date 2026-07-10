import { useState, useEffect, useCallback } from 'react'
import Card from 'react-bootstrap/Card'
import Table from 'react-bootstrap/Table'
import Button from 'react-bootstrap/Button'
import Nav from 'react-bootstrap/Nav'
import Spinner from 'react-bootstrap/Spinner'
import Alert from 'react-bootstrap/Alert'
import Badge from 'react-bootstrap/Badge'
import { Briefcase, Plus, Eye, Pencil, Trash2, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getJobs, deleteJob } from '../api/employerApi.js'
import { ConfirmModal } from './ConfirmModal.jsx'

const STATUS_TABS = [
  { key: '', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
]

const STATUS_VARIANTS = {
  pending: { bg: 'warning', text: 'dark' },
  approved: { bg: 'success', text: 'white' },
  rejected: { bg: 'danger', text: 'white' },
}

export function JobList({ onSuccess }) {
  const navigate = useNavigate()
  const [jobs, setJobs] = useState([])
  const [meta, setMeta] = useState(null)
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const fetchJobs = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = { page, per_page: 15 }
      if (status) params.status = status
      const res = await getJobs(params)
      setJobs(res?.data || [])
      setMeta(res?.meta || null)
    } catch (err) {
      setError(err.body?.message || 'Failed to load jobs')
    } finally {
      setLoading(false)
    }
  }, [status, page])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  function handleStatusChange(newStatus) {
    setStatus(newStatus)
    setPage(1)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteJob(deleteTarget.id)
      setDeleteTarget(null)
      onSuccess?.('Job deleted successfully')
      fetchJobs()
    } catch (err) {
      setError(err.body?.message || 'Failed to delete job')
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <Card className="employer-panel">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-3">
          <div className="panel-header mb-0">
            <Briefcase size={21} aria-hidden="true" />
            <h3>My jobs</h3>
          </div>
          <Button className="btn-brand" size="sm" onClick={() => navigate('/employer/jobs/new')}>
            <Plus size={16} aria-hidden="true" /> Post new job
          </Button>
        </div>

        <Nav variant="tabs" className="employer-status-tabs mb-3">
          {STATUS_TABS.map((tab) => (
            <Nav.Item key={tab.key}>
              <Nav.Link
                active={status === tab.key}
                onClick={() => handleStatusChange(tab.key)}
                className={status === tab.key ? 'active' : ''}
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
              <span className="visually-hidden">Loading jobs…</span>
            </Spinner>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-5">
            <Briefcase size={48} className="text-secondary mb-3" aria-hidden="true" />
            <h4 style={{ fontWeight: 800 }}>
              {status === 'pending' ? 'No pending jobs' : 'No jobs found'}
            </h4>
            <p className="text-secondary">
              {status ? 'Try a different filter.' : 'Post your first job to start receiving applications.'}
            </p>
            {!status && (
              <Button className="btn-brand" onClick={() => navigate('/employer/jobs/new')}>
                <Plus size={16} aria-hidden="true" /> Post your first job
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <Table className="employer-table align-middle">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Applications</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => {
                    const sv = STATUS_VARIANTS[job.status] || { bg: 'secondary', text: 'white' }
                    return (
                      <tr key={job.id}>
                        <td data-label="Title">
                          <strong>{job.title}</strong>
                          {job.category && (
                            <span className="d-block text-secondary" style={{ fontSize: '0.8rem' }}>
                              {job.category.name}
                            </span>
                          )}
                        </td>
                        <td data-label="Status">
                          <Badge bg={sv.bg} text={sv.text} className="status-pill">
                            {job.status}
                          </Badge>
                        </td>
                        <td data-label="Created">{formatDate(job.created_at)}</td>
                        <td data-label="Applications">
                          <Badge bg="light" text="dark" className="status-pill">
                            {job.applications_count ?? 0}
                          </Badge>
                        </td>
                        <td data-label="Actions">
                          <div className="d-flex gap-1 flex-wrap">
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              title="View details"
                              onClick={() => navigate(`/employer/jobs/${job.id}`)}
                            >
                              <Eye size={14} aria-hidden="true" />
                            </Button>
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              title="Edit job"
                              onClick={() => navigate(`/employer/jobs/${job.id}?edit=true`)}
                            >
                              <Pencil size={14} aria-hidden="true" />
                            </Button>
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              title="View applications"
                              onClick={() => navigate(`/employer/jobs/${job.id}/applications`)}
                            >
                              <Users size={14} aria-hidden="true" />
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              title="Delete job"
                              onClick={() => setDeleteTarget(job)}
                            >
                              <Trash2 size={14} aria-hidden="true" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </Table>
            </div>

            {meta && meta.last_page > 1 && (
              <nav aria-label="Job list pagination" className="d-flex justify-content-center gap-1 mt-3">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                {Array.from({ length: meta.last_page }, (_, i) => i + 1)
                  .filter((p) => {
                    if (meta.last_page <= 5) return true
                    if (p === 1 || p === meta.last_page) return true
                    return Math.abs(p - page) <= 1
                  })
                  .reduce((acc, p, i, arr) => {
                    if (i > 0 && p - arr[i - 1] > 1) acc.push('...')
                    acc.push(p)
                    return acc
                  }, [])
                  .map((item, i) =>
                    item === '...' ? (
                      <span key={`ellipsis-${i}`} className="align-self-center px-1 text-secondary">…</span>
                    ) : (
                      <Button
                        key={item}
                        variant={item === page ? 'success' : 'outline-secondary'}
                        size="sm"
                        onClick={() => setPage(item)}
                      >
                        {item}
                      </Button>
                    ),
                  )}
                <Button
                  variant="outline-secondary"
                  size="sm"
                  disabled={page >= (meta.last_page || 1)}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </nav>
            )}
          </>
        )}
      </Card.Body>

      <ConfirmModal
        show={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete job"
        body={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleting}
      />
    </Card>
  )
}
