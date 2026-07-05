import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient, ApiError } from '../apiClient.js'

beforeEach(() => {
  vi.spyOn(globalThis, 'fetch')
  // Mock localStorage
  const store = {}
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => store[key] ?? null)
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key, val) => { store[key] = val })
  vi.spyOn(Storage.prototype, 'removeItem').mockImplementation((key) => { delete store[key] })
})

afterEach(() => {
  vi.restoreAllMocks()
})

// ── ApiError class ──

it('ApiError has correct shape (status, body, message, name)', () => {
  const err = new ApiError(404, { message: 'Not found' }, 'Not Found')
  expect(err).toBeInstanceOf(Error)
  expect(err.name).toBe('ApiError')
  expect(err.status).toBe(404)
  expect(err.body).toEqual({ message: 'Not found' })
  expect(err.message).toBe('Not Found')
})

it('ApiError uses default message when statusText omitted', () => {
  const err = new ApiError(500, null)
  expect(err.message).toBe('Request failed with status 500')
})

// ── Token attachment ──

it('attaches Authorization header when token exists', async () => {
  Storage.prototype.getItem.mockReturnValue('my-jwt')
  fetch.mockResolvedValue({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ data: {} }),
  })

  await apiClient.get('/me')

  expect(fetch).toHaveBeenCalledWith(
    expect.stringContaining('/api/v1/me'),
    expect.objectContaining({
      headers: expect.objectContaining({ Authorization: 'Bearer my-jwt' }),
    })
  )
})

it('does not attach Authorization header when no token', async () => {
  Storage.prototype.getItem.mockReturnValue(null)
  fetch.mockResolvedValue({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ data: {} }),
  })

  await apiClient.get('/me')

  const callArgs = fetch.mock.calls[0][1]
  expect(callArgs.headers.Authorization).toBeUndefined()
})

// ── 401 handling ──

it('removes token and redirects to /login on 401', async () => {
  Storage.prototype.getItem.mockReturnValue('expired-token')
  const removeSpy = Storage.prototype.removeItem
  const loc = { href: '/jobs' }
  Object.defineProperty(window, 'location', {
    get: () => loc,
    set: vi.fn(),
    configurable: true,
  })

  fetch.mockResolvedValue({
    ok: false,
    status: 401,
    statusText: 'Unauthorized',
    json: () => Promise.resolve({ message: 'Session expired' }),
  })

  await expect(apiClient.get('/me')).rejects.toThrow('Session expired')
  expect(removeSpy).toHaveBeenCalledWith('auth_token')
  expect(window.location.href).toBe('/login')
})

// ── Successful responses ──

it('returns parsed JSON on successful 200', async () => {
  const body = { data: { id: 1, name: 'Test' }, message: 'ok' }
  fetch.mockResolvedValue({
    ok: true,
    status: 200,
    json: () => Promise.resolve(body),
  })

  const result = await apiClient.get('/test')

  expect(result).toEqual(body)
})

it('returns null on 204 No Content', async () => {
  fetch.mockResolvedValue({
    ok: true,
    status: 204,
    json: () => { throw new Error('should not be called') },
  })

  const result = await apiClient.get('/test')

  expect(result).toBeNull()
})

// ── POST request ──

it('sends POST with JSON Content-Type and stringified body', async () => {
  fetch.mockResolvedValue({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
  })

  await apiClient.post('/login', { email: 'a@b.com', password: 'secret' })

  expect(fetch).toHaveBeenCalledWith(
    expect.stringContaining('/api/v1/login'),
    expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ email: 'a@b.com', password: 'secret' }),
    })
  )
})

it('does not set Content-Type for FormData body', async () => {
  const formData = new FormData()
  formData.append('file', 'test')
  fetch.mockResolvedValue({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
  })

  await apiClient.upload('/upload', formData)

  const callArgs = fetch.mock.calls[0][1]
  expect(callArgs.headers['Content-Type']).toBeUndefined()
  expect(callArgs.body).toBe(formData)
})

// ── Network error ──

it('throws on network error', async () => {
  fetch.mockRejectedValue(new TypeError('Failed to fetch'))

  await expect(apiClient.get('/fail')).rejects.toThrow(TypeError)
})
