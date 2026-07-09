import { useState, useEffect } from 'react'
import Card from 'react-bootstrap/Card'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Spinner from 'react-bootstrap/Spinner'
import Alert from 'react-bootstrap/Alert'
import { Building2, Save } from 'lucide-react'
import { getProfile, updateProfile } from '../api/employerApi.js'

const EMPTY_FORM = {
  company_name: '',
  company_description: '',
  website: '',
  location: '',
  contact_email: '',
}

export function CompanyProfileForm({ onSuccess }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getProfile()
      .then((res) => {
        if (cancelled) return
        const d = res?.data
        if (d) {
          setForm({
            company_name: d.company_name || '',
            company_description: d.company_description || '',
            website: d.website || '',
            location: d.location || '',
            contact_email: d.contact_email || '',
          })
        }
      })
      .catch(() => {
        // Profile may not exist yet — allow blank form
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  function validate() {
    const e = {}
    if (!form.company_name.trim()) e.company_name = 'Company name is required'
    if (!form.contact_email.trim()) {
      e.contact_email = 'Contact email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contact_email)) {
      e.contact_email = 'Enter a valid email address'
    }
    if (form.website && !/^https?:\/\/.+/.test(form.website)) {
      e.website = 'Website must start with http:// or https://'
    }
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setServerError('')
    const v = validate()
    setErrors(v)
    if (Object.keys(v).length) return

    setSaving(true)
    try {
      await updateProfile(form)
      onSuccess?.('Profile updated successfully')
    } catch (err) {
      if (err.status === 422 && err.body?.errors) {
        const mapped = {}
        for (const [key, msgs] of Object.entries(err.body.errors)) {
          mapped[key] = Array.isArray(msgs) ? msgs[0] : msgs
        }
        setErrors(mapped)
      } else {
        setServerError(err.body?.message || 'Failed to update profile. Please try again.')
      }
    } finally {
      setSaving(false)
    }
  }

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  if (loading) {
    return (
      <Card className="employer-panel h-100">
        <Card.Body className="d-flex justify-content-center align-items-center" style={{ minHeight: 200 }}>
          <Spinner animation="border" variant="success" role="status">
            <span className="visually-hidden">Loading profile…</span>
          </Spinner>
        </Card.Body>
      </Card>
    )
  }

  return (
    <Card className="employer-panel h-100">
      <Card.Body>
        <div className="panel-header">
          <Building2 size={21} aria-hidden="true" />
          <h3>Company profile</h3>
        </div>

        {serverError && <Alert variant="danger" dismissible onClose={() => setServerError('')}>{serverError}</Alert>}

        <Form className="employer-form" onSubmit={handleSubmit} noValidate>
          <Form.Group controlId="companyName">
            <Form.Label>Company name *</Form.Label>
            <Form.Control
              value={form.company_name}
              onChange={(e) => handleChange('company_name', e.target.value)}
              isInvalid={!!errors.company_name}
              disabled={saving}
              placeholder="Your company name"
            />
            <Form.Control.Feedback type="invalid">{errors.company_name}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group controlId="companyDescription">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={form.company_description}
              onChange={(e) => handleChange('company_description', e.target.value)}
              disabled={saving}
              placeholder="Tell candidates about your company…"
            />
          </Form.Group>

          <Form.Group controlId="companyWebsite">
            <Form.Label>Website</Form.Label>
            <Form.Control
              type="url"
              value={form.website}
              onChange={(e) => handleChange('website', e.target.value)}
              isInvalid={!!errors.website}
              disabled={saving}
              placeholder="https://example.com"
            />
            <Form.Control.Feedback type="invalid">{errors.website}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group controlId="companyLocation">
            <Form.Label>Location</Form.Label>
            <Form.Control
              value={form.location}
              onChange={(e) => handleChange('location', e.target.value)}
              disabled={saving}
              placeholder="City, Country"
            />
          </Form.Group>

          <Form.Group controlId="companyContactEmail">
            <Form.Label>Contact email *</Form.Label>
            <Form.Control
              type="email"
              value={form.contact_email}
              onChange={(e) => handleChange('contact_email', e.target.value)}
              isInvalid={!!errors.contact_email}
              disabled={saving}
              placeholder="hr@company.com"
            />
            <Form.Control.Feedback type="invalid">{errors.contact_email}</Form.Control.Feedback>
          </Form.Group>

          <Button className="btn-brand" type="submit" disabled={saving}>
            {saving ? (
              <>
                <Spinner animation="border" size="sm" role="status" aria-hidden="true" />
                Saving…
              </>
            ) : (
              <>
                Save profile <Save size={18} aria-hidden="true" />
              </>
            )}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  )
}
