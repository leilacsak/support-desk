import { useEffect, useState } from 'react'
import { fetchTickets, fetchTicketCount } from './lib/api.js'
import { useAuth } from './auth/authContext.js'
import LoginForm from './auth/LoginForm.jsx'
import TicketDetail from './TicketDetail.jsx'
import './App.css'

function TicketList({ onSelectTicket }) {
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
      {error && <p>Failed to load tickets: {error}</p>}

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

export default function App() {
  const { token, loading: authLoading, user, signOut } = useAuth()
  const [selectedId, setSelectedId] = useState(null)
  const [ticketCount, setTicketCount] = useState(null)

  useEffect(() => {
    if (authLoading || !token) return
    fetchTicketCount(token)
      .then((data) => setTicketCount(data.count))
      .catch(() => {})
  }, [token, authLoading])

  return (
    <>
      <div className="app-header">
        <h1>Support Desk</h1>
        {!authLoading && user && (
          <button type="button" onClick={signOut}>Sign out</button>
        )}
      </div>

      {authLoading && <p>Loading…</p>}

      {!authLoading && !user && <LoginForm />}

      {!authLoading && user && (
        <>
          {selectedId !== null ? (
            <TicketDetail id={selectedId} onBack={() => setSelectedId(null)} />
          ) : (
            <TicketList onSelectTicket={setSelectedId} />
          )}
          {ticketCount !== null && (
            <footer>
              {' '}
              {ticketCount} open {ticketCount === 1 ? 'ticket' : 'tickets'}
            </footer>
          )}
        </>
      )}
    </>
  )
}

