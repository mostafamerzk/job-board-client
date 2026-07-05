# Ragab — Auth + Public Jobs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Auth (Login/Register) and Public Jobs (Job List/Detail) modules with full TDD

**Architecture:** Feature-sliced within `src/features/auth/` and `src/features/publicJobs/`. Existing infra (AuthContext, apiClient, useAuth, AppRouter) already built. Placeholder pages to be replaced with full implementations.

**Tech Stack:** React 19, React Bootstrap, Bootstrap 5, Lucide React, Vitest + React Testing Library + MSW

**Backend:** Laravel API at http://localhost:8000/api/v1 (MySQL currently down — use MSW for tests, fixtures for dev)

## Global Constraints

- Bootstrap imports kept local to the component using them
- No cross-feature folder imports (auth/ → auth only, publicJobs/ → publicJobs only)
- Commit messages: `feat(auth):` or `feat(publicJobs):` prefix
- Build must pass: `npm run build`
- All code written TDD: failing test → minimal implementation → passing test
- Test files in `src/features/<module>/__tests__/`

---

### Task 0.0: Install test tooling

**Files:**
- Modify: `package.json`
- Create: `vitest.config.js`
- Create: `src/test/setup.js`
- Create: `.env`

- [x] **Step 0.0.1: Install Vitest + Testing Library + jsdom + MSW**

Run:
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom msw
```

- [x] **Step 0.0.2: Create vitest.config.js**

```js
/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
    css: true,
  },
})
```

- [x] **Step 0.0.3: Create test setup**

```js
// src/test/setup.js
import '@testing-library/jest-dom'
```

- [x] **Step 0.0.4: Add test script to package.json**

```json
"scripts": {
  "test": "vitest run",
  "test:watch": "vitest"
}
```

- [x] **Step 0.0.5: Create .env for backend URL**

```
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

- [x] **Step 0.0.6: Verify test infra works**

Run: `npm test`
Expected: "No test files found" or similar (no tests yet)

---

### Task 0.1: Create auth fixtures and test utilities

**Files:**
- Create: `src/features/auth/data/authFixtures.js`
- Create: `src/features/auth/data/mockHandlers.js`

- [x] **Step 0.1.1: Create auth fixture data**

```js
// src/features/auth/data/authFixtures.js
export const mockUser = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  role: 'candidate',
  phone: null,
  avatar_url: null,
  is_active: true,
  created_at: '2026-01-01T00:00:00.000000Z',
}

export const mockLoginResponse = {
  data: { user: mockUser, token: 'fake-jwt-token' },
  message: 'Logged in successfully',
}

export const mockRegisterResponse = {
  data: { user: mockUser, token: 'fake-jwt-token' },
  message: 'Registered successfully',
}
```

- [x] **Step 0.1.2: Create MSW handlers for auth**

```js
// src/features/auth/data/mockHandlers.js
import { http, HttpResponse } from 'msw'
import { mockLoginResponse, mockRegisterResponse } from './authFixtures.js'

export const authHandlers = [
  http.post('*/api/v1/login', async ({ request }) => {
    const body = await request.json()
    if (body.email === 'test@example.com' && body.password === 'password123') {
      return HttpResponse.json(mockLoginResponse)
    }
    if (body.email === 'suspended@example.com') {
      return HttpResponse.json({ message: 'Account suspended' }, { status: 403 })
    }
    return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 })
  }),

  http.post('*/api/v1/register', async ({ request }) => {
    const body = await request.json()
    if (body.email === 'existing@example.com') {
      return HttpResponse.json(
        { errors: { email: ['The email has already been taken.'] } },
        { status: 422 }
      )
    }
    return HttpResponse.json(mockRegisterResponse)
  }),

  http.post('*/api/v1/logout', () => {
    return HttpResponse.json({ message: 'Logged out successfully' })
  }),
]
```

---

### Task 1.0: LoginPage — validation errors (RED)

**Files:**
- Create: `src/features/auth/__tests__/LoginPage.test.jsx`

- [x] **Step 1.0.1: Write test — empty email shows error**

```jsx
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
```

- [x] **Step 1.0.2: Run test to confirm FAIL**

Run: `npx vitest run src/features/auth/__tests__/LoginPage.test.jsx`
Expected: FAIL — form fields don't exist yet

---

### Task 1.1: LoginPage — implement form + email validation (GREEN)

**Files:**
- Modify: `src/features/auth/pages/LoginPage.jsx`

- [x] **Step 1.1.1: Implement LoginPage form with validation**

```jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Container from 'react-bootstrap/Container'
import Card from 'react-bootstrap/Card'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Alert from 'react-bootstrap/Alert'
import Spinner from 'react-bootstrap/Spinner'
import { useAuth } from '../../../hooks/useAuth.js'

export function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  if (isAuthenticated) {
    navigate('/', { replace: true })
    return null
  }

  function validate() {
    const errs = {}
    if (!email.trim()) errs.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Invalid email format'
    if (!password) errs.password = 'Password is required'
    else if (password.length < 8) errs.password = 'Password must be at least 8 characters'
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setServerError('')
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setIsLoading(true)
    try {
      await login(email, password)
      navigate('/', { replace: true })
    } catch (err) {
      if (err.status === 401) {
        setServerError('Invalid email or password')
      } else if (err.status === 403) {
        setServerError('Your account has been suspended')
      } else {
        setServerError('Connection error. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Container className="py-5">
      <Card className="mx-auto" style={{ maxWidth: 440 }}>
        <Card.Body className="p-4">
          <Card.Title className="mb-3">Sign in</Card.Title>

          {serverError && (
            <Alert variant="danger" dismissible onClose={() => setServerError('')}>
              {serverError}
            </Alert>
          )}

          <Form noValidate onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="login-email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                isInvalid={!!errors.email}
                aria-describedby={errors.email ? 'login-email-error' : undefined}
                disabled={isLoading}
              />
              <Form.Control.Feedback type="invalid" id="login-email-error">
                {errors.email}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="login-password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                isInvalid={!!errors.password}
                aria-describedby={errors.password ? 'login-password-error' : undefined}
                disabled={isLoading}
              />
              <Form.Control.Feedback type="invalid" id="login-password-error">
                {errors.password}
              </Form.Control.Feedback>
            </Form.Group>

            <Button
              type="submit"
              className="w-100 mb-3"
              disabled={isLoading}
              aria-busy={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </Form>

          <p className="text-center mb-0">
            Don&apos;t have an account? <Link to="/register">Register</Link>
          </p>
        </Card.Body>
      </Card>
    </Container>
  )
}
```

- [x] **Step 1.1.2: Run test to confirm PASS**

Run: `npx vitest run src/features/auth/__tests__/LoginPage.test.jsx`
Expected: PASS

---

### Task 1.2: LoginPage — test API error states (TDD)

**Files:**
- Modify: `src/features/auth/__tests__/LoginPage.test.jsx`

- [x] **Step 1.2.1: Write tests — 401, 403, network error, successful login**

Add these tests:

```jsx
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
```

- [x] **Step 1.2.2: Run tests — confirm FAIL (expected)**

Run: `npx vitest run src/features/auth/__tests__/LoginPage.test.jsx`
Expected: Some tests fail

- [x] **Step 1.2.3: Implement the error handling in LoginPage**

(Already done in Task 1.1.1 — the implementation covers all states)

- [x] **Step 1.2.4: Run tests — confirm PASS**

Run: `npx vitest run src/features/auth/__tests__/LoginPage.test.jsx`
Expected: All tests pass

---

### Task 2.0: RegisterPage — validation tests + implementation

**Files:**
- Create: `src/features/auth/__tests__/RegisterPage.test.jsx`
- Modify: `src/features/auth/pages/RegisterPage.jsx`

- [x] **Step 2.0.1: Write test — validation errors**

```jsx
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
```

- [x] **Step 2.0.2: Run test — confirm FAIL**

Run: `npx vitest run src/features/auth/__tests__/RegisterPage.test.jsx`
Expected: FAIL

- [x] **Step 2.0.3: Implement RegisterPage**

```jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Container from 'react-bootstrap/Container'
import Card from 'react-bootstrap/Card'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Alert from 'react-bootstrap/Alert'
import Spinner from 'react-bootstrap/Spinner'
import { useAuth } from '../../../hooks/useAuth.js'

export function RegisterPage() {
  const { register, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [role, setRole] = useState('candidate')
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  if (isAuthenticated) {
    navigate('/', { replace: true })
    return null
  }

  function validate() {
    const errs = {}
    if (!name.trim()) errs.name = 'Name is required'
    if (!email.trim()) errs.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Invalid email format'
    if (!password) errs.password = 'Password is required'
    else if (password.length < 8) errs.password = 'Password must be at least 8 characters'
    if (password !== passwordConfirmation) errs.passwordConfirmation = 'Passwords do not match'
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setServerError('')
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setIsLoading(true)
    try {
      await register(name, email, password, passwordConfirmation, role)
      navigate('/', { replace: true })
    } catch (err) {
      if (err.status === 422 && err.body?.errors) {
        const fieldErrors = {}
        for (const [field, msgs] of Object.entries(err.body.errors)) {
          fieldErrors[field] = msgs.join(', ')
        }
        setErrors((prev) => ({ ...prev, ...fieldErrors }))
      } else {
        setServerError('Connection error. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Container className="py-5">
      <Card className="mx-auto" style={{ maxWidth: 440 }}>
        <Card.Body className="p-4">
          <Card.Title className="mb-3">Create account</Card.Title>

          {serverError && (
            <Alert variant="danger" dismissible onClose={() => setServerError('')}>
              {serverError}
            </Alert>
          )}

          <Form noValidate onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="register-name">
              <Form.Label>Name</Form.Label>
              <Form.Control
                value={name}
                onChange={(e) => setName(e.target.value)}
                isInvalid={!!errors.name}
                disabled={isLoading}
              />
              <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="register-email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                isInvalid={!!errors.email}
                disabled={isLoading}
              />
              <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="register-password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                isInvalid={!!errors.password}
                disabled={isLoading}
              />
              <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="register-password-confirm">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                isInvalid={!!errors.passwordConfirmation}
                disabled={isLoading}
              />
              <Form.Control.Feedback type="invalid">{errors.passwordConfirmation}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="register-role">
              <Form.Label>I want to</Form.Label>
              <Form.Select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={isLoading}
              >
                <option value="candidate">Find a job</option>
                <option value="employer">Hire talent</option>
              </Form.Select>
            </Form.Group>

            <Button
              type="submit"
              className="w-100 mb-3"
              disabled={isLoading}
              aria-busy={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </Button>
          </Form>

          <p className="text-center mb-0">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </Card.Body>
      </Card>
    </Container>
  )
}
```

