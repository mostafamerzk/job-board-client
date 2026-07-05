import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import { BriefcaseBusiness, Send } from 'lucide-react'
import { PanelTitle } from './PanelTitle.jsx'

export function ApplicationComposer({ draft }) {
  return (
    <Card className="candidate-panel h-100">
      <Card.Body>
        <PanelTitle icon={<Send size={21} aria-hidden="true" />} title="Application composer" />
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
        <Button className="btn-brand" type="button">
          Submit application <BriefcaseBusiness size={18} aria-hidden="true" />
        </Button>
      </Card.Body>
    </Card>
  )
}
