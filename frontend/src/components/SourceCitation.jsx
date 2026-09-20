export default function SourceCitation({ source }) {
  return (
    <div className="source-card">
      <div><strong>{source.filename}</strong> — Page {source.page}</div>
      <div style={{ color: 'var(--muted)', fontSize: 12 }}>Chapter: {source.chapter}</div>
      <div style={{ marginTop: 6, fontStyle: 'italic' }}>"{source.snippet}"</div>
    </div>
  )
}
