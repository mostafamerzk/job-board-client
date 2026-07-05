# Job Board API — Complete Endpoint Reference

**Base URL:** `/api/v1`
**Format:** JSON
**Auth:** Bearer token (Sanctum)

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [User Profile](#2-user-profile)
3. [Employer Module](#3-employer-module)
4. [Candidate Module](#4-candidate-module)
5. [Job Search (Public)](#5-job-search-public)
6. [Applications](#6-applications)
7. [Categories & Technologies](#7-categories--technologies)
8. [Comments](#8-comments)
9. [Admin Module](#9-admin-module)

---

## 1. Authentication

### POST /register

Create a new user account and return an API token.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "password_confirmation": "securePassword123",
  "role": "employer"
}
```

**Response `201`:**
```json
{
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "employer",
      "created_at": "2026-06-11T12:00:00Z"
    },
    "token": "1|abc123def456..."
  },
  "message": "Registered successfully"
}
```

**Errors:** `422` — validation error (duplicate email, weak password, invalid role)

> `role` is optional. Defaults to `candidate` if omitted.

---

### POST /login

Authenticate user and return an API token.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response `200`:**
```json
{
  "data": {
    "user": { "id": 1, "name": "John Doe", "email": "john@example.com", "role": "employer" },
    "token": "2|xyz789abc..."
  },
  "message": "Logged in successfully"
}
```

**Errors:** `401` — Invalid credentials
- `403` — Account suspended

---

### POST /logout

Revoke the current API token.

**Headers:** `Authorization: Bearer {token}`

**Request:** (empty body)

**Response `200`:**
```json
{
  "message": "Logged out successfully"
}
```

**Errors:** `401` — Unauthenticated

---

## 2. User Profile

### GET /me

Get the authenticated user's profile.

**Headers:** `Authorization: Bearer {token}`

**Response `200`:**
```json
{
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "employer",
    "phone": null,
    "avatar_url": null,
    "is_active": true,
    "created_at": "2026-06-11T12:00:00Z"
  }
}
```

Role-specific profile is included when available:
- For employers: includes `employer_profile` (company_name, logo_url, etc.)
- For candidates: includes `candidate_profile` (full_name, headline, linkedin_url, etc.)

---

## 3. Employer Module

### GET /employer/profile

Get employer's company profile.

**Headers:** `Authorization: Bearer {token}`, Role: employer

**Response `200`:**
```json
{
  "data": {
    "id": 1,
    "company_name": "Tech Corp",
    "company_description": "Leading tech company...",
    "website": "https://techcorp.com",
    "logo_url": "https://example.com/storage/employers/logos/logo.png",
    "location": "San Francisco, CA",
    "contact_email": "hr@techcorp.com",
    "created_at": "2026-06-11T12:00:00Z"
  }
}
```

---

### PUT /employer/profile

Create or update employer's company profile.

**Headers:** `Authorization: Bearer {token}`, Role: employer

**Request:**
```json
{
  "company_name": "Tech Corp",
  "company_description": "We build amazing things...",
  "website": "https://techcorp.com",
  "location": "San Francisco, CA",
  "contact_email": "hr@techcorp.com"
}
```

**Response `200`:**
```json
{
  "data": { ... },
  "message": "Profile updated successfully"
}
```

---

### POST /employer/logo

Upload company logo.

**Headers:** `Authorization: Bearer {token}`, Role: employer

**Request:** `multipart/form-data`
- `logo`: file (image/*, max 2MB)

**Response `200`:**
```json
{
  "data": {
    "logo_url": "https://example.com/storage/employers/logos/abc123.png"
  },
  "message": "Logo uploaded successfully"
}
```

---

### GET /employer/jobs

List employer's own job listings (all statuses).

**Headers:** `Authorization: Bearer {token}`, Role: employer

**Query params:** `?page=1&per_page=15&status=pending`

**Response `200`:**
```json
{
  "data": [
    {
      "id": 1,
      "title": "Senior Laravel Developer",
      "slug": "senior-laravel-developer",
      "status": "pending",
      "work_type": "remote",
      "location": "Remote",
      "salary_min": 80000,
      "salary_max": 120000,
      "created_at": "2026-06-11T12:00:00Z",
      "category": { "id": 1, "name": "Programming & Development" },
      "technologies": [
        { "id": 2, "name": "Laravel" },
        { "id": 3, "name": "PHP" }
      ],
      "applications_count": 5
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 3,
    "per_page": 15,
    "total": 35
  }
}
```

---

### POST /employer/jobs

Create a new job listing.

**Headers:** `Authorization: Bearer {token}`, Role: employer

**Request:**
```json
{
  "title": "Senior Laravel Developer",
  "description": "We are looking for an experienced Laravel developer...",
  "responsibilities": "Build REST APIs, write tests, mentor juniors",
  "requirements": "5+ years PHP, 3+ years Laravel",
  "benefits": "Remote work, equity, health insurance",
  "salary_min": 80000,
  "salary_max": 120000,
  "salary_currency": "USD",
  "location": "Remote",
  "work_type": "remote",
  "experience_level": "senior",
  "category_id": 1,
  "technologies": [2, 3, 7],
  "application_deadline": "2026-07-11"
}
```

**Response `201`:**
```json
{
  "data": {
    "id": 1,
    "title": "Senior Laravel Developer",
    "slug": "senior-laravel-developer",
    "status": "pending",
    ...
  },
  "message": "Job created successfully"
}
```

**Errors:** `422` — validation error

---

### GET /employer/jobs/{job}

Get employer's single job listing detail.

**Headers:** `Authorization: Bearer {token}`, Role: employer

**Response `200`:**
```json
{
  "data": {
    "id": 1,
    "title": "Senior Laravel Developer",
    "slug": "senior-laravel-developer",
    "description": "Full description...",
    "responsibilities": "...",
    "requirements": "...",
    "benefits": "...",
    "salary_min": 80000,
    "salary_max": 120000,
    "salary_currency": "USD",
    "location": "Remote",
    "work_type": "remote",
    "experience_level": "senior",
    "status": "pending",
    "rejection_reason": null,
    "application_deadline": "2026-07-11",
    "created_at": "2026-06-11T12:00:00Z",
    "updated_at": "2026-06-11T12:00:00Z",
    "category": { ... },
    "technologies": [ ... ],
    "applications_count": 5
  }
}
```

---

### PUT /employer/jobs/{job}

Update employer's own job listing.

**Headers:** `Authorization: Bearer {token}`, Role: employer

**Request:** (same fields as create, all optional)
```json
{
  "title": "Updated Title",
  "salary_max": 130000
}
```

**Response `200`:**
```json
{
  "data": { ... },
  "message": "Job updated successfully"
}
```

**Note:** `status` and `employer_id` cannot be changed.

---

### DELETE /employer/jobs/{job}

Soft delete employer's own job listing.

**Headers:** `Authorization: Bearer {token}`, Role: employer

**Response `204`:** No content

---

### GET /employer/jobs/{job}/applications

List applications for a specific job (employer's own job only).

**Headers:** `Authorization: Bearer {token}`, Role: employer

**Query params:** `?status=pending`

**Response `200`:**
```json
{
  "data": [
    {
      "id": 1,
      "job_id": 1,
      "candidate": {
        "id": 5,
        "name": "Jane Smith",
        "email": "jane@example.com",
        "candidate_profile": {
          "headline": "Senior PHP Developer",
          "location": "New York"
        }
      },
      "resume": {
        "id": 1,
        "original_name": "jane-smith-resume.pdf",
        "url": "https://..."
      },
      "status": "pending",
      "created_at": "2026-06-11T12:00:00Z"
    }
  ],
  "meta": { ... }
}
```

---

### PUT /employer/applications/{application}/status

Accept or reject a candidate's application.

**Headers:** `Authorization: Bearer {token}`, Role: employer

**Request:**
```json
{
  "status": "accepted",
  "employer_notes": "Impressive background, scheduling interview"
}
```

Or reject:
```json
{
  "status": "rejected"
}
```

**Response `200` (accepted):**
```json
{
  "data": {
    "id": 1,
    "status": "accepted",
    ...
  },
  "message": "Application accepted successfully"
}
```

**Response `200` (rejected):**
```json
{
  "data": {
    "id": 1,
    "status": "rejected",
    ...
  },
  "message": "Application rejected"
}
```

**Notes:**
- Only allowed transitions: `pending → accepted`, `pending → rejected`
- Cannot accept/reject withdrawn applications

---

### GET /employer/applications/{application}

Get a single application detail (employer's own job's application only).

**Headers:** `Authorization: Bearer {token}`, Role: employer

**Response `200`:**
```json
{
  "data": {
    "id": 1,
    "job_id": 1,
    "status": "pending",
    "candidate": {
      "id": 5,
      "name": "Jane Smith",
      "email": "jane@example.com",
      "candidate_profile": {
        "headline": "Senior PHP Developer",
        "location": "New York"
      }
    },
    "resume": {
      "id": 1,
      "original_name": "jane-smith-resume.pdf",
      "url": "https://..."
    },
    "employer_notes": null,
    "created_at": "2026-06-11T12:00:00Z"
  }
}
```

---

## 4. Candidate Module

### GET /candidate/profile

Get candidate's own profile.

**Headers:** `Authorization: Bearer {token}`, Role: candidate

**Response `200`:**
```json
{
  "data": {
    "id": 1,
    "full_name": "Jane Smith",
    "phone": "+1234567890",
    "linkedin_url": "https://linkedin.com/in/janesmith",
    "headline": "Senior PHP Developer",
    "bio": "Experienced developer...",
    "resumes": [
      {
        "id": 1,
        "original_name": "resume.pdf",
        "url": "https://...",
        "mime_type": "application/pdf",
        "size": 1024000,
        "is_primary": true
      }
    ]
  }
}
```

---

### PUT /candidate/profile

Create or update candidate's profile.

**Headers:** `Authorization: Bearer {token}`, Role: candidate

**Request:**
```json
{
  "full_name": "Jane Smith",
  "phone": "+1234567890",
  "linkedin_url": "https://linkedin.com/in/janesmith",
  "headline": "Senior PHP Developer",
  "bio": "Experienced developer with 8 years..."
}
```

**Response `200`:** Profile data

---

### GET /candidate/resumes

List candidate's own uploaded resumes.

**Headers:** `Authorization: Bearer {token}`, Role: candidate

**Response `200`:**
```json
{
  "data": [
    {
      "id": 1,
      "original_name": "resume.pdf",
      "url": "https://...",
      "mime_type": "application/pdf",
      "size": 1024000,
      "is_primary": true
    }
  ]
}
```

---

### POST /candidate/resumes

Upload a new resume.

**Headers:** `Authorization: Bearer {token}`, Role: candidate

**Request:** `multipart/form-data`
- `resume`: file (pdf, doc, docx, max 5MB)

**Response `201`:**
```json
{
  "data": {
    "id": 2,
    "original_name": "resume.pdf",
    "url": "https://...",
    "mime_type": "application/pdf",
    "size": 1024000,
    "is_primary": false
  },
  "message": "Resume uploaded successfully"
}
```

---

### DELETE /candidate/resumes/{resume}

Delete a resume.

**Headers:** `Authorization: Bearer {token}`, Role: candidate

**Response `204`:** No content

---

## 5. Job Search (Public)

### GET /jobs

Search approved jobs with filters. No authentication required.

**Query Parameters:**

| Parameter | Type | Example |
|-----------|------|---------|
| `keyword` | string | `?keyword=laravel` |
| `category_id` | integer | `?category_id=1` |
| `technology_ids` | comma-separated | `?technology_ids=2,3` |
| `location` | string | `?location=new+york` |
| `work_type` | enum | `?work_type=remote` |
| `experience_level` | enum | `?experience_level=senior` |
| `salary_min` | integer | `?salary_min=50000` |
| `salary_max` | integer | `?salary_max=150000` |
| `date_from` | date | `?date_from=2026-01-01` |
| `date_to` | date | `?date_to=2026-06-11` |
| `sort` | string | `?sort=salary_desc` |
| `per_page` | integer | `?per_page=20` |

**Sort options:** `created_at_desc` (default), `created_at_asc`, `salary_desc`, `salary_asc`

**Response `200`:**
```json
{
  "data": [
    {
      "id": 1,
      "title": "Senior Laravel Developer",
      "slug": "senior-laravel-developer",
      "description": "We are looking for...",
      "salary_min": 80000,
      "salary_max": 120000,
      "salary_currency": "USD",
      "location": "Remote",
      "work_type": "remote",
      "experience_level": "senior",
      "created_at": "2026-06-10T12:00:00Z",
      "employer": {
        "company_name": "Tech Corp",
        "logo_url": "https://...",
        "location": "San Francisco, CA"
      },
      "category": { "id": 1, "name": "Programming & Development" },
      "technologies": [
        { "id": 2, "name": "Laravel" },
        { "id": 3, "name": "PHP" }
      ]
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 5,
    "per_page": 15,
    "total": 65
  }
}
```

---

### GET /jobs/{job}

Get single approved job detail. No authentication required.

**Response `200`:**
```json
{
  "data": {
    "id": 1,
    "title": "Senior Laravel Developer",
    "slug": "senior-laravel-developer",
    "description": "Full detailed description...",
    "responsibilities": "List of responsibilities...",
    "requirements": "List of requirements...",
    "benefits": "List of benefits...",
    "salary_min": 80000,
    "salary_max": 120000,
    "salary_currency": "USD",
    "location": "Remote",
    "work_type": "remote",
    "experience_level": "senior",
    "application_deadline": "2026-07-11",
    "created_at": "2026-06-10T12:00:00Z",
    "employer": {
      "company_name": "Tech Corp",
      "company_description": "Leading tech...",
      "logo_url": "https://...",
      "website": "https://techcorp.com",
      "location": "San Francisco, CA"
    },
    "category": { "id": 1, "name": "Programming & Development" },
    "technologies": [
      { "id": 2, "name": "Laravel" },
      { "id": 3, "name": "PHP" }
    ],
    "comments_count": 3
  }
}
```

**Errors:** `404` — Job not found or not approved

---

## 6. Applications

### POST /candidate/applications

Apply for a job.

**Headers:** `Authorization: Bearer {token}`, Role: candidate

**Request (with resume):**
```json
{
  "job_id": 1,
  "resume_id": 2,
  "cover_letter": "I am very interested in this position..."
}
```

**Request (with contact info, no resume):**
```json
{
  "job_id": 1,
  "contact_email": "jane@example.com",
  "contact_phone": "+1234567890",
  "cover_letter": "I am very interested..."
}
```

**Response `201`:**
```json
{
  "data": {
    "id": 1,
    "job_id": 1,
    "status": "pending",
    "created_at": "2026-06-11T12:00:00Z"
  },
  "message": "Application submitted successfully"
}
```

**Errors:**
- `422` — Validation error, or duplicate application
- `400` — Job is not approved or deadline has passed

---

### GET /candidate/applications

List candidate's own applications.

**Headers:** `Authorization: Bearer {token}`, Role: candidate

**Response `200`:**
```json
{
  "data": [
    {
      "id": 1,
      "job": {
        "id": 1,
        "title": "Senior Laravel Developer",
        "employer": { "company_name": "Tech Corp" }
      },
      "status": "pending",
      "created_at": "2026-06-11T12:00:00Z"
    }
  ]
}
```

---

### PUT /candidate/applications/{application}/withdraw

Withdraw a pending application.

**Headers:** `Authorization: Bearer {token}`, Role: candidate

**Response `200`:**
```json
{
  "data": {
    "id": 1,
    "status": "withdrawn",
    ...
  },
  "message": "Application withdrawn successfully"
}
```

**Errors:** `400` — Application is already accepted/rejected, cannot withdraw

---

## 7. Categories & Technologies

### GET /categories

List all job categories.

**No auth required.**

**Response `200`:**
```json
{
  "data": [
    { "id": 1, "name": "Programming & Development", "slug": "programming-development", "jobs_count": 25 },
    { "id": 2, "name": "Data Science & Analytics", "slug": "data-science-analytics", "jobs_count": 10 }
  ]
}
```

---

### GET /categories/{category}

Get a single category by ID.

**No auth required.**

**Response `200`:**
```json
{
  "data": {
    "id": 1,
    "name": "Programming & Development",
    "slug": "programming-development",
    "jobs_count": 25
  }
}
```

**Errors:** `404` — Category not found

---

### GET /technologies

List all technologies/skills.

**No auth required.**

**Response `200`:**
```json
{
  "data": [
    { "id": 1, "name": "PHP", "slug": "php" },
    { "id": 2, "name": "Laravel", "slug": "laravel" }
  ]
}
```

---

## 8. Comments

### GET /jobs/{job}/comments

List visible comments on a job. No auth required.

**Response `200`:**
```json
{
  "data": [
    {
      "id": 1,
      "body": "Great opportunity! How many years of experience required?",
      "user": { "id": 5, "name": "Jane Smith" },
      "created_at": "2026-06-11T12:00:00Z"
    }
  ]
}
```

---

### POST /jobs/{job}/comments

Add a comment to a job.

**Headers:** `Authorization: Bearer {token}`

**Request:**
```json
{
  "body": "Great opportunity! I have 5 years of experience."
}
```

**Response `201`:**
```json
{
  "data": {
    "id": 2,
    "body": "Great opportunity! I have 5 years of experience.",
    "user": { "id": 5, "name": "Jane Smith" },
    "created_at": "2026-06-11T12:00:00Z"
  },
  "message": "Comment added successfully"
}
```

---

### DELETE /comments/{comment}

Delete a comment (author only, or admin).

**Headers:** `Authorization: Bearer {token}`

**Response `204`:** No content

---

## 9. Admin Module

### GET /admin/jobs

List all jobs (all statuses). Admin only.

**Headers:** `Authorization: Bearer {token}`, Role: admin

**Query params:** `?status=pending&page=1&per_page=15`

---

### GET /admin/jobs/{job}

Get a single job detail (any status). Admin only.

**Headers:** `Authorization: Bearer {token}`, Role: admin

**Response `200`:**
```json
{
  "data": {
    "id": 1,
    "title": "Senior Laravel Developer",
    "status": "pending",
    "employer": { "company_name": "Tech Corp" },
    "category": { "id": 1, "name": "Programming & Development" },
    "technologies": [{ "id": 2, "name": "Laravel" }],
    ...
  }
}
```

**Errors:** `404` — Job not found

---

### PUT /admin/jobs/{job}/approve

Approve a pending job.

**Headers:** `Authorization: Bearer {token}`, Role: admin

**Request:** (empty body)

**Response `200`:**
```json
{
  "data": { "id": 1, "status": "approved" },
  "message": "Job approved successfully"
}
```

**Errors:** `422` — Job is not in pending status

---

### PUT /admin/jobs/{job}/reject

Reject a pending job with reason.

**Headers:** `Authorization: Bearer {token}`, Role: admin

**Request:**
```json
{
  "rejection_reason": "Insufficient job description detail"
}
```

**Response `200`:**
```json
{
  "data": { "id": 1, "status": "rejected", "rejection_reason": "Insufficient job description detail" },
  "message": "Job rejected"
}
```

---

### GET /admin/users

List all users.

**Headers:** `Authorization: Bearer {token}`, Role: admin

**Query params:** `?role=employer&is_active=true&search=john&page=1`

---

### GET /admin/users/{user}

Get a single user detail with profile and counts. Admin only.

**Headers:** `Authorization: Bearer {token}`, Role: admin

**Response `200`:**
```json
{
  "data": {
    "id": 5,
    "name": "Jane Smith",
    "email": "jane@example.com",
    "role": "candidate",
    "is_active": true,
    "jobs_count": 0,
    "applications_count": 3,
    "employer_profile": null,
    "candidate_profile": {
      "headline": "Senior PHP Developer",
      "location": "New York"
    },
    "created_at": "2026-06-11T12:00:00Z"
  }
}
```

**Errors:** `404` — User not found

---

### PUT /admin/users/{user}/toggle-active

Suspend or reactivate a user.

**Headers:** `Authorization: Bearer {token}`, Role: admin

**Response `200`:**
```json
{
  "data": { "id": 5, "is_active": false },
  "message": "User suspended successfully"
}
```

---

### GET /admin/comments

List all comments (including hidden/visible).

**Headers:** `Authorization: Bearer {token}`, Role: admin

**Query params:** `?is_visible=false&page=1`

---

### DELETE /admin/comments/{comment}

Hard-delete a comment.

**Headers:** `Authorization: Bearer {token}`, Role: admin

**Response `204`:** No content


