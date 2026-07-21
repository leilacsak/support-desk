import { useEffect, useState } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import { fetchTickets } from './api.js'
import TicketDetail from './TicketDetail.jsx'
import './App.css'

function TicketList() {
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
            <Link to={`/tickets/${ticket.id}`}>
              {ticket.subject} — {ticket.status} / {ticket.priority}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<TicketList />} />
      <Route path="/tickets/:id" element={<TicketDetail />} />
    </Routes>
  )
}
