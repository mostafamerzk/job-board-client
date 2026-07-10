import { useState, useEffect } from 'react'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Spinner from 'react-bootstrap/Spinner'
import Alert from 'react-bootstrap/Alert'
import { ProfilePanel } from '../components/ProfilePanel.jsx'
import { ResumeManager } from '../components/ResumeManager.jsx'
import { ApplicationHistory } from '../components/ApplicationHistory.jsx'
import {
  getProfile,
  getResumes,
  getApplications,
} from '../api/candidateApi.js'

const RESUME_RULES = {
  formats: 'PDF, DOC, DOCX',
  maxSize: '5MB',
  maxFiles: '5 resumes',
}

export function CandidateDashboard() {
  const [profile, setProfile] = useState(null)
  const [resumes, setResumes] = useState([])
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function loadAll() {
    try {
      const [profileRes, resumesRes, appsRes] = await Promise.all([
        getProfile(),
        getResumes(),
        getApplications(),
      ])
      setProfile(profileRes.data || profileRes)
      setResumes(resumesRes.data || [])
      setApplications(appsRes.data?.data || appsRes.data || [])
    } catch (err) {
      setError(err.message || 'Failed to load data')
      throw err
    }
  }

  useEffect(() => {
    let cancelled = false
    loadAll().finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    )
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    )
  }

  const profileProps = profile ? {
    fullName: profile.full_name || '',
    headline: profile.headline || '',
    phone: profile.phone || '',
    linkedinUrl: profile.linkedin_url || '',
    bio: profile.bio || '',
  } : {}

  const resumeList = resumes.map(r => ({
    id: r.id,
    originalName: r.original_name,
    mimeType: r.mime_type,
    size: r.size_for_humans || String(r.size),
    isPrimary: r.is_primary,
  }))

  const appList = applications.map(a => ({
    id: a.id,
    jobTitle: a.job?.title || '',
    company: a.job?.employer?.company_name || '',
    status: a.status,
    createdAt: a.created_at?.split('T')[0] || a.created_at,
  }))

  return (
    <section className="candidate-band" id="candidate-module" aria-labelledby="candidate-module-title">
      <Container>
        <Row className="g-4 mt-1">
          <Col lg={5}>
            <ProfilePanel profile={profileProps} />
          </Col>
          <Col lg={7}>
            <ResumeManager resumes={resumeList} rules={RESUME_RULES} onRefresh={loadAll} />
          </Col>
        </Row>

        <ApplicationHistory applications={appList} onRefresh={loadAll} />
      </Container>
    </section>
  )
}
