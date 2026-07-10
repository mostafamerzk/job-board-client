import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Alert from 'react-bootstrap/Alert'
import Spinner from 'react-bootstrap/Spinner'
import { ArrowLeft, BriefcaseBusiness, Send, Building2, MapPin, Banknote } from 'lucide-react'
import { getResumes, submitApplication } from '../api/candidateApi.js'
import { apiClient } from '../../../lib/apiClient.js'

function formatSalary(min, max, currency) {
  const fmt = (n) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 0,
    }).format(n)
  return `${fmt(min)} - ${fmt(max)}`
}

export function ApplyPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const jobId = searchParams.get('job')

  const [job, setJob] = useState(null)
  const [resumes, setResumes] = useState([])
  const [resumeId, setResumeId] = useState('')
  const [coverLetter, setCoverLetter] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState(null)

  useEffect(() => {
    async function load() {
      if (!jobId) {
        setLoading(false)
        return
      }
      try {
        const [jobRes, resumesRes] = await Promise.all([
          apiClient.get(`/jobs/${jobId}`),
          getResumes(),
        ])
        setJob(jobRes.data)
        const list = resumesRes.data || []
        setResumes(list)
        const primary = list.find((r) => r.is_primary)
        if (primary) setResumeId(String(primary.id))
      } catch {
        setMsg({ variant: 'danger', text: 'Failed to load job details.' })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [jobId])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!jobId) return
    setSubmitting(true)
    setMsg(null)
    try {
      await submitApplication({
        job_id: Number(jobId),
        resume_id: resumeId ? Number(resumeId) : undefined,
        cover_letter: coverLetter || undefined,
      })
      navigate('/candidate', { replace: true })
    } catch (err) {
      const body = err.body
      const detail = body?.message || (body?.errors ? Object.values(body.errors).flat().join(', ') : 'Submission failed')
      setMsg({ variant: 'danger', text: detail })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    )
  }

  if (!jobId || !job) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="warning">No job selected.</Alert>
        <Link to="/jobs" className="d-inline-flex align-items-center gap-1 text-decoration-none fw-semibold" style={{ color: 'var(--text-secondary)' }}>
          <ArrowLeft size={16} /> Browse jobs
        </Link>
      </Container>
    )
  }

  return (
    <Container className="py-4">
      <Link to={`/jobs/${job.id}`} className="d-inline-flex align-items-center gap-1 mb-3 text-decoration-none fw-semibold" style={{ color: 'var(--text-secondary)' }}>
        <ArrowLeft size={16} /> Back to job
      </Link>

      <Row className="g-4">
        <Col lg={7}>
          <Card className="candidate-panel">
            <Card.Body>
              <div className="panel-header">
                <Send size={21} aria-hidden="true" />
                <h3>Apply for this job</h3>
              </div>

              {msg && <Alert variant={msg.variant} dismissible onClose={() => setMsg(null)}>{msg.text}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="apResume" className="mb-3">
                  <Form.Label>Resume</Form.Label>
                  <Form.Select value={resumeId} onChange={(e) => setResumeId(e.target.value)}>
                    <option value="">No resume (use contact info)</option>
                    {resumes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.original_name}{r.is_primary ? ' (Primary)' : ''}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group controlId="apCover" className="mb-3">
                  <Form.Label>Cover letter <small className="text-muted">(optional, max 5000 chars)</small></Form.Label>
                  <Form.Control as="textarea" rows={6} maxLength={5000} value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} placeholder="Tell the employer why you&apos;re a great fit..." />
                </Form.Group>

                <Button className="btn-brand" type="submit" disabled={submitting}>
                  {submitting ? (
                    <><Spinner as="span" animation="border" size="sm" className="me-2" /> Submitting...</>
                  ) : (
                    <>Submit application <BriefcaseBusiness size={18} /></>
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={5}>
          <div className="job-detail-meta d-flex flex-column gap-3">
            <div className="panel-header" style={{ marginBottom: 0 }}>
              <BriefcaseBusiness size={21} aria-hidden="true" />
              <h3>{job.title}</h3>
            </div>

            <div className="meta-item">
              <Building2 size={18} />
              <div>
                <span className="meta-label">Company</span>
                <span className="meta-value">{job.employer?.company_name}</span>
              </div>
            </div>

            <div className="meta-item">
              <MapPin size={18} />
              <div>
                <span className="meta-label">Location</span>
                <span className="meta-value">{job.location}</span>
              </div>
            </div>

            <div className="meta-item">
              <Banknote size={18} />
              <div>
                <span className="meta-label">Salary</span>
                <span className="meta-value">{formatSalary(job.salary_min, job.salary_max, job.salary_currency)}</span>
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  )
}
