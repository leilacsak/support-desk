import { API_BASE } from '../config.js'

export async function fetchTickets() {
  const response = await fetch(`${API_BASE}/api/tickets`)
  if (!response.ok) {
    throw new Error(`Failed to fetch tickets: ${response.status} ${response.statusText}`)
  }
  return response.json()
}

export async function fetchTicket(id) {
  const response = await fetch(`${API_BASE}/api/tickets/${id}`)
  if (!response.ok) {
    const error = new Error(`Failed to fetch ticket: ${response.status} ${response.statusText}`)
    error.status = response.status
    throw error
  }
  return response.json()
}