- [x] **Step 2.0.4: Run test — confirm PASS**

Run: `npx vitest run src/features/auth/__tests__/RegisterPage.test.jsx`
Expected: PASS

---

### Task 2.1: RegisterPage — API error + success tests

**Files:**
- Modify: `src/features/auth/__tests__/RegisterPage.test.jsx`

- [x] **Step 2.1.1: Write tests for API 422 and success**

```jsx
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
```

- [x] **Step 2.1.2: Run tests — confirm all PASS**

Run: `npx vitest run src/features/auth/__tests__/RegisterPage.test.jsx`
Expected: ALL PASS

---

### Task 3.0: Public Jobs fixtures and test setup

**Files:**
- Create: `src/features/publicJobs/data/jobFixtures.js`
- Create: `src/features/publicJobs/data/mockHandlers.js`

- [x] **Step 3.0.1: Create job fixtures**

```js
// src/features/publicJobs/data/jobFixtures.js
export const mockJobs = [
  {
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
  },
  {
    id: 2,
    title: 'React Frontend Developer',
    slug: 'react-frontend-developer',
    description: 'Build stunning UIs with React.',
    salary_min: 70000,
    salary_max: 100000,
    salary_currency: 'USD',
    location: 'San Francisco',
    work_type: 'hybrid',
    experience_level: 'mid',
    created_at: '2026-06-28T00:00:00.000000Z',
    employer: { company_name: 'Startup Inc', logo_url: null, location: 'San Francisco' },
    category: { id: 2, name: 'Frontend' },
    technologies: [{ id: 3, name: 'React' }, { id: 4, name: 'TypeScript' }],
  },
  {
    id: 3,
    title: 'DevOps Engineer',
    slug: 'devops-engineer',
    description: 'Manage cloud infrastructure.',
    salary_min: 90000,
    salary_max: 130000,
    salary_currency: 'USD',
    location: 'Remote',
    work_type: 'remote',
    experience_level: 'senior',
    created_at: '2026-06-25T00:00:00.000000Z',
    employer: { company_name: 'Cloud Co', logo_url: null, location: 'Remote' },
    category: { id: 3, name: 'DevOps' },
    technologies: [{ id: 5, name: 'AWS' }, { id: 6, name: 'Docker' }],
  },
]

export const mockJobDetail = {
  ...mockJobs[0],
  responsibilities: 'Design and build RESTful APIs\nWrite tests\nCode review',
  requirements: '5+ years PHP\n3+ years Laravel\nMySQL expertise',
  benefits: 'Remote work\nHealth insurance\nStock options',
  application_deadline: '2026-08-01',
  employer: { ...mockJobs[0].employer, company_description: 'Leading tech company', website: 'https://techcorp.com' },
  comments_count: 3,
}

export const mockCategories = [
  { id: 1, name: 'Backend', slug: 'backend', jobs_count: 5 },
  { id: 2, name: 'Frontend', slug: 'frontend', jobs_count: 3 },
  { id: 3, name: 'DevOps', slug: 'devops', jobs_count: 2 },
]

export const mockTechnologies = [
  { id: 1, name: 'Laravel', slug: 'laravel' },
  { id: 2, name: 'PHP', slug: 'php' },
  { id: 3, name: 'React', slug: 'react' },
  { id: 4, name: 'TypeScript', slug: 'typescript' },
  { id: 5, name: 'AWS', slug: 'aws' },
  { id: 6, name: 'Docker', slug: 'docker' },
]
```

- [x] **Step 3.0.2: Create MSW handlers for public jobs**

