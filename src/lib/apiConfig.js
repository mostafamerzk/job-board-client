export const API_BASE_URL = '/api/v1'

export const apiGroups = {
  auth: `${API_BASE_URL}/login`,
  publicJobs: `${API_BASE_URL}/jobs`,
  employerJobs: `${API_BASE_URL}/employer/jobs`,
  candidateApplications: `${API_BASE_URL}/candidate/applications`,
  adminJobs: `${API_BASE_URL}/admin/jobs`,
}
