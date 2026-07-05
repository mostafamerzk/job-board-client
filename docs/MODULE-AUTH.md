# Auth Module — Implementation Guide

## 1. Overview

Handles user registration, login, logout, and session validation. Public routes that redirect to the dashboard if the user is already authenticated.

**Route prefix:** none (flat routes: `/login`, `/register`)
**Auth:** public
**API group:** `/api/v1/login`, `/api/v1/register`, `/api/v1/logout`, `/api/v1/me`

---

## 2. API Endpoints

### POST /register
```
Request:  { name, email, password, password_confirmation, role? }
Response: { data: { user, token }, message: "Registered successfully" }
Errors:   422 — validation (duplicate email, weak password, invalid role)
```
`role` defaults to `candidate` if omitted.

### POST /login
```
Request:  { email, password }
Response: { data: { user, token }, message: "Logged in successfully" }
Errors:   401 — invalid credentials
          403 — account suspended
```

### POST /logout
```
Headers:  Authorization: Bearer {token}
Body:     (empty)
Response: { message: "Logged out successfully" }
Errors:   401 — unauthenticated
```

### GET /me
```
Headers:  Authorization: Bearer {token}
Response: { data: { id, name, email, role, phone, avatar_url, is_active, created_at } }
Errors:   401 — unauthenticated
```
Role-specific profile included when available (employer_profile for employers, candidate_profile for candidates).

---

## 3. Route Paths

| Path | Component | Auth | Role | Notes |
|------|-----------|------|------|-------|
| `/login` | LoginPage | ❌ Public | — | Redirects to `/` if authenticated |
| `/register` | RegisterPage | ❌ Public | — | Redirects to `/` if authenticated |

---

## 4. Data Structures

```js
// User (from GET /me)
{
  id: number,
  name: string,
  email: string,
  role: 'candidate' | 'employer' | 'admin',
  phone: string | null,
  avatar_url: string | null,
  is_active: boolean,
  created_at: string (ISO 8601)
}
```

## 5. Component Specs

### LoginPage
- **Form fields:** email (required, email format), password (required, min 8 chars)
- **Submit:** calls `useAuth().login(email, password)`
- **Links:** "Don't have an account? Register"
- **States:**
  - **Loading:** submit button shows spinner, disabled
  - **Error (field):** inline validation messages below each field
  - **Error (API):** banner for 401 ("Invalid email or password"), 403 ("Account suspended")
  - **Success:** navigate to role-based dashboard (`/employer`, `/candidate`, `/admin`)
- **Accessibility:** labels on all inputs, `aria-describedby` linking errors to fields, `aria-busy` on loading button

### RegisterPage
- **Form fields:** name (required), email (required, email format), password (required, min 8 chars), confirm password (must match), role (select: candidate/employer, optional, defaults to candidate)
- **Submit:** calls `useAuth().register(name, email, password, passwordConfirmation, role)`
- **Links:** "Already have an account? Login"
- **States:** same as LoginPage
- **Accessibility:** same as LoginPage

### Shared AuthForm (optional extraction)
- Extracted when LoginPage and RegisterPage share >60% of form logic
- Props: fields config, onSubmit, isLoading, serverError
- Handles field-level validation display

---

## 6. States to Handle

| State | UX |
|-------|-----|
| **Loading** | Button spinner + disabled inputs |
| **Field validation** | Red border + inline error text below each field |
| **API 401** | Banner: "Invalid email or password" |
| **API 403** | Banner: "Your account has been suspended" |
| **API 422** | Field-level errors from API response |
| **Already authenticated** | Redirect to role-based dashboard via `useNavigate` |
| **Network error** | Banner: "Connection error. Please try again." |

---

## 7. Integration with Auth Infrastructure

The auth infrastructure is already in place:

- **`AuthContext`** (`src/context/AuthContext.jsx`): provides `login()`, `register()`, `logout()`, `user`, `token`, `isAuthenticated`, `isLoading`
- **`useAuth`** (`src/hooks/useAuth.js`): context consumer hook
- **`apiClient`** (`src/lib/apiClient.js`): fetch wrapper that auto-attaches token, handles 401

**Usage in pages:**
```jsx
import { useAuth } from '../../hooks/useAuth.js'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

export function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true })
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await login(email, password)
      navigate('/', { replace: true })
    } catch (err) {
      // set server error from err.body
    }
  }
  // ...
}
```

---

## 8. Implementation Order

1. **LoginPage** — form, validation, `login()` call, error display, redirect
2. **RegisterPage** — form, validation, `register()` call, error display, redirect
3. **Extract AuthForm** — only if duplication exceeds 40%
4. **Polish states** — loading skeletons, error banners, edge cases