```js
// src/features/publicJobs/data/mockHandlers.js
import { http, HttpResponse } from 'msw'
import { mockJobs, mockJobDetail, mockCategories, mockTechnologies } from './jobFixtures.js'

export const publicJobsHandlers = [
  http.get('*/api/v1/jobs', ({ request }) => {
    const url = new URL(request.url)
    const keyword = url.searchParams.get('keyword') || ''
    const filtered = keyword
      ? mockJobs.filter((j) =>
          j.title.toLowerCase().includes(keyword.toLowerCase())
        )
      : mockJobs
    return HttpResponse.json({
      data: filtered,
      meta: { current_page: 1, last_page: 1, per_page: 20, total: filtered.length },
    })
  }),

  http.get('*/api/v1/jobs/:id', ({ params }) => {
    const job = mockJobs.find((j) => j.id === Number(params.id))
    if (!job) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    return HttpResponse.json({ data: { ...mockJobDetail, ...job } })
  }),

  http.get('*/api/v1/categories', () => {
    return HttpResponse.json({ data: mockCategories })
  }),

  http.get('*/api/v1/technologies', () => {
    return HttpResponse.json({ data: mockTechnologies })
  }),
]
```

- [x] **Step 3.0.3: Register MSW handlers in test setup**

```js
// src/test/setup.js
import '@testing-library/jest-dom'
import { setupServer } from 'msw/node'
import { authHandlers } from '../features/auth/data/mockHandlers.js'
import { publicJobsHandlers } from '../features/publicJobs/data/mockHandlers.js'

export const server = setupServer(...authHandlers, ...publicJobsHandlers)

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

---

### Task 3.1: JobCard component (TDD)

**Files:**
- Create: `src/features/publicJobs/components/JobCard.jsx`
- Create: `src/features/publicJobs/__tests__/JobCard.test.jsx`
- Create: `src/features/publicJobs/__tests__/JobListPage.test.jsx`

- [x] **Step 3.1.1: Write JobCard test**

```jsx
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { JobCard } from '../components/JobCard.jsx'
import { mockJobs } from '../data/jobFixtures.js'

test('renders job title, company, location, salary, and technologies', () => {
  render(
    <BrowserRouter>
      <JobCard job={mockJobs[0]} />
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
      <JobCard job={mockJobs[0]} />
    </BrowserRouter>
  )

  // createdAt is July 1, so should show relative time
  expect(screen.getByText(/ago/i)).toBeInTheDocument()
})

test('links to job detail page', () => {
  render(
    <BrowserRouter>
      <JobCard job={mockJobs[0]} />
    </BrowserRouter>
  )

  const link = screen.getByRole('link', { name: /senior laravel developer/i })
  expect(link).toHaveAttribute('href', '/jobs/1')
})
```

- [x] **Step 3.1.2: Run test — confirm FAIL**

Run: `npx vitest run src/features/publicJobs/__tests__/JobCard.test.jsx`
Expected: FAIL

- [x] **Step 3.1.3: Implement JobCard**

```jsx
import { Link } from 'react-router-dom'
import Card from 'react-bootstrap/Card'
import Badge from 'react-bootstrap/Badge'

function formatSalary(min, max, currency) {
  const fmt = (n) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 0,
    }).format(n)
  return `${fmt(min)} - ${fmt(max)}`
}

function relativeDate(dateStr) {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now - date
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 30) return `${diffDays} days ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}

export function JobCard({ job }) {
  return (
    <Card
      as={Link}
      to={`/jobs/${job.id}`}
      className="text-decoration-none h-100 job-card"
      role="link"
    >
      <Card.Body className="d-flex flex-column">
        <Card.Title className="h6 mb-1">{job.title}</Card.Title>
        <p className="text-muted small mb-2">{job.employer.company_name}</p>

        <div className="d-flex flex-wrap gap-2 mb-2 small">
          <span className="text-muted">{job.location}</span>
          <span className="text-muted">{formatSalary(job.salary_min, job.salary_max, job.salary_currency)}</span>
          <Badge bg="light" text="dark" className="text-capitalize">
            {job.work_type}
          </Badge>
        </div>

        <div className="d-flex flex-wrap gap-1 mt-auto">
          {job.technologies.map((tech) => (
            <Badge key={tech.id} bg="secondary" pill>
              {tech.name}
            </Badge>
          ))}
        </div>

        <small className="text-muted mt-2">{relativeDate(job.created_at)}</small>
      </Card.Body>
    </Card>
  )
}
```

- [x] **Step 3.1.4: Run test — confirm PASS**

Run: `npx vitest run src/features/publicJobs/__tests__/JobCard.test.jsx`
Expected: PASS

---

### Task 3.2: JobListPage — loading + empty + error + results (TDD)

**Files:**
- Modify: `src/features/publicJobs/pages/JobListPage.jsx`

- [x] **Step 3.2.1: Write JobListPage tests**

```jsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { JobListPage } from '../pages/JobListPage.jsx'

function renderJobListPage() {
  return render(
    <BrowserRouter>
      <JobListPage />
    </BrowserRouter>
  )
}

test('shows skeleton loading state initially', () => {
  renderJobListPage()
  const skeletons = document.querySelectorAll('.placeholder-glow')
  expect(skeletons.length).toBeGreaterThan(0)
})

test('renders job cards after loading', async () => {
  renderJobListPage()
  await waitFor(() => {
    expect(screen.getByText('Senior Laravel Developer')).toBeInTheDocument()
  })
  expect(screen.getByText('React Frontend Developer')).toBeInTheDocument()
})

test('shows empty state when no jobs match filters', async () => {
  renderJobListPage()
  await waitFor(() => {
    expect(screen.getByText(/no jobs found/i)).toBeInTheDocument()
  })
})

test('shows retry button on API error', async () => {
  renderJobListPage()
  await waitFor(() => {
    expect(screen.getByText(/unable to load jobs/i)).toBeInTheDocument()
  })
})
```

- [x] **Step 3.2.2: Run test — confirm FAIL**

Run: `npx vitest run src/features/publicJobs/__tests__/JobListPage.test.jsx`
Expected: FAIL

- [x] **Step 3.2.3: Implement JobListPage**

```jsx
import { useState, useEffect } from 'react'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Alert from 'react-bootstrap/Alert'
import Button from 'react-bootstrap/Button'
import { apiClient } from '../../../lib/apiClient.js'
import { JobCard } from '../components/JobCard.jsx'
import { SearchFilters } from '../components/SearchFilters.jsx'
import { Pagination } from '../components/Pagination.jsx'

export function JobListPage() {
  const [jobs, setJobs] = useState([])
  const [meta, setMeta] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    keyword: '',
    category_id: '',
    work_type: '',
    experience_level: '',
    location: '',
  })
  const [currentPage, setCurrentPage] = useState(1)

  async function fetchJobs(page = 1) {
    setIsLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.set('per_page', '20')
      if (filters.keyword) params.set('keyword', filters.keyword)
      if (filters.category_id) params.set('category_id', filters.category_id)
      if (filters.work_type) params.set('work_type', filters.work_type)
      if (filters.experience_level) params.set('experience_level', filters.experience_level)
      if (filters.location) params.set('location', filters.location)
      if (page > 1) params.set('page', String(page))

      const res = await apiClient.get(`/jobs?${params.toString()}`)
      setJobs(res.data || [])
      setMeta(res.meta || null)
      setCurrentPage(page)
    } catch (err) {
      setError('Unable to load jobs. Please try again.')
      setJobs([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs(1)
  }, [filters])

  function handlePageChange(page) {
    fetchJobs(page)
  }

  function handleFilterChange(newFilters) {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }

  return (
    <Container className="py-4">
      <h1 className="mb-4">Find your next role</h1>

      <SearchFilters
        onFilterChange={handleFilterChange}
        initialFilters={filters}
      />

      {error && (
        <Alert variant="danger" className="mt-3">
          <p className="mb-2">{error}</p>
          <Button variant="outline-danger" size="sm" onClick={() => fetchJobs(currentPage)}>
            Retry
          </Button>
        </Alert>
      )}

      {isLoading ? (
        <Row className="mt-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Col md={6} lg={4} key={i} className="mb-3">
              <div className="card placeholder-glow" aria-hidden="true">
                <div className="card-body">
                  <span className="placeholder col-8 mb-2" />
                  <span className="placeholder col-4 mb-2" />
                  <span className="placeholder col-6" />
                </div>
              </div>
            </Col>
          ))}
        </Row>
      ) : jobs.length === 0 ? (
        <div className="text-center py-5 mt-3">
          <h4 className="text-muted">No jobs found</h4>
          <p className="text-muted">Try adjusting your filters or keywords</p>
        </div>
      ) : (
        <>
          <Row className="mt-3">
            {jobs.map((job) => (
              <Col md={6} lg={4} key={job.id} className="mb-3">
                <JobCard job={job} />
              </Col>
            ))}
          </Row>

          {meta && meta.last_page > 1 && (
            <Pagination
              currentPage={meta.current_page}
              lastPage={meta.last_page}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </Container>
  )
}
```

- [x] **Step 3.2.4: Run test — check status**

Run: `npx vitest run src/features/publicJobs/__tests__/JobListPage.test.jsx`
Expected: Some pass (implementation depends on SearchFilters + Pagination being stubs)

---

### Task 3.3: SearchFilters component (TDD)

**Files:**
- Create: `src/features/publicJobs/components/SearchFilters.jsx`
- Create: `src/features/publicJobs/__tests__/SearchFilters.test.jsx`

