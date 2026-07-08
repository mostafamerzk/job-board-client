import { apiClient } from '../../../lib/apiClient.js'

// ── Company Profile ──

export function getProfile() {
  return apiClient.get('/employer/profile')
}

export function updateProfile(data) {
  return apiClient.put('/employer/profile', data)
}

export function uploadLogo(file) {
  const formData = new FormData()
  formData.append('logo', file)
  return apiClient.upload('/employer/logo', formData)
}

// ── Jobs ──

export function getJobs(params = {}) {
  const query = new URLSearchParams()
  if (params.page) query.set('page', params.page)
  if (params.per_page) query.set('per_page', params.per_page)
  if (params.status) query.set('status', params.status)
  const qs = query.toString()
  return apiClient.get(`/employer/jobs${qs ? `?${qs}` : ''}`)
}

export function getJob(id) {
  return apiClient.get(`/employer/jobs/${id}`)
}

export function createJob(data) {
  return apiClient.post('/employer/jobs', data)
}

export function updateJob(id, data) {
  return apiClient.put(`/employer/jobs/${id}`, data)
}

export function deleteJob(id) {
  return apiClient.delete(`/employer/jobs/${id}`)
}

// ── Applications ──

export function getJobApplications(jobId, params = {}) {
  const query = new URLSearchParams()
  if (params.status) query.set('status', params.status)
  const qs = query.toString()
  return apiClient.get(`/employer/jobs/${jobId}/applications${qs ? `?${qs}` : ''}`)
}

export function getApplication(id) {
  return apiClient.get(`/employer/applications/${id}`)
}

export function updateApplicationStatus(id, data) {
  return apiClient.put(`/employer/applications/${id}/status`, data)
}

// ── Lookups (public) ──

export function getCategories() {
  return apiClient.get('/categories')
}

export function getTechnologies() {
  return apiClient.get('/technologies')
}
