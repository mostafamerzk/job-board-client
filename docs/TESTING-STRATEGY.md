# Testing Strategy

The backend testing strategy is behavior-first. The frontend follows the same rule: test the user-visible result, not implementation details.

## Test Layers

| Layer | Tooling | Purpose |
|-------|---------|---------|
| Static checks | Oxlint, React Doctor | Catch React, accessibility, and code-quality issues early |
| Component tests | Vitest + React Testing Library | Forms, validation messages, empty states, user interactions |
| API integration tests | MSW or Vite test server | Client behavior against `/api/v1` response contracts |
| Browser smoke tests | Playwright | Critical flows render and work in real browsers |
| Route guard tests | Vitest | ProtectedRoute, RoleGuard behavior with mock AuthContext |

Vitest, Testing Library, MSW, and Playwright are not installed yet. Add them when the first real feature needs tests.

## Test File Convention

- `src/features/<module>/__tests__/` — feature-specific tests
- `src/shared/__tests__/` — shared component/hook tests
- `src/routes/__tests__/` — route guard tests
- `src/context/__tests__/` — context provider tests
- `src/lib/__tests__/` — API client tests

## What to Test Per Module

### Auth Module
- Login form: validation (empty fields, invalid email, password length)
- Login API: 401 → error message, 403 → suspended message
- Register form: passwords match, email format, role default
- Already authenticated → redirect away from /login and /register
- Logout clears token and redirects

### Public Jobs Module
- Job list renders with search results
- Filters update URL query params
- Empty search results → "No jobs found" message
- Job detail shows full description
- 404 job → "not available" message
- Mobile filter collapse/expand

### Candidate Module
- Profile form loads with existing data
- Save profile validation (required fields)
- Resume upload: file type/Size validation
- Empty resume list → upload prompt
- Submit application with resume vs contact
- Withdraw button only on pending applications
- Cannot withdraw accepted/rejected applications (API 400 → message)

### Employer Module
- Company profile create/update
- Logo upload: type/size validation, preview
- Job form validation: salary_min < salary_max, required fields
- Job list filters by status
- Delete job confirmation
- Accept/reject application flow
- Rejection requires reason (modal validation)

### Admin Module
- Tab switching persists filter state
- Approve job → success + list refresh
- Reject job requires reason
- Cannot approve/reject non-pending jobs
- User suspend/reactivate confirmation
- Comment delete confirmation
- Cannot suspend own account

### Shared Infrastructure
- **AuthContext**: provides user, token, login, register, logout, isLoading
- **ProtectedRoute**: redirects to /login if not authenticated, shows spinner while loading
- **RoleGuard**: redirects to /unauthorized if wrong role
- **apiClient**: attaches token, handles 401 → redirect + clear, parses JSON, returns ApiError on non-2xx
- **apiConfig**: reads VITE_API_BASE_URL from env

## Required Scenario Classes

Every feature should cover:

| Class | Example |
|-------|---------|
| Happy path | Employer creates a valid job and sees it listed |
| Validation error | Required fields show error messages |
| Empty state | No jobs, no resumes, no applications |
| Loading state | Spinner/skeleton while data fetches |
| Error state | API 401, 403, 404, 422, 500 display useful feedback |
| Edge case | Withdraw accepted application → error, reject without reason → validation |

## Manual QA Checklist

- Run `npm run lint`
- Run `npm run build`
- Run `npm run doctor` when network is available
- Drive the app in a browser at 375px, 768px, and 1280px
- Confirm no horizontal overflow on mobile
- Confirm keyboard focus visible on nav links, buttons, tabs, form fields
- Test every form: submit empty → show errors, submit valid → success
- Test every destructive action: confirm dialog appears
