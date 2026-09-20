export default function ConfidenceBadge({ confidence }) {
  const level = confidence >= 75 ? 'high' : confidence >= 45 ? 'mid' : 'low'
  return (
    <span className={`confidence-badge confidence-${level}`}>
      Confidence: {confidence.toFixed(0)}%
    </span>
  )
}
