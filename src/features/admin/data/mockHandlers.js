import { http, HttpResponse } from 'msw'
import {
  mockAdminJob,
  mockAdminJobApproved,
  mockAdminJobRejected,
  mockAdminUser,
  mockAdminUserEmployer,
  mockAdminUserAdmin,
  mockAdminUserSuspended,
  mockAdminComment,
  mockAdminCommentHidden,
  mockAdminCommentTrashed,
} from './adminFixtures.js'

let jobStore = []
let userStore = []
let commentStore = []

export function resetAdminData() {
  jobStore = [
    { ...mockAdminJob },
    { ...mockAdminJobApproved },
    { ...mockAdminJobRejected },
  ]
  userStore = [
    { ...mockAdminUser },
    { ...mockAdminUserEmployer },
    { ...mockAdminUserAdmin },
    { ...mockAdminUserSuspended },
  ]
  commentStore = [
    { ...mockAdminComment },
    { ...mockAdminCommentHidden },
    { ...mockAdminCommentTrashed },
  ]
}

resetAdminData()

function paginate(data, page = 1, perPage = 15) {
  const start = (page - 1) * perPage
  const sliced = data.slice(start, start + perPage)
  return {
    data: sliced,
    meta: {
      current_page: page,
      last_page: Math.ceil(data.length / perPage) || 1,
      per_page: perPage,
      total: data.length,
    },
  }
}

export const adminHandlers = [
  // GET /admin/jobs
  http.get('*/api/v1/admin/jobs', ({ request }) => {
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const page = parseInt(url.searchParams.get('page') || '1', 10)
    const perPage = parseInt(url.searchParams.get('per_page') || '15', 10)

    let filtered = jobStore.filter(() => true)
    if (status) {
      filtered = filtered.filter((j) => j.status === status)
    }
    return HttpResponse.json(paginate(filtered, page, perPage))
  }),

  // GET /admin/jobs/:id
  http.get('*/api/v1/admin/jobs/:id', ({ params }) => {
    const job = jobStore.find((j) => j.id === Number(params.id))
    if (!job) {
      return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    }
    return HttpResponse.json({ data: { ...job } })
  }),

  // PUT /admin/jobs/:id/approve
  http.put('*/api/v1/admin/jobs/:id/approve', ({ params }) => {
    const idx = jobStore.findIndex((j) => j.id === Number(params.id))
    if (idx === -1) {
      return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    }
    if (jobStore[idx].status !== 'pending') {
      return HttpResponse.json(
        { message: 'Job is not in pending status' },
        { status: 422 },
      )
    }
    jobStore[idx] = { ...jobStore[idx], status: 'approved' }
    return HttpResponse.json({
      data: { id: jobStore[idx].id, status: 'approved' },
      message: 'Job approved successfully',
    })
  }),

  // PUT /admin/jobs/:id/reject
  http.put('*/api/v1/admin/jobs/:id/reject', async ({ params, request }) => {
    const idx = jobStore.findIndex((j) => j.id === Number(params.id))
    if (idx === -1) {
      return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    }
    if (jobStore[idx].status !== 'pending') {
      return HttpResponse.json(
        { message: 'Job is not in pending status' },
        { status: 422 },
      )
    }
    const body = await request.json()
    if (!body.rejection_reason || !body.rejection_reason.trim()) {
      return HttpResponse.json(
        { errors: { rejection_reason: ['Rejection reason is required.'] } },
        { status: 422 },
      )
    }
    jobStore[idx] = {
      ...jobStore[idx],
      status: 'rejected',
      rejection_reason: body.rejection_reason,
    }
    return HttpResponse.json({
      data: {
        id: jobStore[idx].id,
        status: 'rejected',
        rejection_reason: jobStore[idx].rejection_reason,
      },
      message: 'Job rejected',
    })
  }),

  // GET /admin/users
  http.get('*/api/v1/admin/users', ({ request }) => {
    const url = new URL(request.url)
    const role = url.searchParams.get('role')
    const search = url.searchParams.get('search')
    const isActive = url.searchParams.get('is_active')
    const page = parseInt(url.searchParams.get('page') || '1', 10)
    const perPage = parseInt(url.searchParams.get('per_page') || '15', 10)

    let filtered = userStore.filter(() => true)
    if (role) {
      filtered = filtered.filter((u) => u.role === role)
    }
    if (search) {
      const q = search.toLowerCase()
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q),
      )
    }
    if (isActive !== null) {
      const active = isActive === 'true'
      filtered = filtered.filter((u) => u.is_active === active)
    }
    return HttpResponse.json(paginate(filtered, page, perPage))
  }),

  // GET /admin/users/:id
  http.get('*/api/v1/admin/users/:id', ({ params }) => {
    const user = userStore.find((u) => u.id === Number(params.id))
    if (!user) {
      return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    }
    return HttpResponse.json({ data: { ...user } })
  }),

  // PUT /admin/users/:id/toggle-active
  http.put('*/api/v1/admin/users/:id/toggle-active', ({ params }) => {
    const idx = userStore.findIndex((u) => u.id === Number(params.id))
    if (idx === -1) {
      return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    }
    userStore[idx] = { ...userStore[idx], is_active: !userStore[idx].is_active }
    return HttpResponse.json({
      data: { id: userStore[idx].id, is_active: userStore[idx].is_active },
      message: userStore[idx].is_active
        ? 'User reactivated successfully'
        : 'User suspended successfully',
    })
  }),

  // GET /admin/comments
  http.get('*/api/v1/admin/comments', ({ request }) => {
    const url = new URL(request.url)
    const isVisible = url.searchParams.get('is_visible')
    const jobId = url.searchParams.get('job_id')
    const userId = url.searchParams.get('user_id')
    const trashed = url.searchParams.get('trashed')
    const page = parseInt(url.searchParams.get('page') || '1', 10)
    const perPage = parseInt(url.searchParams.get('per_page') || '15', 10)

    let filtered = commentStore.filter(() => true)
    if (isVisible === 'true') {
      filtered = filtered.filter((c) => c.is_visible)
    } else if (isVisible === 'false') {
      filtered = filtered.filter((c) => !c.is_visible)
    }
    if (jobId) {
      filtered = filtered.filter((c) => c.job_id === Number(jobId))
    }
    if (userId) {
      filtered = filtered.filter((c) => c.user?.id === Number(userId))
    }
    if (trashed === 'true') {
      filtered = filtered.filter((c) => c.deleted_at != null)
    } else {
      filtered = filtered.filter((c) => c.deleted_at == null)
    }
    return HttpResponse.json(paginate(filtered, page, perPage))
  }),

  // DELETE /admin/comments/:id
  http.delete('*/api/v1/admin/comments/:id', ({ params }) => {
    const idx = commentStore.findIndex((c) => c.id === Number(params.id))
    if (idx === -1) {
      return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    }
    commentStore.splice(idx, 1)
    return new HttpResponse(null, { status: 204 })
  }),
]
