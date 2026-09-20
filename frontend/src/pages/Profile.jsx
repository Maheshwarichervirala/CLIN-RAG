import { User, Shield, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const { user, logout } = useAuth()

  return (
    <div>
      <h1 style={{ fontSize: 24, margin: '0 0 20px' }}>Profile &amp; Account Settings</h1>

      <div className="profile-section">
        <h3><User size={16} /> User Profile Information</h3>
        <div className="profile-grid">
          <div>
            <div className="field-label">Full Name</div>
            <div className="field-value">{user?.name}</div>
          </div>
          <div>
            <div className="field-label">Email Address</div>
            <div className="field-value">{user?.email}</div>
          </div>
          <div>
            <div className="field-label">Assigned Platform Role</div>
            <div className="field-value" style={{ color: 'var(--accent-dark)', fontWeight: 700 }}>
              <Shield size={13} style={{ verticalAlign: -2, marginRight: 5 }} />
              {user?.role}
            </div>
          </div>
        </div>
      </div>

      <div className="profile-section" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ marginBottom: 4 }}>Sign Out of ClinRAG Session</h3>
          <p style={{ color: 'var(--muted)', fontSize: 12.5, margin: 0 }}>
            Safely clear stored JWT authentication credentials from this browser.
          </p>
        </div>
        <button className="secondary" onClick={logout}><LogOut size={14} /> Sign Out</button>
      </div>
    </div>
  )
}
