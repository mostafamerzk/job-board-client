import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiClient } from '../../../lib/apiClient.js'
import {
  fetchAdminJobs,
  fetchAdminJob,
  approveJob,
  rejectJob,
  fetchAdminUsers,
  fetchAdminUser,
  toggleUserActive,
  fetchAdminComments,
  deleteComment,
} from '../api/adminApi.js'

vi.mock('../../../lib/apiClient.js', () => ({
  apiClient: {
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('adminApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchAdminJobs', () => {
    it('calls apiClient.get with default params', async () => {
      apiClient.get.mockResolvedValue({ data: [], meta: {} })
      await fetchAdminJobs({ page: 1 })

      expect(apiClient.get).toHaveBeenCalledWith('/admin/jobs?page=1')
    })

    it('includes status when provided', async () => {
      apiClient.get.mockResolvedValue({ data: [], meta: {} })
      await fetchAdminJobs({ status: 'pending', page: 1 })

      expect(apiClient.get).toHaveBeenCalledWith(
        '/admin/jobs?status=pending&page=1',
      )
    })

    it('includes per_page when provided', async () => {
      apiClient.get.mockResolvedValue({ data: [], meta: {} })
      await fetchAdminJobs({ page: 1, perPage: 20 })

      expect(apiClient.get).toHaveBeenCalledWith('/admin/jobs?page=1&per_page=20')
    })
  })

  describe('fetchAdminJob', () => {
    it('calls apiClient.get with job id', async () => {
      apiClient.get.mockResolvedValue({ data: {} })
      await fetchAdminJob(42)

      expect(apiClient.get).toHaveBeenCalledWith('/admin/jobs/42')
    })
  })

  describe('approveJob', () => {
    it('calls apiClient.put with approve route', async () => {
      apiClient.put.mockResolvedValue({ data: { id: 1, status: 'approved' } })
      await approveJob(1)

      expect(apiClient.put).toHaveBeenCalledWith('/admin/jobs/1/approve')
    })
  })

  describe('rejectJob', () => {
    it('calls apiClient.put with reject route and reason', async () => {
      apiClient.put.mockResolvedValue({ data: { id: 1, status: 'rejected' } })
      await rejectJob(1, 'Position filled')

      expect(apiClient.put).toHaveBeenCalledWith('/admin/jobs/1/reject', {
        rejection_reason: 'Position filled',
      })
    })
  })

  describe('fetchAdminUsers', () => {
    it('calls apiClient.get with search and role params', async () => {
      apiClient.get.mockResolvedValue({ data: [], meta: {} })
      await fetchAdminUsers({ role: 'employer', search: 'bob', page: 1 })

      const calledUrl = apiClient.get.mock.calls[0][0]
      expect(calledUrl).toContain('/admin/users')
      expect(calledUrl).toContain('role=employer')
      expect(calledUrl).toContain('search=bob')
      expect(calledUrl).toContain('page=1')
    })
  })

  describe('fetchAdminUser', () => {
    it('calls apiClient.get with user id', async () => {
      apiClient.get.mockResolvedValue({ data: {} })
      await fetchAdminUser(7)

      expect(apiClient.get).toHaveBeenCalledWith('/admin/users/7')
    })
  })

  describe('toggleUserActive', () => {
    it('calls apiClient.put with toggle-active route', async () => {
      apiClient.put.mockResolvedValue({ data: { id: 1, is_active: false } })
      await toggleUserActive(1)

      expect(apiClient.put).toHaveBeenCalledWith('/admin/users/1/toggle-active')
    })
  })

  describe('fetchAdminComments', () => {
    it('calls apiClient.get with is_visible param', async () => {
      apiClient.get.mockResolvedValue({ data: [], meta: {} })
      await fetchAdminComments({ isVisible: false, page: 1 })

      const calledUrl = apiClient.get.mock.calls[0][0]
      expect(calledUrl).toContain('/admin/comments')
      expect(calledUrl).toContain('is_visible=false')
      expect(calledUrl).toContain('page=1')
    })

    it('calls apiClient.get with jobId param', async () => {
      apiClient.get.mockResolvedValue({ data: [], meta: {} })
      await fetchAdminComments({ jobId: 5, page: 1 })

      const calledUrl = apiClient.get.mock.calls[0][0]
      expect(calledUrl).toContain('/admin/comments')
      expect(calledUrl).toContain('job_id=5')
    })

    it('calls apiClient.get with userId param', async () => {
      apiClient.get.mockResolvedValue({ data: [], meta: {} })
      await fetchAdminComments({ userId: 3, page: 1 })

      const calledUrl = apiClient.get.mock.calls[0][0]
      expect(calledUrl).toContain('/admin/comments')
      expect(calledUrl).toContain('user_id=3')
    })

    it('calls apiClient.get with trashed param', async () => {
      apiClient.get.mockResolvedValue({ data: [], meta: {} })
      await fetchAdminComments({ trashed: 'true', page: 1 })

      const calledUrl = apiClient.get.mock.calls[0][0]
      expect(calledUrl).toContain('/admin/comments')
      expect(calledUrl).toContain('trashed=true')
    })
  })

  describe('deleteComment', () => {
    it('calls apiClient.delete with comment route', async () => {
      apiClient.delete.mockResolvedValue(null)
      await deleteComment(5)

      expect(apiClient.delete).toHaveBeenCalledWith('/admin/comments/5')
    })
  })
})
