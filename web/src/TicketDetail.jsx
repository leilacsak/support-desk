import { useCallback, useEffect, useState } from 'react'
import { fetchTicket } from './lib/api.js'

export default function TicketDetail({ id, onBack }) {
  const [ticket, setTicket] = useState(null)
  const [error, setError] = useState(null)

  const loadTicket = useCallback(() => {
    setTicket(null)
    setError(null)
    fetchTicket(id)
      .then((data) => setTicket(data))
      .catch((err) => {
        setError({
          message: err.status === 404 ? 'Ticket not found' : 'Something went wrong. Please try again.',
          isNotFound: err.status === 404,
        })
      })
  }, [id])

  useEffect(() => {
    loadTicket()
  }, [loadTicket])

  if (error) {
    return (
      <div>
        <p>{error.message}</p>
        {!error.isNotFound && (
          <button type="button" onClick={loadTicket}>Retry</button>
        )}
        <button type="button" onClick={onBack}>Back to list</button>
      </div>
    )
  }

  if (!ticket) {
    return (
      <div>
        <p>Loading ticket…</p>
        <button type="button" onClick={onBack}>Back to list</button>
      </div>
    )
  }

  return (
    <div>
      <h1>{ticket.subject}</h1>
      <p>Status: {ticket.status}</p>
      <p>Priority: {ticket.priority}</p>
      <p>Requester: {ticket.requester}</p>
      <p>Description: {ticket.description}</p>
      <button type="button" onClick={onBack}>Back to list</button>
    </div>
  )
}
