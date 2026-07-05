import { useState, useEffect } from 'react'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Alert from 'react-bootstrap/Alert'
import Button from 'react-bootstrap/Button'
import { apiClient } from '../../../lib/apiClient.js'
import { JobCard } from '../components/JobCard.jsx'
import { SearchFilters } from '../components/SearchFilters.jsx'
import { Pagination } from '../components/Pagination.jsx'

export function JobListPage() {
  const [jobs, setJobs] = useState([])
  const [meta, setMeta] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    keyword: '',
    category_id: '',
    work_type: '',
    experience_level: '',
    location: '',
  })
  const [currentPage, setCurrentPage] = useState(1)

  async function fetchJobs(page = 1) {
    setIsLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.set('per_page', '20')
      if (filters.keyword) params.set('keyword', filters.keyword)
      if (filters.category_id) params.set('category_id', filters.category_id)
      if (filters.work_type) params.set('work_type', filters.work_type)
      if (filters.experience_level) params.set('experience_level', filters.experience_level)
      if (filters.location) params.set('location', filters.location)
      if (page > 1) params.set('page', String(page))

      const res = await apiClient.get(`/jobs?${params.toString()}`)
      setJobs(res.data || [])
      setMeta(res.meta || null)
      setCurrentPage(page)
    } catch (err) {
      setError('Unable to load jobs. Please try again.')
      setJobs([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs(1)
  }, [filters])

  function handlePageChange(page) {
    fetchJobs(page)
  }

  function handleFilterChange(newFilters) {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }

  return (
    <Container className="py-4">
      <h1 className="mb-4">Find your next role</h1>

      <SearchFilters
        onFilterChange={handleFilterChange}
        initialFilters={filters}
      />

      {error && (
        <Alert variant="danger" className="mt-3">
          <p className="mb-2">{error}</p>
          <Button variant="outline-danger" size="sm" onClick={() => fetchJobs(currentPage)}>
            Retry
          </Button>
        </Alert>
      )}

      {isLoading ? (
        <Row className="mt-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Col md={6} lg={4} key={i} className="mb-3">
              <div className="card placeholder-glow" aria-hidden="true">
                <div className="card-body">
                  <span className="placeholder col-8 mb-2" />
                  <span className="placeholder col-4 mb-2" />
                  <span className="placeholder col-6" />
                </div>
              </div>
            </Col>
          ))}
        </Row>
      ) : jobs.length === 0 ? (
        <div className="text-center py-5 mt-3">
          <h4 className="text-muted">No jobs found</h4>
          <p className="text-muted">Try adjusting your filters or keywords</p>
        </div>
      ) : (
        <>
          <Row className="mt-3">
            {jobs.map((job) => (
              <Col md={6} lg={4} key={job.id} className="mb-3">
                <JobCard job={job} />
              </Col>
            ))}
          </Row>

          {meta && meta.last_page > 1 && (
            <Pagination
              currentPage={meta.current_page}
              lastPage={meta.last_page}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </Container>
  )
}
