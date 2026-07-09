import { useState } from 'react'
import Container from 'react-bootstrap/Container'
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { JobForm } from '../components/JobForm.jsx'
import { ToastNotification } from '../components/ToastNotification.jsx'
import { createJob, getJob, updateJob } from '../api/employerApi.js'
import { useEffect } from 'react'
import Spinner from 'react-bootstrap/Spinner'

export function JobFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id
  const [initialData, setInitialData] = useState(null)
  const [loading, setLoading] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setLoading(true)
    getJob(id)
      .then((res) => {
        if (!cancelled) setInitialData(res?.data || null)
      })
      .catch(() => {
        setToast({ message: 'Failed to load job', variant: 'error' })
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [id])

  async function handleSubmit(payload) {
    setSubmitting(true)
    try {
      if (isEdit) {
        await updateJob(id, payload)
        setToast({ message: 'Job updated successfully', variant: 'success' })
        setTimeout(() => navigate(`/employer/jobs/${id}`), 800)
      } else {
        const res = await createJob(payload)
        setToast({ message: 'Job created successfully', variant: 'success' })
        const newId = res?.data?.id
        setTimeout(() => navigate(newId ? `/employer/jobs/${newId}` : '/employer'), 800)
      }
    } catch (err) {
      setSubmitting(false)
      throw err // Let JobForm handle validation errors
    }
  }

  return (
    <Container className="py-4">
      {toast && (
        <ToastNotification
          message={toast.message}
          variant={toast.variant}
          onClose={() => setToast(null)}
        />
      )}

      <Button
        variant="link"
        className="mb-3 p-0 text-decoration-none"
        onClick={() => navigate('/employer')}
        style={{ color: 'var(--text-secondary)', fontWeight: 600 }}
      >
        <ArrowLeft size={18} aria-hidden="true" /> Back to dashboard
      </Button>

      <Card className="employer-panel">
        <Card.Body>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 850, marginBottom: '1.5rem' }}>
            {isEdit ? 'Edit job' : 'Post a new job'}
          </h2>

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="success" role="status">
                <span className="visually-hidden">Loading job…</span>
              </Spinner>
            </div>
          ) : (
            <JobForm
              initialData={isEdit ? initialData : undefined}
              onSubmit={handleSubmit}
              isSubmitting={submitting}
            />
          )}
        </Card.Body>
      </Card>
    </Container>
  )
}
