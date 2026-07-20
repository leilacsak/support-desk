export async function fetchTickets() {
  const response = await fetch('/api/tickets')
  if (!response.ok) {
    throw new Error(`Failed to fetch tickets: ${response.status} ${response.statusText}`)
  }
  return response.json()
}
