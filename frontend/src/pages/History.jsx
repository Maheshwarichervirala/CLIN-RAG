import { useEffect, useState } from 'react'
import { Search, HelpCircle, Clock, BookOpen } from 'lucide-react'
import api from '../api/axios'

function sourceCount(sourcesJson) {
  try { return JSON.parse(sourcesJson || '[]').length } catch { return 0 }
}

export default function History() {
  const [items, setItems] = useState([])
  const [keyword, setKeyword] = useState(() => new URLSearchParams(window.location.search).get('search') || '')
  const [sort, setSort] = useState('newest')
  const [expanded, setExpanded] = useState(null)

  async function load(kw = keyword) {
    const url = kw.trim() ? `/questions/history/search?keyword=${encodeURIComponent(kw)}` : '/questions/history'
    const { data } = await api.get(url)
    setItems(data)
  }

  useEffect(() => { load(keyword) }, [])

  const sorted = [...items].sort((a, b) =>
    sort === 'newest'
      ? new Date(b.askedAt) - new Date(a.askedAt)
      : new Date(a.askedAt) - new Date(b.askedAt)
  )

  return (
    <div>
      <div className="history-toolbar">
        <div className="search-box">
          <Search size={14} />
          <input
            placeholder="Search past questions or answer text..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load()}
          />
        </div>
        <select className="sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="newest">Sort: Newest First</option>
          <option value="oldest">Sort: Oldest First</option>
        </select>
      </div>

      {sorted.length === 0 && <p style={{ color: 'var(--muted)' }}>No questions yet.</p>}

      {sorted.map((q) => (
        <div className="q-card" key={q.id}>
          <div className="q-card-head">
            <div className="q-icon"><HelpCircle size={15} /></div>
            <div style={{ flex: 1 }}>
              <div className="q-title">{q.questionText}</div>
              <div className="q-meta">
                <span><Clock size={11} style={{ verticalAlign: -1 }} /> {new Date(q.askedAt).toLocaleString()}</span>
                <span><BookOpen size={11} style={{ verticalAlign: -1 }} /> {sourceCount(q.sourcesJson)} Sources</span>
              </div>
            </div>
            <button className="pill-btn" onClick={() => setExpanded(expanded === q.id ? null : q.id)}>
              {expanded === q.id ? 'Hide Answer' : 'View Answer'}
            </button>
          </div>
          {expanded === q.id && <div className="q-preview">{q.answerText}</div>}
          {expanded !== q.id && <div className="q-preview">"{(q.answerText || '').slice(0, 140)}..."</div>}
        </div>
      ))}
    </div>
  )
}
