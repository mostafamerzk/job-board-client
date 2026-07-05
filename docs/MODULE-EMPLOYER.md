# Employer Module — Implementation Guide

## 1. Overview

Employer company profile management, job CRUD, logo upload, and applicant review with accept/reject decisions.

**Route prefix:** `/employer/*`
**Auth:** ProtectedRoute + RoleGuard(role='employer')
**API groups:** `/api/v1/employer/*`

---

## 2. API Endpoints

### GET /employer/profile
```
Headers:  Authorization: Bearer {token} (role: employer)
Response: { data: { id, company_name, company_description, website, logo_url, location, contact_email } }
```

### PUT /employer/profile
```
Headers:  Authorization: Bearer {token} (role: employer)
Request:  { company_name, company_description, website, location, contact_email }
Response: { data: { ... }, message: "Profile updated successfully" }
```

### POST /employer/logo
```
Headers:  Authorization: Bearer {token} (role: employer)
Body:     multipart/form-data { logo: file (image/*, max 2MB) }
Response: { data: { logo_url }, message: "Logo uploaded successfully" }
```

### GET /employer/jobs
```
Headers:  Authorization: Bearer {token} (role: employer)
Query:    ?page=1&per_page=15&status=pending
Response: { data: [ Job ], meta: { current_page, last_page, per_page, total } }
```

### POST /employer/jobs
```
Headers:  Authorization: Bearer {token} (role: employer)
Request:  { title, description, responsibilities, requirements, benefits, salary_min, salary_max, salary_currency, location, work_type, experience_level, category_id, technologies[], application_deadline }
Response: { data: Job, message: "Job created successfully" }
Errors:   422 — validation
```

### GET /employer/jobs/{job}
```
Headers:  Authorization: Bearer {token} (role: employer)
Response: { data: Job (full detail with category, technologies, applications_count) }
```

### PUT /employer/jobs/{job}
```
Headers:  Authorization: Bearer {token} (role: employer)
Request:  (same as create, all optional)
Response: { data: Job, message: "Job updated successfully" }
Note:     status and employer_id cannot be changed
```

### DELETE /employer/jobs/{job}
```
Headers:  Authorization: Bearer {token} (role: employer)
Response: 204 No Content
```

### GET /employer/jobs/{job}/applications
```
Headers:  Authorization: Bearer {token} (role: employer)
Query:    ?status=pending
Response: { data: [ { id, job_id, candidate: { id, name, email, candidate_profile }, resume, status, created_at } ] }
```

### PUT /employer/applications/{application}/status
```
Headers:  Authorization: Bearer {token} (role: employer)
Request:  { status: "accepted"|"rejected", employer_notes? }
Response: { data: { ... }, message: "Application accepted/rejected successfully" }
Note:     Only allowed: pending → accepted, pending → rejected. Cannot modify withdrawn.
```

### GET /employer/applications/{application}
```
Headers:  Authorization: Bearer {token} (role: employer)
Response: { data: { id, status, candidate, resume, employer_notes, created_at } }
```

---

## 3. Route Paths

| Path | Component | Auth | Role | Notes |
|------|-----------|------|------|-------|
| `/employer` | EmployerDashboard | ✅ Protected | employer | Tabbed layout container |
| `/employer/jobs/new` | JobCreatePage | ✅ Protected | employer | Create job form |
| `/employer/jobs/:id` | JobDetailPage | ✅ Protected | employer | View/edit own job |
| `/employer/jobs/:id/applications` | ApplicantListPage | ✅ Protected | employer | Review applicants |
| `/employer/profile` | CompanyProfilePage | ✅ Protected | employer | Profile + logo |

---

## 4. Data Structures

```js
// Employer Profile
{ id, company_name, company_description, website, logo_url, location, contact_email, created_at }

// Job (employer view)
{ id, title, slug, description, responsibilities, requirements, benefits,
  salary_min, salary_max, salary_currency, location, work_type, experience_level,
  status, rejection_reason, application_deadline, created_at, updated_at,
  category: { id, name }, technologies: [{ id, name }], applications_count }

// Application (employer view)
{ id, job_id, status, created_at,
  candidate: { id, name, email, candidate_profile: { headline, location } },
  resume: { id, original_name, url }, employer_notes }
```

## 5. Component Specs

### CompanyProfileForm
- **Fields:** company_name*, company_description, website, location, contact_email*
- **States:** loading (prefill from API), saving (button spinner), validation errors, success toast
- **LogoUpload:** drag-drop zone, image preview, 2MB size validation, submit button

### JobForm (create + edit)
- **Fields:** title*, description, responsibilities, requirements, benefits, salary_min*, salary_max*, salary_currency, location, work_type (select: remote/hybrid/onsite), experience_level (select), category_id (select from /categories), technologies (multi-select), application_deadline
- **Validation:** salary_min < salary_max, required fields (*), valid date for deadline
- **States:** creating/saving, validation errors, API 422 (field-level), success redirect to job list

### JobList
- **Table columns:** Title, Status (badge: pending/approved/rejected), Created, Applications count, Actions (view/edit/delete)
- **Filters:** by status (dropdown tabs: all/pending/approved/rejected)
- **Pagination:** page navigation from API meta
- **States:** loading (skeleton rows), empty (CTA: "Post your first job"), error
- **Delete:** confirmation modal before soft-delete

### ApplicantList
- **Table columns:** Candidate name, email, headline, resume link, status badge, applied date, Actions (accept/reject buttons)
- **Filters:** by status (all/pending/accepted/rejected)
- **Accept/Reject:** Accept → immediate update. Reject → modal with reason field (required)
- **States:** loading, empty ("No applications yet"), error
- **Edge:** cannot accept/reject withdrawn applications (disable buttons)

---

## 6. States to Handle

| State | UX |
|-------|-----|
| **Loading** | Spinner / skeleton rows |
| **Empty (jobs)** | Illustration + "Post your first job" CTA |
| **Empty (applications)** | "No applications received yet" |
| **Saving** | Button spinner, disable form |
| **Validation error** | Inline field messages |
| **API 422** | Field-level errors from response |
| **API 404** | "Job not found" banner |
| **Delete confirm** | Modal: "Are you sure you want to delete this job?" (cannot undo warning) |
| **Success** | Toast/banner + redirect or list refresh |

---

## 7. Implementation Order

1. **CompanyProfileForm** — view/edit flow with logo upload (gets /employer/profile, PUT updates)
2. **JobList** — fetch GET /employer/jobs, render table with status badges + pagination
3. **JobForm** — create (POST) + edit (PUT) with field validation
4. **ApplicantList** — fetch applications for a job, accept/reject workflow
5. **Polish** — confirm modals, empty states, loading skeletons, error boundaries
