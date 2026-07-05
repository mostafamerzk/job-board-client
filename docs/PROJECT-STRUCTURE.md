# Project Structure

This client follows a **feature-sliced module structure**. Each feature owns its pages, components, API calls, and data. Shared code lives in `src/shared/`. The infrastructure layer (routing, auth, API client) provides building blocks for all features.

```text
job-board-client/
├── docs/
│   ├── API-REFERENCE.md           # Complete API endpoint reference
│   ├── MODULE-AUTH.md             # Auth module implementation guide
│   ├── MODULE-CANDIDATE.md        # Candidate module implementation guide
│   ├── MODULE-EMPLOYER.md         # Employer module implementation guide
│   ├── MODULE-PUBLIC-JOBS.md      # Public jobs module implementation guide
│   ├── MODULE-ADMIN.md            # Admin module implementation guide
│   ├── PROJECT-STRUCTURE.md       # This file
│   ├── TESTING-STRATEGY.md        # Testing approach and per-phase plan
│   └── WORK-DIVISION.md           # Team member task allocation
├── src/
│   ├── app/
│   │   └── App.jsx                # App shell: BrowserRouter + AuthProvider + AppShell + AppRouter
│   ├── shared/
│   │   ├── layout/
│   │   │   └── AppShell.jsx       # Navbar + page shell wrapper
│   │   ├── ui/
│   │   │   └── StatusPill.jsx     # Reusable status badge
│   │   └── hooks/                 # Shared custom hooks (future)
│   ├── features/
│   │   ├── home/                  # Landing page (public)
│   │   │   ├── pages/
│   │   │   │   └── HomePage.jsx   # Landing page with hero, product map, workspaces
│   │   │   ├── components/        # Home-specific components (future)
│   │   │   └── moduleData.jsx     # Static config: module cards, workspace tabs, phase plan
│   │   ├── auth/                  # Authentication (public routes)
│   │   │   ├── pages/
│   │   │   │   ├── LoginPage.jsx  # Login form (placeholder)
│   │   │   │   ├── RegisterPage.jsx # Register form (placeholder)
│   │   │   │   └── UnauthorizedPage.jsx # Access denied page
│   │   │   ├── components/        # Auth-specific components (future)
│   │   │   └── api/               # Auth API functions (future)
│   │   ├── candidate/             # Candidate workspace (protected: candidate role)
│   │   │   ├── pages/
│   │   │   │   └── CandidateDashboard.jsx  # Candidate workspace layout
│   │   │   ├── components/
│   │   │   │   ├── ProfilePanel.jsx        # Candidate profile form
│   │   │   │   ├── ResumeManager.jsx       # Resume upload/list/manage
│   │   │   │   ├── JobSearchPanel.jsx      # Job search + matches
│   │   │   │   ├── ApplicationComposer.jsx # Submit application
│   │   │   │   ├── ApplicationHistory.jsx  # Application status table
│   │   │   │   └── PanelTitle.jsx          # Panel heading helper
│   │   │   ├── api/               # Candidate API functions (future)
│   │   │   ├── data/
│   │   │   │   └── candidateConstants.js   # Status variants, resume rules (future)
│   │   │   └── candidateData.js   # Static fixtures until API integration
│   │   ├── employer/              # Employer workspace (protected: employer role)
│   │   │   ├── pages/
│   │   │   │   └── EmployerDashboard.jsx   # Employer workspace (placeholder)
│   │   │   ├── components/        # Employer-specific components (future)
│   │   │   └── api/               # Employer API functions (future)
│   │   ├── publicJobs/            # Public job search (no auth)
│   │   │   ├── pages/
│   │   │   │   ├── JobListPage.jsx    # Job search results (placeholder)
│   │   │   │   └── JobDetailPage.jsx  # Job detail view (placeholder)
│   │   │   ├── components/        # Public job components (future)
│   │   │   └── api/               # Public jobs API functions (future)
│   │   └── admin/                 # Admin console (protected: admin role)
│   │       ├── pages/
│   │       │   └── AdminDashboard.jsx    # Admin console (placeholder)
│   │       ├── components/        # Admin-specific components (future)
│   │       └── api/               # Admin API functions (future)
│   ├── routes/
│   │   ├── AppRouter.jsx          # All route definitions with guards
│   │   ├── ProtectedRoute.jsx     # Auth check wrapper
│   │   ├── RoleGuard.jsx          # Role check wrapper
│   │   └── NotFoundPage.jsx       # 404 catch-all
│   ├── context/
│   │   └── AuthContext.jsx        # Auth state + token persistence + login/register/logout
│   ├── hooks/
│   │   └── useAuth.js            # Auth context consumer hook
│   ├── lib/
│   │   ├── apiClient.js           # Fetch wrapper with auth, error handling, 401 redirect
│   │   └── apiConfig.js           # Route config (env-driven base URL)
│   ├── styles/
│   │   └── index.css              # Global styles + design tokens
│   └── main.jsx                   # React entry point
├── .env                           # VITE_API_BASE_URL
├── DESIGN.md                      # Design system (colors, typography, spacing)
├── package.json
└── vite.config.js
```

## Folder Ownership Rules

| Folder | Owns | Add files when |
|--------|------|----------------|
| `src/app` | App composition, provider wiring | The concern affects the whole client |
| `src/shared/layout` | Navbar, page shells, layout-only components | Reused across two or more pages |
| `src/shared/ui` | Small shared UI primitives | Domain-neutral |
| `src/shared/hooks` | Shared custom hooks | Used by 2+ feature modules |
| `src/features/*` | Domain screens and feature-local code | Maps to an API module |
| `src/routes` | Route definitions, auth/role guards | Adding a new route or guard |
| `src/context` | React Context providers | Global state that crosses features |
| `src/hooks` | Global shared hooks | Cross-feature hook |
| `src/lib` | API client, route config, core utilities | Non-UI infrastructure |
| `src/styles` | Global overrides and design tokens | Global CSS rule |

## Feature Module Convention

Each feature folder (`auth/`, `candidate/`, `employer/`, `publicJobs/`, `admin/`) follows:

| Subfolder | Content |
|-----------|---------|
| `pages/` | Route-level components (one per route) |
| `components/` | Feature-specific UI components |
| `api/` | API call functions (future) |
| `data/` | Constants, fixtures, configuration |

One team member owns one feature folder at a time.

## API Boundary

- Base URL: driven by `VITE_API_BASE_URL` env var (default: `/api/v1`)
- Auth: Bearer token via `apiClient` (auto-attached, auto-redirect on 401)
- Response shape: follows `docs/API-REFERENCE.md`
- Expected roles: `candidate`, `employer`, `admin`
