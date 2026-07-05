import Badge from 'react-bootstrap/Badge'
import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Stack from 'react-bootstrap/Stack'
import {
  ArrowRight, BriefcaseBusiness, Building2, ChevronRight, FileCheck,
  Search, Star, UserPlus, UsersRound,
} from 'lucide-react'
import { jobMatches } from '../../candidate/candidateData.js'

const stats = [
  { value: '1,200+', label: 'Active jobs' },
  { value: '850+', label: 'Companies' },
  { value: '15,000+', label: 'Candidates' },
  { value: '98%', label: 'Satisfaction' },
]

const steps = [
  {
    icon: <Search size={28} aria-hidden="true" />,
    title: 'Search jobs',
    desc: 'Browse thousands of opportunities across Egypt. Filter by category, location, experience, and salary.',
  },
  {
    icon: <FileCheck size={28} aria-hidden="true" />,
    title: 'Apply easily',
    desc: 'Submit your resume or contact info with one click. Track every application from your dashboard.',
  },
  {
    icon: <Star size={28} aria-hidden="true" />,
    title: 'Get hired',
    desc: 'Employers review and respond directly. Receive offers and manage your career growth.',
  },
]

const employerBenefits = [
  'Post jobs and reach thousands of qualified candidates across Egypt',
  'Review applicants with rich profiles and attached resumes',
  'Manage the entire hiring pipeline — from review to offer',
  'Build your employer brand with a company profile and logo',
]

