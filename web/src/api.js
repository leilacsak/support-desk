export async function fetchTickets() {
  const response = await fetch('/api/tickets')
  if (!response.ok) {
    throw new Error(`Failed to fetch tickets: ${response.status} ${response.statusText}`)
  }
  return response.json()
}

export async function fetchTicket(id) {
  const response = await fetch(`/api/tickets/${id}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch ticket: ${response.status} ${response.statusText}`)
  }
  return response.json()
}
