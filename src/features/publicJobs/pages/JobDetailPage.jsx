import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card'
import Badge from 'react-bootstrap/Badge'
import Button from 'react-bootstrap/Button'
import Alert from 'react-bootstrap/Alert'
import Spinner from 'react-bootstrap/Spinner'
import {
  ArrowLeft,
  MapPin,
  Building2,
  Banknote,
  Clock,
  BriefcaseBusiness,
  CalendarDays,
  Tags,
  GraduationCap,
  Wrench,
  Gift,
  ListChecks,
  FileText,
} from 'lucide-react'
import { apiClient } from '../../../lib/apiClient.js'
import { useAuth } from '../../../hooks/useAuth.js'

function formatSalary(min, max, currency) {
  const fmt = (n) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 0,
    }).format(n)
  return `${fmt(min)} - ${fmt(max)}`
}

function relativeDate(dateStr) {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now - date
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 30) return `${diffDays} days ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}

const workTypeLabels = {
  remote: 'Remote',
  onsite: 'On-site',
  hybrid: 'Hybrid',
}

const expLevelLabels = {
  entry: 'Entry',
  mid: 'Mid',
  senior: 'Senior',
  lead: 'Lead',
}

export function JobDetailPage() {
  const { id } = useParams()
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const [job, setJob] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchJob() {
      setIsLoading(true)
      setError(null)
      setNotFound(false)
      try {
        const res = await apiClient.get(`/jobs/${id}`)
        setJob(res.data)
      } catch (err) {
        if (err.status === 404) {
          setNotFound(true)
        } else {
          setError('Unable to load job details. Please try again.')
        }
      } finally {
        setIsLoading(false)
      }
    }
    fetchJob()
  }, [id])

  if (isLoading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    )
  }

  if (notFound) {
    return (
      <Container className="py-5 text-center">
        <h3>This job listing is no longer available</h3>
        <p className="text-muted">It may have been filled or removed.</p>
        <Link to="/jobs">Back to jobs</Link>
      </Container>
    )
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <p className="mb-2">{error}</p>
          <Button variant="outline-danger" size="sm" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </Alert>
      </Container>
    )
  }

  if (!job) return null

  function handleApply() {
    if (isAuthenticated) {
      navigate(`/candidate/apply?job=${job.id}`)
    } else {
      navigate('/register')
    }
  }

  const sections = [
    { key: 'description', label: 'Description', icon: FileText },
    { key: 'responsibilities', label: 'Responsibilities', icon: ListChecks },
    { key: 'requirements', label: 'Requirements', icon: Wrench },
    { key: 'benefits', label: 'Benefits', icon: Gift },
  ].filter((s) => job[s.key])

  return (
    <Container className="py-4">
      <Link to="/jobs" className="d-inline-flex align-items-center gap-1 mb-3 text-decoration-none fw-semibold" style={{ color: 'var(--text-secondary)' }}>
        <ArrowLeft size={16} /> Back to jobs
      </Link>

      <Row className="g-4">
        <Col lg={8}>
          <Card className="candidate-panel">
            <Card.Body>
              <div className="panel-header">
                <BriefcaseBusiness size={21} aria-hidden="true" />
                <h3>{job.title}</h3>
              </div>

              <p className="text-muted mb-3 d-flex align-items-center gap-2 flex-wrap">
                <span className="d-inline-flex align-items-center gap-1"><Building2 size={16} /> {job.employer?.company_name}</span>
                <span className="text-tertiary">·</span>
                <span className="d-inline-flex align-items-center gap-1"><Clock size={14} /> {relativeDate(job.created_at)}</span>
              </p>

              <div className="d-flex flex-wrap gap-2 mb-3">
                <Badge bg="light" text="dark" className="text-capitalize job-tag">
                  {workTypeLabels[job.work_type] || job.work_type}
                </Badge>
                <Badge bg="light" text="dark" className="text-capitalize job-tag">
                  {expLevelLabels[job.experience_level] || job.experience_level}
                </Badge>
                <Badge bg="light" text="dark" className="job-tag">
                  {job.location}
                </Badge>
                <Badge bg="light" text="dark" className="job-tag">
                  {formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
                </Badge>
              </div>

              {sections.map((s) => (
                <div className="job-detail-section" key={s.key}>
                  <h4><s.icon size={18} className="me-1" style={{ color: 'var(--accent-primary)' }} /> {s.label}</h4>
                  <p>{job[s.key]}</p>
                </div>
              ))}

              {job.technologies?.length > 0 && (
                <div className="job-detail-section">
                  <h4><Tags size={18} className="me-1" style={{ color: 'var(--accent-primary)' }} /> Technologies</h4>
                  <div className="d-flex flex-wrap gap-1">
                    {job.technologies.map((tech) => (
                      <Badge key={tech.id} bg="light" text="dark" className="job-tag">
                        {tech.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <div className="job-detail-meta d-flex flex-column gap-3">
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

            <div className="meta-item">
              <BriefcaseBusiness size={18} />
              <div>
                <span className="meta-label">Work type</span>
                <span className="meta-value text-capitalize">{workTypeLabels[job.work_type] || job.work_type}</span>
              </div>
            </div>

            <div className="meta-item">
              <GraduationCap size={18} />
              <div>
                <span className="meta-label">Experience</span>
                <span className="meta-value text-capitalize">{expLevelLabels[job.experience_level] || job.experience_level}</span>
              </div>
            </div>

            <div className="meta-item">
              <Clock size={18} />
              <div>
                <span className="meta-label">Posted</span>
                <span className="meta-value">{relativeDate(job.created_at)}</span>
              </div>
            </div>

            {job.application_deadline && (
              <div className="meta-item">
                <CalendarDays size={18} />
                <div>
                  <span className="meta-label">Deadline</span>
                  <span className="meta-value">{job.application_deadline}</span>
                </div>
              </div>
            )}

            <hr className="my-1" style={{ borderColor: 'var(--border-default)' }} />

            <div className="d-flex flex-wrap gap-1">
              {job.technologies?.map((tech) => (
                <Badge key={tech.id} bg="light" text="dark" className="job-tag">
                  {tech.name}
                </Badge>
              ))}
            </div>

            <hr className="my-1" style={{ borderColor: 'var(--border-default)' }} />

            {(!isAuthenticated || user?.role === 'candidate') && (
              <Button className="btn-brand w-100" onClick={handleApply}>
                Apply now <BriefcaseBusiness size={18} />
              </Button>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  )
}
