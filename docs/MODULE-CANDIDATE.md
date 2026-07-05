# Candidate Module — Implementation Guide

## 1. Overview

Candidate profile management, resume library, job application (submit/withdraw), and application history. This module already has UI components split from the original monolith — the main task is wiring them to API calls.

**Route prefix:** `/candidate/*`
**Auth:** ProtectedRoute + RoleGuard(role='candidate')
**API groups:** `/api/v1/candidate/*`, `/api/v1/jobs`

---

## 2. API Endpoints

### GET /candidate/profile
```
Headers:  Authorization: Bearer {token} (role: candidate)
Response: { data: { id, full_name, phone, linkedin_url, headline, bio, resumes: [Resume] } }
```

### PUT /candidate/profile
```
Headers:  Authorization: Bearer {token} (role: candidate)
Request:  { full_name, phone, linkedin_url, headline, bio }
Response: { data: Profile, message: "Profile updated successfully" }
```

### GET /candidate/resumes
```
Headers:  Authorization: Bearer {token} (role: candidate)
Response: { data: [Resume] }
```

### POST /candidate/resumes
```
Headers:  Authorization: Bearer {token} (role: candidate)
Body:     multipart/form-data { resume: file (pdf,doc,docx, max 5MB) }
Response: { data: Resume, message: "Resume uploaded successfully" }
```

### DELETE /candidate/resumes/{resume}
```
Headers:  Authorization: Bearer {token} (role: candidate)
Response: 204 No Content
```

### POST /candidate/applications
```
Headers:  Authorization: Bearer {token} (role: candidate)
Request (resume path): { job_id, resume_id, cover_letter }
Request (contact path): { job_id, contact_email, contact_phone, cover_letter }
Response: { data: { id, job_id, status: "pending", created_at }, message: "Application submitted successfully" }
Errors:   422 — validation or duplicate, 400 — job not approved or past deadline
```

### GET /candidate/applications
```
Headers:  Authorization: Bearer {token} (role: candidate)
Response: { data: [ { id, job: { id, title, employer: { company_name } }, status, created_at } ] }
```

### PUT /candidate/applications/{application}/withdraw
```
Headers:  Authorization: Bearer {token} (role: candidate)
Response: { data: { id, status: "withdrawn" }, message: "Application withdrawn successfully" }
Errors:   400 — already accepted/rejected, cannot withdraw
```

### GET /jobs (public search — used inside candidate dashboard)
```
Query:    ?keyword=&location=&work_type=&experience_level=&salary_min=&salary_max=&category_id=&technology_ids=&sort=&per_page=
Response: { data: [ Job ], meta: { ... } }
```

---

## 3. Route Paths

| Path | Component | Auth | Role | Notes |
|------|-----------|------|------|-------|
| `/candidate` | CandidateDashboard | ✅ Protected | candidate | Main dashboard (profile + resumes + search + apply + history) |

---

## 4. Existing Components (already split)

All components are in `src/features/candidate/components/` and receive data as props. Wire them to API calls using useAuth + apiClient.

### ProfilePanel
**Props:** `profile`, `onSave`, `isEditing`, `isSaving`, `error`
**Current:** Read-only display. Needs edit toggle + save handler.
**Wiring:** Fetch from `GET /candidate/profile`, save via `PUT /candidate/profile`.
**Fields:** full_name, phone, linkedin_url, headline, bio.

### ResumeManager
**Props:** `resumes`, `rules`, `onUpload`, `onSetPrimary`, `onDelete`
**Current:** List resumes + upload button. Needs upload/set-primary/delete handlers.
**Wiring:** Fetch `GET /candidate/resumes`, upload `POST /candidate/resumes` (FormData), delete `DELETE /candidate/resumes/{id}`.
**Rules:** formats="PDF, DOC, DOCX", maxSize="5MB", maxFiles="5 resumes" (from constants).
**States:** no files yet → show upload prompt + rules. Uploading → progress indicator.

### JobSearchPanel
**Props:** `filters`, `jobs`, `onFilterChange`
**Current:** Static filter display + job match list. Needs real search.
**Wiring:** Fetch `GET /jobs` with filter query params. Debounce input changes.
**Filters:** keyword, location, work_type, experience_level, salary range.
**States:** loading (skeleton cards), empty ("No jobs match your filters, try broadening your search"), error.

### ApplicationComposer
**Props:** `draft`, `onSubmit`, `isSubmitting`
**Current:** Static draft display. Needs job selector, resume selector, cover letter input, submit handler.
**Wiring:** Submit via `POST /candidate/applications`.
**Two paths:** with resume_id or with contact_email/contact_phone.

### ApplicationHistory
**Props:** `applications`, `onWithdraw`
**Current:** Table with status badges. Needs withdraw action.
**Wiring:** Fetch `GET /candidate/applications`. Withdraw via `PUT /candidate/applications/{id}/withdraw`.
**States:** loading, empty ("You haven't applied to any jobs yet"), error.
**Edge:** withdraw button only shown for `pending` status. Withdrawn/accepted/rejected show status text instead.

---

## 5. Data Structures

```js
// Candidate Profile
{ id, full_name, phone, linkedin_url, headline, bio }

// Resume
{ id, original_name, url, mime_type, size (bytes), is_primary }

// Job (summary for search results)
{ id, title, slug, salary_min, salary_max, salary_currency, location, work_type,
  experience_level, created_at,
  employer: { company_name, logo_url, location },
  category: { id, name }, technologies: [{ id, name }] }

// Application
{ id, status, created_at,
  job: { id, title, employer: { company_name } } }
```

## 6. Static Fixtures (src/features/candidate/candidateData.js)

These provide default props until API integration is complete:
- `candidateProfile` — default profile data
- `resumes` — sample resume list
- `resumeRules` — upload rules (formats, maxSize, maxFiles)
- `searchFilters` — default search filter presets
- `jobMatches` — sample job listings
- `applicationDraft` — default compose state
- `applications` — sample application history
- `candidateEndpoints` — endpoint reference for UI display

**Migration:** When wiring to APIs, replace fixture imports with API call results. Keep fixtures as fallback defaults.

---

## 7. States to Handle

| State | UX |
|-------|-----|
| **Loading** | Skeleton cards / spinner per panel |
| **Empty (resumes)** | "No resumes uploaded. Upload your first resume." |
| **Empty (applications)** | "You haven't applied to any jobs yet. Start searching!" |
| **Empty (search)** | "No jobs match your filters. Try different keywords." |
| **Saving profile** | Button spinner, disable form |
| **Uploading resume** | Progress bar + disabled upload button |
| **Validation error** | Inline field messages |
| **API 422** | Field-level errors |
| **API 400 (apply)** | "Job is no longer accepting applications" |
| **API 400 (withdraw)** | "Application already decided, cannot withdraw" |
| **Success** | Toast + list refresh |

---

## 8. Implementation Order

1. **ProfilePanel** — wire fetch + save to API, add edit/save toggle
2. **ResumeManager** — wire upload, delete, set-primary actions
3. **ApplicationComposer + History** — wire submit, list, withdraw
4. **JobSearchPanel** — wire search with filters (debounced)
5. **Polish** — loading states, empty states, error handling, form validation
