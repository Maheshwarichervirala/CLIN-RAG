import { useState } from 'react'
import jsPDF from 'jspdf'
import { Sparkles, Send, Copy, Bookmark, Download, ThumbsUp, ThumbsDown } from 'lucide-react'
import api from '../api/axios'
import ConfidenceBadge from '../components/ConfidenceBadge'
import SourceCitation from '../components/SourceCitation'

const SAMPLE_QUERIES = [
  'What causes insulin resistance?',
  'What are the risk factors for gestational diabetes?',
  'What are common symptoms of type 2 diabetes?',
  'What are the complications of diabetes?',
]

export default function AskQuestion() {
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [feedbackGiven, setFeedbackGiven] = useState(null)

  async function handleAsk(e) {
    e?.preventDefault()
    if (!question.trim()) return
    setLoading(true)
    setResult(null)
    setFeedbackGiven(null)
    try {
      const { data } = await api.post('/questions/ask', { question })
      setResult(data)
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleAsk()
  }

  function copyAnswer() { navigator.clipboard.writeText(result.answer) }
  function bookmark() { api.post(`/bookmarks/${result.questionId}`) }
  function sendFeedback(helpful) {
    api.post('/feedback', { questionId: result.questionId, helpful })
    setFeedbackGiven(helpful)
  }
  function downloadPdf() {
    const doc = new jsPDF()
    const lines = doc.splitTextToSize(`Question: ${question}\n\nAnswer:\n${result.answer}`, 180)
    doc.text(lines, 15, 20)
    doc.save('clinical-answer.pdf')
  }

  return (
    <div>
      <h1 style={{ fontSize: 26, margin: '0 0 6px' }}>Clinical Question &amp; Answer</h1>
      <p style={{ color: 'var(--muted)', fontSize: 13.5, marginBottom: 22 }}>
        Ask a question and retrieve evidence-grounded answers with page-level citations from your uploaded documents.
      </p>

      <div className="ask-card">
        <label>Clinical Question</label>
        <textarea
          placeholder="Ask a clinical question (e.g. What causes insulin resistance? What are the symptoms of gestational diabetes?)..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={1000}
        />
        <div className="ask-meta-row">
          <span className="ask-hint">
            {question.length}/1000 &nbsp;•&nbsp; Press <span className="kbd">Ctrl</span> + <span className="kbd">Enter</span> to submit
          </span>
          <button className="btn-primary" onClick={handleAsk} disabled={loading || !question.trim()}>
            <Send size={14} /> {loading ? 'Thinking…' : 'Ask Clinical Question'}
          </button>
        </div>

        <div className="sample-label">Sample Clinical Queries:</div>
        <div className="sample-chips">
          {SAMPLE_QUERIES.map((q) => (
            <button key={q} className="sample-chip" onClick={() => setQuestion(q)}>
              <Sparkles size={13} /> {q}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="card" style={{ marginTop: 18 }}>
          <div className="skeleton" style={{ width: '90%' }} />
          <div className="skeleton" style={{ width: '75%' }} />
          <div className="skeleton" style={{ width: '60%' }} />
        </div>
      )}

      {result && (
        <div className="card" style={{ marginTop: 18 }}>
          <div className="top-bar" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <ConfidenceBadge confidence={result.confidence} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="secondary" onClick={copyAnswer}><Copy size={13} /> Copy</button>
              <button className="secondary" onClick={bookmark}><Bookmark size={13} /> Bookmark</button>
              <button className="secondary" onClick={downloadPdf}><Download size={13} /> PDF</button>
            </div>
          </div>

          <p>{result.answer}</p>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 8 }}>
            <span style={{ color: 'var(--muted)', fontSize: 13 }}>Was this helpful?</span>
            <button className="secondary" disabled={feedbackGiven !== null} onClick={() => sendFeedback(true)}><ThumbsUp size={13} /></button>
            <button className="secondary" disabled={feedbackGiven !== null} onClick={() => sendFeedback(false)}><ThumbsDown size={13} /></button>
          </div>

          {result.sources?.length > 0 && (
            <>
              <h4 style={{ marginTop: 18 }}>Answer generated from:</h4>
              {result.sources.map((s, i) => <SourceCitation key={i} source={s} />)}
            </>
          )}

          {result.suggestedFollowups?.length > 0 && (
            <>
              <h4 style={{ marginTop: 18 }}>Related Questions</h4>
              <div className="sample-chips">
                {result.suggestedFollowups.map((q, i) => (
                  <button key={i} className="sample-chip" onClick={() => setQuestion(q)}><Sparkles size={13} /> {q}</button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
