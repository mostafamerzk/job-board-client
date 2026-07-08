import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { setupServer } from 'msw/node'
import { HttpResponse, http } from 'msw'
import { adminHandlers } from '../data/mockHandlers.js'

import { resetAdminData } from '../data/mockHandlers.js'

const server = setupServer(...adminHandlers)

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
beforeEach(() => resetAdminData())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

import { CommentModeration } from '../components/CommentModeration.jsx'

describe('CommentModeration', () => {
  it('renders loading state initially', () => {
    render(<CommentModeration />)
    expect(document.querySelector('.spinner-border')).toBeInTheDocument()
  })

  it('renders comment list after loading', async () => {
    render(<CommentModeration />)

    await waitFor(() => {
      expect(
        screen.getByText(
          'This is a great job posting! I am very interested in applying for this position.',
        ),
      ).toBeInTheDocument()
    })
  })

  it('truncates long comments', async () => {
    server.use(
      http.get('*/api/v1/admin/comments', () => {
        return HttpResponse.json({
          data: [
            {
              id: 99,
              body: 'A'.repeat(200),
              user: { id: 2, name: 'Long User' },
              job_id: 1,
              is_visible: true,
              created_at: '2026-06-20T14:30:00.000000Z',
            },
          ],
          meta: { current_page: 1, last_page: 1, per_page: 15, total: 1 },
        })
      }),
    )

    render(<CommentModeration />)

    await waitFor(() => {
      const cell = screen.getByText(/\.\.\.$/)
      expect(cell.textContent.length).toBeLessThanOrEqual(103) // 100 + '...'
    })
  })

  it('shows empty state when no comments', async () => {
    server.use(
      http.get('*/api/v1/admin/comments', () => {
        return HttpResponse.json({ data: [], meta: { current_page: 1, last_page: 1, per_page: 15, total: 0 } })
      }),
    )

    render(<CommentModeration />)

    await waitFor(() => {
      expect(
        screen.getByText('No comments to moderate.'),
      ).toBeInTheDocument()
    })
  })

  it('deletes a comment with confirmation', async () => {
    const user = userEvent.setup()

    server.use(
      http.get('*/api/v1/admin/comments', () => {
        return HttpResponse.json({
          data: [
            {
              id: 1,
              body: 'Test comment',
              user: { id: 2, name: 'Test User' },
              job_id: 1,
              is_visible: true,
              created_at: '2026-06-20T14:30:00.000000Z',
            },
          ],
          meta: { current_page: 1, last_page: 1, per_page: 15, total: 1 },
        })
      }),
    )

    render(<CommentModeration />)

    await waitFor(() => {
      expect(screen.getByText('Test comment')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /delete/i }))

    await waitFor(() => {
      expect(
        screen.getByText('Delete this comment permanently? This cannot be undone.'),
      ).toBeInTheDocument()
    })

    // Click the confirm button in the dialog
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
    await user.click(deleteButtons[deleteButtons.length - 1])

    await waitFor(() => {
      expect(screen.getByText('Comment deleted.')).toBeInTheDocument()
    })
  })

  it('filters comments by Job ID input', async () => {
    const user = userEvent.setup()
    render(<CommentModeration />)

    await waitFor(() => {
      expect(
        screen.getByText(
          'This is a great job posting! I am very interested in applying for this position.',
        ),
      ).toBeInTheDocument()
    })

    const jobIdInput = screen.getByPlaceholderText('Job ID')
    await user.type(jobIdInput, '2')

    await waitFor(() => {
      expect(
        screen.queryByText(
          'This is a great job posting! I am very interested in applying for this position.',
        ),
      ).not.toBeInTheDocument()
    })
  })

  it('filters comments by User ID input', async () => {
    const user = userEvent.setup()
    render(<CommentModeration />)

    await waitFor(() => {
      expect(
        screen.getByText(
          'This is a great job posting! I am very interested in applying for this position.',
        ),
      ).toBeInTheDocument()
    })

    const userIdInput = screen.getByPlaceholderText('User ID')
    await user.type(userIdInput, '999')

    await waitFor(() => {
      expect(
        screen.queryByText(
          'This is a great job posting! I am very interested in applying for this position.',
        ),
      ).not.toBeInTheDocument()
    })
  })

  it('shows only deleted comments when trashed filter is set to Deleted only', async () => {
    const user = userEvent.setup()
    render(<CommentModeration />)

    await waitFor(() => {
      expect(
        screen.getByText(
          'This is a great job posting! I am very interested in applying for this position.',
        ),
      ).toBeInTheDocument()
    })

    const trashedSelect = screen.getByRole('combobox')
    await user.selectOptions(trashedSelect, 'true')

    await waitFor(() => {
      expect(
        screen.getByText('This was a comment that got deleted.'),
      ).toBeInTheDocument()
    })

    expect(
      screen.queryByText(
        'This is a great job posting! I am very interested in applying for this position.',
      ),
    ).not.toBeInTheDocument()
  })

  it('shows error state with retry', async () => {
    server.use(
      http.get('*/api/v1/admin/comments', () => {
        return HttpResponse.json({ message: 'Server error' }, { status: 500 })
      }),
    )

    render(<CommentModeration />)

    await waitFor(() => {
      expect(
        screen.getByText('Unable to load comments. Please try again.'),
      ).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
  })
})
