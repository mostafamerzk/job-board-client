const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

export const apiGroups = {
  auth: `${API_BASE_URL}/login`,
  publicJobs: `${API_BASE_URL}/jobs`,
  employerJobs: `${API_BASE_URL}/employer/jobs`,
  candidateProfile: `${API_BASE_URL}/candidate/profile`,
  candidateResumes: `${API_BASE_URL}/candidate/resumes`,
  candidateApplications: `${API_BASE_URL}/candidate/applications`,
  adminJobs: `${API_BASE_URL}/admin/jobs`,
  adminUsers: `${API_BASE_URL}/admin/users`,
  adminComments: `${API_BASE_URL}/admin/comments`,
}

export const apiRoutes = {
  candidateApplicationWithdraw: (applicationId) =>
    `${apiGroups.candidateApplications}/${applicationId}/withdraw`,
  candidateResume: (resumeId) => `${apiGroups.candidateResumes}/${resumeId}`,
  publicJob: (jobId) => `${apiGroups.publicJobs}/${jobId}`,
  adminJobApprove: (id) => `${apiGroups.adminJobs}/${id}/approve`,
  adminJobReject: (id) => `${apiGroups.adminJobs}/${id}/reject`,
  adminUserToggleActive: (id) => `${apiGroups.adminUsers}/${id}/toggle-active`,
  adminComment: (id) => `${apiGroups.adminComments}/${id}`,
}
