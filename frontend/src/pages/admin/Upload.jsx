import { useState } from 'react'
import api from '../../api/axios'

const CATEGORIES = ['Cardiology', 'Neurology', 'Pediatrics', 'Dermatology', 'Oncology', 'General Medicine']

export default function Upload() {
  const [file, setFile] = useState(null)
  const [category, setCategory] = useState(CATEGORIES[0])
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('')

  async function handleUpload(e) {
    e.preventDefault()
    if (!file) return
    const form = new FormData()
    form.append('file', file)
    form.append('category', category)

    setStatus('')
    setProgress(0)
    await api.post('/admin/documents', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (evt) => setProgress(Math.round((evt.loaded / evt.total) * 100)),
    })
    setStatus('PDF uploaded successfully.')
    setFile(null)
    setProgress(0)
  }

  return (
    <div>
      <h2>Upload Medical PDF</h2>
      <form className="card" onSubmit={handleUpload}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files[0])} />
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <button type="submit" className="btn-primary" disabled={!file}>Upload</button>
        </div>

        {progress > 0 && progress < 100 && (
          <div style={{ marginTop: 10, fontSize: 13 }}>
            Uploading… {progress}%
            <div style={{ background: 'var(--border)', borderRadius: 4, height: 8, marginTop: 4 }}>
              <div style={{ width: `${progress}%`, background: 'var(--accent)', height: '100%', borderRadius: 4 }} />
            </div>
          </div>
        )}
        {status && <p style={{ color: '#2ea043', marginTop: 10 }}>{status}</p>}
      </form>
    </div>
  )
}
