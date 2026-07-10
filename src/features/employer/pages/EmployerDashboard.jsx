import { Routes, Route, Navigate } from 'react-router-dom'
import Container from 'react-bootstrap/Container'
import Tab from 'react-bootstrap/Tab'
import Tabs from 'react-bootstrap/Tabs'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import { useState } from 'react'
import { CompanyProfileForm } from '../components/CompanyProfileForm.jsx'
import { LogoUpload } from '../components/LogoUpload.jsx'
import { JobList } from '../components/JobList.jsx'
import { JobFormPage } from './JobFormPage.jsx'
import { JobDetailPage } from './JobDetailPage.jsx'
import { ApplicantListPage } from './ApplicantListPage.jsx'
import { ToastNotification } from '../components/ToastNotification.jsx'

function EmployerDashboardHome() {
  const [toast, setToast] = useState(null)

  return (
    <section className="workspace-band" id="employer-module">
      <Container>
        {toast && (
          <ToastNotification
            message={toast.message}
            variant={toast.variant}
            onClose={() => setToast(null)}
          />
        )}
        
        <Tabs
          defaultActiveKey="jobs"
          id="employer-workspace-tabs"
          className="workspace-tabs mb-4"
        >
          <Tab eventKey="jobs" title="My Jobs">
            <JobList onSuccess={(msg) => setToast({ message: msg, variant: 'success' })} />
          </Tab>
          <Tab eventKey="profile" title="Company Profile">
            <Row className="g-4">
              <Col lg={8}>
                <CompanyProfileForm onSuccess={(msg) => setToast({ message: msg, variant: 'success' })} />
              </Col>
              <Col lg={4}>
                <LogoUpload onSuccess={(msg) => setToast({ message: msg, variant: 'success' })} />
              </Col>
            </Row>
          </Tab>
        </Tabs>
      </Container>
    </section>
  )
}

export function EmployerDashboard() {
  return (
    <Routes>
      <Route path="" element={<EmployerDashboardHome />} />
      <Route path="jobs/new" element={<JobFormPage />} />
      <Route path="jobs/:id" element={<JobDetailPage />} />
      <Route path="jobs/:id/applications" element={<ApplicantListPage />} />
      <Route path="*" element={<Navigate to="/employer" replace />} />
    </Routes>
  )
}
