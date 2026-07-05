import { Routes, Route } from 'react-router-dom'
import { HomePage } from '../features/home/pages/HomePage.jsx'
import { LoginPage } from '../features/auth/pages/LoginPage.jsx'
import { RegisterPage } from '../features/auth/pages/RegisterPage.jsx'
import { JobListPage } from '../features/publicJobs/pages/JobListPage.jsx'
import { JobDetailPage } from '../features/publicJobs/pages/JobDetailPage.jsx'
import { UnauthorizedPage } from '../features/auth/pages/UnauthorizedPage.jsx'
import { NotFoundPage } from './NotFoundPage.jsx'
import { EmployerDashboard } from '../features/employer/pages/EmployerDashboard.jsx'
import { AdminDashboard } from '../features/admin/pages/AdminDashboard.jsx'
import { CandidateDashboard } from '../features/candidate/pages/CandidateDashboard.jsx'
import { ProtectedRoute } from './ProtectedRoute.jsx'
import { RoleGuard } from './RoleGuard.jsx'

export function AppRouter() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/jobs" element={<JobListPage />} />
      <Route path="/jobs/:id" element={<JobDetailPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Protected: candidate */}
      <Route
        path="/candidate/*"
        element={
          <ProtectedRoute>
            <RoleGuard roles={['candidate']}>
              <CandidateDashboard />
            </RoleGuard>
          </ProtectedRoute>
        }
      />

      {/* Protected: employer */}
      <Route
        path="/employer/*"
        element={
          <ProtectedRoute>
            <RoleGuard roles={['employer']}>
              <EmployerDashboard />
            </RoleGuard>
          </ProtectedRoute>
        }
      />

      {/* Protected: admin */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute>
            <RoleGuard roles={['admin']}>
              <AdminDashboard />
            </RoleGuard>
          </ProtectedRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