- [x] **Step 3.3.1: Write SearchFilters test**

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchFilters } from '../components/SearchFilters.jsx'

test('renders keyword search input', () => {
  render(<SearchFilters onFilterChange={vi.fn()} initialFilters={{}} />)
  expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument()
})

test('calls onFilterChange after debounced input', async () => {
  vi.useFakeTimers()
  const onChange = vi.fn()
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
  render(<SearchFilters onFilterChange={onChange} initialFilters={{}} />)

  await user.type(screen.getByPlaceholderText(/search/i), 'laravel')
  vi.advanceTimersByTime(300)

  expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ keyword: 'laravel' }))
  vi.useRealTimers()
})
```

- [x] **Step 3.3.2: Run test — confirm FAIL**

Run: `npx vitest run src/features/publicJobs/__tests__/SearchFilters.test.jsx`
Expected: FAIL

- [x] **Step 3.3.3: Implement SearchFilters**

```jsx
import { useState, useEffect, useRef, useCallback } from 'react'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import InputGroup from 'react-bootstrap/InputGroup'
import { Search } from 'lucide-react'

export function SearchFilters({ onFilterChange, initialFilters = {} }) {
  const [keyword, setKeyword] = useState(initialFilters.keyword || '')
  const [workType, setWorkType] = useState(initialFilters.work_type || '')
  const [experienceLevel, setExperienceLevel] = useState(initialFilters.experience_level || '')
  const [location, setLocation] = useState(initialFilters.location || '')
  const timerRef = useRef(null)

  const debouncedNotify = useCallback(
    (updates) => {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        onFilterChange(updates)
      }, 300)
    },
    [onFilterChange]
  )

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  function handleKeywordChange(e) {
    const val = e.target.value
    setKeyword(val)
    debouncedNotify({ keyword: val })
  }

  function handleWorkTypeChange(e) {
    const val = e.target.value
    setWorkType(val)
    onFilterChange({ work_type: val })
  }

  function handleExperienceChange(e) {
    const val = e.target.value
    setExperienceLevel(val)
    onFilterChange({ experience_level: val })
  }

  function handleLocationChange(e) {
    const val = e.target.value
    setLocation(val)
    debouncedNotify({ location: val })
  }

  return (
    <div className="search-filters">
      <Row className="g-2 mb-3">
        <Col md={4}>
          <InputGroup>
            <InputGroup.Text>
              <Search size={16} />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search jobs..."
              value={keyword}
              onChange={handleKeywordChange}
              aria-label="Search jobs"
            />
          </InputGroup>
        </Col>
        <Col md={2}>
          <Form.Select
            value={workType}
            onChange={handleWorkTypeChange}
            aria-label="Work type"
          >
            <option value="">All types</option>
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
            <option value="onsite">On-site</option>
          </Form.Select>
        </Col>
        <Col md={2}>
          <Form.Select
            value={experienceLevel}
            onChange={handleExperienceChange}
            aria-label="Experience level"
          >
            <option value="">All levels</option>
            <option value="entry">Entry</option>
            <option value="mid">Mid</option>
            <option value="senior">Senior</option>
          </Form.Select>
        </Col>
        <Col md={2}>
          <Form.Control
            type="text"
            placeholder="Location"
            value={location}
            onChange={handleLocationChange}
            aria-label="Location"
          />
        </Col>
      </Row>
    </div>
  )
}
```

- [x] **Step 3.3.4: Run test — confirm PASS**

Run: `npx vitest run src/features/publicJobs/__tests__/SearchFilters.test.jsx`
Expected: PASS

---

### Task 3.4: Pagination component (TDD)

**Files:**
- Create: `src/features/publicJobs/components/Pagination.jsx`
- Create: `src/features/publicJobs/__tests__/Pagination.test.jsx`

- [x] **Step 3.4.1: Write Pagination test**

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Pagination } from '../components/Pagination.jsx'

test('renders page numbers and prev/next buttons', () => {
  render(<Pagination currentPage={1} lastPage={5} onPageChange={vi.fn()} />)
  expect(screen.getByText('1')).toBeInTheDocument()
  expect(screen.getByText('5')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled()
  expect(screen.getByRole('button', { name: /next/i })).not.toBeDisabled()
})

test('calls onPageChange with clicked page number', async () => {
  const onChange = vi.fn()
  const user = userEvent.setup()
  render(<Pagination currentPage={1} lastPage={5} onPageChange={onChange} />)

  await user.click(screen.getByText('2'))
  expect(onChange).toHaveBeenCalledWith(2)
})

test('disables next on last page', () => {
  render(<Pagination currentPage={5} lastPage={5} onPageChange={vi.fn()} />)
  expect(screen.getByRole('button', { name: /next/i })).toBeDisabled()
})
```

- [x] **Step 3.4.2: Run test — confirm FAIL**

