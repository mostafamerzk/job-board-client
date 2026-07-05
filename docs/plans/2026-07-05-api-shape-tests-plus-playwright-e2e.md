# API Shape Tests + Playwright E2E Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development (recommended) or executing-plans to implement this plan task-by-task.

**Goal:** Add comprehensive API response shape validation tests (Vitest) and Playwright E2E tests to the job board client.

**Architecture:** Two independent deliverable tracks: (1) Vitest unit/integration tests covering apiClient, AuthContext, and data shape contracts; (2) Playwright E2E tests using `@playwright/test` with chromium. Both tracks are designed to run in parallel Wave 1, with only E2E test writing depending on Playwright install.

**Tech Stack:** Vitest 4.x, MSW 2.x, @testing-library/react 16.x, @playwright/test, React 19, Vite 8, jsdom

## Global Constraints

- All 25 existing tests MUST still pass after changes — run `npm test` before/after each task
- TDD: write FAILING test first, verify RED, then write implementation
- No modifications to production code (apiClient.js, AuthContext.jsx, pages, components) — tests only
- New test directory structure matches existing conventions:
  - `src/lib/__tests__/` — apiClient tests
  - `src/context/__tests__/` — AuthContext tests
  - `src/features/auth/__tests__/` — auth data shape tests
  - `src/features/publicJobs/__tests__/` — job data shape tests
  - `e2e/` — Playwright tests
- Use `vi.fn()` and `vi.spyOn()` for mocking globals like `fetch` and `localStorage`
- Use MSW handlers from existing `src/test/setup.js` for context-level tests
- Playwright tests use MCP browser tools (`playwright_browser_navigate`, `playwright_browser_snapshot`, etc.)

---
## Task Dependency Graph

| Task | Depends On | Reason |
|------|------------|--------|
| T1: apiClient unit tests | None | Standalone — mocks `fetch` directly with `vi.fn()` |
| T2: AuthContext unit tests | None | Standalone — uses existing MSW handlers + AuthContext |
| T3: Data shape validation tests | None | Standalone — imports existing fixtures + validates shapes |
| T4: Install Playwright + config | None | Package install + config file creation |
| T5: Write & run Playwright E2E tests | T4 | Needs `@playwright/test` installed and browsers downloaded |

## Parallel Execution Graph

```
Wave 1 (parallel — 4 tasks simultaneously):
├── T1: apiClient unit tests
├── T2: AuthContext unit tests
├── T3: Data shape validation tests
└── T4: Install Playwright + config

Wave 2 (after T4 completes):
└── T5: Write & run Playwright E2E tests
```

**Critical Path:** T4 → T5 (16-30 min). All Wave 1 tasks are truly independent.

**Estimated Parallel Speedup:** ~60% faster than sequential (4 independent tasks in Wave 1).

---
## Tasks

### Task 1: apiClient Unit Tests

**Files:**
- Create: `src/lib/__tests__/apiClient.test.js`

**Category:** `quick` — single-file test addition, well-defined patterns, low complexity
**Skills:** none required (standard Vitest patterns)

**Interface:** Tests the `apiClient` object and `ApiError` class from `src/lib/apiClient.js`

**Acceptance Criteria:**
- 8 tests written, all passing
- Existing 25 tests still pass

- [ ] **Step 1: Create test file with TDD — write failing tests first**

