import Card from 'react-bootstrap/Card'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import { FileCheck2, UserRound } from 'lucide-react'
import { PanelTitle } from './PanelTitle.jsx'

export function ProfilePanel({ profile }) {
  return (
    <Card className="candidate-panel h-100">
      <Card.Body>
        <PanelTitle icon={<UserRound size={21} aria-hidden="true" />} title="Candidate profile" />
        <Form className="candidate-form">
          <Form.Group controlId="candidateFullName">
            <Form.Label>Full name</Form.Label>
            <Form.Control readOnly defaultValue={profile.fullName} />
          </Form.Group>
          <Form.Group controlId="candidateHeadline">
            <Form.Label>Headline</Form.Label>
            <Form.Control readOnly defaultValue={profile.headline} />
          </Form.Group>
          <Form.Group controlId="candidatePhone">
            <Form.Label>Phone</Form.Label>
            <Form.Control readOnly defaultValue={profile.phone} />
          </Form.Group>
          <Form.Group controlId="candidateLinkedin">
            <Form.Label>LinkedIn URL</Form.Label>
            <Form.Control readOnly defaultValue={profile.linkedinUrl} />
          </Form.Group>
          <Form.Group controlId="candidateBio">
            <Form.Label>Bio</Form.Label>
            <Form.Control as="textarea" rows={4} readOnly defaultValue={profile.bio} />
          </Form.Group>
          <Button className="btn-brand" type="button">
            Save profile <FileCheck2 size={18} aria-hidden="true" />
          </Button>
        </Form>
      </Card.Body>
    </Card>
  )
}
