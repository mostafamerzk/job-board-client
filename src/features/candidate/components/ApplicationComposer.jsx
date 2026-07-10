import { useState } from 'react'
import Card from 'react-bootstrap/Card'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Alert from 'react-bootstrap/Alert'
import Spinner from 'react-bootstrap/Spinner'
import { BriefcaseBusiness, Send } from 'lucide-react'
import { PanelTitle } from './PanelTitle.jsx'
import { submitApplication } from '../api/candidateApi.js'

export function ApplicationComposer({ jobs, resumes, onRefresh }) {
  const [jobId, setJobId] = useState('')
  const [resumeId, setResumeId] = useState('')
  const [coverLetter, setCoverLetter] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState(null)

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
      setMsg({ variant: 'success', text: 'Application submitted successfully!' })
      setJobId('')
      setResumeId('')
      setCoverLetter('')
      onRefresh?.()
    } catch (err) {
      const body = err.body
      const detail = body?.message || (body?.errors ? Object.values(body.errors).flat().join(', ') : 'Submission failed')
      setMsg({ variant: 'danger', text: detail })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="candidate-panel h-100">
      <Card.Body>
        <PanelTitle icon={<Send size={21} aria-hidden="true" />} title="Application composer" />
        {msg && <Alert variant={msg.variant} dismissible onClose={() => setMsg(null)}>{msg.text}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="acJob" className="mb-2">
            <Form.Label>Job</Form.Label>
            <Form.Select value={jobId} onChange={e => setJobId(e.target.value)} required>
              <option value="">Select a job...</option>
              {jobs.map(j => (
                <option key={j.id} value={j.id}>{j.title} - {j.company}</option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group controlId="acResume" className="mb-2">
            <Form.Label>Resume</Form.Label>
            <Form.Select value={resumeId} onChange={e => setResumeId(e.target.value)}>
              <option value="">No resume (use contact info)</option>
              {resumes.map(r => (
                <option key={r.id} value={r.id}>{r.originalName}{r.isPrimary ? ' (Primary)' : ''}</option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group controlId="acCover" className="mb-2">
            <Form.Label>Cover letter <small className="text-muted">(optional, max 5000 chars)</small></Form.Label>
            <Form.Control as="textarea" rows={4} maxLength={5000} value={coverLetter} onChange={e => setCoverLetter(e.target.value)} />
          </Form.Group>
          <Button className="btn-brand" type="submit" disabled={submitting || !jobId}>
            {submitting ? (
              <><Spinner as="span" animation="border" size="sm" role="status" className="me-2" /> Submitting...</>
            ) : (
              <>Submit application <BriefcaseBusiness size={18} aria-hidden="true" /></>
            )}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  )
}
