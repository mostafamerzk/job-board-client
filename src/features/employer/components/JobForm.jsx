import { useState, useEffect } from 'react'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Spinner from 'react-bootstrap/Spinner'
import Alert from 'react-bootstrap/Alert'
import { Save, Send } from 'lucide-react'
import { getCategories, getTechnologies } from '../api/employerApi.js'

const WORK_TYPES = [
  { value: '', label: 'Select work type' },
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'onsite', label: 'On-site' },
]

const EXPERIENCE_LEVELS = [
  { value: '', label: 'Select experience level' },
  { value: 'junior', label: 'Junior' },
  { value: 'mid', label: 'Mid-level' },
  { value: 'senior', label: 'Senior' },
  { value: 'lead', label: 'Lead' },
]

const EMPTY_FORM = {
  title: '',
  description: '',
  responsibilities: '',
  requirements: '',
  benefits: '',
  salary_min: '',
  salary_max: '',
  salary_currency: 'USD',
  location: '',
  work_type: '',
  experience_level: '',
  category_id: '',
  technologies: [],
  application_deadline: '',
}

export function JobForm({ initialData, onSubmit, isSubmitting }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [categories, setCategories] = useState([])
  const [technologies, setTechnologies] = useState([])
  const [loadingLookups, setLoadingLookups] = useState(true)

  const isEdit = !!initialData

  useEffect(() => {
    let cancelled = false
    setLoadingLookups(true)
    Promise.all([getCategories(), getTechnologies()])
      .then(([catRes, techRes]) => {
        if (cancelled) return
        setCategories(catRes?.data || [])
        setTechnologies(techRes?.data || [])
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingLookups(false)
      })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || '',
        description: initialData.description || '',
        responsibilities: initialData.responsibilities || '',
        requirements: initialData.requirements || '',
        benefits: initialData.benefits || '',
        salary_min: initialData.salary_min ?? '',
        salary_max: initialData.salary_max ?? '',
        salary_currency: initialData.salary_currency || 'USD',
        location: initialData.location || '',
        work_type: initialData.work_type || '',
        experience_level: initialData.experience_level || '',
        category_id: initialData.category?.id ?? initialData.category_id ?? '',
        technologies: initialData.technologies?.map((t) => t.id) ?? [],
        application_deadline: initialData.application_deadline || '',
      })
    }
  }, [initialData])

  function validate() {
    const e = {}
    if (!form.title.trim()) e.title = 'Title is required'
    if (!form.salary_min && form.salary_min !== 0) e.salary_min = 'Minimum salary is required'
    if (!form.salary_max && form.salary_max !== 0) e.salary_max = 'Maximum salary is required'
    if (form.salary_min && form.salary_max && Number(form.salary_min) >= Number(form.salary_max)) {
      e.salary_max = 'Maximum salary must be greater than minimum'
    }
    if (form.application_deadline) {
      const deadline = new Date(form.application_deadline)
      if (isNaN(deadline.getTime())) {
        e.application_deadline = 'Invalid date'
      }
    }
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setServerError('')
    const v = validate()
    setErrors(v)
    if (Object.keys(v).length) return

    const payload = {
      ...form,
      salary_min: Number(form.salary_min),
      salary_max: Number(form.salary_max),
      category_id: form.category_id ? Number(form.category_id) : undefined,
      technologies: form.technologies.length ? form.technologies : undefined,
    }

    // Remove empty optional fields
    if (!payload.application_deadline) delete payload.application_deadline
    if (!payload.category_id) delete payload.category_id
    if (!payload.technologies) delete payload.technologies
    if (!payload.work_type) delete payload.work_type
    if (!payload.experience_level) delete payload.experience_level

    try {
      await onSubmit(payload)
    } catch (err) {
      if (err.status === 422 && err.body?.errors) {
        const mapped = {}
        for (const [key, msgs] of Object.entries(err.body.errors)) {
          mapped[key] = Array.isArray(msgs) ? msgs[0] : msgs
        }
        setErrors(mapped)
      } else {
        setServerError(err.body?.message || 'Something went wrong. Please try again.')
      }
    }
  }

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  function handleTechToggle(techId) {
    setForm((prev) => {
      const current = prev.technologies
      const next = current.includes(techId)
        ? current.filter((id) => id !== techId)
        : [...current, techId]
      return { ...prev, technologies: next }
    })
  }

  if (loadingLookups) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="success" role="status">
          <span className="visually-hidden">Loading form data…</span>
        </Spinner>
      </div>
    )
  }

  return (
    <Form className="employer-form" onSubmit={handleSubmit} noValidate>
      {serverError && <Alert variant="danger" dismissible onClose={() => setServerError('')}>{serverError}</Alert>}

      <Form.Group controlId="jobTitle">
        <Form.Label>Job title *</Form.Label>
        <Form.Control
          value={form.title}
          onChange={(e) => handleChange('title', e.target.value)}
          isInvalid={!!errors.title}
          disabled={isSubmitting}
          placeholder="e.g. Senior Laravel Developer"
        />
        <Form.Control.Feedback type="invalid">{errors.title}</Form.Control.Feedback>
      </Form.Group>

      <Form.Group controlId="jobDescription">
        <Form.Label>Description</Form.Label>
        <Form.Control
          as="textarea"
          rows={4}
          value={form.description}
          onChange={(e) => handleChange('description', e.target.value)}
          isInvalid={!!errors.description}
          disabled={isSubmitting}
          placeholder="Describe the role and what the candidate will be working on…"
        />
        <Form.Control.Feedback type="invalid">{errors.description}</Form.Control.Feedback>
      </Form.Group>

      <Row>
        <Col md={6}>
          <Form.Group controlId="jobResponsibilities">
            <Form.Label>Responsibilities</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={form.responsibilities}
              onChange={(e) => handleChange('responsibilities', e.target.value)}
              isInvalid={!!errors.responsibilities}
              disabled={isSubmitting}
              placeholder="List key responsibilities…"
            />
            <Form.Control.Feedback type="invalid">{errors.responsibilities}</Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group controlId="jobRequirements">
            <Form.Label>Requirements</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={form.requirements}
              onChange={(e) => handleChange('requirements', e.target.value)}
              isInvalid={!!errors.requirements}
              disabled={isSubmitting}
              placeholder="List required skills and experience…"
            />
            <Form.Control.Feedback type="invalid">{errors.requirements}</Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Form.Group controlId="jobBenefits">
        <Form.Label>Benefits</Form.Label>
        <Form.Control
          as="textarea"
          rows={2}
          value={form.benefits}
          onChange={(e) => handleChange('benefits', e.target.value)}
          isInvalid={!!errors.benefits}
          disabled={isSubmitting}
          placeholder="e.g. Remote work, health insurance, equity"
        />
        <Form.Control.Feedback type="invalid">{errors.benefits}</Form.Control.Feedback>
      </Form.Group>

      <Row>
        <Col md={4}>
          <Form.Group controlId="jobSalaryMin">
            <Form.Label>Min salary *</Form.Label>
            <Form.Control
              type="number"
              value={form.salary_min}
              onChange={(e) => handleChange('salary_min', e.target.value)}
              isInvalid={!!errors.salary_min}
              disabled={isSubmitting}
              placeholder="50000"
              min={0}
            />
            <Form.Control.Feedback type="invalid">{errors.salary_min}</Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group controlId="jobSalaryMax">
            <Form.Label>Max salary *</Form.Label>
            <Form.Control
              type="number"
              value={form.salary_max}
              onChange={(e) => handleChange('salary_max', e.target.value)}
              isInvalid={!!errors.salary_max}
              disabled={isSubmitting}
              placeholder="120000"
              min={0}
            />
            <Form.Control.Feedback type="invalid">{errors.salary_max}</Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group controlId="jobSalaryCurrency">
            <Form.Label>Currency</Form.Label>
            <Form.Select
              value={form.salary_currency}
              onChange={(e) => handleChange('salary_currency', e.target.value)}
              disabled={isSubmitting}
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="EGP">EGP</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group controlId="jobLocation">
            <Form.Label>Location</Form.Label>
            <Form.Control
              value={form.location}
              onChange={(e) => handleChange('location', e.target.value)}
              isInvalid={!!errors.location}
              disabled={isSubmitting}
              placeholder="e.g. Cairo, Egypt or Remote"
            />
            <Form.Control.Feedback type="invalid">{errors.location}</Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group controlId="jobDeadline">
            <Form.Label>Application deadline</Form.Label>
            <Form.Control
              type="date"
              value={form.application_deadline}
              onChange={(e) => handleChange('application_deadline', e.target.value)}
              isInvalid={!!errors.application_deadline}
              disabled={isSubmitting}
            />
            <Form.Control.Feedback type="invalid">{errors.application_deadline}</Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={4}>
          <Form.Group controlId="jobWorkType">
            <Form.Label>Work type</Form.Label>
            <Form.Select
              value={form.work_type}
              onChange={(e) => handleChange('work_type', e.target.value)}
              isInvalid={!!errors.work_type}
              disabled={isSubmitting}
            >
              {WORK_TYPES.map((wt) => (
                <option key={wt.value} value={wt.value}>{wt.label}</option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">{errors.work_type}</Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group controlId="jobExperience">
            <Form.Label>Experience level</Form.Label>
            <Form.Select
              value={form.experience_level}
              onChange={(e) => handleChange('experience_level', e.target.value)}
              isInvalid={!!errors.experience_level}
              disabled={isSubmitting}
            >
              {EXPERIENCE_LEVELS.map((el) => (
                <option key={el.value} value={el.value}>{el.label}</option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">{errors.experience_level}</Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group controlId="jobCategory">
            <Form.Label>Category</Form.Label>
            <Form.Select
              value={form.category_id}
              onChange={(e) => handleChange('category_id', e.target.value)}
              isInvalid={!!errors.category_id}
              disabled={isSubmitting}
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">{errors.category_id}</Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      {technologies.length > 0 && (
        <Form.Group>
          <Form.Label>Technologies</Form.Label>
          <div className="tech-checkbox-grid">
            {technologies.map((tech) => (
              <Form.Check
                key={tech.id}
                id={`tech-${tech.id}`}
                type="checkbox"
                label={tech.name}
                checked={form.technologies.includes(tech.id)}
                onChange={() => handleTechToggle(tech.id)}
                disabled={isSubmitting}
              />
            ))}
          </div>
          {errors.technologies && (
            <div className="text-danger small mt-1">{errors.technologies}</div>
          )}
        </Form.Group>
      )}

      <div className="d-flex gap-2 mt-2">
        <Button className="btn-brand" type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Spinner animation="border" size="sm" role="status" aria-hidden="true" />
              {isEdit ? 'Saving…' : 'Creating…'}
            </>
          ) : (
            <>
              {isEdit ? (
                <><Save size={18} aria-hidden="true" /> Save changes</>
              ) : (
                <><Send size={18} aria-hidden="true" /> Create job</>
              )}
            </>
          )}
        </Button>
      </div>
    </Form>
  )
}
