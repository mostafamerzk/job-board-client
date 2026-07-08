import { useState, useEffect } from 'react'
import Modal from 'react-bootstrap/Modal'
import Badge from 'react-bootstrap/Badge'
import Spinner from 'react-bootstrap/Spinner'
import Alert from 'react-bootstrap/Alert'
import { fetchAdminJob } from '../api/adminApi.js'

const STATUS_BADGE = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
}

export function JobDetailModal({ show, jobId, onHide }) {
  const [job, setJob] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!show || !jobId) return
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const res = await fetchAdminJob(jobId)
        if (!cancelled) setJob(res.data || res)
      } catch {
        if (!cancelled) setError('Unable to load job details.')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [show, jobId])

  function handleExited() {
    setJob(null)
    setError(null)
  }

  return (
    <Modal show={show} onHide={onHide} onExited={handleExited} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Job Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {isLoading && (
          <div className="text-center py-4">
            <Spinner animation="border" variant="primary" />
          </div>
        )}

        {error && (
          <Alert variant="danger">{error}</Alert>
        )}

        {!isLoading && !error && job && (
          <dl className="row mb-0">
            <dt className="col-sm-4">Title</dt>
            <dd className="col-sm-8">{job.title}</dd>

            <dt className="col-sm-4">Status</dt>
            <dd className="col-sm-8">
              <Badge bg={STATUS_BADGE[job.status] || 'secondary'}>
                {job.status}
              </Badge>
            </dd>

            <dt className="col-sm-4">Employer</dt>
            <dd className="col-sm-8">
              {job.employer?.company_name || '—'}
            </dd>

            <dt className="col-sm-4">Category</dt>
            <dd className="col-sm-8">{job.category?.name || '—'}</dd>

            <dt className="col-sm-4">Technologies</dt>
            <dd className="col-sm-8">
              {job.technologies?.length
                ? job.technologies.map((t) => t.name).join(', ')
                : '—'}
            </dd>

            <dt className="col-sm-4">Applications</dt>
            <dd className="col-sm-8">{job.applications_count ?? 0}</dd>

            {job.rejection_reason && (
              <>
                <dt className="col-sm-4">Rejection Reason</dt>
                <dd className="col-sm-8 text-danger">
                  {job.rejection_reason}
                </dd>
              </>
            )}

            <dt className="col-sm-4">Created</dt>
            <dd className="col-sm-8">
              {job.created_at
                ? new Date(job.created_at).toLocaleString()
                : '—'}
            </dd>

            <dt className="col-sm-4">Updated</dt>
            <dd className="col-sm-8">
              {job.updated_at
                ? new Date(job.updated_at).toLocaleString()
                : '—'}
            </dd>
          </dl>
        )}
      </Modal.Body>
    </Modal>
  )
}
