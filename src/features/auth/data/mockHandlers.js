import { http, HttpResponse } from 'msw'
import { mockUser, mockLoginResponse, mockRegisterResponse } from './authFixtures.js'

export const authHandlers = [
  http.post('*/api/v1/login', async ({ request }) => {
    const body = await request.json()
    if (body.email === 'test@example.com' && body.password === 'password123') {
      return HttpResponse.json(mockLoginResponse)
    }
    if (body.email === 'suspended@example.com') {
      return HttpResponse.json({ message: 'Account suspended' }, { status: 403 })
    }
    return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 })
  }),

  http.post('*/api/v1/register', async ({ request }) => {
    const body = await request.json()
    if (body.email === 'existing@example.com') {
      return HttpResponse.json(
        { errors: { email: ['The email has already been taken.'] } },
        { status: 422 }
      )
    }
    return HttpResponse.json(mockRegisterResponse)
  }),

  http.post('*/api/v1/logout', () => {
    return HttpResponse.json({ message: 'Logged out successfully' })
  }),

  http.get('*/api/v1/me', () => {
    return HttpResponse.json({ data: mockUser })
  }),
]
