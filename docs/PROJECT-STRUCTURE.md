# Project Structure

This client is organized by responsibility first, then feature. Keep the root small and move code only when a second file needs the pattern.

```text
job-board-client/
├── docs/
│   ├── API-REFERENCE.md
│   ├── PROJECT-STRUCTURE.md
│   ├── TESTING-STRATEGY.md
│   └── WORK-DIVISION.md
├── src/
│   ├── app/
│   │   └── App.jsx
│   ├── components/
│   │   ├── layout/
│   │   └── ui/
│   ├── features/
│   │   ├── candidate/
│   │   └── home/
│   ├── lib/
│   │   └── apiConfig.js
│   ├── styles/
│   │   └── index.css
│   └── main.jsx
├── DESIGN.md
├── package.json
└── vite.config.js
```

## Folder Rules

| Folder | Owns | Add files when |
| --- | --- | --- |
| `src/app` | App composition, providers, route shell | The concern affects the whole client |
| `src/components/layout` | Navbar, page shells, layout-only components | Reused across two or more pages |
| `src/components/ui` | Small shared UI primitives | They are domain-neutral |
| `src/features` | Domain screens and feature-local data/components | The code maps to an API module |
| `src/lib` | API config, shared client helpers, constants | The code has no UI |
| `src/styles` | Global Bootstrap overrides and design tokens | The rule is global |

## Feature Split

Future feature folders should follow the backend modules:

```text
src/features/
├── auth/
├── candidate/
├── employer/
├── public-jobs/
├── applications/
├── comments/
└── admin/
```

Each feature may contain `components/`, `pages/`, `api/`, and `fixtures/` only after those files exist. Do not pre-create empty folders.

## Current Feature Folders

| Feature | Files | Purpose |
| --- | --- | --- |
| `src/features/home` | `moduleData.jsx` | Landing/product map data for team orientation |
| `src/features/candidate` | `candidateData.js`, `CandidateModule.jsx` | Phase 3 candidate profile, resumes, public search, and applications workspace |

## API Boundary

- Base URL: `/api/v1`
- Auth: Sanctum bearer token
- Response shape: follow `docs/API-REFERENCE.md`
- Expected roles: `candidate`, `employer`, `admin`

API functions belong beside the feature that uses them until two features share the same call. Shared API configuration belongs in `src/lib`.
