export const mockAdminJob = {
  id: 1,
  title: 'Senior Laravel Developer',
  status: 'pending',
  rejection_reason: null,
  created_at: '2026-06-15T10:00:00.000000Z',
  updated_at: '2026-06-15T10:00:00.000000Z',
  employer: { company_name: 'Tech Corp' },
  category: { id: 1, name: 'Engineering' },
  technologies: [{ id: 1, name: 'PHP' }, { id: 2, name: 'Laravel' }],
  applications_count: 3,
}

export const mockAdminJobApproved = {
  ...mockAdminJob,
  id: 2,
  title: 'Frontend Developer',
  status: 'approved',
  applications_count: 5,
}

export const mockAdminJobRejected = {
  ...mockAdminJob,
  id: 3,
  title: 'Junior Developer',
  status: 'rejected',
  rejection_reason: 'Position filled internally',
  applications_count: 0,
}

export const mockAdminJobsPage = {
  data: [mockAdminJob, mockAdminJobApproved, mockAdminJobRejected],
  meta: {
    current_page: 1,
    last_page: 3,
    per_page: 15,
    total: 35,
  },
}

export const mockAdminUser = {
  id: 2,
  name: 'Jane Candidate',
  email: 'jane@example.com',
  role: 'candidate',
  is_active: true,
  jobs_count: 0,
  applications_count: 4,
  employer_profile: null,
  candidate_profile: { headline: 'Full Stack Developer', location: 'Cairo' },
  created_at: '2026-03-10T08:00:00.000000Z',
}

export const mockAdminUserEmployer = {
  id: 3,
  name: 'Bob Employer',
  email: 'bob@company.com',
  role: 'employer',
  is_active: true,
  jobs_count: 12,
  applications_count: 0,
  employer_profile: { company_name: 'Bob Corp' },
  candidate_profile: null,
  created_at: '2026-02-20T09:00:00.000000Z',
}

export const mockAdminUserAdmin = {
  id: 1,
  name: 'Admin User',
  email: 'admin@example.com',
  role: 'admin',
  is_active: true,
  jobs_count: 0,
  applications_count: 0,
  employer_profile: null,
  candidate_profile: null,
  created_at: '2026-01-01T00:00:00.000000Z',
}

export const mockAdminUserSuspended = {
  ...mockAdminUser,
  id: 4,
  name: 'Suspended User',
  email: 'suspended@example.com',
  is_active: false,
}

export const mockAdminUsersPage = {
  data: [mockAdminUser, mockAdminUserEmployer, mockAdminUserAdmin, mockAdminUserSuspended],
  meta: {
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 4,
  },
}

export const mockAdminComment = {
  id: 1,
  body: 'This is a great job posting! I am very interested in applying for this position.',
  user: { id: 2, name: 'Jane Candidate' },
  job_id: 1,
  is_visible: true,
  created_at: '2026-06-20T14:30:00.000000Z',
}

export const mockAdminCommentHidden = {
  id: 2,
  body: 'Inappropriate comment that was flagged and hidden.',
  user: { id: 5, name: 'Spam User' },
  job_id: 1,
  is_visible: false,
  created_at: '2026-06-19T09:00:00.000000Z',
}

export const mockAdminCommentTrashed = {
  id: 3,
  body: 'This was a comment that got deleted.',
  user: { id: 3, name: 'Bob Employer' },
  job_id: 2,
  is_visible: true,
  deleted_at: '2026-06-21T10:00:00.000000Z',
  created_at: '2026-06-18T08:00:00.000000Z',
}

export const mockAdminCommentsPage = {
  data: [mockAdminComment, mockAdminCommentHidden],
  meta: {
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 2,
  },
}
