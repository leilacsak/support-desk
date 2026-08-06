import { API_BASE } from '../config.js'

export class ApiError extends Error {
  constructor(status, message) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

function messageFrom(body, status) {
  const error = body?.error
  if (typeof error === 'string') {
    return error
  }
  if (error && typeof error === 'object' && typeof error.message === 'string') {
    return error.message
  }
  return `Request failed with status ${status}`
}

async function apiFetch(path, { method = 'GET', token, body } = {}) {
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers['Authorization'] = `Bearer ${token}`

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const text = await response.text()
  let data = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      throw new ApiError(response.status, 'Invalid JSON response')
    }
  }

  if (!response.ok) {
    throw new ApiError(response.status, messageFrom(data, response.status))
  }

  return data
}

export function login(email, password) {
  return apiFetch('/api/auth/login', { method: 'POST', body: { email, password } })
}

export function register(email, name, password) {
  return apiFetch('/api/auth/register', { method: 'POST', body: { email, name, password } })
}

export function fetchCurrentUser(token) {
  return apiFetch('/api/auth/me', { token })
}

export function fetchTickets(token) {
  return apiFetch('/api/tickets', { token })
}

export function fetchTicket(id, token) {
  return apiFetch(`/api/tickets/${id}`, { token })
}

export function fetchTicketCount(token) {
  return apiFetch('/api/tickets/count', { token })
}
