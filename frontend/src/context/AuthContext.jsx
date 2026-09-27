import { createContext, useContext, useState } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true'
const DEMO_USER = { name: 'Demo Admin', email: 'demo@example.com', role: 'ADMIN', token: 'demo-token' }

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    if (DEMO_MODE) return DEMO_USER
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })
  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password })
    persist(data)
  }

  async function register(name, email, password) {
    const { data } = await api.post('/auth/register', { name, email, password })
    persist(data)
  }

  function persist(data) {
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data))
    setUser(data)
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
