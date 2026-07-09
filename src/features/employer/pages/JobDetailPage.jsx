import { useState, useEffect } from 'react'
import Container from 'react-bootstrap/Container'
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import Badge from 'react-bootstrap/Badge'
import Spinner from 'react-bootstrap/Spinner'
import Alert from 'react-bootstrap/Alert'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft, Pencil, Trash2, Users, MapPin, Clock,
  Banknote, Calendar, Tag, AlertTriangle,
} from 'lucide-react'
import { getJob, deleteJob, updateJob } from '../api/employerApi.js'
import { ConfirmModal } from '../components/ConfirmModal.jsx'
import { ToastNotification } from '../components/ToastNotification.jsx'
import { JobForm } from '../components/JobForm.jsx'

const STATUS_VARIANTS = {
  pending: { bg: 'warning', text: 'dark' },
  approved: { bg: 'success', text: 'white' },
  rejected: { bg: 'danger', text: 'white' },
}

export function JobDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const isEditing = searchParams.get('edit') === 'true'

  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [toast, setToast] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getJob(id)
      .then((res) => { if (!cancelled) setJob(res?.data || null) })
      .catch((err) => { if (!cancelled) setError(err.body?.message || 'Failed to load job') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [id])

  async function handleDelete() {
    setDeleting(true)
    try {
      await deleteJob(id)
      setToast({ message: 'Job deleted', variant: 'success' })
      setTimeout(() => navigate('/employer'), 800)
    } catch (err) {
      setError(err.body?.message || 'Delete failed')
    } finally { setDeleting(false); setShowDelete(false) }
  }

  async function handleEditSubmit(payload) {
    setSubmitting(true)
    try {
      const res = await updateJob(id, payload)
      setJob(res?.data || job)
      setToast({ message: 'Job updated', variant: 'success' })
      setSearchParams({})
    } catch (err) { setSubmitting(false); throw err }
    finally { setSubmitting(false) }
  }

  const fmt = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'
  const fmtSalary = (min, max, cur) => {
    const f = (v) => Number(v).toLocaleString()
    if (min && max) return `${f(min)} – ${f(max)} ${cur || ''}`
    if (min) return `From ${f(min)} ${cur || ''}`
    if (max) return `Up to ${f(max)} ${cur || ''}`
    return '—'
  }

  if (loading) return (
    <Container className="py-4 text-center"><Spinner animation="border" variant="success" /></Container>
  )

  if (error || !job) return (
    <Container className="py-4">
      <Button variant="link" className="mb-3 p-0" onClick={() => navigate('/employer')}
        style={{ color: 'var(--text-secondary)', fontWeight: 600, textDecoration: 'none' }}>
        <ArrowLeft size={18} /> Back
      </Button>
      <Alert variant="danger">{error || 'Job not found'}</Alert>
    </Container>
  )

  const sv = STATUS_VARIANTS[job.status] || { bg: 'secondary', text: 'white' }

  return (
    <Container className="py-4">
      {toast && <ToastNotification message={toast.message} variant={toast.variant} onClose={() => setToast(null)} />}

      <Button variant="link" className="mb-3 p-0" onClick={() => navigate('/employer')}
        style={{ color: 'var(--text-secondary)', fontWeight: 600, textDecoration: 'none' }}>
        <ArrowLeft size={18} /> Back to dashboard
      </Button>

      {isEditing ? (
        <Card className="employer-panel">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 style={{ fontSize: '1.5rem', fontWeight: 850, margin: 0 }}>Edit job</h2>
              <Button variant="outline-secondary" size="sm" onClick={() => setSearchParams({})}>Cancel</Button>
            </div>
            <JobForm initialData={job} onSubmit={handleEditSubmit} isSubmitting={submitting} />
          </Card.Body>
        </Card>
      ) : (
        <>
          <Card className="employer-panel mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 850, margin: 0 }}>{job.title}</h2>
                  {job.category && <span className="text-secondary" style={{ fontSize: '0.875rem' }}>{job.category.name}</span>}
                </div>
                <Badge bg={sv.bg} text={sv.text} className="status-pill" style={{ fontSize: '0.85rem' }}>{job.status}</Badge>
              </div>

              {job.status === 'rejected' && job.rejection_reason && (
                <Alert variant="warning" className="d-flex align-items-start gap-2">
                  <AlertTriangle size={18} className="flex-shrink-0 mt-1" />
                  <div><strong>Rejection reason:</strong><p className="mb-0 mt-1">{job.rejection_reason}</p></div>
                </Alert>
              )}

              <Row className="g-3 mb-4">
                {[
                  { icon: MapPin, label: 'Location', value: job.location || '—' },
                  { icon: Clock, label: 'Work type', value: job.work_type || '—' },
                  { icon: Banknote, label: 'Salary', value: fmtSalary(job.salary_min, job.salary_max, job.salary_currency) },
                  { icon: Calendar, label: 'Deadline', value: fmt(job.application_deadline) },
                ].map(({ icon: Icon, label, value }) => (
                  <Col sm={6} md={3} key={label}>
                    <div className="meta-item"><Icon size={16} /><div><span className="meta-label">{label}</span><span className="meta-value">{value}</span></div></div>
                  </Col>
                ))}
              </Row>

              {job.technologies?.length > 0 && (
                <div className="mb-4">
                  <div className="d-flex align-items-center gap-2 mb-2"><Tag size={16} className="text-secondary" /><strong style={{ fontSize: '0.875rem' }}>Technologies</strong></div>
                  <div className="d-flex flex-wrap gap-2">{job.technologies.map((t) => <Badge key={t.id} bg="light" text="dark" className="job-tag px-2 py-1">{t.name}</Badge>)}</div>
                </div>
              )}

              {['description', 'responsibilities', 'requirements', 'benefits'].map((field) => job[field] && (
                <div className="job-detail-section" key={field}>
                  <h4>{field.charAt(0).toUpperCase() + field.slice(1)}</h4>
                  <p>{job[field]}</p>
                </div>
              ))}

              <div className="d-flex gap-2 flex-wrap mt-4 pt-3" style={{ borderTop: '1px solid var(--border-default)' }}>
                <Button variant="outline-secondary" size="sm" onClick={() => setSearchParams({ edit: 'true' })}><Pencil size={14} /> Edit</Button>
                <Button variant="outline-secondary" size="sm" onClick={() => navigate(`/employer/jobs/${id}/applications`)}><Users size={14} /> Applications ({job.applications_count ?? 0})</Button>
                <Button variant="outline-danger" size="sm" onClick={() => setShowDelete(true)}><Trash2 size={14} /> Delete</Button>
              </div>
            </Card.Body>
          </Card>
          <div className="text-secondary text-center" style={{ fontSize: '0.8rem' }}>Created {fmt(job.created_at)} · Updated {fmt(job.updated_at)}</div>
        </>
      )}

      <ConfirmModal show={showDelete} onCancel={() => setShowDelete(false)} onConfirm={handleDelete}
        title="Delete job" body={`Delete "${job.title}"? This cannot be undone.`} confirmLabel="Delete" variant="danger" isLoading={deleting} />
    </Container>
  )
}
