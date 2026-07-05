# Public Jobs Module — Implementation Guide

## 1. Overview

Public job search and browsing. No authentication required. This module serves as the entry point for all site visitors — they can search, filter, and view job details without logging in.

**Route prefix:** `/jobs`
**Auth:** Public (no authentication required)
**API groups:** `/api/v1/jobs`, `/api/v1/categories`, `/api/v1/technologies`

---

## 2. API Endpoints

### GET /jobs
```
Auth:     None (public)
Query:
  keyword       — string       ?keyword=laravel
  category_id   — integer      ?category_id=1
  technology_ids — comma-sep   ?technology_ids=2,3
  location      — string       ?location=new+york
  work_type     — enum         ?work_type=remote
  experience_level — enum      ?experience_level=senior
  salary_min    — integer      ?salary_min=50000
  salary_max    — integer      ?salary_max=150000
  date_from     — date (Y-m-d) ?date_from=2026-01-01
  date_to       — date (Y-m-d) ?date_to=2026-06-11
  sort          — string       ?sort=salary_desc
  per_page      — integer      ?per_page=20

Sort options: created_at_desc (default), created_at_asc, salary_desc, salary_asc

Response: { data: [ Job ], meta: { current_page, last_page, per_page, total } }
```

### GET /jobs/{job}
```
Auth:     None (public)
Response: { data: Job (full detail + employer info + comments_count) }
Errors:   404 — not found or not approved
```

### GET /categories
```
Auth:     None (public)
Response: { data: [ { id, name, slug, jobs_count } ] }
```

### GET /categories/{category}
```
Auth:     None (public)
Response: { data: { id, name, slug, jobs_count } }
Errors:   404 — not found
```

### GET /technologies
```
Auth:     None (public)
Response: { data: [ { id, name, slug } ] }
```

---

## 3. Route Paths

| Path | Component | Auth | Role | Notes |
|------|-----------|------|------|-------|
| `/jobs` | JobListPage | ❌ Public | — | Search + filter + paginated results |
| `/jobs/:id` | JobDetailPage | ❌ Public | — | Full job detail + apply CTA |

---

## 4. Data Structures

```js
// Job (public listing)
{
  id, title, slug, description, salary_min, salary_max, salary_currency,
  location, work_type, experience_level, created_at,
  employer: { company_name, logo_url, location },
  category: { id, name },
  technologies: [{ id, name }]
}

// Job (public detail — extended)
{
  ...above,
  responsibilities, requirements, benefits, application_deadline,
  employer: { ...company_description, website },
  comments_count
}

// Category
{ id, name, slug, jobs_count }

// Technology
{ id, name, slug }
```

## 5. Component Specs

### JobListPage
- **Search bar:** keyword input with search icon
- **Filters sidebar/panel:** category (dropdown from GET /categories), work_type (radio: remote/hybrid/onsite), experience_level (select), salary range (min/max inputs), location (text input)
- **Results grid:** list of JobCard components
- **Pagination:** page numbers + prev/next from meta
- **Empty state:** "No jobs found" with illustration + "Try adjusting your filters" guidance
- **Loading state:** skeleton cards (3-6 placeholder cards with shimmer)
- **Error state:** "Unable to load jobs. Please try again." + retry button
- **Edge:** zero results after filter change → show message immediately, no pagination

### JobCard
- **Props:** job object
- **Display:** title, company name, location, salary range, tags (technologies), posted date (relative: "3 days ago")
- **Action:** click → navigate to `/jobs/:id`
- **States:** hover lift effect, focus ring

### JobDetailPage
- **Header:** title, company name + logo, location, salary, work_type
- **Sections:** description, responsibilities, requirements, benefits
- **Sidebar:** company info (logo, description, website), application deadline
- **CTA:** "Apply now" button (if logged in → navigate to /candidate/apply?job=:id, if not → navigate to /register)
- **Comments section:** list of comments + "Login to comment" prompt
- **States:** loading (skeleton), not found (404 message), error

### SearchFilters (reusable)
- **Props:** onFilterChange, initialFilters, categories[], technologies[]
- **Behavior:** debounced (300ms) on text inputs, immediate on selects
- **Mobile:** collapsible filter panel

### Pagination
- **Props:** currentPage, lastPage, onPageChange
- **Display:** prev/next + page numbers (show max 5, with ellipsis)

---

## 6. States to Handle

| State | UX |
|-------|-----|
| **Loading** | Skeleton cards (6) + disabled filters |
| **Empty (no results)** | "No jobs found" + illustration + "Try different keywords or filters" |
| **Empty (no filters)** | Should not happen — always show paginated results |
| **API error** | Banner: "Unable to load jobs" + retry button |
| **Job detail 404** | "This job listing is no longer available" + back to /jobs link |
| **Filtering** | Show results update as user types (debounced) |
| **Paginating** | Skeleton during page transition |

---

## 7. Static Fixtures

The job listing data (`jobMatches`) currently lives in `src/features/candidate/candidateData.js`. For this module, either:

1. **Move** a copy of `jobMatches` to `src/features/publicJobs/data/jobFixtures.js` as fallback fixtures
2. **Or** import from candidate data temporarily (not recommended — creates cross-module dependency)

**Preferred approach:** Create `src/features/publicJobs/data/jobFixtures.js` with:
```js
export const publicJobFixtures = [ /* jobMatches structure */ ]
export const categoryFixtures = [...]
export const technologyFixtures = [...]
```

---

## 8. Key UX Requirements

- Search results update as filters change (debounce 300ms)
- Mobile: filters are collapsible (accordion or offcanvas)
- Job card shows relative date ("Posted 3 days ago")
- Empty results show actionable guidance, not just "no results"
- Job detail "Apply" button adapts based on auth status
- Page title updates with job title on detail page
- Meta description for SEO on detail page

---

## 9. Implementation Order

1. **JobListPage** — fetch GET /jobs, render JobCard list, basic keyword search
2. **JobCard** — card component with hover/focus states
3. **SearchFilters** — filter bar with category, work_type, experience_level, salary range
4. **Pagination** — page nav component
5. **JobDetailPage** — fetch GET /jobs/{id}, render full detail
6. **Categories/Technologies** — fetch for filter dropdowns
7. **Comments section** — on detail page (read-only for public)
8. **Polish** — loading skeletons, empty states, mobile layout, debounce
