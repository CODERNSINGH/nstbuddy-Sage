import { createContext, useContext, useEffect, useState } from 'react'
import { api, getToken, setToken } from './api.js'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(!!getToken())

  // Restore the session when the page reloads
  useEffect(() => {
    if (!getToken()) return
    api('/auth/me')
      .then((data) => setAdmin(data.admin))
      .catch(() => setToken(null))
      .finally(() => setLoading(false))
  }, [])

  async function authenticate(path, body) {
    const data = await api(path, { method: 'POST', body })
    setToken(data.token)
    setAdmin(data.admin)
  }

  const value = {
    admin,
    loading,
    login: (email, password) => authenticate('/auth/login', { email, password }),
    signup: (form) => authenticate('/auth/signup', form),
    logout: () => {
      setToken(null)
      setAdmin(null)
    },
  }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
