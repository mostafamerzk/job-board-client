import { apiClient } from '../../../lib/apiClient.js'

function buildQuery(params) {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== '',
  )
  if (entries.length === 0) return ''
  return '?' + new URLSearchParams(entries).toString()
}

function normalizePaginated(res) {
  if (!res || !res.data) return { data: [], meta: null }

  // Laravel returns paginated data as { data: { current_page, data: [...], ... } }
  if (!Array.isArray(res.data) && Array.isArray(res.data?.data)) {
    return {
      data: res.data.data,
      meta: {
        current_page: res.data.current_page,
        last_page: res.data.last_page,
        per_page: res.data.per_page,
        total: res.data.total,
      },
    }
  }

  return {
    data: Array.isArray(res.data) ? res.data : [],
    meta: res.meta || null,
  }
}

export function fetchAdminJobs({ status, page, perPage } = {}) {
  const qs = buildQuery({ status, page, per_page: perPage })
  return apiClient.get(`/admin/jobs${qs}`).then(normalizePaginated)
}

export function fetchAdminJob(id) {
  return apiClient.get(`/admin/jobs/${id}`)
}

export function approveJob(id) {
  return apiClient.put(`/admin/jobs/${id}/approve`)
}

export function rejectJob(id, rejectionReason) {
  return apiClient.put(`/admin/jobs/${id}/reject`, {
    rejection_reason: rejectionReason,
  })
}

export function fetchAdminUsers({ role, isActive, search, page } = {}) {
  const qs = buildQuery({
    role,
    is_active: isActive,
    search,
    page,
  })
  return apiClient.get(`/admin/users${qs}`).then(normalizePaginated)
}

export function fetchAdminUser(id) {
  return apiClient.get(`/admin/users/${id}`)
}

export function toggleUserActive(id) {
  return apiClient.put(`/admin/users/${id}/toggle-active`)
}

export function fetchAdminComments({ isVisible, jobId, userId, trashed, page } = {}) {
  const qs = buildQuery({
    is_visible: isVisible,
    job_id: jobId,
    user_id: userId,
    trashed,
    page,
  })
  return apiClient.get(`/admin/comments${qs}`).then(normalizePaginated)
}

export function deleteComment(id) {
  return apiClient.delete(`/admin/comments/${id}`)
}
