import { useState, useEffect } from 'react'
import Modal from 'react-bootstrap/Modal'
import Badge from 'react-bootstrap/Badge'
import Spinner from 'react-bootstrap/Spinner'
import Alert from 'react-bootstrap/Alert'
import { fetchAdminUser } from '../api/adminApi.js'

const ROLE_BADGE = {
  candidate: 'primary',
  employer: 'warning',
  admin: 'secondary',
}

export function UserDetailModal({ show, userId, onHide }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!show || !userId) return
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const res = await fetchAdminUser(userId)
        if (!cancelled) setUser(res.data || res)
      } catch {
        if (!cancelled) setError('Unable to load user details.')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [show, userId])

  function handleExited() {
    setUser(null)
    setError(null)
  }

  return (
    <Modal show={show} onHide={onHide} onExited={handleExited} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>User Details</Modal.Title>
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

        {!isLoading && !error && user && (
          <dl className="row mb-0">
            <dt className="col-sm-4">Name</dt>
            <dd className="col-sm-8">{user.name}</dd>

            <dt className="col-sm-4">Email</dt>
            <dd className="col-sm-8">{user.email}</dd>

            <dt className="col-sm-4">Role</dt>
            <dd className="col-sm-8">
              <Badge bg={ROLE_BADGE[user.role] || 'secondary'}>
                {user.role}
              </Badge>
            </dd>

            <dt className="col-sm-4">Status</dt>
            <dd className="col-sm-8">
              <Badge bg={user.is_active ? 'success' : 'danger'}>
                {user.is_active ? 'Active' : 'Suspended'}
              </Badge>
            </dd>

            {user.employer_profile?.company_name && (
              <>
                <dt className="col-sm-4">Company</dt>
                <dd className="col-sm-8">
                  {user.employer_profile.company_name}
                </dd>
              </>
            )}

            {user.candidate_profile && (
              <>
                <dt className="col-sm-4">Headline</dt>
                <dd className="col-sm-8">
                  {user.candidate_profile.headline || '—'}
                </dd>
                <dt className="col-sm-4">Location</dt>
                <dd className="col-sm-8">
                  {user.candidate_profile.location || '—'}
                </dd>
              </>
            )}

            <dt className="col-sm-4">Jobs Posted</dt>
            <dd className="col-sm-8">{user.jobs_count ?? 0}</dd>

            <dt className="col-sm-4">Applications</dt>
            <dd className="col-sm-8">{user.applications_count ?? 0}</dd>

            <dt className="col-sm-4">Created</dt>
            <dd className="col-sm-8">
              {user.created_at
                ? new Date(user.created_at).toLocaleString()
                : '—'}
            </dd>
          </dl>
        )}
      </Modal.Body>
    </Modal>
  )
}
