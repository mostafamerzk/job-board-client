# Work Division

Use this plan to divide work across team members without merge conflicts.

## Phase 1: Foundation

| Track | Owner Scope | Main Files |
| --- | --- | --- |
| App shell | Layout, navigation, Bootstrap theme, design tokens | `src/app`, `src/components/layout`, `src/styles` |
| API client | Base URL, auth token attachment, response/error parsing | `src/lib`, feature `api/` folders |
| Auth UI | Register, login, logout, current user profile | `src/features/auth` |

## Phase 2: Employer

| Track | Owner Scope | API Groups |
| --- | --- | --- |
| Employer profile | Company profile form and logo upload state | `/employer/profile`, `/employer/logo` |
| Job management | Employer job list, create, update, delete | `/employer/jobs` |
| Applicant review | Applications for employer-owned jobs | `/employer/jobs/{job}/applications` |

## Phase 3: Candidate

| Track | Owner Scope | API Groups |
| --- | --- | --- |
| Candidate profile | Candidate profile form and display | `/candidate/profile` |
| Resume manager | Upload, list, primary resume, delete | `/candidate/resumes` |
| Applications | Apply, withdraw, history, status display | `/jobs/{job}/apply`, `/candidate/applications` |
| Public search | Approved job list, filters, detail page | `/jobs`, `/categories`, `/technologies` |

## Phase 4: Admin

| Track | Owner Scope | API Groups |
| --- | --- | --- |
| Job moderation | Pending, approve, reject with reason | `/admin/jobs` |
| User moderation | Role filters, active status toggle | `/admin/users` |
| Comment moderation | List, hide/delete, visibility filters | `/admin/comments` |

## Phase 5: Bonus

Payments, notifications, analytics, resume database, and LinkedIn integration should be separate feature folders because each can ship independently after the core API is stable.

## Collaboration Rules

- One team member owns one feature folder at a time.
- Shared components move to `src/components` only after a second feature needs them.
- Keep Bootstrap component imports local to the component using them.
- Update `DESIGN.md` before adding a new color, spacing token, or reusable component pattern.
- Update `docs/API-REFERENCE.md` only by copying the backend source file.
