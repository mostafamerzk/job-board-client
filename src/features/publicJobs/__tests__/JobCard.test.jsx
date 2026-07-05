import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { JobCard } from '../components/JobCard.jsx'

const mockJob = {
  id: 1,
  title: 'Senior Laravel Developer',
  slug: 'senior-laravel-developer',
  description: 'Build amazing APIs with Laravel.',
  salary_min: 80000,
  salary_max: 120000,
  salary_currency: 'USD',
  location: 'New York',
  work_type: 'remote',
  experience_level: 'senior',
  created_at: '2026-07-01T00:00:00.000000Z',
  employer: { company_name: 'Tech Corp', logo_url: null, location: 'New York' },
  category: { id: 1, name: 'Backend' },
  technologies: [{ id: 1, name: 'Laravel' }, { id: 2, name: 'PHP' }],
}

test('renders job title, company, location, salary, and technologies', () => {
  render(
    <BrowserRouter>
      <JobCard job={mockJob} />
    </BrowserRouter>
  )

  expect(screen.getByText('Senior Laravel Developer')).toBeInTheDocument()
  expect(screen.getByText('Tech Corp')).toBeInTheDocument()
  expect(screen.getByText(/new york/i)).toBeInTheDocument()
  expect(screen.getByText(/\$80,000/)).toBeInTheDocument()
  expect(screen.getByText('Laravel')).toBeInTheDocument()
  expect(screen.getByText('PHP')).toBeInTheDocument()
})

test('renders relative date for posted time', () => {
  render(
    <BrowserRouter>
      <JobCard job={mockJob} />
    </BrowserRouter>
  )

  expect(screen.getByText(/ago/i)).toBeInTheDocument()
})

test('links to job detail page', () => {
  render(
    <BrowserRouter>
      <JobCard job={mockJob} />
    </BrowserRouter>
  )

  const link = screen.getByRole('link', { name: /senior laravel developer/i })
  expect(link).toHaveAttribute('href', '/jobs/1')
})