export function HomePage() {
  return (
    <main>
      {/* ── Hero ── */}
      <section className="hero-band">
        <Container>
          <Row className="align-items-center gy-5 gx-4 gx-lg-5">
            <Col lg={7}>
              <Stack gap={4}>
                <div>
                  <Badge bg="success" className="eyebrow">
                    مصر — Egypt
                  </Badge>
                  <h1>Find your next opportunity in Egypt</h1>
                  <p className="hero-copy">
                    WazeefaMasr connects talented professionals with top companies across Egypt.
                    Browse jobs, apply in minutes, and take the next step in your career.
                  </p>
                </div>
                <Stack direction="horizontal" gap={3} className="flex-wrap">
                  <Button href="/jobs" className="btn-brand btn-lg">
                    Browse jobs <Search size={18} aria-hidden="true" />
                  </Button>
                  <Button href="/register?role=employer" variant="outline-dark" className="btn-lg">
                    For employers <Building2 size={18} aria-hidden="true" />
                  </Button>
                </Stack>
              </Stack>
            </Col>
            <Col lg={5}>
              <Card className="hero-panel">
                <Card.Body>
                  <div className="panel-header">
                    <BriefcaseBusiness size={22} aria-hidden="true" />
                    <span>Egypt's job market</span>
                  </div>
                  <div className="metric-grid" aria-label="Platform stats">
                    {stats.map((s) => (
                      <div key={s.label}>
                        <strong>{s.value}</strong>
                        <span>{s.label}</span>
                      </div>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* ── How it works ── */}
      <section className="section-band">
        <Container>
          <div className="section-heading text-center">
            <Badge bg="light" text="dark" className="mx-auto">How it works</Badge>
            <h2>Three steps to your next role</h2>
            <p className="mx-auto" style={{ maxWidth: 600 }}>
              Whether you are a seasoned professional or just starting out, WazeefaMasr makes
              the job search simple and effective.
            </p>
          </div>
          <Row className="g-4 mt-2">
            {steps.map((step, i) => (
              <Col md={4} key={step.title}>
                <Card className="step-card h-100">
                  <Card.Body className="text-center">
                    <div className="step-number">{i + 1}</div>
                    <div className="step-icon">{step.icon}</div>
                    <Card.Title>{step.title}</Card.Title>
                    <Card.Text>{step.desc}</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* ── Featured jobs ── */}
      <section className="section-band muted">
        <Container>
          <div className="section-heading d-flex justify-content-between align-items-end flex-wrap gap-3">
            <div>
              <Badge bg="light" text="dark">Featured jobs</Badge>
              <h2>Recent opportunities</h2>
            </div>
            <Button href="/jobs" variant="outline-dark">
              View all jobs <ArrowRight size={17} aria-hidden="true" />
            </Button>
          </div>
          <Row className="g-3 mt-1">
            {jobMatches.map((job) => (
              <Col md={6} key={job.id}>
                <Card className="featured-job-card h-100">
                  <Card.Body>
                    <div className="featured-job-header">
                      <div className="featured-job-icon">
                        <BriefcaseBusiness size={20} aria-hidden="true" />
                      </div>
                      <div>
                        <Card.Title>{job.title}</Card.Title>
                        <Card.Text className="job-meta">
                          {job.company} — {job.location}
                        </Card.Text>
                      </div>
                    </div>
                    <div className="job-salary">{job.salary}</div>
                    <Stack direction="horizontal" gap={2} className="flex-wrap mt-2">
                      {job.tags.map((tag) => (
                        <Badge bg="light" text="dark" key={tag} className="job-tag">
                          {tag}
                        </Badge>
                      ))}
                    </Stack>
                    <Button variant="outline-dark" size="sm" className="mt-3" href={`/jobs/${job.id}`}>
                      View details <ChevronRight size={15} aria-hidden="true" />
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* ── For employers ── */}
      <section className="section-band">
        <Container>
          <Row className="g-5 align-items-center">
            <Col lg={6}>
              <Badge bg="success" className="eyebrow">For employers</Badge>
              <h2 className="mt-3">Hire the best talent in Egypt</h2>
              <p className="text-secondary mb-4" style={{ lineHeight: 1.7 }}>
                Reach thousands of active job seekers across every industry. WazeefaMasr gives
                you the tools to post jobs, review candidates, and build your team — all in one place.
              </p>
              <ul className="employer-benefits">
                {employerBenefits.map((benefit) => (
                  <li key={benefit}>
                    <CheckCircle2 size={18} aria-hidden="true" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
              <Button href="/register?role=employer" className="btn-brand btn-lg mt-3">
                Start hiring <UserPlus size={18} aria-hidden="true" />
              </Button>
            </Col>
            <Col lg={6}>
              <Card className="employer-card">
                <Card.Body>
                  <div className="panel-header">
                    <Building2 size={22} aria-hidden="true" />
                    <span>Companies on WazeefaMasr</span>
                  </div>
                  <div className="employer-metric-grid">
                    <div>
                      <strong>850+</strong>
                      <span>Active employers</span>
                    </div>
                    <div>
                      <strong>1,200+</strong>
                      <span>Jobs posted</span>
                    </div>
                    <div>
                      <strong>5,000+</strong>
                      <span>Hires made</span>
                    </div>
                    <div>
                      <strong>4.8★</strong>
                      <span>Avg. rating</span>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* ── CTA ── */}
      <section className="cta-band">
        <Container className="text-center">
          <h2>Ready to find your next opportunity?</h2>
          <p className="cta-copy">
            Join thousands of professionals and companies already using WazeefaMasr.
          </p>
          <Stack direction="horizontal" gap={3} className="justify-content-center flex-wrap">
            <Button href="/register" className="btn-brand btn-lg">
              Get started <UserPlus size={18} aria-hidden="true" />
            </Button>
            <Button href="/jobs" variant="outline-light" className="btn-lg">
              Browse jobs <ArrowRight size={18} aria-hidden="true" />
            </Button>
          </Stack>
        </Container>
      </section>

      {/* ── Footer ── */}
      <footer className="app-footer">
        <Container>
          <Row className="g-4">
            <Col lg={4}>
              <strong className="footer-brand">WazeefaMasr</strong>
              <p className="text-secondary mt-2 mb-0" style={{ fontSize: '0.9rem' }}>
                Connecting talent with opportunity across Egypt.
              </p>
            </Col>
            <Col lg={2} xs={6}>
              <strong className="footer-heading">Platform</strong>
              <NavList items={['Browse jobs', 'For employers', 'Categories', 'About us']} />
            </Col>
            <Col lg={2} xs={6}>
              <strong className="footer-heading">Support</strong>
              <NavList items={['Help centre', 'Contact us', 'Privacy policy', 'Terms of service']} />
            </Col>
            <Col lg={2} xs={6}>
              <strong className="footer-heading">For candidates</strong>
              <NavList items={['Create account', 'Upload resume', 'My applications', 'Job alerts']} />
            </Col>
            <Col lg={2} xs={6}>
              <strong className="footer-heading">For employers</strong>
              <NavList items={['Post a job', 'Pricing', 'Applicant dashboard', 'Resources']} />
            </Col>
          </Row>
          <hr className="footer-divider" />
          <p className="text-center text-secondary mb-0" style={{ fontSize: '0.85rem' }}>
            &copy; {new Date().getFullYear()} WazeefaMasr. All rights reserved.
          </p>
        </Container>
      </footer>
    </main>
  )
}

function CheckCircle2({ size, 'aria-hidden': ariaHidden }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden={ariaHidden}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}

function NavList({ items }) {
  return (
    <ul className="footer-nav-list">
      {items.map((item) => (
        <li key={item}><a href="#">{item}</a></li>
      ))}
    </ul>
  )
}
