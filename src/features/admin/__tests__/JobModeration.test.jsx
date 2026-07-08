import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { setupServer } from 'msw/node'
import { HttpResponse, http } from 'msw'
import { adminHandlers, resetAdminData } from '../data/mockHandlers.js'

const server = setupServer(...adminHandlers)

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
beforeEach(() => resetAdminData())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

vi.mock('../../../hooks/useAuth.js', () => ({
  useAuth: () => ({ user: { id: 1 } }),
}))

import { JobModeration } from '../components/JobModeration.jsx'

describe('JobModeration', () => {
  it('renders loading state initially', () => {
    render(<JobModeration />)
    expect(document.querySelector('.spinner-border')).toBeInTheDocument()
  })

  it('renders pending job list by default', async () => {
    render(<JobModeration />)

    await waitFor(() => {
      expect(screen.getByText('Senior Laravel Developer')).toBeInTheDocument()
    })
  })

  it('opens approve dialog and calls approve endpoint', async () => {
    const user = userEvent.setup()
    render(<JobModeration />)

    await waitFor(() => {
      expect(screen.getByText('Senior Laravel Developer')).toBeInTheDocument()
    })

    const approveButtons = screen.getAllByRole('button', { name: /^approve$/i })
    await user.click(approveButtons[0])

    await waitFor(() => {
      expect(
        screen.getByText('Approve this job listing? It will be visible to the public.'),
      ).toBeInTheDocument()
    })

    // Click approve in the dialog (second one after dialog opens)
    const dialogApproves = screen.getAllByRole('button', { name: /^approve$/i })
    await user.click(dialogApproves[dialogApproves.length - 1])

    await waitFor(() => {
      expect(screen.getByText('Job approved successfully.')).toBeInTheDocument()
    })
  })

  it('opens reject dialog with reason validation', async () => {
    const user = userEvent.setup()
    render(<JobModeration />)

    await waitFor(() => {
      expect(screen.getByText('Senior Laravel Developer')).toBeInTheDocument()
    })

    const rejectButtons = screen.getAllByRole('button', { name: /^reject$/i })
    await user.click(rejectButtons[0])

    await waitFor(() => {
      expect(
        screen.getByText('Are you sure you want to reject this job?'),
      ).toBeInTheDocument()
    })

    // Try confirming without reason
    const dialogRejects = screen.getAllByRole('button', { name: /^reject$/i })
    await user.click(dialogRejects[dialogRejects.length - 1])

    await waitFor(() => {
      expect(
        screen.getByText('Rejection reason is required.'),
      ).toBeInTheDocument()
    })
  })

  it('shows empty state when no pending jobs', async () => {
    server.use(
      http.get('*/api/v1/admin/jobs', () => {
        return HttpResponse.json({ data: [], meta: { current_page: 1, last_page: 1, per_page: 15, total: 0 } })
      }),
    )

    render(<JobModeration />)

    await waitFor(() => {
      expect(
        screen.getByText('All jobs have been moderated.'),
      ).toBeInTheDocument()
    })
  })

  it('shows error state with retry button', async () => {
    server.use(
      http.get('*/api/v1/admin/jobs', () => {
        return HttpResponse.json({ message: 'Server error' }, { status: 500 })
      }),
    )

    render(<JobModeration />)

    await waitFor(() => {
      expect(screen.getByText('Unable to load jobs. Please try again.')).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
  })

  it('disables approve/reject for non-pending jobs in All tab', async () => {
    const user = userEvent.setup()
    render(<JobModeration />)

    await waitFor(() => {
      expect(screen.getByText('Senior Laravel Developer')).toBeInTheDocument()
    })

    // Switch to "All" tab
    await user.click(screen.getByRole('button', { name: /^all$/i }))

    await waitFor(() => {
      expect(screen.getByText('Frontend Developer')).toBeInTheDocument()
    })

    const approveButtons = screen.getAllByRole('button', { name: /^approve$/i })
    const rejectButtons = screen.getAllByRole('button', { name: /^reject$/i })

    const disabledApproves = approveButtons.filter((b) => b.disabled)
    const disabledRejects = rejectButtons.filter((b) => b.disabled)

    expect(disabledApproves.length).toBeGreaterThan(0)
    expect(disabledRejects.length).toBeGreaterThan(0)
  })

  it('opens detail modal on View button click', async () => {
    const user = userEvent.setup()
    render(<JobModeration />)

    await waitFor(() => {
      expect(screen.getByText('Senior Laravel Developer')).toBeInTheDocument()
    })

    const viewButtons = screen.getAllByRole('button', { name: /^view$/i })
    await user.click(viewButtons[0])

    await waitFor(() => {
      expect(screen.getByText('Job Details')).toBeInTheDocument()
    })

    expect(screen.getByText('Engineering')).toBeInTheDocument()
    expect(screen.getByText('PHP, Laravel')).toBeInTheDocument()
  })
})
