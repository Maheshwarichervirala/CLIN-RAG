import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import {
  LayoutGrid, HelpCircle, History as HistoryIcon, FileText, Settings,
  UserCog, Shield, Bell, Search, Sparkles, LogOut, Upload as UploadIcon,
} from 'lucide-react'
import { useAuth } from './context/AuthContext'
import { useTheme } from './context/ThemeContext'

import Login from './pages/Login'
import Register from './pages/Register'
import AskQuestion from './pages/AskQuestion'
import History from './pages/History'
import Dashboard from './pages/Dashboard'
import Sources from './pages/Sources'
import Profile from './pages/Profile'
import UploadPage from './pages/admin/Upload'
import Documents from './pages/admin/Documents'

const CLINICIAN_NAV = [
  { to: '/dashboard', label: 'Overview', icon: LayoutGrid },
  { to: '/ask', label: 'Ask Clinical Question', icon: HelpCircle },
  { to: '/history', label: 'Question History', icon: HistoryIcon },
  { to: '/sources', label: 'Medical Sources', icon: FileText },
  { to: '/profile', label: 'Profile & Settings', icon: Settings },
]

const ADMIN_NAV = [
  { to: '/dashboard', label: 'Overview', icon: LayoutGrid },
  { to: '/admin/upload', label: 'Upload PDF', icon: UploadIcon },
  { to: '/admin/documents', label: 'Manage Documents', icon: FileText },
  { to: '/profile', label: 'Profile & Settings', icon: Settings },
]

const PAGE_META = {
  '/dashboard': { crumb: 'overview', title: 'Clinical Overview & Knowledge Dashboard' },
  '/ask': { crumb: 'ask', title: 'Ask Clinical Question' },
  '/history': { crumb: 'history', title: 'Question History & Retrievals' },
  '/sources': { crumb: 'sources', title: 'Medical Sources' },
  '/profile': { crumb: 'profile', title: 'Profile & Account Settings' },
  '/admin/upload': { crumb: 'admin / upload', title: 'Upload Medical PDF' },
  '/admin/documents': { crumb: 'admin / documents', title: 'Manage Documents' },
}

function Protected({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" />
}

function AdminOnly({ children }) {
  const { user } = useAuth()
  return user?.role === 'ADMIN' ? children : <Navigate to="/ask" />
}

function Sidebar({ viewMode, setViewMode }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const nav = viewMode === 'admin' ? ADMIN_NAV : CLINICIAN_NAV
  const initial = (user?.name || '?').trim().charAt(0).toUpperCase()

  return (
    <div className="sidebar">
      <div className="brand">
        <div className="brand-icon"><Shield size={20} /></div>
        <div>
          <div className="brand-name">ClinRAG</div>
          <div className="brand-tag">Clinical Knowledge Assistant</div>
        </div>
      </div>

      {user?.role === 'ADMIN' && (
        <div className="view-mode-box">
          Current View Mode:
          <span className="view-mode-pill">{viewMode === 'admin' ? 'ADMIN' : 'CLINICIAN USER'}</span>
          <button
            className="mode-switch-btn"
            onClick={() => setViewMode(viewMode === 'admin' ? 'user' : 'admin')}
          >
            <UserCog size={14} />
            Switch to {viewMode === 'admin' ? 'User' : 'Admin'} Mode
          </button>
        </div>
      )}

      <div className="nav-label">NAVIGATION ({viewMode === 'admin' ? 'ADMIN' : 'USER'})</div>
      {nav.map(({ to, label, icon: Icon }) => (
        <Link key={to} to={to} className={`nav-link${location.pathname === to ? ' active' : ''}`}>
          <Icon size={16} />
          {label}
        </Link>
      ))}

      <div className="sidebar-footer">
        <div className="engine-status">
          <span><span className="dot" /> RAG Engine</span>
          <span className="online-text">ONLINE</span>
        </div>
        <div className="user-card">
          <div className="avatar-circle">{initial}</div>
          <div>
            <div className="u-name">{user?.name}</div>
            <div className="u-role">{user?.role === 'ADMIN' ? 'Administrator' : 'Clinician User'}</div>
          </div>
          <button className="signout-icon" onClick={logout} title="Sign out"><LogOut size={16} /></button>
        </div>
      </div>
    </div>
  )
}

function Topbar({ viewMode }) {
  const { user } = useAuth()
  const location = useLocation()
  const meta = PAGE_META[location.pathname] || { crumb: '', title: '' }
  const workspace = viewMode === 'admin' ? 'Admin Workspace' : 'Clinician Workspace'

  return (
    <div className="topbar">
      <div>
        <div className="breadcrumb">
          <b>ClinRAG</b> &gt; {workspace} &gt; {meta.crumb}
        </div>
        <div className="page-title">{meta.title}</div>
      </div>
      <div className="topbar-right">
        <Link to="/ask" className="ask-ai-btn"><Sparkles size={14} /> Ask AI</Link>
        <div className="search-box">
          <Search size={14} />
          <input
            placeholder="Search RAG knowledge base..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.target.value.trim()) {
                window.location.href = `/history?search=${encodeURIComponent(e.target.value)}`
              }
            }}
          />
        </div>
        <span className="role-badge"><Shield size={12} /> {user?.role}</span>
        <button className="icon-btn"><Bell size={17} /></button>
        <div className="avatar-circle">{(user?.name || '?').trim().charAt(0).toUpperCase()}</div>
      </div>
    </div>
  )
}

export default function App() {
  const { user } = useAuth()
  const [viewMode, setViewMode] = useState('user')

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    )
  }

  return (
    <div className="app-shell">
      <Sidebar viewMode={viewMode} setViewMode={setViewMode} />
      <div className="main">
        <Topbar viewMode={viewMode} />
        <div className="content-area">
          <Routes>
            <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
            <Route path="/ask" element={<Protected><AskQuestion /></Protected>} />
            <Route path="/history" element={<Protected><History /></Protected>} />
            <Route path="/sources" element={<Protected><Sources /></Protected>} />
            <Route path="/profile" element={<Protected><Profile /></Protected>} />
            <Route path="/admin/upload" element={<Protected><AdminOnly><UploadPage /></AdminOnly></Protected>} />
            <Route path="/admin/documents" element={<Protected><AdminOnly><Documents /></AdminOnly></Protected>} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}
