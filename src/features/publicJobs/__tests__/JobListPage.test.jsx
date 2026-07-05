import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { server } from '../../../test/setup.js'
import { JobListPage } from '../pages/JobListPage.jsx'

function renderJobListPage() {
  return render(
    <BrowserRouter>
      <JobListPage />
    </BrowserRouter>
  )
}

test('shows loading state initially', () => {
  renderJobListPage()
  const placeholders = document.querySelectorAll('.placeholder')
  expect(placeholders.length).toBeGreaterThan(0)
})

test('renders job cards after loading', async () => {
  renderJobListPage()
  await waitFor(() => {
    expect(screen.getByText('Senior Laravel Developer')).toBeInTheDocument()
  })
  expect(screen.getByText('React Frontend Developer')).toBeInTheDocument()
})

test('shows empty state when no jobs match', async () => {
  server.use(
    http.get('*/api/v1/jobs', () => {
      return HttpResponse.json({
        data: [],
        meta: { current_page: 1, last_page: 1, per_page: 20, total: 0 },
      })
    })
  )
  renderJobListPage()
  await waitFor(() => {
    expect(screen.getByText('No jobs found')).toBeInTheDocument()
  })
})

test('shows error state when API fails', async () => {
  server.use(
    http.get('*/api/v1/jobs', () => {
      return HttpResponse.error()
    })
  )
  renderJobListPage()
  await waitFor(() => {
    expect(screen.getByText('Unable to load jobs. Please try again.')).toBeInTheDocument()
  })
})
