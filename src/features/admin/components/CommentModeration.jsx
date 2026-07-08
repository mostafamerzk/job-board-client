import { useState, useEffect, useCallback } from 'react'
import Table from 'react-bootstrap/Table'
import Badge from 'react-bootstrap/Badge'
import Button from 'react-bootstrap/Button'
import Alert from 'react-bootstrap/Alert'
import Spinner from 'react-bootstrap/Spinner'
import Nav from 'react-bootstrap/Nav'
import Form from 'react-bootstrap/Form'
import { Pagination } from '../../publicJobs/components/Pagination.jsx'
import { ConfirmDialog } from './ConfirmDialog.jsx'
import { fetchAdminComments, deleteComment } from '../api/adminApi.js'

const VISIBILITY_TABS = [
  { key: '', label: 'All' },
  { key: '1', label: 'Visible' },
  { key: '0', label: 'Hidden' },
]

export function CommentModeration() {
  const [comments, setComments] = useState([])
  const [meta, setMeta] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [visibilityFilter, setVisibilityFilter] = useState('')
  const [jobIdFilter, setJobIdFilter] = useState('')
  const [userIdFilter, setUserIdFilter] = useState('')
  const [trashedFilter, setTrashedFilter] = useState('')
  const [page, setPage] = useState(1)
  const [successMessage, setSuccessMessage] = useState(null)

  const [confirmDialog, setConfirmDialog] = useState({
    show: false,
    comment: null,
    isSubmitting: false,
  })

  const loadComments = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const params = { page }
      if (visibilityFilter !== '') {
        params.isVisible = visibilityFilter === '1'
      }
      if (jobIdFilter) params.jobId = jobIdFilter
      if (userIdFilter) params.userId = userIdFilter
      if (trashedFilter) params.trashed = trashedFilter
      const res = await fetchAdminComments(params)
      setComments(res.data || [])
      setMeta(res.meta || null)
    } catch {
      setError('Unable to load comments. Please try again.')
      setComments([])
    } finally {
      setIsLoading(false)
    }
  }, [visibilityFilter, jobIdFilter, userIdFilter, trashedFilter, page])

  useEffect(() => {
    loadComments()
  }, [loadComments])

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  function handleVisibilityFilter(tabKey) {
    setVisibilityFilter(tabKey)
    setPage(1)
  }

  function openDeleteDialog(comment) {
    setConfirmDialog({ show: true, comment, isSubmitting: false })
  }

  function closeDialog() {
    setConfirmDialog((prev) => ({ ...prev, show: false }))
  }

  function truncate(text, max = 100) {
    if (!text) return '—'
    return text.length > max ? text.slice(0, max) + '...' : text
  }

  async function handleConfirm() {
    const { comment } = confirmDialog
    setConfirmDialog((prev) => ({ ...prev, isSubmitting: true }))

    try {
      await deleteComment(comment.id)
      setComments((prev) => prev.filter((c) => c.id !== comment.id))
      setConfirmDialog({ show: false, comment: null, isSubmitting: false })
      setSuccessMessage('Comment deleted.')
    } catch {
      setConfirmDialog((prev) => ({ ...prev, show: false }))
      setError('An error occurred. Please try again.')
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
        <Button variant="outline-danger" size="sm" onClick={loadComments}>
          Retry
        </Button>
      </Alert>
    )
  }

  return (
    <div>
      {successMessage && (
        <Alert variant="success" className="mt-3">
          {successMessage}
        </Alert>
      )}

      <div className="d-flex gap-3 mb-3 flex-wrap">
        <Nav
          variant="pills"
          activeKey={visibilityFilter}
          onSelect={handleVisibilityFilter}
        >
          {VISIBILITY_TABS.map((tab) => (
            <Nav.Item key={tab.key}>
              <Nav.Link eventKey={tab.key}>{tab.label}</Nav.Link>
            </Nav.Item>
          ))}
        </Nav>

        <Form.Control
          type="number"
          placeholder="Job ID"
          value={jobIdFilter}
          onChange={(e) => { setJobIdFilter(e.target.value); setPage(1) }}
          style={{ width: 100 }}
          min="1"
        />
        <Form.Control
          type="number"
          placeholder="User ID"
          value={userIdFilter}
          onChange={(e) => { setUserIdFilter(e.target.value); setPage(1) }}
          style={{ width: 100 }}
          min="1"
        />
        <Form.Select
          value={trashedFilter}
          onChange={(e) => { setTrashedFilter(e.target.value); setPage(1) }}
          style={{ width: 150 }}
        >
          <option value="">Active comments</option>
          <option value="true">Deleted only</option>
        </Form.Select>
      </div>

      {comments.length === 0 ? (
        <p className="text-muted text-center py-4">
          No comments to moderate.
        </p>
      ) : (
        <>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Comment</th>
                <th>Author</th>
                <th>Job ID</th>
                <th>Date</th>
                <th>Visibility</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {comments.map((comment) => (
                <tr key={comment.id}>
                  <td style={{ maxWidth: 300 }}>
                    {truncate(comment.body)}
                  </td>
                  <td>{comment.user?.name || '—'}</td>
                  <td>{comment.job_id}</td>
                  <td>
                    {comment.created_at
                      ? new Date(comment.created_at).toLocaleDateString()
                      : '—'}
                  </td>
                  <td>
                    <Badge bg={comment.is_visible ? 'success' : 'secondary'}>
                      {comment.is_visible ? 'Visible' : 'Hidden'}
                    </Badge>
                  </td>
                  <td>
                    {!comment.deleted_at && (
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => openDeleteDialog(comment)}
                      >
                        Delete
                      </Button>
                    )}
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
        title="Delete comment"
        body="Delete this comment permanently? This cannot be undone."
        confirmLabel="Delete"
        confirmVariant="danger"
        isLoading={confirmDialog.isSubmitting}
        isDestructive
      />
    </div>
  )
}
