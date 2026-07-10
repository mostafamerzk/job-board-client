import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from 'react-bootstrap/Card'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Stack from 'react-bootstrap/Stack'
import Badge from 'react-bootstrap/Badge'
import Spinner from 'react-bootstrap/Spinner'
import { Link2, Search } from 'lucide-react'
import { PanelTitle } from './PanelTitle.jsx'
import { getJobList } from '../api/candidateApi.js'

export function JobSearchPanel({ jobs: initialJobs }) {
  const navigate = useNavigate()
  const [keyword, setKeyword] = useState('')
  const [workType, setWorkType] = useState('')
  const [expLevel, setExpLevel] = useState('')
  const [location, setLocation] = useState('')
  const [jobs, setJobs] = useState(initialJobs || [])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setJobs(initialJobs || [])
  }, [initialJobs])

  async function handleSearch(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const params = {}
      if (keyword) params.keyword = keyword
      if (workType) params.work_type = workType
      if (expLevel) params.experience_level = expLevel
      if (location) params.location = location
      const res = await getJobList(params)
      setJobs(res.data || [])
    } catch {
    } finally {
      setLoading(false)
    }
  }

  function resetFilters() {
    setKeyword('')
    setWorkType('')
    setExpLevel('')
    setLocation('')
    setJobs(initialJobs || [])
  }

  return (
    <Card className="candidate-panel h-100">
      <Card.Body>
        <PanelTitle icon={<Search size={21} aria-hidden="true" />} title="Job search" />
        <Form onSubmit={handleSearch} className="filter-grid">
          <Form.Group controlId="jsKeyword">
            <Form.Label>Keyword</Form.Label>
            <Form.Control placeholder="e.g. Laravel" value={keyword} onChange={e => setKeyword(e.target.value)} />
          </Form.Group>
          <Form.Group controlId="jsWorkType">
            <Form.Label>Work type</Form.Label>
            <Form.Select value={workType} onChange={e => setWorkType(e.target.value)}>
              <option value="">All</option>
              <option value="remote">Remote</option>
              <option value="onsite">On-site</option>
              <option value="hybrid">Hybrid</option>
            </Form.Select>
          </Form.Group>
          <Form.Group controlId="jsExpLevel">
            <Form.Label>Experience</Form.Label>
            <Form.Select value={expLevel} onChange={e => setExpLevel(e.target.value)}>
              <option value="">All</option>
              <option value="entry">Entry</option>
              <option value="mid">Mid</option>
              <option value="senior">Senior</option>
              <option value="lead">Lead</option>
            </Form.Select>
          </Form.Group>
          <Form.Group controlId="jsLocation">
            <Form.Label>Location</Form.Label>
            <Form.Control placeholder="e.g. Cairo" value={location} onChange={e => setLocation(e.target.value)} />
          </Form.Group>
          <div className="filter-actions">
            <Button variant="brand" type="submit" disabled={loading}>
              {loading ? <Spinner animation="border" size="sm" /> : <Search size={16} />} Search
            </Button>
            <Button variant="outline-secondary" type="button" onClick={resetFilters}>Reset</Button>
          </div>
        </Form>
        <div className="job-match-list">
          {jobs.length === 0 && !loading && <p className="text-muted text-center my-3">No jobs found</p>}
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
              <Button variant="outline-dark" type="button" onClick={() => navigate(`/jobs/${job.id}`)}>
                View job <Link2 size={17} aria-hidden="true" />
              </Button>
            </article>
          ))}
        </div>
      </Card.Body>
    </Card>
  )
}
