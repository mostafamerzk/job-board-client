import { useState } from 'react'
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import Alert from 'react-bootstrap/Alert'
import Spinner from 'react-bootstrap/Spinner'
import { BriefcaseBusiness, Send } from 'lucide-react'
import { PanelTitle } from './PanelTitle.jsx'

export function ApplicationComposer({ draft }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = () => {
    setIsSubmitting(true)
    setSuccess(false)
    
    setTimeout(() => {
      setIsSubmitting(false)
      setSuccess(true)
    }, 800)
  }

  return (
    <Card className="candidate-panel h-100">
      <Card.Body>
        <PanelTitle icon={<Send size={21} aria-hidden="true" />} title="Application composer" />
        
        {success && (
          <Alert variant="success" dismissible onClose={() => setSuccess(false)}>
            Application submitted successfully!
          </Alert>
        )}

        <dl className="application-draft">
          <div>
            <dt>Selected job</dt>
            <dd>{draft.selectedJob}</dd>
          </div>
          <div>
            <dt>Resume path</dt>
            <dd>{draft.selectedResume}</dd>
          </div>
          <div>
            <dt>Fallback contact</dt>
            <dd>{draft.fallbackContact}</dd>
          </div>
          <div>
            <dt>Cover letter</dt>
            <dd>{draft.coverLetterLimit}</dd>
          </div>
        </dl>
        <Button 
          className="btn-brand" 
          type="button" 
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
              Submitting...
            </>
          ) : (
            <>
              Submit application <BriefcaseBusiness size={18} aria-hidden="true" />
            </>
          )}
        </Button>
      </Card.Body>
    </Card>
  )
}
