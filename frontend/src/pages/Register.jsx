import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { register } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      await register(name, email, password)
      navigate('/ask')
    } catch {
      setError('Could not register — email may already be in use.')
    }
  }

  return (
    <div className="card" style={{ maxWidth: 360, margin: '80px auto' }}>
      <h2>Create Account</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <span style={{ color: 'crimson', fontSize: 13 }}>{error}</span>}
        <button type="submit" className="btn-primary" style={{ justifyContent: "center" }}>Register</button>
      </form>
      <p style={{ fontSize: 13, marginTop: 10 }}>Already have an account? <Link to="/login">Log in</Link></p>
    </div>
  )
}
