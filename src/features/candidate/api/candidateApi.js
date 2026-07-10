import { apiClient } from '../../../lib/apiClient.js'

// ── Profile ──

export function getProfile() {
  return apiClient.get('/candidate/profile')
}

export function updateProfile(data) {
  return apiClient.put('/candidate/profile', data)
}

// ── Resumes ──

export function getResumes() {
  return apiClient.get('/candidate/resumes')
}

export function uploadResume(file) {
  const formData = new FormData()
  formData.append('resume', file)
  return apiClient.upload('/candidate/resumes', formData)
}

export function updateResume(id, data) {
  return apiClient.put(`/candidate/resumes/${id}`, data)
}

export function deleteResume(id) {
  return apiClient.delete(`/candidate/resumes/${id}`)
}

// ── Applications ──

export function getApplications() {
  return apiClient.get('/candidate/applications')
}

export function submitApplication(data) {
  return apiClient.post('/candidate/applications', data)
}

export function withdrawApplication(id) {
  return apiClient.put(`/candidate/applications/${id}/withdraw`)
}

// ── Job Search ──

export function getJobList(params = {}) {
  const query = new URLSearchParams()
  if (params.keyword) query.set('keyword', params.keyword)
  if (params.work_type) query.set('work_type', params.work_type)
  if (params.experience_level) query.set('experience_level', params.experience_level)
  if (params.location) query.set('location', params.location)
  if (params.salary_min) query.set('salary_min', params.salary_min)
  if (params.salary_max) query.set('salary_max', params.salary_max)
  if (params.category_id) query.set('category_id', params.category_id)
  if (params.page) query.set('page', params.page)
  const qs = query.toString()
  return apiClient.get(`/jobs${qs ? `?${qs}` : ''}`)
}
