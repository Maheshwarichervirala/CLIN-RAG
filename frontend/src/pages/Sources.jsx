import { useEffect, useState } from 'react'
import { CheckCircle2, FileText } from 'lucide-react'
import api from '../api/axios'

export default function Sources() {
  const [documents, setDocuments] = useState([])

  useEffect(() => {
    api.get('/documents').then(({ data }) => setDocuments(data))
  }, [])

  return (
    <div>
      <h1 style={{ fontSize: 24, margin: '0 0 6px' }}>Medical Sources</h1>
      <p style={{ color: 'var(--muted)', fontSize: 13.5, marginBottom: 20 }}>
        Browse the trusted medical documents currently indexed in the knowledge base.
      </p>

      {documents.length === 0 && (
        <p style={{ color: 'var(--muted)' }}>No documents have been uploaded to the knowledge base yet.</p>
      )}

      {documents.map((d) => (
        <div className="q-card" key={d.id}>
          <div className="q-card-head">
            <div className="q-icon"><FileText size={15} /></div>
            <div style={{ flex: 1 }}>
              <div className="q-title">{d.filename}</div>
              <div className="q-meta">
                <span>{d.category}</span>
                <span>{d.chunkCount} chunks</span>
                <span>Uploaded {new Date(d.uploadedAt).toLocaleDateString()}</span>
              </div>
            </div>
            <span className="indexed-badge"><CheckCircle2 size={11} /> Indexed</span>
          </div>
        </div>
      ))}
    </div>
  )
}
