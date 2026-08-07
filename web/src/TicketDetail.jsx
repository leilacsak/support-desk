import { useCallback, useEffect, useState } from 'react'
import { fetchTicket } from './lib/api.js'
import { useAuth } from './auth/authContext.js'

export default function TicketDetail({ id, onBack }) {
  const { token, loading: authLoading } = useAuth()
  const [ticket, setTicket] = useState(null)
  const [error, setError] = useState(null)

  const loadTicket = useCallback(() => {
    if (authLoading || !token) return
    setTicket(null)
    setError(null)
    fetchTicket(id, token)
      .then((data) => setTicket(data))
      .catch((err) => {
        setError({
          message: err.status === 404 ? 'Ticket not found' : 'Something went wrong. Please try again.',
          isNotFound: err.status === 404,
        })
      })
  }, [id, token, authLoading])

  useEffect(() => {
    loadTicket()
  }, [loadTicket])

  if (error) {
    return (
      <div className="card">
        <p className="error-message">{error.message}</p>
        {!error.isNotFound && (
          <button type="button" onClick={loadTicket}>Retry</button>
        )}
        <button type="button" onClick={onBack}>Back to list</button>
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="card">
        <p>Loading ticket…</p>
        <button type="button" onClick={onBack}>Back to list</button>
      </div>
    )
  }

  return (
    <div className="card">
      <h1>{ticket.subject}</h1>
      <div className="ticket-meta">
        <p>Status: <span className={`badge badge-status-${ticket.status}`}>{ticket.status}</span></p>
        <p>Priority: <span className={`badge badge-priority-${ticket.priority}`}>{ticket.priority}</span></p>
        <p>Requester: {ticket.requester}</p>
        <p>Assignee: {ticket.assignee ?? 'unassigned'}</p>
      </div>
      <p>Description: {ticket.description}</p>
      <button type="button" onClick={onBack}>Back to list</button>
    </div>
  )
}
