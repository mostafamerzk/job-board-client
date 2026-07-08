import { useState, useEffect, useCallback, useRef } from 'react'
import Table from 'react-bootstrap/Table'
import Badge from 'react-bootstrap/Badge'
import Button from 'react-bootstrap/Button'
import Alert from 'react-bootstrap/Alert'
import Spinner from 'react-bootstrap/Spinner'
import Form from 'react-bootstrap/Form'
import { Pagination } from '../../publicJobs/components/Pagination.jsx'
import { ConfirmDialog } from './ConfirmDialog.jsx'
import { UserDetailModal } from './UserDetailModal.jsx'
import { fetchAdminUsers, toggleUserActive } from '../api/adminApi.js'
import { useAuth } from '../../../hooks/useAuth.js'

const ROLE_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'candidate', label: 'Candidate' },
  { value: 'employer', label: 'Employer' },
  { value: 'admin', label: 'Admin' },
]

const ROLE_BADGE = {
  candidate: 'primary',
  employer: 'warning',
  admin: 'secondary',
}

export function UserManagement() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [meta, setMeta] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [roleFilter, setRoleFilter] = useState('')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [successMessage, setSuccessMessage] = useState(null)
  const [detailUserId, setDetailUserId] = useState(null)
  const debounceRef = useRef(null)

  const [confirmDialog, setConfirmDialog] = useState({
    show: false,
    user: null,
    isSubmitting: false,
  })

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [search])

  const loadUsers = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const params = { page }
      if (roleFilter) params.role = roleFilter
      if (debouncedSearch) params.search = debouncedSearch
      const res = await fetchAdminUsers(params)
      setUsers(Array.isArray(res.data) ? res.data : [])
      setMeta(res.meta || null)
    } catch {
      setError('Unable to load users. Please try again.')
      setUsers([])
    } finally {
      setIsLoading(false)
    }
  }, [roleFilter, debouncedSearch, page])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  function handleRoleFilter(e) {
    setRoleFilter(e.target.value)
    setPage(1)
  }

  function openConfirmDialog(user) {
    setConfirmDialog({ show: true, user, isSubmitting: false })
  }

  function closeDialog() {
    setConfirmDialog((prev) => ({ ...prev, show: false }))
  }

  async function handleConfirm() {
    const { user } = confirmDialog
    setConfirmDialog((prev) => ({ ...prev, isSubmitting: true }))

    try {
      await toggleUserActive(user.id)
      setConfirmDialog((prev) => ({ ...prev, show: false }))
      setSuccessMessage(
        user.is_active
          ? `${user.name} has been suspended.`
          : `${user.name} has been reactivated.`,
      )
      loadUsers()
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
        <Button variant="outline-danger" size="sm" onClick={loadUsers}>
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

      <div className="d-flex gap-3 mb-3">
        <Form.Group style={{ minWidth: 180 }}>
          <Form.Select value={roleFilter} onChange={handleRoleFilter}>
            {ROLE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
        <Form.Group style={{ flex: 1, maxWidth: 320 }}>
          <Form.Control
            type="search"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Form.Group>
      </div>

      {users.length === 0 ? (
        <p className="text-muted text-center py-4">
          No users match your search. Try different filters.
        </p>
      ) : (
        <>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const isSelf = currentUser && currentUser.id === user.id
                return (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <Badge bg={ROLE_BADGE[user.role] || 'secondary'}>
                        {user.role}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg={user.is_active ? 'success' : 'danger'}>
                        {user.is_active ? 'Active' : 'Suspended'}
                      </Badge>
                    </td>
                    <td>
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString()
                        : '—'}
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button
                          variant="outline-info"
                          size="sm"
                          onClick={() => setDetailUserId(user.id)}
                        >
                          View
                        </Button>
                        <Button
                          variant={
                            user.is_active ? 'outline-warning' : 'outline-success'
                          }
                          size="sm"
                          disabled={isSelf}
                          title={
                            isSelf
                              ? 'Cannot modify your own account'
                              : user.is_active
                                ? 'Suspend user'
                                : 'Reactivate user'
                          }
                          onClick={() => openConfirmDialog(user)}
                        >
                          {user.is_active ? 'Suspend' : 'Reactivate'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
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
          confirmDialog.user?.is_active ? 'Suspend User' : 'Reactivate User'
        }
        body={
          confirmDialog.user?.is_active
            ? `This will prevent ${confirmDialog.user?.name} from logging in. Are you sure?`
            : `Reactivate ${confirmDialog.user?.name}?`
        }
        confirmLabel={
          confirmDialog.user?.is_active ? 'Suspend' : 'Reactivate'
        }
        confirmVariant={confirmDialog.user?.is_active ? 'warning' : 'success'}
        isLoading={confirmDialog.isSubmitting}
        isDestructive={confirmDialog.user?.is_active ?? true}
      />

      <UserDetailModal
        show={detailUserId !== null}
        userId={detailUserId}
        onHide={() => setDetailUserId(null)}
      />
    </div>
  )
}
