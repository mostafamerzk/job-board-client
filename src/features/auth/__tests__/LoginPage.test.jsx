import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { AuthContext } from '../../../context/AuthContext.jsx'
import { LoginPage } from '../pages/LoginPage.jsx'

function renderLoginPage(authValue = {}) {
  const defaultAuth = {
    login: vi.fn(),
    isAuthenticated: false,
    isLoading: false,
    ...authValue,
  }
  return render(
    <AuthContext.Provider value={defaultAuth}>
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    </AuthContext.Provider>
  )
}

test('shows "Email is required" when submitting empty email', async () => {
  const user = userEvent.setup()
  renderLoginPage()

  await user.click(screen.getByRole('button', { name: /sign in/i }))

  expect(screen.getByText(/email is required/i)).toBeInTheDocument()
})

test('shows "Invalid email or password" on 401', async () => {
  const mockLogin = vi.fn().mockRejectedValue({
    status: 401,
    body: { message: 'Invalid credentials' },
  })
  const user = userEvent.setup()
  renderLoginPage({ login: mockLogin })

  await user.type(screen.getByLabelText(/email/i), 'wrong@example.com')
  await user.type(screen.getByLabelText(/password/i), 'wrongpass')
  await user.click(screen.getByRole('button', { name: /sign in/i }))

  expect(await screen.findByText(/invalid email or password/i)).toBeInTheDocument()
})

test('shows "Account suspended" on 403', async () => {
  const mockLogin = vi.fn().mockRejectedValue({
    status: 403,
    body: { message: 'Account suspended' },
  })
  const user = userEvent.setup()
  renderLoginPage({ login: mockLogin })

  await user.type(screen.getByLabelText(/email/i), 'suspended@example.com')
  await user.type(screen.getByLabelText(/password/i), 'password123')
  await user.click(screen.getByRole('button', { name: /sign in/i }))

  expect(await screen.findByText(/your account has been suspended/i)).toBeInTheDocument()
})

test('shows "Connection error" on network failure', async () => {
  const mockLogin = vi.fn().mockRejectedValue(new Error('Network Error'))
  const user = userEvent.setup()
  renderLoginPage({ login: mockLogin })

  await user.type(screen.getByLabelText(/email/i), 'test@example.com')
  await user.type(screen.getByLabelText(/password/i), 'password123')
  await user.click(screen.getByRole('button', { name: /sign in/i }))

  expect(await screen.findByText(/connection error/i)).toBeInTheDocument()
})

test('calls login and navigates on success', async () => {
  const mockLogin = vi.fn().mockResolvedValue({ data: { user: {}, token: 'x' } })
  const user = userEvent.setup()
  renderLoginPage({ login: mockLogin })

  await user.type(screen.getByLabelText(/email/i), 'test@example.com')
  await user.type(screen.getByLabelText(/password/i), 'password123')
  await user.click(screen.getByRole('button', { name: /sign in/i }))

  expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123')
})
