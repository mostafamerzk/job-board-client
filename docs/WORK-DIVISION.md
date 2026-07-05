# Work Division

Use this plan to divide work across team members without merge conflicts.

## Module Ownership

Each feature folder = one team member's scope. The restructure has already:

- Set up all folder structures
- Created route definitions and guards
- Built the auth infrastructure (AuthContext, ProtectedRoute, RoleGuard)
- Created the API client (fetch wrapper with auth)
- Split the CandidateModule into sub-components
- Created placeholder pages for every route

## Team Assignments

### Ragab — Auth + Public Jobs

**Scope:** Login/register + public job search and detail
**Folders:** `src/features/auth/`, `src/features/publicJobs/`
**Depends on:** AuthContext, apiClient (both done)
**API groups:** `/api/v1/login`, `/register`, `/logout`, `/me`, `/jobs`, `/categories`, `/technologies`
**Module doc:** `docs/MODULE-AUTH.md`, `docs/MODULE-PUBLIC-JOBS.md`
**Key risks:** Form validation, error states, edge cases

### Yousef — Employer

**Scope:** Employer profile, job CRUD, applicant review with accept/reject
**Folders:** `src/features/employer/`
**Depends on:** AuthContext, apiClient (both done)
**API groups:** `/api/v1/employer/*`
**Module doc:** `docs/MODULE-EMPLOYER.md`
**Key risks:** File upload (logo), multi-step forms, status transitions

### Merzk — Candidate

**Scope:** Wire existing UI components to APIs (profile, resumes, apply, withdraw, history)
**Folders:** `src/features/candidate/`
**Depends on:** AuthContext, apiClient (both done). Sub-components already split.
**API groups:** `/api/v1/candidate/*`, `/api/v1/jobs`
**Module doc:** `docs/MODULE-CANDIDATE.md`
**Key risks:** Two-path application (resume vs contact), withdraw edge case

### Issac — Admin + Integration

**Scope:** Admin console (job moderation, user management, comments)
**Folders:** `src/features/admin/`
**Depends on:** Rest of features done or stable
**API groups:** `/api/v1/admin/*`
**Module doc:** `docs/MODULE-ADMIN.md`

## Collaboration Rules

1. **One person, one feature folder.** No one touches another person's `src/features/<name>/` folder.
2. **Shared components go in `src/shared/ui/`** after a second feature needs them.
3. **Shared hooks go in `src/shared/hooks/`** after a second feature needs them.
4. **Keep Bootstrap imports local** to the component using them.
5. **Update `docs/MODULE-*.md`** when API contracts change or new patterns emerge.
6. **Update `DESIGN.md`** before adding a new color, spacing token, or component pattern.
7. **Commit messages:** `feat(auth):`, `feat(employer):`, `feat(candidate):`, `feat(admin):`, `feat(publicJobs):` followed by summary.
8. **Build must pass before push.** `npm run build && npm run lint`.

## What the Restructure Already Delivered

| Layer                           | Status  | Owned by |
| ------------------------------- | ------- | -------- |
| Folder structure                | ✅ Done | Infra    |
| React Router with all routes    | ✅ Done | Infra    |
| AuthContext + token persistence | ✅ Done | Infra    |
| ProtectedRoute + RoleGuard      | ✅ Done | Infra    |
| API client (fetch wrapper)      | ✅ Done | Infra    |
| .env configuration              | ✅ Done | Infra    |
| Home page extracted             | ✅ Done | Infra    |
| Candidate sub-components split  | ✅ Done | Infra    |
| Placeholder pages               | ✅ Done | Infra    |
| Module docs                     | ✅ Done | Infra    |

## What Each Person Builds

| Person | Feature                           | API Endpoints                                                                  | Est. Effort |
| ------ | --------------------------------- | ------------------------------------------------------------------------------ | ----------- |
| A      | Login/Register pages              | POST /register, POST /login, POST /logout, GET /me                             | 2-3 days    |
| A      | Public job search + list + detail | GET /jobs, GET /jobs/{id}, GET /categories, GET /technologies                  | 4-5 days    |
| B      | Employer profile + logo           | GET/PUT /employer/profile, POST /employer/logo                                 | 2-3 days    |
| B      | Job CRUD                          | GET/POST /employer/jobs, GET/PUT/DELETE /employer/jobs/{job}                   | 4-5 days    |
| B      | Applicant review                  | GET /employer/jobs/{job}/applications, PUT /employer/applications/{app}/status | 3-4 days    |
| C      | Wire candidate profile            | GET/PUT /candidate/profile                                                     | 1-2 days    |
| C      | Wire resume manager               | GET/POST/DELETE /candidate/resumes                                             | 2-3 days    |
| C      | Wire apply/withdraw/history       | POST /candidate/applications, GET, PUT withdraw                                | 3-4 days    |
| C      | Wire job search                   | GET /jobs (for candidate dashboard)                                            | 2-3 days    |
| D      | Admin job moderation              | GET /admin/jobs, PUT approve/reject                                            | 2-3 days    |
| D      | Admin user management             | GET /admin/users, PUT toggle-active                                            | 2-3 days    |
| D      | Admin comment moderation          | GET /admin/comments, DELETE                                                    | 1-2 days    |
