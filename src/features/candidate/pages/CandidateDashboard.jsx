import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import { ProfilePanel } from '../components/ProfilePanel.jsx'
import { ResumeManager } from '../components/ResumeManager.jsx'
import { JobSearchPanel } from '../components/JobSearchPanel.jsx'
import { ApplicationComposer } from '../components/ApplicationComposer.jsx'
import { ApplicationHistory } from '../components/ApplicationHistory.jsx'
import {
  candidateProfile,
  resumes,
  resumeRules,
  searchFilters,
  jobMatches,
  applicationDraft,
  applications,
} from '../candidateData.js'

export function CandidateDashboard() {
  return (
    <section className="candidate-band" id="candidate-module" aria-labelledby="candidate-module-title">
      <Container>
        <Row className="g-4 mt-1">
          <Col lg={5}>
            <ProfilePanel profile={candidateProfile} />
          </Col>
          <Col lg={7}>
            <ResumeManager resumes={resumes} rules={resumeRules} />
          </Col>
        </Row>

        <Row className="g-4 mt-1">
          <Col lg={7}>
            <JobSearchPanel filters={searchFilters} jobs={jobMatches} />
          </Col>
          <Col lg={5}>
            <ApplicationComposer draft={applicationDraft} />
          </Col>
        </Row>

        <ApplicationHistory applications={applications} />
      </Container>
    </section>
  )
}
