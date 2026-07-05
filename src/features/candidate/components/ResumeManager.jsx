import Card from 'react-bootstrap/Card'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Badge from 'react-bootstrap/Badge'
import { FileCheck2, FileUp } from 'lucide-react'
import { PanelTitle } from './PanelTitle.jsx'

export function ResumeManager({ resumes, rules }) {
  return (
    <Card className="candidate-panel h-100">
      <Card.Body>
        <PanelTitle icon={<FileUp size={21} aria-hidden="true" />} title="Resume manager" />
        <div className="resume-rules" aria-label="Resume upload rules">
          <span>{rules.formats}</span>
          <span>{rules.maxSize}</span>
          <span>{rules.maxFiles}</span>
        </div>
        <Form.Group controlId="candidateResumeUpload" className="mt-3">
          <Form.Label>Upload resume</Form.Label>
          <Form.Control type="file" accept=".pdf,.doc,.docx" />
        </Form.Group>
        <div className="resume-list">
          {resumes.map((resume) => (
            <div className="resume-item" key={resume.id}>
              <FileCheck2 size={20} aria-hidden="true" />
              <div>
                <strong>{resume.originalName}</strong>
                <span>{resume.mimeType} · {resume.size}</span>
              </div>
              {resume.isPrimary ? (
                <Badge bg="success">Primary</Badge>
              ) : (
                <Button variant="outline-dark" size="sm" type="button">Set primary</Button>
              )}
            </div>
          ))}
        </div>
      </Card.Body>
    </Card>
  )
}
