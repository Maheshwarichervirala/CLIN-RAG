import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      await login(email, password)
      navigate('/ask')
    } catch {
      setError('Invalid email or password.')
    }
  }

  return (
    <div className="card" style={{ maxWidth: 360, margin: '80px auto' }}>
      <h2>Log In</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <span style={{ color: 'crimson', fontSize: 13 }}>{error}</span>}
        <button type="submit" className="btn-primary" style={{ justifyContent: "center" }}>Log In</button>
      </form>
      <p style={{ fontSize: 13, marginTop: 10 }}>No account? <Link to="/register">Register</Link></p>
    </div>
  )
}
