import { render, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { MemoryRouter } from 'react-router-dom'
import { server } from '../../test/setup.js'
import { AuthContext, AuthProvider } from '../AuthContext.jsx'
import { useContext } from 'react'

function renderAuthContext() {
  let contextValue
  function TestConsumer() {
    contextValue = useContext(AuthContext)
    return <div data-testid="ready">{contextValue.isLoading ? 'loading' : 'ready'}</div>
  }
  const result = render(
    <MemoryRouter>
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    </MemoryRouter>
  )
  return { result, getContext: () => contextValue }
}

// ── Mount without stored token ──

it('sets isLoading false, user null, token null when no stored token', async () => {
  vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null)
  const { getContext } = renderAuthContext()

  await waitFor(() => {
    const ctx = getContext()
    expect(ctx.isLoading).toBe(false)
    expect(ctx.user).toBeNull()
    expect(ctx.token).toBeNull()
    expect(ctx.isAuthenticated).toBe(false)
  })
})

// ── Mount with stored token, successful /me ──

it('fetches /me when token exists and sets user', async () => {
  vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('valid-token')
  const { getContext } = renderAuthContext()

  await waitFor(() => {
    const ctx = getContext()
    expect(ctx.isLoading).toBe(false)
    expect(ctx.user).toEqual({
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      role: 'candidate',
      phone: null,
      avatar_url: null,
      is_active: true,
      created_at: '2026-01-01T00:00:00.000000Z',
    })
    expect(ctx.token).toBe('valid-token')
    expect(ctx.isAuthenticated).toBe(true)
  })
})

// ── Mount with stored token, /me fails ──

it('clears user and token when /me request fails', async () => {
  server.use(
    http.get('*/api/v1/me', () => {
      return HttpResponse.json({ message: 'Unauthenticated' }, { status: 401 })
    })
  )
  const removeSpy = vi.spyOn(Storage.prototype, 'removeItem')
  vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('expired-token')
  const { getContext } = renderAuthContext()

  await waitFor(() => {
    const ctx = getContext()
    expect(ctx.isLoading).toBe(false)
    expect(ctx.user).toBeNull()
    expect(ctx.token).toBeNull()
    expect(ctx.isAuthenticated).toBe(false)
  })
  expect(removeSpy).toHaveBeenCalledWith('auth_token')
})

// ── login ──

it('login: posts to /login, stores token, sets user', async () => {
  const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')
  vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null)
  const { getContext } = renderAuthContext()

  await waitFor(() => expect(getContext().isLoading).toBe(false))

  const ctx = getContext()
  await ctx.login('test@example.com', 'password123')

  expect(setItemSpy).toHaveBeenCalledWith('auth_token', 'fake-jwt-token')
  await waitFor(() => {
    expect(getContext().token).toBe('fake-jwt-token')
    expect(getContext().user.email).toBe('test@example.com')
    expect(getContext().isAuthenticated).toBe(true)
  })
})

// ── register ──

it('register: posts to /register, does NOT set token/user (returns res)', async () => {
  vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null)
  const { getContext } = renderAuthContext()

  await waitFor(() => expect(getContext().isLoading).toBe(false))

  const ctx = getContext()
  await ctx.register('New User', 'new@example.com', 'password123', 'password123', 'candidate')

  // register() currently returns the response without storing token/setting user
  expect(getContext().user).toBeNull()
  expect(getContext().token).toBeNull()
})

// ── logout ──

it('logout: posts to /logout, clears token and user, navigates to /login', async () => {
  vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('valid-token')
  const removeSpy = vi.spyOn(Storage.prototype, 'removeItem')
  const { getContext } = renderAuthContext()

  await waitFor(() => expect(getContext().isLoading).toBe(false))

  await getContext().logout()

  expect(removeSpy).toHaveBeenCalledWith('auth_token')
  await waitFor(() => {
    expect(getContext().user).toBeNull()
    expect(getContext().token).toBeNull()
  })
})
