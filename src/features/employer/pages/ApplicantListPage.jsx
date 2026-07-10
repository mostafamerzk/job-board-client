import { useState, useEffect } from 'react'
import Container from 'react-bootstrap/Container'
import Button from 'react-bootstrap/Button'
import Spinner from 'react-bootstrap/Spinner'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { getJob } from '../api/employerApi.js'
import { ApplicantList } from '../components/ApplicantList.jsx'
import { ToastNotification } from '../components/ToastNotification.jsx'

export function ApplicantListPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [jobTitle, setJobTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    let cancelled = false
    getJob(id)
      .then((res) => { if (!cancelled) setJobTitle(res?.data?.title || '') })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [id])

  if (loading) {
    return (
      <Container className="py-4 text-center">
        <Spinner animation="border" variant="success" />
      </Container>
    )
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
        onClick={() => navigate(`/employer/jobs/${id}`)}
        style={{ color: 'var(--text-secondary)', fontWeight: 600 }}
      >
        <ArrowLeft size={18} aria-hidden="true" /> Back to job
      </Button>

      <ApplicantList
        jobId={id}
        jobTitle={jobTitle}
        onSuccess={(msg) => setToast({ message: msg, variant: 'success' })}
      />
    </Container>
  )
}
