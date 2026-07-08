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

vi.mock('../../../hooks/useAuth.js', () => ({
  useAuth: () => ({ user: { id: 1 } }),
}))

import { UserManagement } from '../components/UserManagement.jsx'

describe('UserManagement', () => {
  it('renders loading state initially', () => {
    render(<UserManagement />)
    expect(document.querySelector('.spinner-border')).toBeInTheDocument()
  })

  it('renders user list after loading', async () => {
    render(<UserManagement />)

    await waitFor(() => {
      expect(screen.getByText('Jane Candidate')).toBeInTheDocument()
    })
  })

  it('filters by role when dropdown changes', async () => {
    const user = userEvent.setup()
    render(<UserManagement />)

    await waitFor(() => {
      expect(screen.getByText('Jane Candidate')).toBeInTheDocument()
    })

    await user.selectOptions(screen.getByRole('combobox'), 'employer')

    await waitFor(() => {
      expect(screen.getByText('Bob Employer')).toBeInTheDocument()
    })
  })

  it('shows empty state when no users match', async () => {
    server.use(
      http.get('*/api/v1/admin/users', () => {
        return HttpResponse.json({ data: [], meta: { current_page: 1, last_page: 1, per_page: 15, total: 0 } })
      }),
    )

    render(<UserManagement />)

    await waitFor(() => {
      expect(
        screen.getByText('No users match your search. Try different filters.'),
      ).toBeInTheDocument()
    })
  })

  it('disables suspend button for own account', async () => {
    render(<UserManagement />)

    await waitFor(() => {
      expect(screen.getByText('Admin User')).toBeInTheDocument()
    })

    // Admin User is id=1 which matches current user (id=1 from mock)
    const suspendBtns = screen.getAllByRole('button', { name: /suspend/i })
    const selfBtn = suspendBtns.find((b) => b.disabled)
    expect(selfBtn).toBeDefined()
    expect(selfBtn).toHaveAttribute(
      'title',
      'Cannot modify your own account',
    )
  })

  it('opens detail modal on View button click', async () => {
    const user = userEvent.setup()
    render(<UserManagement />)

    await waitFor(() => {
      expect(screen.getByText('Jane Candidate')).toBeInTheDocument()
    })

    const viewButtons = screen.getAllByRole('button', { name: /^view$/i })
    await user.click(viewButtons[0])

    await waitFor(() => {
      expect(screen.getByText('User Details')).toBeInTheDocument()
    })

    expect(screen.getByText('Full Stack Developer')).toBeInTheDocument()
    expect(screen.getByText('Cairo')).toBeInTheDocument()
  })

  it('opens suspend dialog and calls toggle-active', async () => {
    const user = userEvent.setup()
    render(<UserManagement />)

    await waitFor(() => {
      expect(screen.getByText('Jane Candidate')).toBeInTheDocument()
    })

    const suspendButtons = screen.getAllByRole('button', { name: /suspend/i })
    await user.click(suspendButtons[0])

    await waitFor(() => {
      expect(
        screen.getByText(
          'This will prevent Jane Candidate from logging in. Are you sure?',
        ),
      ).toBeInTheDocument()
    })

    const allSuspendBtns = screen.getAllByRole('button', { name: /suspend/i })
    // Click the confirm button in the dialog (second one)
    await user.click(allSuspendBtns[allSuspendBtns.length - 1])

    await waitFor(() => {
      expect(
        screen.getByText('Jane Candidate has been suspended.'),
      ).toBeInTheDocument()
    })
  })
})
