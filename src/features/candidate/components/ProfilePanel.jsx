import { useState } from 'react'
import Card from 'react-bootstrap/Card'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Spinner from 'react-bootstrap/Spinner'
import Alert from 'react-bootstrap/Alert'
import { FileCheck2, UserRound } from 'lucide-react'
import { PanelTitle } from './PanelTitle.jsx'
import { updateProfile } from '../api/candidateApi.js'

export function ProfilePanel({ profile }) {
  const [form, setForm] = useState({ ...profile })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)

  function onChange(e) {
    setForm({ ...form, [e.target.id]: e.target.value })
  }

  async function handleSave() {
    setSaving(true)
    setMsg(null)
    try {
      await updateProfile({
        full_name: form.fullName,
        headline: form.headline || null,
        phone: form.phone || null,
        linkedin_url: form.linkedinUrl || null,
        bio: form.bio || null,
      })
      setMsg({ variant: 'success', text: 'Profile saved' })
    } catch {
      setMsg({ variant: 'danger', text: 'Failed to save profile' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="candidate-panel h-100">
      <Card.Body>
        <PanelTitle icon={<UserRound size={21} aria-hidden="true" />} title="Candidate profile" />
        {msg && <Alert variant={msg.variant} dismissible onClose={() => setMsg(null)}>{msg.text}</Alert>}
        <Form className="candidate-form">
          <Form.Group controlId="fullName">
            <Form.Label>Full name</Form.Label>
            <Form.Control value={form.fullName || ''} onChange={onChange} />
          </Form.Group>
          <Form.Group controlId="headline">
            <Form.Label>Headline</Form.Label>
            <Form.Control value={form.headline || ''} onChange={onChange} />
          </Form.Group>
          <Form.Group controlId="phone">
            <Form.Label>Phone</Form.Label>
            <Form.Control value={form.phone || ''} onChange={onChange} />
          </Form.Group>
          <Form.Group controlId="linkedinUrl">
            <Form.Label>LinkedIn URL</Form.Label>
            <Form.Control value={form.linkedinUrl || ''} onChange={onChange} />
          </Form.Group>
          <Form.Group controlId="bio">
            <Form.Label>Bio</Form.Label>
            <Form.Control as="textarea" rows={4} value={form.bio || ''} onChange={onChange} />
          </Form.Group>
          <Button className="btn-brand" type="button" onClick={handleSave} disabled={saving}>
            {saving ? (
              <><Spinner as="span" animation="border" size="sm" role="status" className="me-2" /> Saving...</>
            ) : (
              <>Save profile <FileCheck2 size={18} aria-hidden="true" /></>
            )}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  )
}
