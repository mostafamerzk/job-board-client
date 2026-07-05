import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AuthContext } from '../../../context/AuthContext.jsx'
import { JobDetailPage } from '../pages/JobDetailPage.jsx'

function renderJobDetailPage(jobId = '1', authValue = {}) {
  const defaultAuth = {
    isAuthenticated: false,
    ...authValue,
  }
  return render(
    <AuthContext.Provider value={defaultAuth}>
      <MemoryRouter initialEntries={[`/jobs/${jobId}`]}>
        <Routes>
          <Route path="/jobs/:id" element={<JobDetailPage />} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  )
}

test('shows loading state initially', () => {
  renderJobDetailPage()
  expect(screen.getByRole('status')).toBeInTheDocument()
})

test('renders job detail after loading', async () => {
  renderJobDetailPage('1')
  await waitFor(() => {
    expect(screen.getByText('Senior Laravel Developer')).toBeInTheDocument()
  })
  expect(screen.getByText(/build amazing apis/i)).toBeInTheDocument()
  expect(screen.getByText(/apply now/i)).toBeInTheDocument()
})

test('shows not found message for invalid job id', async () => {
  renderJobDetailPage('999')
  await waitFor(() => {
    expect(screen.getByText(/no longer available/i)).toBeInTheDocument()
  })
  expect(screen.getByRole('link', { name: /back to jobs/i })).toBeInTheDocument()
})
