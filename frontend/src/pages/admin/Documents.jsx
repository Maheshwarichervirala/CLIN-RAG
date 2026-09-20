import { useEffect, useState } from 'react'
import api from '../../api/axios'

export default function Documents() {
  const [documents, setDocuments] = useState([])
  const [search, setSearch] = useState('')
  const [reindexing, setReindexing] = useState(false)

  async function load() {
    const url = search.trim() ? `/admin/documents?search=${encodeURIComponent(search)}` : '/admin/documents'
    const { data } = await api.get(url)
    setDocuments(data)
  }

  useEffect(() => { load() }, [])

  async function remove(id) {
    await api.delete(`/admin/documents/${id}`)
    load()
  }

  async function reindex() {
    setReindexing(true)
    await api.post('/admin/documents/reindex')
    setReindexing(false)
  }

  return (
    <div>
      <div className="top-bar">
        <h2>Uploaded Documents</h2>
        <button className="btn-primary" onClick={reindex} disabled={reindexing}>
          {reindexing ? 'Re-indexing…' : 'Re-index Knowledge Base'}
        </button>
      </div>

      <div className="card top-bar">
        <input
          placeholder="Search uploaded PDFs…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && load()}
          style={{ flex: 1 }}
        />
        <button className="btn-primary" onClick={load}>Search</button>
      </div>

      {documents.map((d) => (
        <div className="card top-bar" key={d.id}>
          <div>
            <strong>{d.filename}</strong>
            <div style={{ color: 'var(--muted)', fontSize: 12 }}>
              {d.category} · {d.chunkCount} chunks · uploaded {new Date(d.uploadedAt).toLocaleDateString()}
            </div>
          </div>
          <button className="secondary" onClick={() => remove(d.id)}>Delete</button>
        </div>
      ))}
      {documents.length === 0 && <p style={{ color: 'var(--muted)' }}>No documents uploaded yet.</p>}
    </div>
  )
}
