import { createContext, useState, useEffect, useCallback } from 'react'
import { apiClient } from '../lib/apiClient.js'

export const AuthContext = createContext(null)

function getStoredToken() {
  try {
    return localStorage.getItem('auth_token')
  } catch {
    return null
  }
}

function storeToken(token) {
  try { localStorage.setItem('auth_token', token) } catch {}
}

function clearToken() {
  try { localStorage.removeItem('auth_token') } catch {}
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(getStoredToken)
  const [isLoading, setIsLoading] = useState(true)

  const fetchUser = useCallback(async () => {
    const stored = getStoredToken()
    if (!stored) {
      setUser(null)
      setToken(null)
      setIsLoading(false)
      return
    }

    try {
      const res = await apiClient.get('/me')
      setUser(res?.data ?? null)
      setToken(stored)
    } catch {
      clearToken()
      setUser(null)
      setToken(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const login = useCallback(async (email, password) => {
    const res = await apiClient.post('/login', { email, password })
    const t = res?.data?.token
    if (t) {
      storeToken(t)
      setToken(t)
      setUser(res.data.user)
    }
    return res
  }, [])

  const register = useCallback(async (name, email, password, passwordConfirmation, role) => {
    const res = await apiClient.post('/register', {
      name,
      email,
      password,
      password_confirmation: passwordConfirmation,
      ...(role && { role }),
    })
    return res
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiClient.post('/logout')
    } catch {
      // Logout even if API call fails
    }
    clearToken()
    setToken(null)
    setUser(null)
    window.location.href = '/login'
  }, [])

  const isAuthenticated = !!token && !!user

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
