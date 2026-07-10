import { useState, useRef } from 'react'
import Card from 'react-bootstrap/Card'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Badge from 'react-bootstrap/Badge'
import Spinner from 'react-bootstrap/Spinner'
import Alert from 'react-bootstrap/Alert'
import { FileCheck2, FileUp, Trash2, Star } from 'lucide-react'
import { PanelTitle } from './PanelTitle.jsx'
import { uploadResume, updateResume, deleteResume } from '../api/candidateApi.js'

export function ResumeManager({ resumes, rules, onRefresh }) {
  const fileRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [actionId, setActionId] = useState(null)
  const [msg, setMsg] = useState(null)

  async function handleUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setMsg(null)
    try {
      await uploadResume(file)
      setMsg({ variant: 'success', text: 'Resume uploaded' })
      fileRef.current.value = ''
      onRefresh?.()
    } catch {
      setMsg({ variant: 'danger', text: 'Upload failed' })
    } finally {
      setUploading(false)
    }
  }

  async function handleSetPrimary(id) {
    setActionId(id)
    setMsg(null)
    try {
      await updateResume(id, { is_primary: true })
      setMsg({ variant: 'success', text: 'Primary resume updated' })
      onRefresh?.()
    } catch {
      setMsg({ variant: 'danger', text: 'Failed to update' })
    } finally {
      setActionId(null)
    }
  }

  async function handleDelete(id) {
    setActionId(id)
    setMsg(null)
    try {
      await deleteResume(id)
      setMsg({ variant: 'success', text: 'Resume deleted' })
      onRefresh?.()
    } catch {
      setMsg({ variant: 'danger', text: 'Delete failed' })
    } finally {
      setActionId(null)
    }
  }

  return (
    <Card className="candidate-panel h-100">
      <Card.Body>
        <PanelTitle icon={<FileUp size={21} aria-hidden="true" />} title="Resume manager" />
        {msg && <Alert variant={msg.variant} dismissible onClose={() => setMsg(null)}>{msg.text}</Alert>}
        <div className="resume-rules" aria-label="Resume upload rules">
          <span>{rules.formats}</span>
          <span>{rules.maxSize}</span>
          <span>{rules.maxFiles}</span>
        </div>
        <Form.Group controlId="candidateResumeUpload" className="mt-3">
          <Form.Label>Upload resume</Form.Label>
          <Form.Control type="file" accept=".pdf,.doc,.docx" ref={fileRef} onChange={handleUpload} disabled={uploading} />
          {uploading && <Spinner as="span" animation="border" size="sm" className="mt-1" />}
        </Form.Group>
        <div className="resume-list">
          {resumes.map((resume) => (
            <div className="resume-item" key={resume.id}>
              <FileCheck2 size={20} aria-hidden="true" />
              <div>
                <strong>{resume.originalName}</strong>
                <span>{resume.mimeType} · {resume.size}</span>
              </div>
              <div className="resume-actions">
                {resume.isPrimary ? (
                  <Badge bg="success">Primary</Badge>
                ) : (
                  <Button variant="outline-dark" size="sm" type="button" onClick={() => handleSetPrimary(resume.id)} disabled={actionId === resume.id}>
                    {actionId === resume.id ? <Spinner animation="border" size="sm" /> : <><Star size={14} /> Primary</>}
                  </Button>
                )}
                <Button variant="outline-danger" size="sm" type="button" onClick={() => handleDelete(resume.id)} disabled={actionId === resume.id}>
                  {actionId === resume.id ? <Spinner animation="border" size="sm" /> : <Trash2 size={14} />}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card.Body>
    </Card>
  )
}
