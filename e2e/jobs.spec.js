import { test, expect } from '@playwright/test'

const mockJobs = [
  {
    id: 1, title: 'Senior Laravel Developer', slug: 'senior-laravel-developer',
    description: 'Build amazing APIs with Laravel.',
    salary_min: 80000, salary_max: 120000, salary_currency: 'USD',
    location: 'New York', work_type: 'remote', experience_level: 'senior',
    created_at: '2026-07-01T00:00:00.000000Z',
    employer: { company_name: 'Tech Corp', logo_url: null, location: 'New York' },
    category: { id: 1, name: 'Backend' },
    technologies: [{ id: 1, name: 'Laravel' }, { id: 2, name: 'PHP' }],
  },
  {
    id: 2, title: 'React Frontend Developer', slug: 'react-frontend-developer',
    description: 'Build stunning UIs with React.',
    salary_min: 70000, salary_max: 100000, salary_currency: 'USD',
    location: 'San Francisco', work_type: 'hybrid', experience_level: 'mid',
    created_at: '2026-06-28T00:00:00.000000Z',
    employer: { company_name: 'Startup Inc', logo_url: null, location: 'San Francisco' },
    category: { id: 2, name: 'Frontend' },
    technologies: [{ id: 3, name: 'React' }, { id: 4, name: 'TypeScript' }],
  },
]

const mockJobDetail = {
  ...mockJobs[0],
  responsibilities: 'Design and build RESTful APIs\nWrite tests\nCode review',
  requirements: '5+ years PHP\n3+ years Laravel\nMySQL expertise',
  benefits: 'Remote work\nHealth insurance\nStock options',
  application_deadline: '2026-08-01',
  employer: { ...mockJobs[0].employer, company_description: 'Leading tech company', website: 'https://techcorp.com' },
  comments_count: 3,
}

const mockCategories = [
  { id: 1, name: 'Backend', slug: 'backend', jobs_count: 5 },
  { id: 2, name: 'Frontend', slug: 'frontend', jobs_count: 3 },
]

const mockTechnologies = [
  { id: 1, name: 'Laravel', slug: 'laravel' },
  { id: 2, name: 'PHP', slug: 'php' },
  { id: 3, name: 'React', slug: 'react' },
  { id: 4, name: 'TypeScript', slug: 'typescript' },
]

test.describe('Jobs pages', () => {

  test('jobs page loads and shows job cards', async ({ page }) => {
    // Set up API intercepts BEFORE navigation
    await page.route('**/api/v1/jobs*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: mockJobs,
          meta: { current_page: 1, last_page: 1, per_page: 20, total: 2 },
        }),
      })
    })
    await page.route('**/api/v1/categories', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: mockCategories }),
      })
    })
    await page.route('**/api/v1/technologies', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: mockTechnologies }),
      })
    })

    await page.goto('/jobs', { waitUntil: 'networkidle' })

    // Wait for job cards to render
    await expect(page.getByText('Senior Laravel Developer')).toBeVisible({ timeout: 15000 })
    await expect(page.getByText('React Frontend Developer')).toBeVisible()
    // Verify job data is displayed
    await expect(page.getByText('Tech Corp')).toBeVisible()
    await expect(page.getByText(/new york/i)).toBeVisible()
    // Technologies shown (use badge specifically to avoid matching job titles)
    await expect(page.locator('.badge').filter({ hasText: 'Laravel' })).toBeVisible()
    await expect(page.locator('.badge').filter({ hasText: 'PHP' })).toBeVisible()
    await expect(page.locator('.badge').filter({ hasText: 'React' })).toBeVisible()
  })

  test('job detail page loads with full description', async ({ page }) => {
    await page.route('**/api/v1/jobs/1', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: mockJobDetail }),
      })
    })

    await page.goto('/jobs/1')

    await expect(page.getByText('Senior Laravel Developer')).toBeVisible()
    await expect(page.getByText(/build amazing apis/i)).toBeVisible()
    await expect(page.getByText(/apply now/i)).toBeVisible()
    // Check extended fields render
    await expect(page.getByText('Responsibilities')).toBeVisible()
    await expect(page.getByText('Requirements')).toBeVisible()
    await expect(page.getByText('Benefits')).toBeVisible()
  })

  test('job detail shows 404 for non-existent job', async ({ page }) => {
    await page.route('**/api/v1/jobs/999', async (route) => {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Not found' }),
      })
    })

    await page.goto('/jobs/999')

    await expect(page.getByText(/no longer available/i)).toBeVisible()
    await expect(page.getByRole('link', { name: /back to jobs/i })).toBeVisible()
  })
})
