import { useEffect, useState } from 'react'
import { fetchTickets, fetchTicketCount } from './lib/api.js'
import TicketDetail from './TicketDetail.jsx'
import './App.css'

function TicketList({ onSelectTicket }) {
  const [tickets, setTickets] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchTickets()
      .then((data) => setTickets(data))
      .catch((err) => setError(err.message))
  }, [])

  return (
    <div>
      <h1>Support Desk</h1>

      {error && <p>Failed to load tickets: {error}</p>}

      <ul>
        {tickets.map((ticket) => (
          <li key={ticket.id}>
            <button type="button" onClick={() => onSelectTicket(ticket.id)}>
              {ticket.subject} — {ticket.status} / {ticket.priority}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function App() {
  const [selectedId, setSelectedId] = useState(null)
  const [ticketCount, setTicketCount] = useState(null)

  useEffect(() => {
    fetchTicketCount()
      .then((data) => setTicketCount(data.count))
      .catch(() => {})
  }, [])

  return (
    <>
      {selectedId !== null ? (
        <TicketDetail id={selectedId} onBack={() => setSelectedId(null)} />
      ) : (
        <TicketList onSelectTicket={setSelectedId} />
      )}
      {ticketCount !== null && <footer> {ticketCount} open tickets</footer>}
    </>
  )
}
