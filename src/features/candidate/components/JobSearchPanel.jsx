import Card from 'react-bootstrap/Card'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Stack from 'react-bootstrap/Stack'
import Badge from 'react-bootstrap/Badge'
import { Link2, Search } from 'lucide-react'
import { PanelTitle } from './PanelTitle.jsx'

export function JobSearchPanel({ filters, jobs }) {
  return (
    <Card className="candidate-panel h-100">
      <Card.Body>
        <PanelTitle icon={<Search size={21} aria-hidden="true" />} title="Job search" />
        <div className="filter-grid">
          {filters.map((filter) => (
            <Form.Group controlId={`candidateFilter${filter.label}`} key={filter.label}>
              <Form.Label>{filter.label}</Form.Label>
              <Form.Control readOnly defaultValue={filter.value} />
            </Form.Group>
          ))}
        </div>
        <div className="job-match-list">
          {jobs.map((job) => (
            <article className="job-match" key={job.id}>
              <div>
                <h3>{job.title}</h3>
                <p>{job.company} · {job.location} · {job.salary}</p>
                <Stack direction="horizontal" gap={2} className="flex-wrap">
                  {job.tags.map((tag) => (
                    <Badge bg="light" text="dark" key={tag}>{tag}</Badge>
                  ))}
                </Stack>
              </div>
              <Button variant="outline-dark" type="button">
                View job <Link2 size={17} aria-hidden="true" />
              </Button>
            </article>
          ))}
        </div>
      </Card.Body>
    </Card>
  )
}
