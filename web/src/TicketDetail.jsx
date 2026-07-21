import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchTicket } from './api.js'

export default function TicketDetail() {
  const { id } = useParams()
  const [ticket, setTicket] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    setTicket(null)
    setError(null)
    fetchTicket(id)
      .then((data) => setTicket(data))
      .catch((err) => setError(err.message))
  }, [id])

  if (error) {
    return (
      <div>
        <p>Failed to load ticket: {error}</p>
        <Link to="/">Back to list</Link>
      </div>
    )
  }

  if (!ticket) {
    return (
      <div>
        <p>Loading ticket…</p>
        <Link to="/">Back to list</Link>
      </div>
    )
  }

  return (
    <div>
      <h1>{ticket.subject}</h1>
      <p>Status: {ticket.status}</p>
      <p>Priority: {ticket.priority}</p>
      <p>Requester: {ticket.requester}</p>
      <Link to="/">Back to list</Link>
    </div>
  )
}
