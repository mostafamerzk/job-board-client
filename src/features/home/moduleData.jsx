import {
  Building2,
  Search,
  UserRound,
  UsersRound,
} from 'lucide-react'

export const moduleCards = [
  {
    title: 'Public jobs',
    description: 'Search, filter, category browsing, technology filters, and approved job details.',
    status: 'Public API',
    icon: <Search size={22} aria-hidden="true" />,
  },
  {
    title: 'Employer workspace',
    description: 'Company profile, logo upload, job CRUD, applicant review, and hiring decisions.',
    status: 'Role: employer',
    icon: <Building2 size={22} aria-hidden="true" />,
  },
  {
    title: 'Candidate workspace',
    description: 'Candidate profile, resume library, applications, withdrawals, and job history.',
    status: 'Role: candidate',
    icon: <UserRound size={22} aria-hidden="true" />,
  },
  {
    title: 'Admin console',
    description: 'Job approval, user moderation, comment moderation, and platform analytics.',
    status: 'Role: admin',
    icon: <UsersRound size={22} aria-hidden="true" />,
  },
]

export const workspaceTabs = [
  {
    key: 'employer',
    title: 'Employer',
    heading: 'Employer workspace',
    summary: 'Owns employer profile setup, job drafting, submission status, and application review.',
    items: [
      'Use /employer/profile for company onboarding',
      'Keep job forms aligned with pending approval workflow',
      'Separate application review from public job search',
    ],
  },
  {
    key: 'candidate',
    title: 'Candidate',
    heading: 'Candidate workspace',
    summary: 'Owns candidate profile, resume upload, application submission, and application history.',
    items: [
      'Support resume or contact-info application paths',
      'Show application statuses: pending, accepted, rejected, withdrawn',
      'Treat resume upload as a dedicated integration surface',
    ],
  },
  {
    key: 'admin',
    title: 'Admin',
    heading: 'Admin console',
    summary: 'Owns moderation screens and operational lists across jobs, users, and comments.',
    items: [
      'Surface pending jobs before approved listings',
      'Keep destructive actions confirmable and auditable',
      'Expose filters by status, role, employer, and visibility',
    ],
  },
]

export const phasePlan = [
  {
    phase: '01',
    title: 'Foundation',
    scope: 'Bootstrap, routing, auth token storage policy, API client, shared layout, and form rules.',
  },
  {
    phase: '02',
    title: 'Employer',
    scope: 'Employer profile, company logo, job create/edit/list, and employer-scoped guards.',
  },
  {
    phase: '03',
    title: 'Candidate',
    scope: 'Candidate profile, resumes, job search, application creation, and application history.',
  },
  {
    phase: '04',
    title: 'Admin',
    scope: 'Job approval, user activation, comment moderation, and admin-only navigation.',
  },
  {
    phase: '05',
    title: 'Bonus',
    scope: 'Payments, notifications, analytics, resume database, and LinkedIn integration.',
  },
]

export const qualityChecks = [
  'Component tests for form behavior and state changes',
  'API integration tests against mocked /api/v1 responses',
  'Role-based route tests for employer, candidate, and admin screens',
  'Browser smoke tests for public search and authenticated workspaces',
  'Accessibility checks for keyboard focus, labels, contrast, and empty states',
]
