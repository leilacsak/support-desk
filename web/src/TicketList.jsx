import { useEffect, useState } from 'react'
import { fetchTickets } from './lib/api.js'
import { useAuth } from './auth/authContext.js'

export default function TicketList({ onSelectTicket }) {
  const { token, loading: authLoading } = useAuth()
  const [tickets, setTickets] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    if (authLoading || !token) return
    fetchTickets(token)
      .then((data) => setTickets(data))
      .catch((err) => setError(err.message))
  }, [token, authLoading])

  return (
    <div className="card">
      <h1>My tickets</h1>

      {error && <p>Failed to load tickets: {error}</p>}

      {!authLoading && !error && tickets.length === 0 && (
        <p className="hint">No tickets involve you yet.</p>
      )}

      <ul>
        {tickets.map((ticket) => (
          <li key={ticket.id}>
            <button type="button" onClick={() => onSelectTicket(ticket.id)}>
              <span className="ticket-subject">{ticket.subject}</span>
              <span className="ticket-badges">
                <span className={`badge badge-status-${ticket.status}`}>{ticket.status}</span>
                <span className={`badge badge-priority-${ticket.priority}`}>{ticket.priority}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
