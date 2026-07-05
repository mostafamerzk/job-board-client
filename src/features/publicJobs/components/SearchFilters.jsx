import { useState, useRef, useEffect } from 'react'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import InputGroup from 'react-bootstrap/InputGroup'
import { Search } from 'lucide-react'

export function SearchFilters({ onFilterChange, initialFilters = {} }) {
  const [keyword, setKeyword] = useState(initialFilters.keyword || '')
  const [workType, setWorkType] = useState(initialFilters.work_type || '')
  const [experienceLevel, setExperienceLevel] = useState(initialFilters.experience_level || '')
  const [location, setLocation] = useState(initialFilters.location || '')
  const timerRef = useRef(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  function debouncedNotify(updates) {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      onFilterChange(updates)
    }, 300)
  }

  function handleKeywordChange(e) {
    const val = e.target.value
    setKeyword(val)
    debouncedNotify({ keyword: val })
  }

  function handleWorkTypeChange(e) {
    const val = e.target.value
    setWorkType(val)
    onFilterChange({ work_type: val })
  }

  function handleExperienceChange(e) {
    const val = e.target.value
    setExperienceLevel(val)
    onFilterChange({ experience_level: val })
  }

  function handleLocationChange(e) {
    const val = e.target.value
    setLocation(val)
    debouncedNotify({ location: val })
  }

  return (
    <div className="search-filters">
      <Row className="g-2 mb-3">
        <Col md={4}>
          <InputGroup>
            <InputGroup.Text>
              <Search size={16} />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search jobs..."
              value={keyword}
              onChange={handleKeywordChange}
              aria-label="Search jobs"
            />
          </InputGroup>
        </Col>
        <Col md={2}>
          <Form.Select
            value={workType}
            onChange={handleWorkTypeChange}
            aria-label="Work type"
          >
            <option value="">All types</option>
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
            <option value="onsite">On-site</option>
          </Form.Select>
        </Col>
        <Col md={2}>
          <Form.Select
            value={experienceLevel}
            onChange={handleExperienceChange}
            aria-label="Experience level"
          >
            <option value="">All levels</option>
            <option value="entry">Entry</option>
            <option value="mid">Mid</option>
            <option value="senior">Senior</option>
          </Form.Select>
        </Col>
        <Col md={2}>
          <Form.Control
            type="text"
            placeholder="Location"
            value={location}
            onChange={handleLocationChange}
            aria-label="Location"
          />
        </Col>
      </Row>
    </div>
  )
}
