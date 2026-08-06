import { useEffect, useState } from 'react'
import { AuthContext } from './authContext.js'
import { login as apiLogin, register as apiRegister, fetchCurrentUser } from '../lib/api.js'

const TOKEN_KEY = 'supportdesk.token'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }

    fetchCurrentUser(token)
      .then((result) => {
        if (cancelled) return
        setUser(result)
      })
      .catch(() => {
        if (cancelled) return
        // The token failed verification - discard it so we don't keep retrying a dead token.
        localStorage.removeItem(TOKEN_KEY)
        setToken(null)
        setUser(null)
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [token])

  async function signIn(email, password) {
    const result = await apiLogin(email, password)
    localStorage.setItem(TOKEN_KEY, result.token)
    setToken(result.token)
    setUser(result.user)
  }

  async function signUp(email, name, password) {
    const result = await apiRegister(email, name, password)
    localStorage.setItem(TOKEN_KEY, result.token)
    setToken(result.token)
    setUser(result.user)
  }

  function signOut() {
    // No server call here: the token is a stateless signed claim with no
    // revocation mechanism, so there is no server-side session to end - it
    // stays valid until it naturally expires. This only makes the browser
    // forget it.
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
  }

  const value = { user, token, loading, signIn, signUp, signOut }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
