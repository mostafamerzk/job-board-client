import { http, HttpResponse } from 'msw'
import { mockJobs, mockJobDetail, mockCategories, mockTechnologies } from './jobFixtures.js'

export const publicJobsHandlers = [
  http.get('*/api/v1/jobs', ({ request }) => {
    const url = new URL(request.url)
    const keyword = url.searchParams.get('keyword') || ''
    const filtered = keyword
      ? mockJobs.filter((j) =>
          j.title.toLowerCase().includes(keyword.toLowerCase())
        )
      : mockJobs
    return HttpResponse.json({
      data: filtered,
      meta: { current_page: 1, last_page: 1, per_page: 20, total: filtered.length },
    })
  }),

  http.get('*/api/v1/jobs/:id', ({ params }) => {
    const job = mockJobs.find((j) => j.id === Number(params.id))
    if (!job) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    return HttpResponse.json({ data: { ...mockJobDetail, ...job } })
  }),

  http.get('*/api/v1/categories', () => {
    return HttpResponse.json({ data: mockCategories })
  }),

  http.get('*/api/v1/technologies', () => {
    return HttpResponse.json({ data: mockTechnologies })
  }),
]
