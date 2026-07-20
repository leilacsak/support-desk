import { useEffect, useState } from 'react'
import { fetchTickets } from './api.js'
import './App.css'

export default function App() {
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
            {ticket.subject} — {ticket.status} / {ticket.priority}
          </li>
        ))}
      </ul>
    </div>
  )
}
