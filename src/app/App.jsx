import Badge from 'react-bootstrap/Badge'
import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Stack from 'react-bootstrap/Stack'
import Tab from 'react-bootstrap/Tab'
import Tabs from 'react-bootstrap/Tabs'
import { ArrowRight, BriefcaseBusiness, CheckCircle2, FileText, Search, ShieldCheck } from 'lucide-react'
import { AppShell } from '../components/layout/AppShell.jsx'
import { StatusPill } from '../components/ui/StatusPill.jsx'
import { moduleCards, phasePlan, qualityChecks, workspaceTabs } from '../features/home/moduleData.jsx'

function App() {
  return (
    <AppShell>
      <main>
        <section className="hero-band">
          <Container>
            <Row className="align-items-center gy-5 gx-4 gx-lg-5">
              <Col lg={7}>
                <Stack gap={4}>
                  <div>
                    <Badge bg="success" className="eyebrow">
                      React Bootstrap client
                    </Badge>
                    <h1>Job Board Client</h1>
                    <p className="hero-copy">
                      A role-aware frontend foundation for the Laravel Job Board API. The first
                      screen maps the product domains, API boundaries, and team phases before full
                      feature implementation begins.
                    </p>
                  </div>
                  <Stack direction="horizontal" gap={3} className="flex-wrap">
                    <Button className="btn-brand" href="#workspaces">
                      View workspaces <ArrowRight size={18} aria-hidden="true" />
                    </Button>
                    <Button variant="outline-dark" href="./docs/API-REFERENCE.md">
                      API reference <FileText size={18} aria-hidden="true" />
                    </Button>
                  </Stack>
                </Stack>
              </Col>
              <Col lg={5}>
                <Card className="hero-panel">
                  <Card.Body>
                    <div className="panel-header">
                      <BriefcaseBusiness size={22} aria-hidden="true" />
                      <span>Client readiness</span>
                    </div>
                    <div className="metric-grid" aria-label="Client foundation metrics">
                      <div>
                        <strong>3</strong>
                        <span>user roles</span>
                      </div>
                      <div>
                        <strong>9</strong>
                        <span>API groups</span>
                      </div>
                      <div>
                        <strong>5</strong>
                        <span>delivery phases</span>
                      </div>
                      <div>
                        <strong>1</strong>
                        <span>design system</span>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
        </section>

        <section className="section-band">
          <Container>
            <div className="section-heading">
              <Badge bg="light" text="dark">
                Product map
              </Badge>
              <h2>API modules translated into frontend ownership</h2>
            </div>
            <Row className="g-3">
              {moduleCards.map((module) => (
                <Col md={6} xl={3} key={module.title}>
                  <Card className="module-card h-100">
                    <Card.Body>
                      <div className="module-icon">{module.icon}</div>
                      <Card.Title>{module.title}</Card.Title>
                      <Card.Text>{module.description}</Card.Text>
                      <StatusPill label={module.status} />
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Container>
        </section>

        <section className="workspace-band" id="workspaces">
          <Container>
            <Row className="g-4">
              <Col lg={5}>
                <div className="section-heading sticky-heading">
                  <Badge bg="warning" text="dark">
                    Workspaces
                  </Badge>
                  <h2>Role-first screens for team development</h2>
                  <p>
                    Each workspace has a clear API boundary, component ownership, and test surface
                    so members can work without stepping on each other.
                  </p>
                </div>
              </Col>
              <Col lg={7}>
                <Tabs defaultActiveKey="employer" className="workspace-tabs">
                  {workspaceTabs.map((workspace) => (
                    <Tab eventKey={workspace.key} title={workspace.title} key={workspace.key}>
                      <Card className="workspace-card">
                        <Card.Body>
                          <h3>{workspace.heading}</h3>
                          <p>{workspace.summary}</p>
                          <ul>
                            {workspace.items.map((item) => (
                              <li key={item}>
                                <CheckCircle2 size={17} aria-hidden="true" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </Card.Body>
                      </Card>
                    </Tab>
                  ))}
                </Tabs>
              </Col>
            </Row>
          </Container>
        </section>

        <section className="section-band muted">
          <Container>
            <Row className="g-4">
              <Col lg={6}>
                <div className="section-heading">
                  <Badge bg="light" text="dark">
                    Delivery plan
                  </Badge>
                  <h2>Phase alignment with the Laravel API</h2>
                </div>
                <div className="timeline">
                  {phasePlan.map((phase) => (
                    <div className="timeline-item" key={phase.phase}>
                      <span>{phase.phase}</span>
                      <div>
                        <h3>{phase.title}</h3>
                        <p>{phase.scope}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Col>
              <Col lg={6}>
                <Card className="quality-card">
                  <Card.Body>
                    <div className="panel-header">
                      <ShieldCheck size={22} aria-hidden="true" />
                      <span>Testing strategy</span>
                    </div>
                    <ul className="quality-list">
                      {qualityChecks.map((check) => (
                        <li key={check}>
                          <Search size={17} aria-hidden="true" />
                          <span>{check}</span>
                        </li>
                      ))}
                    </ul>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
        </section>
      </main>
    </AppShell>
  )
}

export default App
