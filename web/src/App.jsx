import { useEffect, useState } from 'react'
import { fetchTicketCount } from './lib/api.js'
import { useAuth } from './auth/authContext.js'
import LoginForm from './auth/LoginForm.jsx'
import TicketList from './TicketList.jsx'
import TicketDetail from './TicketDetail.jsx'
import './App.css'

export default function App() {
  const { token, loading, user, signOut } = useAuth()
  const [selectedId, setSelectedId] = useState(null)
  const [ticketCount, setTicketCount] = useState(null)

  useEffect(() => {
    if (loading || !token) return
    fetchTicketCount(token)
      .then((data) => setTicketCount(data.count))
      .catch(() => {})
  }, [token, loading])

  // This conditional rendering is a UX convenience only, not a security
  // boundary - the server enforces authorization on every request
  // regardless of what the client renders here.
  return (
    <>
      <nav className="navbar">
        <h1>Support Desk</h1>
        {user && (
          <div className="navbar-user">
            <span>{user.name || user.email}</span>
            <button type="button" onClick={signOut}>Sign out</button>
          </div>
        )}
      </nav>

      {loading && <p>Loading…</p>}

      {!loading && !user && <LoginForm />}

      {!loading && user && (
        <>
          {selectedId !== null ? (
            <TicketDetail id={selectedId} onBack={() => setSelectedId(null)} />
          ) : (
            <TicketList onSelectTicket={setSelectedId} />
          )}
          {ticketCount !== null && (
            <footer> {ticketCount} open {ticketCount === 1 ? 'ticket' : 'tickets'}</footer>
          )}
        </>
      )}
    </>
  )
}
