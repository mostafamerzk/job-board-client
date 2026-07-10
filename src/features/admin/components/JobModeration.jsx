import { useState, useEffect, useCallback } from 'react'
import Table from 'react-bootstrap/Table'
import Badge from 'react-bootstrap/Badge'
import Button from 'react-bootstrap/Button'
import Alert from 'react-bootstrap/Alert'
import Spinner from 'react-bootstrap/Spinner'
import Nav from 'react-bootstrap/Nav'
import { Pagination } from '../../publicJobs/components/Pagination.jsx'
import { ConfirmDialog } from './ConfirmDialog.jsx'
import { JobDetailModal } from './JobDetailModal.jsx'
import {
  fetchAdminJobs,
  approveJob,
  rejectJob,
} from '../api/adminApi.js'

const STATUS_TABS = [
  { key: '', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
]

const STATUS_BADGE = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
}

export function JobModeration() {
  const [jobs, setJobs] = useState([])
  const [meta, setMeta] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statusFilter, setStatusFilter] = useState('pending')
  const [page, setPage] = useState(1)
  const [successMessage, setSuccessMessage] = useState(null)

  const [detailJobId, setDetailJobId] = useState(null)

  const [confirmDialog, setConfirmDialog] = useState({
    show: false,
    type: null,
    job: null,
    reason: '',
    reasonError: '',
    isSubmitting: false,
  })

  const loadJobs = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const params = { page }
      if (statusFilter) params.status = statusFilter
      const res = await fetchAdminJobs(params)
      setJobs(res.data || [])
      setMeta(res.meta || null)
    } catch {
      setError('Unable to load jobs. Please try again.')
      setJobs([])
    } finally {
      setIsLoading(false)
    }
  }, [statusFilter, page])

  useEffect(() => {
    loadJobs()
  }, [loadJobs])

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  function handleStatusFilter(tabKey) {
    setStatusFilter(tabKey)
    setPage(1)
  }

  function openApproveDialog(job) {
    setConfirmDialog({
      show: true,
      type: 'approve',
      job,
      reason: '',
      reasonError: '',
      isSubmitting: false,
    })
  }

  function openRejectDialog(job) {
    setConfirmDialog({
      show: true,
      type: 'reject',
      job,
      reason: '',
      reasonError: '',
      isSubmitting: false,
    })
  }

  function closeDialog() {
    setConfirmDialog((prev) => ({ ...prev, show: false }))
  }

  async function handleConfirm() {
    const { type, job, reason } = confirmDialog

    if (type === 'reject') {
      if (!reason.trim()) {
        setConfirmDialog((prev) => ({
          ...prev,
          reasonError: 'Rejection reason is required.',
        }))
        return
      }
    }

    setConfirmDialog((prev) => ({ ...prev, isSubmitting: true, reasonError: '' }))

    try {
      if (type === 'approve') {
        await approveJob(job.id)
      } else {
        await rejectJob(job.id, reason.trim())
      }
      setConfirmDialog((prev) => ({ ...prev, show: false }))
      setSuccessMessage(
        type === 'approve'
          ? 'Job approved successfully.'
          : 'Job rejected successfully.',
      )
      loadJobs()
    } catch (err) {
      if (err.status === 422) {
        if (type === 'reject' && err.body?.errors?.rejection_reason) {
          setConfirmDialog((prev) => ({
            ...prev,
            isSubmitting: false,
            reasonError: err.body.errors.rejection_reason[0],
          }))
        } else {
          setConfirmDialog((prev) => ({ ...prev, show: false }))
          setError('This job has already been reviewed.')
        }
      } else {
        setConfirmDialog((prev) => ({ ...prev, show: false }))
        setError('An error occurred. Please try again.')
      }
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="danger" className="mt-3">
        <Alert.Heading as="h5">Error</Alert.Heading>
        <p className="mb-2">{error}</p>
        <Button variant="outline-danger" size="sm" onClick={loadJobs}>
          Retry
        </Button>
      </Alert>
    )
  }

  const emptyMessage =
    statusFilter === 'pending'
      ? 'All jobs have been moderated.'
      : 'No jobs found.'

  return (
    <div>
      {successMessage && (
        <Alert variant="success" className="mt-3">
          {successMessage}
        </Alert>
      )}

      <Nav
        variant="tabs"
        activeKey={statusFilter}
        onSelect={handleStatusFilter}
        className="mb-3"
      >
        {STATUS_TABS.map((tab) => (
          <Nav.Item key={tab.key}>
            <Nav.Link eventKey={tab.key}>{tab.label}</Nav.Link>
          </Nav.Item>
        ))}
      </Nav>

      {jobs.length === 0 ? (
        <p className="text-muted text-center py-4">{emptyMessage}</p>
      ) : (
        <>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Title</th>
                <th>Employer</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id}>
                  <td>{job.title}</td>
                  <td>{job.employer?.company_name || '—'}</td>
                  <td>
                    <Badge bg={STATUS_BADGE[job.status] || 'secondary'}>
                      {job.status}
                    </Badge>
                  </td>
                  <td>
                    {job.created_at
                      ? new Date(job.created_at).toLocaleDateString()
                      : '—'}
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <Button
                        variant="outline-info"
                        size="sm"
                        onClick={() => setDetailJobId(job.id)}
                      >
                        View
                      </Button>
                      <Button
                        variant="outline-success"
                        size="sm"
                        disabled={job.status !== 'pending'}
                        onClick={() => openApproveDialog(job)}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        disabled={job.status !== 'pending'}
                        onClick={() => openRejectDialog(job)}
                      >
                        Reject
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {meta && meta.last_page > 1 && (
            <Pagination
              currentPage={meta.current_page}
              lastPage={meta.last_page}
              onPageChange={setPage}
            />
          )}
        </>
      )}

      <ConfirmDialog
        show={confirmDialog.show}
        onHide={closeDialog}
        onConfirm={handleConfirm}
        title={
          confirmDialog.type === 'approve'
            ? 'Approve Job'
            : 'Reject Job'
        }
        body={
          confirmDialog.type === 'approve'
            ? 'Approve this job listing? It will be visible to the public.'
            : 'Are you sure you want to reject this job?'
        }
        confirmLabel={
          confirmDialog.type === 'approve' ? 'Approve' : 'Reject'
        }
        confirmVariant={
          confirmDialog.type === 'approve' ? 'success' : 'danger'
        }
        isLoading={confirmDialog.isSubmitting}
        isDestructive={confirmDialog.type === 'reject'}
      >
        {confirmDialog.type === 'reject' && (
          <div className="mt-3">
            <label htmlFor="rejection-reason" className="form-label">
              Reason for rejection
            </label>
            <textarea
              id="rejection-reason"
              className={`form-control ${confirmDialog.reasonError ? 'is-invalid' : ''}`}
              rows={3}
              value={confirmDialog.reason}
              onChange={(e) =>
                setConfirmDialog((prev) => ({
                  ...prev,
                  reason: e.target.value,
                  reasonError: '',
                }))
              }
              placeholder="Enter the reason for rejection..."
            />
            {confirmDialog.reasonError && (
              <div className="invalid-feedback d-block">
                {confirmDialog.reasonError}
              </div>
            )}
          </div>
        )}
      </ConfirmDialog>

      <JobDetailModal
        show={detailJobId !== null}
        jobId={detailJobId}
        onHide={() => setDetailJobId(null)}
      />
    </div>
  )
}
