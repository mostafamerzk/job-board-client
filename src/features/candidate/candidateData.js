import { apiGroups, apiRoutes } from '../../lib/apiConfig.js'

export const candidateEndpoints = [
  { method: 'GET', path: apiGroups.candidateProfile, label: 'Load profile' },
  { method: 'PUT', path: apiGroups.candidateProfile, label: 'Save profile' },
  { method: 'GET', path: apiGroups.candidateResumes, label: 'List resumes' },
  { method: 'POST', path: apiGroups.candidateResumes, label: 'Upload resume' },
  { method: 'GET', path: apiGroups.publicJobs, label: 'Search jobs' },
  { method: 'POST', path: apiGroups.candidateApplications, label: 'Apply' },
  { method: 'PUT', path: apiRoutes.candidateApplicationWithdraw('{application}'), label: 'Withdraw' },
]

export const candidateProfile = {
  fullName: 'Jane Smith',
  phone: '+1234567890',
  linkedinUrl: 'linkedin.com/in/janesmith',
  headline: 'Senior PHP Developer',
  bio: 'Experienced developer focused on Laravel APIs, React clients, and hiring workflows.',
}

export const resumeRules = {
  formats: 'PDF, DOC, DOCX',
  maxSize: '5MB',
  maxFiles: '5 resumes',
}

export const resumes = [
  {
    id: 1,
    originalName: 'jane-smith-backend.pdf',
    mimeType: 'application/pdf',
    size: '1.1MB',
    isPrimary: true,
  },
  {
    id: 2,
    originalName: 'jane-smith-fullstack.docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    size: '740KB',
    isPrimary: false,
  },
]

export const searchFilters = [
  { label: 'Keyword', value: 'laravel' },
  { label: 'Location', value: 'Remote' },
  { label: 'Work type', value: 'remote' },
  { label: 'Experience', value: 'senior' },
  { label: 'Salary', value: '$80k-$150k' },
]

export const jobMatches = [
  {
    id: 1,
    title: 'Senior Laravel Developer',
    company: 'Tech Corp',
    location: 'Remote',
    salary: '$80k-$120k',
    tags: ['Laravel', 'PHP', 'Remote'],
  },
  {
    id: 2,
    title: 'Full Stack Engineer',
    company: 'Product Labs',
    location: 'Hybrid',
    salary: '$90k-$140k',
    tags: ['React', 'Laravel', 'MySQL'],
  },
]

export const applicationDraft = {
  selectedJob: 'Senior Laravel Developer',
  selectedResume: 'jane-smith-backend.pdf',
  fallbackContact: 'jane@example.com',
  coverLetterLimit: '5000 characters',
}

export const applications = [
  {
    id: 1,
    jobTitle: 'Senior Laravel Developer',
    company: 'Tech Corp',
    status: 'pending',
    createdAt: '2026-06-11',
    action: apiRoutes.candidateApplicationWithdraw(1),
  },
  {
    id: 2,
    jobTitle: 'Backend API Engineer',
    company: 'Commerce Desk',
    status: 'accepted',
    createdAt: '2026-06-02',
    action: 'Locked after decision',
  },
  {
    id: 3,
    jobTitle: 'PHP Platform Developer',
    company: 'Orbit Works',
    status: 'withdrawn',
    createdAt: '2026-05-23',
    action: 'Already withdrawn',
  },
]

export const applicationStatusVariants = {
  accepted: 'success',
  pending: 'warning',
  rejected: 'danger',
  withdrawn: 'secondary',
}