Run: `npx vitest run src/features/publicJobs/__tests__/Pagination.test.jsx`
Expected: FAIL

- [x] **Step 3.4.3: Implement Pagination**

```jsx
import Pag from 'react-bootstrap/Pagination'

export function Pagination({ currentPage, lastPage, onPageChange }) {
  function getPageNumbers() {
    const pages = []
    const maxVisible = 5
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
    const end = Math.min(lastPage, start + maxVisible - 1)
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1)
    }
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    if (start > 1) {
      pages.unshift('...')
      pages.unshift(1)
    }
    if (end < lastPage) {
      pages.push('...')
      pages.push(lastPage)
    }
    return pages
  }

  const pages = getPageNumbers()

  return (
    <nav aria-label="Job list pagination">
      <Pag className="justify-content-center mt-4">
        <Pag.Prev
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        />
        {pages.map((page, idx) =>
          page === '...' ? (
            <Pag.Ellipsis key={`ellipsis-${idx}`} disabled />
          ) : (
            <Pag.Item
              key={page}
              active={page === currentPage}
              onClick={() => onPageChange(page)}
            >
              {page}
            </Pag.Item>
          )
        )}
        <Pag.Next
          disabled={currentPage === lastPage}
          onClick={() => onPageChange(currentPage + 1)}
        />
      </Pag>
    </nav>
  )
}
```

- [x] **Step 3.4.4: Run test — confirm PASS**

Run: `npx vitest run src/features/publicJobs/__tests__/Pagination.test.jsx`
Expected: PASS

---

### Task 3.5: JobDetailPage (TDD)

**Files:**
- Create: `src/features/publicJobs/__tests__/JobDetailPage.test.jsx`
- Modify: `src/features/publicJobs/pages/JobDetailPage.jsx`

- [x] **Step 3.5.1: Write JobDetailPage tests**

```jsx
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { JobDetailPage } from '../pages/JobDetailPage.jsx'

function renderJobDetailPage(jobId = '1') {
  return render(
    <MemoryRouter initialEntries={[`/jobs/${jobId}`]}>
      <Routes>
        <Route path="/jobs/:id" element={<JobDetailPage />} />
      </Routes>
    </MemoryRouter>
  )
}

test('shows loading state initially', () => {
  renderJobDetailPage()
  expect(screen.getByText(/loading/i)).toBeInTheDocument()
})

test('renders job detail after loading', async () => {
  renderJobDetailPage('1')
  await waitFor(() => {
    expect(screen.getByText('Senior Laravel Developer')).toBeInTheDocument()
  })
  expect(screen.getByText(/build amazing apis/i)).toBeInTheDocument()
  expect(screen.getByText(/remote/i)).toBeInTheDocument()
  expect(screen.getByText(/apply now/i)).toBeInTheDocument()
})

test('shows not found message for invalid job id', async () => {
  renderJobDetailPage('999')
  await waitFor(() => {
    expect(screen.getByText(/no longer available/i)).toBeInTheDocument()
  })
  expect(screen.getByRole('link', { name: /back to jobs/i })).toBeInTheDocument()
})
```

- [x] **Step 3.5.2: Run test — confirm FAIL**

Run: `npx vitest run src/features/publicJobs/__tests__/JobDetailPage.test.jsx`
Expected: FAIL

- [x] **Step 3.5.3: Implement JobDetailPage**

