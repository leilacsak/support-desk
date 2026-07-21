import { useParams } from 'react-router-dom'

export default function TicketDetail() {
  const { id } = useParams()

  return (
    <div>
      <h1>Ticket #{id}</h1>
      <p>Details coming soon.</p>
    </div>
  )
}
