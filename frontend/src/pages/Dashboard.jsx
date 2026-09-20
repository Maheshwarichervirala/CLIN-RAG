import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileText, HelpCircle, Bookmark, UploadCloud, Sparkles, Clock, CheckCircle2 } from 'lucide-react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [recent, setRecent] = useState([])
  const [sources, setSources] = useState([])

  useEffect(() => {
    api.get('/dashboard').then(({ data }) => setStats(data))
    api.get('/questions/recent').then(({ data }) => setRecent(data.slice(0, 3))).catch(() => {})
    api.get('/documents').then(({ data }) => setSources(data.slice(0, 4))).catch(() => {})
  }, [])

  const firstName = (user?.name || '').split(' ')[0]

  return (
    <div>
      <div className="hero">
        <div className="hero-pill"><span className="dot" /> RAG Knowledge Base Online</div>
        <h1>Good morning, {user?.name || firstName}</h1>
        <p>
          Ask clinical questions and explore evidence-grounded answers retrieved from your
          uploaded medical documents, complete with page-level citations.
        </p>
        <div className="hero-actions">
          <Link to="/ask" className="btn-primary"><Sparkles size={15} /> Ask a Clinical Question</Link>
          <Link to="/history" className="btn-outline-dark"><Clock size={15} /> View Question History</Link>
        </div>
      </div>

      {stats && (
        <div className="stat-grid">
          <div className="stat-card c-green">
            <div className="stat-top">
              <span className="stat-label">Available Documents</span>
              <span className="stat-icon"><FileText size={15} /></span>
            </div>
            <div className="stat-number">{stats.totalDocuments}</div>
            <div className="stat-sub">Indexed clinical PDFs in ChromaDB</div>
          </div>
          <div className="stat-card c-purple">
            <div className="stat-top">
              <span className="stat-label">Questions Asked</span>
              <span className="stat-icon"><HelpCircle size={15} /></span>
            </div>
            <div className="stat-number">{stats.questionsAsked}</div>
            <div className="stat-sub">Queries synthesized by RAG pipeline</div>
          </div>
          <div className="stat-card c-blue">
            <div className="stat-top">
              <span className="stat-label">Saved Answers</span>
              <span className="stat-icon"><Bookmark size={15} /></span>
            </div>
            <div className="stat-number">{stats.savedAnswers}</div>
            <div className="stat-sub">Bookmarked for later reference</div>
          </div>
          <div className="stat-card c-navy">
            <div className="stat-top">
              <span className="stat-label">Recent Upload</span>
              <span className="stat-icon"><UploadCloud size={15} /></span>
            </div>
            <div className="stat-number" style={{ fontSize: 15 }}>{stats.recentUpload || 'None yet'}</div>
            <div className="stat-sub">Latest document added to the library</div>
          </div>
        </div>
      )}

      <div className="panel-grid">
        <div className="panel">
          <div className="panel-head">
            <h3>Recent Clinical Questions</h3>
            <Link to="/history" className="link">View All →</Link>
          </div>
          <div className="panel-sub">Queries processed with grounded sources</div>
          {recent.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 13 }}>No questions asked yet.</p>}
          {recent.map((q) => (
            <div className="recent-item" key={q.id}>
              <div className="recent-q-row">
                <span className="recent-q">{q.questionText}</span>
                <Link to="/history" className="pill-btn">View Answer</Link>
              </div>
              <div className="recent-preview">"{(q.answerText || '').slice(0, 110)}..."</div>
            </div>
          ))}
        </div>

        <div className="panel">
          <div className="panel-head">
            <h3>Medical Sources</h3>
            <Link to="/sources" className="link">Browse All</Link>
          </div>
          <div className="panel-sub">Indexed PDFs in library</div>
          {sources.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 13 }}>No documents uploaded yet.</p>}
          {sources.map((d) => (
            <div className="source-item" key={d.id}>
              <div className="source-name">{d.filename}</div>
              <div className="source-meta">
                {d.chunkCount} chunks &nbsp;•&nbsp; {new Date(d.uploadedAt).toLocaleDateString()}
              </div>
              <span className="indexed-badge" style={{ marginTop: 6 }}>
                <CheckCircle2 size={11} /> Indexed
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
