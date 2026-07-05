import { Link } from 'react-router-dom'
import Card from 'react-bootstrap/Card'
import Badge from 'react-bootstrap/Badge'

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

export function JobCard({ job }) {
  return (
    <Card
      as={Link}
      to={`/jobs/${job.id}`}
      className="text-decoration-none h-100 job-card"
      role="link"
    >
      <Card.Body className="d-flex flex-column">
        <Card.Title className="h6 mb-1">{job.title}</Card.Title>
        <p className="text-muted small mb-2">{job.employer.company_name}</p>

        <div className="d-flex flex-wrap gap-2 mb-2 small">
          <span className="text-muted">{job.location}</span>
          <span className="text-muted">{formatSalary(job.salary_min, job.salary_max, job.salary_currency)}</span>
          <Badge bg="light" text="dark" className="text-capitalize">
            {job.work_type}
          </Badge>
        </div>

        <div className="d-flex flex-wrap gap-1 mt-auto">
          {job.technologies.map((tech) => (
            <Badge key={tech.id} bg="secondary" pill>
              {tech.name}
            </Badge>
          ))}
        </div>

        <small className="text-muted mt-2">{relativeDate(job.created_at)}</small>
      </Card.Body>
    </Card>
  )
}
