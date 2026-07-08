import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AuthContext } from '../../../context/AuthContext.jsx'
import { AdminDashboard } from '../pages/AdminDashboard.jsx'

function renderDashboard(initialPath = '/admin') {
  return render(
    <AuthContext.Provider value={{ user: { id: 1 }, isLoading: false, isAuthenticated: true }}>
      <MemoryRouter initialEntries={[initialPath]}>
        <AdminDashboard />
      </MemoryRouter>
    </AuthContext.Provider>,
  )
}

describe('AdminDashboard', () => {
  it('shows Jobs tab active by default', () => {
    renderDashboard()
    const jobsTab = screen.getByRole('tab', { name: /jobs/i })
    expect(jobsTab).toHaveAttribute('aria-selected', 'true')
  })

  it('shows Users tab when tab=users in URL', () => {
    renderDashboard('/admin?tab=users')
    const usersTab = screen.getByRole('tab', { name: /users/i })
    expect(usersTab).toHaveAttribute('aria-selected', 'true')
  })

  it('shows Comments tab when tab=comments in URL', () => {
    renderDashboard('/admin?tab=comments')
    const commentsTab = screen.getByRole('tab', { name: /comments/i })
    expect(commentsTab).toHaveAttribute('aria-selected', 'true')
  })

  it('falls back to Jobs tab for invalid tab value', () => {
    renderDashboard('/admin?tab=invalid')
    const jobsTab = screen.getByRole('tab', { name: /jobs/i })
    expect(jobsTab).toHaveAttribute('aria-selected', 'true')
  })

  it('switches tabs on click and updates URL', async () => {
    const user = userEvent.setup()
    renderDashboard()

    await user.click(screen.getByRole('tab', { name: /users/i }))
    const usersTab = screen.getByRole('tab', { name: /users/i })
    expect(usersTab).toHaveAttribute('aria-selected', 'true')

    const jobsTab = screen.getByRole('tab', { name: /jobs/i })
    expect(jobsTab).toHaveAttribute('aria-selected', 'false')
  })
})