```jsx
import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card'
import Badge from 'react-bootstrap/Badge'
import Button from 'react-bootstrap/Button'
import Alert from 'react-bootstrap/Alert'
import Spinner from 'react-bootstrap/Spinner'
import { apiClient } from '../../../lib/apiClient.js'
import { useAuth } from '../../../hooks/useAuth.js'

function formatSalary(min, max, currency) {
  const fmt = (n) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 0,
    }).format(n)
  return `${fmt(min)} - ${fmt(max)}`
}

export function JobDetailPage() {
  const { id } = useParams()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [job, setJob] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchJob() {
      setIsLoading(true)
      setError(null)
      setNotFound(false)
      try {
        const res = await apiClient.get(`/jobs/${id}`)
        setJob(res.data)
      } catch (err) {
        if (err.status === 404) {
          setNotFound(true)
        } else {
          setError('Unable to load job details. Please try again.')
        }
      } finally {
        setIsLoading(false)
      }
    }
    fetchJob()
  }, [id])

  if (isLoading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    )
  }

  if (notFound) {
    return (
      <Container className="py-5 text-center">
        <h3>This job listing is no longer available</h3>
        <p className="text-muted">It may have been filled or removed.</p>
        <Link to="/jobs">Back to job listings</Link>
      </Container>
    )
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <p className="mb-2">{error}</p>
          <Button variant="outline-danger" size="sm" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </Alert>
      </Container>
    )
  }

  if (!job) return null

  function handleApply() {
    if (isAuthenticated) {
      navigate(`/candidate/apply?job=${job.id}`)
    } else {
      navigate('/register')
    }
  }

  return (
    <Container className="py-4">
      <Link to="/jobs" className="mb-3 d-inline-block">&larr; Back to jobs</Link>

      <Row>
        <Col lg={8}>
          <Card className="mb-4">
            <Card.Body>
              <h2 className="mb-1">{job.title}</h2>
              <p className="text-muted mb-3">{job.employer?.company_name}</p>

              <div className="d-flex flex-wrap gap-2 mb-3">
                <Badge bg="light" text="dark" className="text-capitalize">{job.work_type}</Badge>
                <Badge bg="light" text="dark" className="text-capitalize">{job.experience_level}</Badge>
                <Badge bg="light" text="dark">{job.location}</Badge>
              </div>

              <h5>Description</h5>
              <p className="mb-4">{job.description}</p>

              {job.responsibilities && (
                <>
                  <h5>Responsibilities</h5>
                  <p className="mb-4">{job.responsibilities}</p>
                </>
              )}

              {job.requirements && (
                <>
                  <h5>Requirements</h5>
                  <p className="mb-4">{job.requirements}</p>
                </>
              )}

              {job.benefits && (
                <>
                  <h5>Benefits</h5>
                  <p className="mb-4">{job.benefits}</p>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="mb-4">
            <Card.Body>
              <h5>Salary</h5>
              <p className="mb-3">{formatSalary(job.salary_min, job.salary_max, job.salary_currency)}</p>

              <h5>Company</h5>
              {job.employer?.logo_url && (
                <img
                  src={job.employer.logo_url}
                  alt={job.employer.company_name}
                  className="img-fluid mb-2"
                  style={{ maxHeight: 60 }}
                />
              )}
              <p className="mb-1"><strong>{job.employer?.company_name}</strong></p>
              {job.employer?.company_description && (
                <p className="text-muted small">{job.employer.company_description}</p>
              )}
              {job.employer?.website && (
                <p className="mb-3">
                  <a href={job.employer.website} target="_blank" rel="noopener noreferrer">
                    Website
                  </a>
                </p>
              )}

              {job.application_deadline && (
                <>
                  <h5>Application Deadline</h5>
                  <p className="mb-3">{job.application_deadline}</p>
                </>
              )}

              <Button
                variant="primary"
                className="w-100"
                onClick={handleApply}
              >
                Apply now
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}
```

- [x] **Step 3.5.4: Run test — confirm PASS**

Run: `npx vitest run src/features/publicJobs/__tests__/JobDetailPage.test.jsx`
Expected: PASS

---

### Task 3.6: Categories/Technologies integration in filters

**Files:**
- Modify: `src/features/publicJobs/components/SearchFilters.jsx`
- Modify: `src/features/publicJobs/pages/JobListPage.jsx`

- [x] **Step 3.6.1: Write test — filters load categories**

(Tests will be added to SearchFilters.test.jsx)

```jsx
import { render, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '../../../test/setup.js'
import { SearchFilters } from '../components/SearchFilters.jsx'

test('loads and displays category dropdown', async () => {
  render(
    <SearchFilters
      onFilterChange={vi.fn()}
      initialFilters={{}}
      categories={[{ id: 1, name: 'Backend' }, { id: 2, name: 'Frontend' }]}
    />
  )
  expect(screen.getByText('Backend')).toBeInTheDocument()
  expect(screen.getByText('Frontend')).toBeInTheDocument()
})
```

- [x] **Step 3.6.2: Integrate categories into SearchFilters**

(Update SearchFilters component to accept and display categories prop)

- [x] **Step 3.6.3: Fetch categories in JobListPage**

(Update JobListPage to fetch categories and technologies on mount and pass to SearchFilters)

- [x] **Step 3.6.4: Run tests**

Run: `npx vitest run src/features/publicJobs/__tests__/`
Expected: ALL PASS

---

### Task 4.0: Final verification and commit

- [x] **Step 4.0.1: Run full test suite**

Run: `npm test`
Expected: All tests pass (0 failures)

- [x] **Step 4.0.2: Run build**

Run: `npm run build`
Expected: exit 0

- [x] **Step 4.0.3: Commit everything**

```bash
git add src/features/auth/ src/features/publicJobs/ src/test/ vitest.config.js package.json .env
git commit -m "feat(auth): implement login and register pages with full TDD

- LoginPage with validation, 401/403 error states, loading spinner
- RegisterPage with validation, 422 field errors, role selector
- JobCard component with salary format and relative dates
- JobListPage with loading skeleton, empty state, error retry
- JobDetailPage with loading, 404, error states and auth-aware CTA
- SearchFilters with debounced keyword search
- Pagination component with ellipsis support
- All tests written TDD - RED/GREEN/REFACTOR cycle
- MSW handlers for all public endpoints"
```
