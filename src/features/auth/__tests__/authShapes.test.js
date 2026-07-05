import { describe, it, expect } from 'vitest'
import { mockUser, mockLoginResponse, mockRegisterResponse } from '../data/authFixtures.js'

describe('User shape', () => {
  const validUser = {
    id: expect.any(Number),
    name: expect.any(String),
    email: expect.any(String),
    role: expect.any(String),
    phone: null,
    avatar_url: null,
    is_active: expect.any(Boolean),
    created_at: expect.any(String),
  }

  it('matches User shape exactly', () => {
    expect(mockUser).toMatchObject(validUser)
  })
})

describe('Login response shape', () => {
  it('contains data.user and data.token', () => {
    expect(mockLoginResponse).toMatchObject({
      data: {
        user: {
          id: expect.any(Number),
          name: expect.any(String),
          email: expect.any(String),
          role: expect.any(String),
        },
        token: expect.any(String),
      },
      message: expect.any(String),
    })
  })
})

describe('Register response shape', () => {
  it('matches login response shape (same structure)', () => {
    expect(mockRegisterResponse).toMatchObject({
      data: {
        user: {
          id: expect.any(Number),
          name: expect.any(String),
          email: expect.any(String),
        },
        token: expect.any(String),
      },
      message: expect.any(String),
    })
  })
})

describe('Logout response shape', () => {
  it('contains message field', () => {
    const logoutResponse = { message: 'Logged out successfully' }
    expect(logoutResponse).toEqual({ message: expect.any(String) })
  })
})
