# Admin Module — Implementation Guide

## 1. Overview

Admin console for job moderation (approve/reject), user management (suspend/reactivate), and comment moderation (delete).

**Route prefix:** `/admin/*`
**Auth:** ProtectedRoute + RoleGuard(role='admin')
**API groups:** `/api/v1/admin/*`

---

## 2. API Endpoints

### GET /admin/jobs
```
Headers:  Authorization: Bearer {token} (role: admin)
Query:    ?status=pending&page=1&per_page=15
Response: { data: [ Job (all statuses) ], meta }
```

### GET /admin/jobs/{job}
```
Headers:  Authorization: Bearer {token} (role: admin)
Response: { data: Job (full detail, any status including rejection_reason) }
Errors:   404 — not found
```

### PUT /admin/jobs/{job}/approve
```
Headers:  Authorization: Bearer {token} (role: admin)
Body:     (empty)
Response: { data: { id, status: "approved" }, message: "Job approved successfully" }
Errors:   422 — job is not in pending status
```

### PUT /admin/jobs/{job}/reject
```
Headers:  Authorization: Bearer {token} (role: admin)
Request:  { rejection_reason }
Response: { data: { id, status: "rejected", rejection_reason }, message: "Job rejected" }
Errors:   422 — job is not in pending status, or reason missing
```

### GET /admin/users
```
Headers:  Authorization: Bearer {token} (role: admin)
Query:    ?role=employer&is_active=true&search=john&page=1
Response: { data: [ User ], meta }
```

### GET /admin/users/{user}
```
Headers:  Authorization: Bearer {token} (role: admin)
Response: { data: { id, name, email, role, is_active, jobs_count, applications_count, employer_profile, candidate_profile, created_at } }
Errors:   404 — not found
```

### PUT /admin/users/{user}/toggle-active
```
Headers:  Authorization: Bearer {token} (role: admin)
Response: { data: { id, is_active: false }, message: "User suspended/reactivated successfully" }
```

### GET /admin/comments
```
Headers:  Authorization: Bearer {token} (role: admin)
Query:    ?is_visible=false&page=1
Response: { data: [ Comment ], meta }
```

### DELETE /admin/comments/{comment}
```
Headers:  Authorization: Bearer {token} (role: admin)
Response: 204 No Content
```

---

## 3. Route Paths

| Path | Component | Auth | Role | Notes |
|------|-----------|------|------|-------|
| `/admin` | AdminDashboard | ✅ Protected | admin | Tabbed layout: Jobs | Users | Comments |

---

## 4. Data Structures

```js
// Job (admin view)
{ id, title, status (pending|approved|rejected), rejection_reason?, created_at, updated_at,
  employer: { company_name }, category: { id, name }, technologies: [{ id, name }],
  applications_count }

// User (admin view)
{ id, name, email, role, is_active, jobs_count, applications_count,
  employer_profile: { company_name } | null,
  candidate_profile: { headline, location } | null,
  created_at }

// Comment (admin view)
{ id, body, user: { id, name }, job_id, is_visible, created_at }
```

## 5. Component Specs

### AdminDashboard
- **Layout:** Bootstrap Tabs (Jobs | Users | Comments)
- **Default tab:** Jobs (pending first)

### JobModeration
- **Table columns:** Title, Employer, Status badge, Created, Actions (approve/reject)
- **Filters:** status tabs (All | Pending | Approved | Rejected). Pending is default active.
- **Approve flow:** Click "Approve" → confirm dialog → PUT /admin/jobs/{id}/approve → success toast → refresh list
- **Reject flow:** Click "Reject" → modal with textarea for rejection_reason (required) → confirm → PUT /admin/jobs/{id}/reject → success toast → refresh list
- **States:** loading (skeleton table), empty pending ("No jobs to moderate"), error
- **Edge:** cannot approve/reject already-processed jobs (button disabled if status != pending)

### UserManagement
- **Table columns:** Name, Email, Role badge (candidate/employer/admin), Status (active/suspended), Created, Actions (toggle active)
- **Filters:** role dropdown (All | Candidate | Employer | Admin), search input (name/email)
- **Toggle flow:** Click "Suspend" → confirm dialog ("This will prevent the user from logging in") → PUT /admin/users/{id}/toggle-active → success toast
- **Reactivate flow:** Click "Reactivate" → confirm dialog → same endpoint
- **States:** loading, empty ("No users found"), error
- **Edge:** admin cannot suspend themselves (disable button on own row)

### CommentModeration
- **Table columns:** Comment text (truncated), Author, Job, Date, Visibility, Actions (delete)
- **Filters:** visibility toggle (All | Visible | Hidden)
- **Delete flow:** Click "Delete" → confirm dialog ("This cannot be undone") → DELETE /admin/comments/{id} → 204 → remove from list
- **States:** loading, empty ("No comments to moderate"), error

---

## 6. States to Handle

| State | UX |
|-------|-----|
| **Loading** | Skeleton table rows |
| **Empty (jobs)** | "All jobs have been moderated" (pending tab) / "No jobs found" (other tabs) |
| **Empty (users)** | "No users match your search. Try different filters." |
| **Empty (comments)** | "No comments to moderate." |
| **Confirm approve** | Modal: "Approve this job listing? It will be visible to the public." |
| **Confirm reject** | Modal: textarea for reason + "Are you sure you want to reject this job?" |
| **Confirm suspend** | Modal: "This will prevent [name] from logging in. Are you sure?" |
| **Confirm delete** | Modal: "Delete this comment permanently? This cannot be undone." |
| **API 422 (reject)** | "Rejection reason is required" — inline on modal |
| **API 422 (already processed)** | Banner: "This job has already been reviewed" |
| **Success** | Toast notification (auto-dismiss 3s) |

---

## 7. Key UX Requirements

- All destructive actions (reject, suspend, delete) require **confirmation dialogs** with clear warnings
- Rejection reason is **required** — modal textarea validates on submit
- Tab state persists in URL (e.g., `/admin?tab=users`) for deep-linking
- Bulk actions are out of scope (Phase 5+)
- Admin cannot modify own account status
- Deleted comments should immediately disappear from the list

---

## 8. Implementation Order

1. **AdminDashboard** — tabbed layout shell
2. **JobModeration** — list pending jobs, approve/reject with confirmation modals
3. **UserManagement** — list users, role filter, search, suspend/reactivate
4. **CommentModeration** — list comments, delete with confirmation
5. **Polish** — loading states, empty states, error boundaries, toast notifications
