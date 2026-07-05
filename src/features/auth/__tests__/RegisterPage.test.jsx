import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { AuthContext } from '../../../context/AuthContext.jsx'
import { RegisterPage } from '../pages/RegisterPage.jsx'

function renderRegisterPage(authValue = {}) {
  const defaultAuth = {
    register: vi.fn(),
    isAuthenticated: false,
    isLoading: false,
    ...authValue,
  }
  return render(
    <AuthContext.Provider value={defaultAuth}>
      <BrowserRouter>
        <RegisterPage />
      </BrowserRouter>
    </AuthContext.Provider>
  )
}

test('shows required field errors on empty submit', async () => {
  const user = userEvent.setup()
  renderRegisterPage()

  await user.click(screen.getByRole('button', { name: /create account/i }))

  expect(screen.getByText(/name is required/i)).toBeInTheDocument()
  expect(screen.getByText(/email is required/i)).toBeInTheDocument()
  expect(screen.getByText(/password is required/i)).toBeInTheDocument()
})

test('shows error when passwords do not match', async () => {
  const user = userEvent.setup()
  renderRegisterPage()

  await user.type(screen.getByLabelText(/^name/i), 'Test User')
  await user.type(screen.getByLabelText(/email/i), 'test@example.com')
  await user.type(screen.getByLabelText(/^password/i), 'password123')
  await user.type(screen.getByLabelText(/confirm password/i), 'different')
  await user.click(screen.getByRole('button', { name: /create account/i }))

  expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
})

test('shows field errors from API 422 response', async () => {
  const mockRegister = vi.fn().mockRejectedValue({
    status: 422,
    body: {
      message: 'Validation failed',
      errors: { email: ['The email has already been taken.'] },
    },
  })
  const user = userEvent.setup()
  renderRegisterPage({ register: mockRegister })

  await user.type(screen.getByLabelText(/^name/i), 'Test User')
  await user.type(screen.getByLabelText(/email/i), 'existing@example.com')
  await user.type(screen.getByLabelText(/^password/i), 'password123')
  await user.type(screen.getByLabelText(/confirm password/i), 'password123')
  await user.click(screen.getByRole('button', { name: /create account/i }))

  expect(await screen.findByText(/already been taken/i)).toBeInTheDocument()
})

test('calls register and navigates on success', async () => {
  const mockRegister = vi.fn().mockResolvedValue({ data: { user: {}, token: 'x' } })
  const user = userEvent.setup()
  renderRegisterPage({ register: mockRegister })

  await user.type(screen.getByLabelText(/^name/i), 'Test User')
  await user.type(screen.getByLabelText(/email/i), 'test@example.com')
  await user.type(screen.getByLabelText(/^password/i), 'password123')
  await user.type(screen.getByLabelText(/confirm password/i), 'password123')
  await user.click(screen.getByRole('button', { name: /create account/i }))

  expect(mockRegister).toHaveBeenCalledWith('Test User', 'test@example.com', 'password123', 'password123', 'candidate')
})
