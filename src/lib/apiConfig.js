export const API_BASE_URL = '/api/v1'

export const apiGroups = {
  auth: `${API_BASE_URL}/login`,
  publicJobs: `${API_BASE_URL}/jobs`,
  employerJobs: `${API_BASE_URL}/employer/jobs`,
  candidateProfile: `${API_BASE_URL}/candidate/profile`,
  candidateResumes: `${API_BASE_URL}/candidate/resumes`,
  candidateApplications: `${API_BASE_URL}/candidate/applications`,
  adminJobs: `${API_BASE_URL}/admin/jobs`,
}

export const apiRoutes = {
  candidateApplicationWithdraw: (applicationId) =>
    `${apiGroups.candidateApplications}/${applicationId}/withdraw`,
  candidateResume: (resumeId) => `${apiGroups.candidateResumes}/${resumeId}`,
  publicJob: (jobId) => `${apiGroups.publicJobs}/${jobId}`,
}
