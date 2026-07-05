const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

class ApiError extends Error {
  constructor(status, body, statusText) {
    super(statusText || `Request failed with status ${status}`)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

function getToken() {
  try {
    return localStorage.getItem('auth_token')
  } catch {
    return null
  }
}

async function request(method, path, options = {}) {
  const url = `${BASE_URL}${path}`
  const headers = { Accept: 'application/json' }

  const token = getToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  let body
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
    body = JSON.stringify(options.body)
  } else if (options.body instanceof FormData) {
    body = options.body
  }

  const res = await fetch(url, { method, headers, body })

  if (res.status === 204) {
    return null
  }

  let data
  try {
    data = await res.json()
  } catch {
    data = null
  }

  if (!res.ok) {
    if (res.status === 401) {
      try { localStorage.removeItem('auth_token') } catch {}
      window.location.href = '/login'
      throw new ApiError(res.status, data, 'Session expired. Please log in again.')
    }
    throw new ApiError(res.status, data, res.statusText)
  }

  return data
}

export const apiClient = {
  get: (path, options) => request('GET', path, options),
  post: (path, body, options) => request('POST', path, { ...options, body }),
  put: (path, body, options) => request('PUT', path, { ...options, body }),
  delete: (path, options) => request('DELETE', path, options),
  upload: (path, formData, options) =>
    request('POST', path, { ...options, body: formData }),
}

export { ApiError }
