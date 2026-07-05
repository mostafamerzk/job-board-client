# Testing Strategy

The backend testing strategy is behavior-first. The frontend should follow the same rule: test the user-visible result, not implementation details.

## Test Layers

| Layer | Tooling | Purpose |
| --- | --- | --- |
| Static checks | Oxlint, React Doctor | Catch React, accessibility, and code-quality issues early |
| Component tests | Vitest plus React Testing Library | Forms, validation messages, empty states, and user interactions |
| API integration tests | MSW or a Vite test server | Verify client behavior against `/api/v1` response contracts |
| Browser smoke tests | Playwright | Confirm critical flows render and remain usable in real browsers |

Vitest, Testing Library, MSW, and Playwright are not installed yet. Add them when the first real feature needs tests so the baseline stays small.

## Required Scenario Classes

Every feature should cover:

| Class | Frontend Example |
| --- | --- |
| Happy path | Employer creates a valid job and sees it in pending status |
| Validation error | Required form fields show API or client validation messages |
| Unauthenticated | Protected routes redirect or show login prompt |
| Forbidden | Wrong role cannot access employer, candidate, or admin screens |
| Empty state | No jobs, no resumes, no applications, no comments |
| Error state | API 422, 401, 403, 404, and server failure display useful feedback |

## Per-Phase Test Plan

### Phase 1

- Auth register, login, logout, and `/me`
- Token persistence policy
- Role-aware navigation
- Global layout at mobile and desktop widths

### Phase 2

- Employer profile create/update
- Logo upload validation and preview
- Employer job list, create, edit, delete
- Employer only sees own jobs

### Phase 3

- Candidate profile create/update
- Resume upload type and size errors
- Public search filters and empty results
- Candidate apply and withdraw flows

### Phase 4

- Admin pending job review
- Reject job with required reason
- User active status toggle
- Comment visibility and deletion

## Manual QA Checklist

- Run `npm run lint`
- Run `npm run build`
- Run `npm run doctor` when network access is available
- Drive the app in a browser at 375px, 768px, and 1280px
- Confirm no horizontal overflow on mobile
- Confirm keyboard focus is visible on nav links, buttons, tabs, and form fields
