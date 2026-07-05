export const mockUser = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  role: 'candidate',
  phone: null,
  avatar_url: null,
  is_active: true,
  created_at: '2026-01-01T00:00:00.000000Z',
}

export const mockLoginResponse = {
  data: { user: mockUser, token: 'fake-jwt-token' },
  message: 'Logged in successfully',
}

export const mockRegisterResponse = {
  data: { user: mockUser, token: 'fake-jwt-token' },
  message: 'Registered successfully',
}