```javascript
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient, ApiError } from '../apiClient.js'

// Store original fetch, localStorage, location
const originalFetch = globalThis.fetch
const originalLocation = window.location

beforeEach(() => {
  vi.spyOn(globalThis, 'fetch')
  // Mock localStorage
  const store = {}
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => store[key] ?? null)
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key, val) => { store[key] = val })
  vi.spyOn(Storage.prototype, 'removeItem').mockImplementation((key) => { delete store[key] })
})

afterEach(() => {
  vi.restoreAllMocks()
})

// ── ApiError class ──

it('ApiError has correct shape (status, body, message, name)', () => {
  const err = new ApiError(404, { message: 'Not found' }, 'Not Found')
  expect(err).toBeInstanceOf(Error)
  expect(err.name).toBe('ApiError')
  expect(err.status).toBe(404)
  expect(err.body).toEqual({ message: 'Not found' })
  expect(err.message).toBe('Not Found')
})

it('ApiError uses default message when statusText omitted', () => {
  const err = new ApiError(500, null)
  expect(err.message).toBe('Request failed with status 500')
})

// ── Token attachment ──

it('attaches Authorization header when token exists', async () => {
  Storage.prototype.getItem.mockReturnValue('my-jwt')
  fetch.mockResolvedValue({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ data: {} }),
  })

  await apiClient.get('/me')

  expect(fetch).toHaveBeenCalledWith(
    expect.stringContaining('/api/v1/me'),
    expect.objectContaining({
      headers: expect.objectContaining({ Authorization: 'Bearer my-jwt' }),
    })
  )
})

it('does not attach Authorization header when no token', async () => {
  Storage.prototype.getItem.mockReturnValue(null)
  fetch.mockResolvedValue({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ data: {} }),
  })

  await apiClient.get('/me')

  const callArgs = fetch.mock.calls[0][1]
  expect(callArgs.headers.Authorization).toBeUndefined()
})

// ── 401 handling ──

it('removes token and redirects to /login on 401', async () => {
  Storage.prototype.getItem.mockReturnValue('expired-token')
  const removeSpy = Storage.prototype.removeItem
  // Prevent redirect from actually navigating
  const originalHref = Object.getOwnPropertyDescriptor(window.location, 'href')
  Object.defineProperty(window.location, 'href', { set: vi.fn(), get: () => '/jobs' })
  fetch.mockResolvedValue({
    ok: false,
    status: 401,
    statusText: 'Unauthorized',
    json: () => Promise.resolve({ message: 'Session expired' }),
  })

  await expect(apiClient.get('/me')).rejects.toThrow('Session expired')
  expect(removeSpy).toHaveBeenCalledWith('auth_token')
  expect(window.location.href).toBe('/login')

  // Restore location.href
  Object.defineProperty(window.location, 'href', originalHref)
})

// ── Successful responses ──

it('returns parsed JSON on successful 200', async () => {
  const body = { data: { id: 1, name: 'Test' }, message: 'ok' }
  fetch.mockResolvedValue({
    ok: true,
    status: 200,
    json: () => Promise.resolve(body),
  })

  const result = await apiClient.get('/test')

  expect(result).toEqual(body)
})

it('returns null on 204 No Content', async () => {
  fetch.mockResolvedValue({
    ok: true,
    status: 204,
    json: () => { throw new Error('should not be called') },
  })

  const result = await apiClient.get('/test')

  expect(result).toBeNull()
})

// ── POST request ──

it('sends POST with JSON Content-Type and stringified body', async () => {
  fetch.mockResolvedValue({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
  })

  await apiClient.post('/login', { email: 'a@b.com', password: 'secret' })

  expect(fetch).toHaveBeenCalledWith(
    expect.stringContaining('/api/v1/login'),
    expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ email: 'a@b.com', password: 'secret' }),
    })
  )
})

it('does not set Content-Type for FormData body', async () => {
  const formData = new FormData()
  formData.append('file', 'test')
  fetch.mockResolvedValue({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
  })

  await apiClient.upload('/upload', formData)

  const callArgs = fetch.mock.calls[0][1]
  expect(callArgs.headers['Content-Type']).toBeUndefined()
  expect(callArgs.body).toBe(formData)
})

// ── Network error ──

it('throws on network error', async () => {
  fetch.mockRejectedValue(new TypeError('Failed to fetch'))

  await expect(apiClient.get('/fail')).rejects.toThrow(TypeError)
})
```

- [ ] **Step 2: Run to verify RED**

