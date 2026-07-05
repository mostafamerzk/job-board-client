import Badge from 'react-bootstrap/Badge'
import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Stack from 'react-bootstrap/Stack'
import Table from 'react-bootstrap/Table'
import {
  BriefcaseBusiness,
  FileCheck2,
  FileUp,
  History,
  Link2,
  Search,
  Send,
  UserRound,
} from 'lucide-react'
import {
  applicationDraft,
  applicationStatusVariants,
  applications,
  candidateEndpoints,
  candidateProfile,
  jobMatches,
  resumeRules,
  resumes,
  searchFilters,
} from './candidateData.js'

export function CandidateModule() {
  return (
    <section className="candidate-band" id="candidate-module" aria-labelledby="candidate-module-title">
      <Container>
        <Row className="g-4 align-items-start">
          <Col lg={4}>
            <div className="section-heading sticky-heading">
              <Badge bg="success" className="eyebrow">
                Phase 03
              </Badge>
              <h2 id="candidate-module-title">Candidate module</h2>
              <p>
                Candidate-owned screens for profile readiness, resumes, approved job search,
                application submission, and status history.
              </p>
            </div>
          </Col>

          <Col lg={8}>
            <div className="endpoint-strip" aria-label="Candidate API endpoints">
              {candidateEndpoints.map((endpoint) => (
                <div key={`${endpoint.method}-${endpoint.path}`}>
                  <span>{endpoint.method}</span>
                  <strong>{endpoint.label}</strong>
                  <code>{endpoint.path}</code>
                </div>
              ))}
            </div>
          </Col>
        </Row>

        <Row className="g-4 mt-1">
          <Col lg={5}>
            <Card className="candidate-panel h-100">
              <Card.Body>
                <PanelTitle icon={<UserRound size={21} aria-hidden="true" />} title="Candidate profile" />
                <Form className="candidate-form">
                  <Form.Group controlId="candidateFullName">
                    <Form.Label>Full name</Form.Label>
                    <Form.Control readOnly defaultValue={candidateProfile.fullName} />
                  </Form.Group>
                  <Form.Group controlId="candidateHeadline">
                    <Form.Label>Headline</Form.Label>
                    <Form.Control readOnly defaultValue={candidateProfile.headline} />
                  </Form.Group>
                  <Form.Group controlId="candidatePhone">
                    <Form.Label>Phone</Form.Label>
                    <Form.Control readOnly defaultValue={candidateProfile.phone} />
                  </Form.Group>
                  <Form.Group controlId="candidateLinkedin">
                    <Form.Label>LinkedIn URL</Form.Label>
                    <Form.Control readOnly defaultValue={candidateProfile.linkedinUrl} />
                  </Form.Group>
                  <Form.Group controlId="candidateBio">
                    <Form.Label>Bio</Form.Label>
                    <Form.Control as="textarea" rows={4} readOnly defaultValue={candidateProfile.bio} />
                  </Form.Group>
                  <Button className="btn-brand" type="button">
                    Save profile <FileCheck2 size={18} aria-hidden="true" />
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={7}>
            <Card className="candidate-panel h-100">
              <Card.Body>
                <PanelTitle icon={<FileUp size={21} aria-hidden="true" />} title="Resume manager" />
                <div className="resume-rules" aria-label="Resume upload rules">
                  <span>{resumeRules.formats}</span>
                  <span>{resumeRules.maxSize}</span>
                  <span>{resumeRules.maxFiles}</span>
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
                        <span>
                          {resume.mimeType} · {resume.size}
                        </span>
                      </div>
                      {resume.isPrimary ? (
                        <Badge bg="success">Primary</Badge>
                      ) : (
                        <Button variant="outline-dark" size="sm" type="button">
                          Set primary
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="g-4 mt-1">
          <Col lg={7}>
            <Card className="candidate-panel h-100">
              <Card.Body>
                <PanelTitle icon={<Search size={21} aria-hidden="true" />} title="Job search" />
                <div className="filter-grid">
                  {searchFilters.map((filter) => (
                    <Form.Group controlId={`candidateFilter${filter.label}`} key={filter.label}>
                      <Form.Label>{filter.label}</Form.Label>
                      <Form.Control readOnly defaultValue={filter.value} />
                    </Form.Group>
                  ))}
                </div>
                <div className="job-match-list">
                  {jobMatches.map((job) => (
                    <article className="job-match" key={job.id}>
                      <div>
                        <h3>{job.title}</h3>
                        <p>
                          {job.company} · {job.location} · {job.salary}
                        </p>
                        <Stack direction="horizontal" gap={2} className="flex-wrap">
                          {job.tags.map((tag) => (
                            <Badge bg="light" text="dark" key={tag}>
                              {tag}
                            </Badge>
                          ))}
                        </Stack>
                      </div>
                      <Button variant="outline-dark" type="button">
                        View job <Link2 size={17} aria-hidden="true" />
                      </Button>
                    </article>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={5}>
            <Card className="candidate-panel h-100">
              <Card.Body>
                <PanelTitle icon={<Send size={21} aria-hidden="true" />} title="Application composer" />
                <dl className="application-draft">
                  <div>
                    <dt>Selected job</dt>
                    <dd>{applicationDraft.selectedJob}</dd>
                  </div>
                  <div>
                    <dt>Resume path</dt>
                    <dd>{applicationDraft.selectedResume}</dd>
                  </div>
                  <div>
                    <dt>Fallback contact</dt>
                    <dd>{applicationDraft.fallbackContact}</dd>
                  </div>
                  <div>
                    <dt>Cover letter</dt>
                    <dd>{applicationDraft.coverLetterLimit}</dd>
                  </div>
                </dl>
                <Button className="btn-brand" type="button">
                  Submit application <BriefcaseBusiness size={18} aria-hidden="true" />
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Card className="candidate-panel application-history mt-4">
          <Card.Body>
            <PanelTitle icon={<History size={21} aria-hidden="true" />} title="Application history" />
            <Table responsive className="candidate-table align-middle">
              <thead>
                <tr>
                  <th>Job</th>
                  <th>Company</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Candidate action</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((application) => (
                  <tr key={application.id}>
                    <td data-label="Job">{application.jobTitle}</td>
                    <td data-label="Company">{application.company}</td>
                    <td data-label="Status">
                      <Badge bg={applicationStatusVariants[application.status]}>
                        {application.status}
                      </Badge>
                    </td>
                    <td data-label="Created">{application.createdAt}</td>
                    <td data-label="Candidate action">
                      <code>{application.action}</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Container>
    </section>
  )
}

function PanelTitle({ icon, title }) {
  return (
    <div className="panel-header">
      {icon}
      <h3>{title}</h3>
    </div>
  )
}
