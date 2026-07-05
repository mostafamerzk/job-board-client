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

  return (
    <Container className="py-4">
      <Link to="/jobs" className="mb-3 d-inline-block">&larr; Back to jobs</Link>

      <Row>
        <Col lg={8}>
          <Card className="mb-4">
            <Card.Body>
              <h2 className="mb-1">{job.title}</h2>
              <p className="text-muted mb-3">{job.employer?.company_name}</p>

              <div className="d-flex flex-wrap gap-2 mb-3">
                <Badge bg="light" text="dark" className="text-capitalize">{job.work_type}</Badge>
                <Badge bg="light" text="dark" className="text-capitalize">{job.experience_level}</Badge>
                <Badge bg="light" text="dark">{job.location}</Badge>
              </div>

              <h5>Description</h5>
              <p className="mb-4">{job.description}</p>

              {job.responsibilities && (
                <>
                  <h5>Responsibilities</h5>
                  <p className="mb-4">{job.responsibilities}</p>
                </>
              )}

              {job.requirements && (
                <>
                  <h5>Requirements</h5>
                  <p className="mb-4">{job.requirements}</p>
                </>
              )}

              {job.benefits && (
                <>
                  <h5>Benefits</h5>
                  <p className="mb-4">{job.benefits}</p>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="mb-4">
            <Card.Body>
              <h5>Salary</h5>
              <p className="mb-3">{formatSalary(job.salary_min, job.salary_max, job.salary_currency)}</p>

              <h5>Company</h5>
              {job.employer?.logo_url && (
                <img
                  src={job.employer.logo_url}
                  alt={job.employer.company_name}
                  className="img-fluid mb-2"
                  style={{ maxHeight: 60 }}
                />
              )}
              <p className="mb-1"><strong>{job.employer?.company_name}</strong></p>
              {job.employer?.company_description && (
                <p className="text-muted small">{job.employer.company_description}</p>
              )}
              {job.employer?.website && (
                <p className="mb-3">
                  <a href={job.employer.website} target="_blank" rel="noopener noreferrer">
                    Website
                  </a>
                </p>
              )}

              {job.application_deadline && (
                <>
                  <h5>Application Deadline</h5>
                  <p className="mb-3">{job.application_deadline}</p>
                </>
              )}

              {(!isAuthenticated || user?.role === 'candidate') && (
                <Button
                  variant="primary"
                  className="w-100"
                  onClick={handleApply}
                >
                  Apply now
                </Button>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}