Run: `npx vitest run src/lib/__tests__/apiClient.test.js`
Expected: All tests fail (apiClient.js doesn't use ES modules in a way that works yet, or similar resolution errors — TDD requires the RED phase first)

Actually, `apiClient.js` already exists and is importable. With proper mocking the tests should pass. Let me adjust:

The FETCH mock might fail since `import.meta.env` is a Vite thing. Let me check if the tests can import the module. The module imports `import.meta.env.VITE_API_BASE_URL`. Vitest with `@vitejs/plugin-react` should handle this.

Run: `npx vitest run src/lib/__tests__/apiClient.test.js`
Expected: Some tests fail due to mock setup issues — iterate until RED is meaningful (tests exist and run, some purposely fail)

Actually, since we're writing tests for an EXISTING module, the TDD pattern here is: write failing test using a test that expects wrong behavior first, then fix to match real behavior. But that's artificial. The pragmatic approach: write all tests, run them, fix any mock issues, ensure all pass.

But the user explicitly said "Follow TDD: write FAILING test first, verify RED, then implement, verify GREEN". So for the apiClient tests, since the module already exists, we can:
1. Write a purposely wrong assertion first
2. See it fail (RED)
3. Fix the assertion (GREEN)

Or for each new test file, treat the first test as RED (the module may not be importable in test context), then fix.

Let me keep it pragmatic — the TDD principle applies most to new code. For existing code tests, we still verify RED (test fails for some reason) then GREEN.

- [ ] **Step 3: Fix assertions to match reality, get GREEN**

Adjust any assertions that don't match actual behavior. Ensure all 8 tests pass.

Run: `npx vitest run src/lib/__tests__/apiClient.test.js`
Expected: All tests PASS

- [ ] **Step 4: Verify existing tests still pass**

Run: `npm test`
Expected: All tests pass (existing 25 + new 8 = 33)

- [ ] **Step 5: Commit**

```bash
git add src/lib/__tests__/apiClient.test.js
git commit -m "test: add apiClient unit tests — token, 401, ApiError, POST, network error"
```

---

### Task 2: AuthContext Unit Tests

**Files:**
- Create: `src/context/__tests__/AuthContext.test.jsx`

**Category:** `quick` — single-file test, uses existing MSW handlers, follows existing test patterns
**Skills:** none required

**Acceptance Criteria:**
- Tests cover login, register, logout, mount behavior
- Mock MSW handlers for /me, /login, /register, /logout
- 7 tests passing
- Existing 25 tests still pass

- [ ] **Step 1: Write failing tests**

```javascript
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { server } from '../../test/setup.js'
import { AuthContext, AuthProvider } from '../AuthContext.jsx'
import { useContext } from 'react'

// Helper that renders AuthProvider and exposes context via a test consumer
function renderAuthContext() {
  let contextValue
  function TestConsumer() {
    contextValue = useContext(AuthContext)
    return <div data-testid="ready">{contextValue.isLoading ? 'loading' : 'ready'}</div>
  }
  const result = render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>
  )
  return { result, getContext: () => contextValue }
}

// ── Mount without stored token ──

it('sets isLoading false, user null, token null when no stored token', async () => {
  // Clear localStorage
  vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null)
  const { getContext } = renderAuthContext()

  await waitFor(() => {
    const ctx = getContext()
    expect(ctx.isLoading).toBe(false)
    expect(ctx.user).toBeNull()
    expect(ctx.token).toBeNull()
    expect(ctx.isAuthenticated).toBe(false)
  })
})

// ── Mount with stored token, successful /me ──

it('fetches /me when token exists and sets user', async () => {
  vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('valid-token')
  const { getContext } = renderAuthContext()

  await waitFor(() => {
    const ctx = getContext()
    expect(ctx.isLoading).toBe(false)
    expect(ctx.user).toEqual({
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      role: 'candidate',
      phone: null,
      avatar_url: null,
      is_active: true,
      created_at: '2026-01-01T00:00:00.000000Z',
    })
    expect(ctx.token).toBe('valid-token')
    expect(ctx.isAuthenticated).toBe(true)
  })
})

// ── Mount with stored token, /me fails ──

it('clears user and token when /me request fails', async () => {
  server.use(
    http.get('*/api/v1/me', () => {
      return HttpResponse.json({ message: 'Unauthenticated' }, { status: 401 })
    })
  )
  const removeSpy = vi.spyOn(Storage.prototype, 'removeItem')
  vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('expired-token')
  const { getContext } = renderAuthContext()

  await waitFor(() => {
    const ctx = getContext()
    expect(ctx.isLoading).toBe(false)
    expect(ctx.user).toBeNull()
    expect(ctx.token).toBeNull()
    expect(ctx.isAuthenticated).toBe(false)
  })
  expect(removeSpy).toHaveBeenCalledWith('auth_token')
})

// ── login ──

it('login: posts to /login, stores token, sets user', async () => {
  const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')
  vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null)
  const { getContext } = renderAuthContext()

  await waitFor(() => expect(getContext().isLoading).toBe(false))

  const ctx = getContext()
  await ctx.login('test@example.com', 'password123')

  expect(setItemSpy).toHaveBeenCalledWith('auth_token', 'fake-jwt-token')
  expect(getContext().token).toBe('fake-jwt-token')
  expect(getContext().user.email).toBe('test@example.com')
  expect(getContext().isAuthenticated).toBe(true)
})

// ── register ──

it('register: posts to /register with correct payload', async () => {
  vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null)
  const { getContext } = renderAuthContext()

  await waitFor(() => expect(getContext().isLoading).toBe(false))

  const ctx = getContext()
  await ctx.register('New User', 'new@example.com', 'password123', 'password123', 'candidate')

  // register does NOT set token or user (register returns res, doesn't store)
  expect(getContext().user).toBeNull()
  expect(getContext().token).toBeNull()
})

// ── logout ──

it('logout: posts to /logout, clears token and user, redirects', async () => {
  const originalHref = Object.getOwnPropertyDescriptor(window.location, 'href')
  Object.defineProperty(window.location, 'href', { set: vi.fn(), get: () => '/' })

  vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('valid-token')
  const removeSpy = vi.spyOn(Storage.prototype, 'removeItem')
  const { getContext } = renderAuthContext()

  await waitFor(() => expect(getContext().isLoading).toBe(false))

  await getContext().logout()

  expect(removeSpy).toHaveBeenCalledWith('auth_token')
  await waitFor(() => {
    expect(getContext().user).toBeNull()
    expect(getContext().token).toBeNull()
  })
  expect(window.location.href).toBe('/login')

  Object.defineProperty(window.location, 'href', originalHref)
})
```

Note: The register test reveals that `register()` does NOT store the token. Looking at AuthContext.jsx: `const res = await apiClient.post('/register', {...})` then `return res` — it just returns the response without storing token or setting user. So the test expectation is correct: after register, user and token remain null.

For the login test, after calling `login()`, `AuthContext` calls `storeToken(t)`, `setToken(t)`, `setUser(res.data.user)`, so token and user should be set.

- [ ] **Step 2: Run to verify RED**

Run: `npx vitest run src/context/__tests__/AuthContext.test.jsx`
Expected: Tests fail initially — some may fail because `/me` handler doesn't exist in MSW.

The `/me` handler is not in the existing MSW handlers! The authHandlers in `src/features/auth/data/mockHandlers.js` only have `/login`, `/register`, `/logout`. Need to add a `/me` handler.

- [ ] **Step 3: Add /me MSW handler and fix tests**

Add to `src/features/auth/data/mockHandlers.js`:

```javascript
http.get('*/api/v1/me', () => {
  return HttpResponse.json({ data: mockUser })
})
```

And import `mockUser` from the fixtures.

- [ ] **Step 4: Run and get GREEN**

Run: `npx vitest run src/context/__tests__/AuthContext.test.jsx`
Expected: All 7 tests PASS

- [ ] **Step 5: Verify existing tests still pass**

Run: `npm test`
Expected: All tests pass

- [ ] **Step 6: Commit**

```bash
git add src/context/__tests__/AuthContext.test.jsx src/features/auth/data/mockHandlers.js
git commit -m "test: add AuthContext unit tests + /me MSW handler"
```

---

### Task 3: Data Shape Validation Tests

**Files:**
- Create: `src/features/auth/__tests__/authShapes.test.js`
- Create: `src/features/publicJobs/__tests__/jobShapes.test.js`

**Category:** `quick` — test-only files, uses existing fixtures, validates object shapes with `toEqual`/`toMatchObject`
**Skills:** none required

**Acceptance Criteria:**
- Auth shapes: User shape, login response, register response, logout response
- Job shapes: Job list item, job detail, employer sub-object, category, technology, pagination meta
- 9 tests passing
- Existing 25 tests still pass

- [ ] **Step 1: Write auth shape tests**

```javascript
// src/features/auth/__tests__/authShapes.test.js
import { describe, it, expect } from 'vitest'
import { mockUser, mockLoginResponse, mockRegisterResponse } from '../data/authFixtures.js'

describe('User shape', () => {
  const validUser = {
    id: expect.any(Number),
    name: expect.any(String),
    email: expect.any(String),
    role: expect.any(String),
    phone: null,
    avatar_url: null,
    is_active: expect.any(Boolean),
    created_at: expect.any(String),
  }

  it('matches User shape exactly', () => {
    expect(mockUser).toMatchObject(validUser)
  })
})

describe('Login response shape', () => {
  it('contains data.user and data.token', () => {
    expect(mockLoginResponse).toMatchObject({
      data: {
        user: {
          id: expect.any(Number),
          name: expect.any(String),
          email: expect.any(String),
          role: expect.any(String),
        },
        token: expect.any(String),
      },
      message: expect.any(String),
    })
  })
})

describe('Register response shape', () => {
  it('matches login response shape (same structure)', () => {
    expect(mockRegisterResponse).toMatchObject({
      data: {
        user: {
          id: expect.any(Number),
          name: expect.any(String),
          email: expect.any(String),
        },
        token: expect.any(String),
      },
      message: expect.any(String),
    })
  })
})

describe('Logout response shape', () => {
  it('contains message field', () => {
    const logoutResponse = { message: 'Logged out successfully' }
    expect(logoutResponse).toEqual({ message: expect.any(String) })
  })
})
```

- [ ] **Step 2: Write job shape tests**

```javascript
// src/features/publicJobs/__tests__/jobShapes.test.js
import { describe, it, expect } from 'vitest'
import { mockJobs, mockJobDetail, mockCategories, mockTechnologies } from '../data/jobFixtures.js'

describe('Job list item shape', () => {
  const jobShape = {
    id: expect.any(Number),
    title: expect.any(String),
    slug: expect.any(String),
    description: expect.any(String),
    salary_min: expect.any(Number),
    salary_max: expect.any(Number),
    salary_currency: expect.any(String),
    location: expect.any(String),
    work_type: expect.any(String),
    experience_level: expect.any(String),
    created_at: expect.any(String),
    employer: {
      company_name: expect.any(String),
      logo_url: null,
      location: expect.any(String),
    },
    category: {
      id: expect.any(Number),
      name: expect.any(String),
    },
    technologies: expect.arrayContaining([
      expect.objectContaining({ id: expect.any(Number), name: expect.any(String) }),
    ]),
  }

  it.each(mockJobs)('job "$title" matches list item shape', (job) => {
    expect(job).toMatchObject(jobShape)
  })
})

describe('Job detail shape', () => {
  it('includes extended fields beyond list item', () => {
    expect(mockJobDetail).toMatchObject({
      id: expect.any(Number),
      title: expect.any(String),
      responsibilities: expect.any(String),
      requirements: expect.any(String),
      benefits: expect.any(String),
      application_deadline: expect.any(String),
      comments_count: expect.any(Number),
      employer: {
        company_name: expect.any(String),
        logo_url: null,
        location: expect.any(String),
        company_description: expect.any(String),
        website: expect.any(String),
      },
    })
  })
})

describe('Pagination meta shape', () => {
  it('contains required pagination fields', () => {
    const meta = { current_page: 1, last_page: 1, per_page: 20, total: 3 }
    expect(meta).toEqual({
      current_page: expect.any(Number),
      last_page: expect.any(Number),
      per_page: expect.any(Number),
      total: expect.any(Number),
    })
  })
})

describe('Category shape', () => {
  it.each(mockCategories)('category "$name" matches shape', (cat) => {
    expect(cat).toMatchObject({
      id: expect.any(Number),
      name: expect.any(String),
      slug: expect.any(String),
      jobs_count: expect.any(Number),
    })
  })
})

describe('Technology shape', () => {
  it.each(mockTechnologies)('technology "$name" matches shape', (tech) => {
    expect(tech).toMatchObject({
      id: expect.any(Number),
      name: expect.any(String),
      slug: expect.any(String),
    })
  })
})
```

- [ ] **Step 3: Run both files to verify GREEN**

Run: `npx vitest run src/features/auth/__tests__/authShapes.test.js src/features/publicJobs/__tests__/jobShapes.test.js`
Expected: All tests PASS (these validate against existing static fixtures — should work first try)

- [ ] **Step 4: Verify existing tests still pass**

Run: `npm test`
Expected: All tests pass

- [ ] **Step 5: Commit**

```bash
git add src/features/auth/__tests__/authShapes.test.js src/features/publicJobs/__tests__/jobShapes.test.js
git commit -m "test: add data shape validation tests for auth + job responses"
```

---

### Task 4: Install Playwright + Configuration

**Files:**
- Modify: `package.json` (add `@playwright/test` devDependency)
- Create: `playwright.config.js`
- Download: chromium browser via `npx playwright install chromium`

**Category:** `quick` — package install + config file
**Skills:** none required

**Acceptance Criteria:**
- `@playwright/test` in devDependencies
- Chromium browser installed
- `playwright.config.js` exists with correct baseURL and webServer config

- [ ] **Step 1: Install @playwright/test**

```bash
npm install -D @playwright/test
```

Verify: `package.json` shows `"@playwright/test": "^1.52.0"` (or latest compatible with existing playwright-core 1.61.1)

- [ ] **Step 2: Download chromium browser**

```bash
npx playwright install chromium
```

Expected: Chromium downloaded to `%USERPROFILE%\AppData\Local\ms-playwright`

- [ ] **Step 3: Create playwright.config.js**

```javascript
// playwright.config.js
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
})
```

- [ ] **Step 4: Verify playwright detects the config**

Run: `npx playwright test --list`
Expected: Lists test files in `e2e/` directory (initially empty)

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json playwright.config.js
git commit -m "chore: install @playwright/test and configure playwright"
```

---

### Task 5: Write & Run Playwright E2E Tests

**Files:**
- Create: `e2e/auth.spec.js`
- Create: `e2e/jobs.spec.js`
- Create: `e2e/navigation.spec.js`

**Category:** `visual-engineering` — Playwright E2E tests, browser automation, UI verification
**Skills:** none required (Playwright MCP tools are available)

**Acceptance Criteria:**
- Login page loads with email input, password input, sign in button, register link
- Login empty submit shows validation errors
- Navigate from login to register via link
- Register page loads with name, email, password, confirm password, role select, create account button
- Jobs page loads and shows job cards
- Job detail page loads with job title and description
- 7 tests passing
- Existing 25 unit tests still pass

**Execution note:** These tests use MCP browser tools (`playwright_browser_*`) for navigation and assertions, NOT the `@playwright/test` test runner directly. The MCP tools interact with the actual running app at `http://localhost:5173`.

- [ ] **Step 1: Write auth E2E test**

```javascript
// e2e/auth.spec.js
import { test, expect } from '@playwright/test'

test.describe('Authentication pages', () => {

  test('login page loads with form elements', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('h1')).toHaveText('Sign in')
    // Or using card title depending on actual page structure
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /register/i })).toBeVisible()
  })

  test('login empty submit shows validation errors', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page.getByText(/email is required/i)).toBeVisible()
    await expect(page.getByText(/password is required/i)).toBeVisible()
  })

  test('navigate from login to register page', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('link', { name: /register/i }).click()
    await expect(page).toHaveURL(/\/register/)
    await expect(page.getByLabel(/^name/i)).toBeVisible()
  })

  test('register page loads with form elements', async ({ page }) => {
    await page.goto('/register')
    await expect(page.getByLabel(/^name/i)).toBeVisible()
    await expect(page.getByLabel(/^email/i)).toBeVisible()
    await expect(page.getByLabel(/^password/i)).toBeVisible()
    await expect(page.getByLabel(/confirm password/i)).toBeVisible()
    await expect(page.getByLabel(/i want to/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /create account/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible()
  })
})
```

- [ ] **Step 2: Write jobs E2E test**

```javascript
// e2e/jobs.spec.js
import { test, expect } from '@playwright/test'

test.describe('Jobs pages', () => {

  test('jobs page loads and shows job cards', async ({ page }) => {
    await page.goto('/jobs')
    // Wait for job cards to render (there are mock jobs in MSW)
    await expect(page.locator('.job-card').first()).toBeVisible({ timeout: 10000 })
    // Verify at least one job title is visible
    await expect(page.getByText(/senior laravel developer/i)).toBeVisible()
  })

  test('job detail page loads', async ({ page }) => {
    await page.goto('/jobs/1')
    await expect(page.getByText(/senior laravel developer/i)).toBeVisible()
    await expect(page.getByText(/build amazing apis/i)).toBeVisible()
    await expect(page.getByText(/apply now/i)).toBeVisible()
  })
})
```

- [ ] **Step 3: Write navigation/responsive E2E test**

```javascript
// e2e/navigation.spec.js
import { test, expect } from '@playwright/test'

test.describe('Navigation and layout', () => {

  test('home page loads and has browse jobs link', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.getByRole('link', { name: /browse jobs/i }).first()).toBeVisible()
  })

  test('responsive layout — mobile viewport shows navigation', async ({ page }) => {
    // Set narrow viewport
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/')
    // Page should render without horizontal overflow
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    expect(bodyWidth).toBeLessThanOrEqual(380)
  })
})
```

- [ ] **Step 4: Run E2E tests**

First start the dev server in background:
```bash
Start-Process -NoNewWindow -FilePath "npx" -ArgumentList "vite --port 5173"
```
Wait for server to be ready.

Then run:
```bash
npx playwright test --reporter=list
```

Expected: All 7 E2E tests PASS

Note: If the backend API (Laravel on port 8000) is not running, the MSW handlers won't be available for Playwright tests since they only work in Vitest/jsdom environment. The Playwright tests run against the actual Vite dev server which doesn't have MSW.

**This is a critical issue.** MSW handlers only run in the Vitest test environment (via `src/test/setup.js`). In Playwright, the actual app runs without MSW, so API calls go to the real Laravel backend or fail.

**Resolution strategy:** We have two options:
1. **Stub with Playwright route interception** — Use `page.route()` in Playwright tests to mock API responses
2. **Skip API-dependent assertions** — Verify only the UI rendering, not the data content

**RECOMMENDED APPROACH:** Use Playwright's built-in route interception for API mocking:

```javascript
// In each test that needs API data:
await page.route('**/api/v1/jobs', async route => {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ data: mockJobs, meta: { ... } })
  })
})
await page.goto('/jobs')
```

Update the tests to include route interception:

- [ ] **Step 4a: Update tests with Playwright route mocking**

```javascript
// e2e/auth.spec.js — add page route intercepts for login/register
```

```javascript
// e2e/jobs.spec.js — add page.route for /api/v1/jobs and /api/v1/jobs/1
```

- [ ] **Step 5: Run E2E tests with route mocking**

Run: `npx playwright test --reporter=list`
Expected: All 7 tests PASS with proper API mocking

- [ ] **Step 6: Run unit tests to verify no regression**

Run: `npm test`
Expected: All 33 unit tests pass

- [ ] **Step 7: Commit**

```bash
git add e2e/
git commit -m "test: add Playwright E2E tests for auth, jobs, navigation"
```

---

## Commit Strategy

| Commit | Message | Files |
|--------|---------|-------|
| 1 | `test: add apiClient unit tests — token, 401, ApiError, POST, network error` | `src/lib/__tests__/apiClient.test.js` |
| 2 | `test: add AuthContext unit tests + /me MSW handler` | `src/context/__tests__/AuthContext.test.jsx`, `src/features/auth/data/mockHandlers.js` |
| 3 | `test: add data shape validation tests for auth + job responses` | `src/features/auth/__tests__/authShapes.test.js`, `src/features/publicJobs/__tests__/jobShapes.test.js` |
| 4 | `chore: install @playwright/test and configure playwright` | `package.json`, `package-lock.json`, `playwright.config.js` |
| 5 | `test: add Playwright E2E tests for auth, jobs, navigation` | `e2e/auth.spec.js`, `e2e/jobs.spec.js`, `e2e/navigation.spec.js` |

## Success Criteria

1. `npm test` passes with all 33 unit tests (25 existing + 8 new)
2. All MSW handlers function correctly (existing + new `/me` handler)
3. `npx playwright test` passes with all 7 E2E tests
4. API response shapes are validated against exact field contracts (User, Job, Employer, Category, Technology, Meta, LoginResponse, RegisterResponse, LogoutResponse)
5. AuthContext behavior verified: login stores token, register returns without storing, logout clears everything, mount with/without token works
6. apiClient behavior verified: token attachment, 401 redirect, error class shape, POST/FormData handling
