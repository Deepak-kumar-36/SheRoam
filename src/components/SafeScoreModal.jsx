import { useState } from 'react'
import { Star, X, Send, MapPin } from 'lucide-react'
import { db } from '../lib/database'

export default function SafeScoreModal({ lat, lng, placeName, onClose, addToast }) {
  const [score, setScore] = useState(7)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await db.safeScores.submit(lat, lng, placeName, score, comment)
      addToast(`RATED ${placeName.toUpperCase()}: ${score}/10`, 'success')
      onClose()
    } catch (err) {
      addToast('FAILED TO SUBMIT RATING: ' + err.message, 'error')
    }
    setSubmitting(false)
  }

  const scoreColor = score >= 7 ? '#ceee93' : score >= 4 ? '#f59e0b' : '#ff4a8d'
  const scoreLabel = score >= 7 ? 'SAFE' : score >= 4 ? 'MODERATE' : 'UNSAFE'

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="glass-panel modal-panel" style={{ borderTop: `2px solid ${scoreColor}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div className="label-caps" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Star size={14} color={scoreColor} /> RATE THIS PLACE
          </div>
          <button className="btn-icon" onClick={onClose}><X size={16} /></button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px', padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <MapPin size={14} color="rgba(255,255,255,0.5)" />
          <span className="label-caps" style={{ fontSize: '10px' }}>{placeName}</span>
        </div>

        {/* Score Selector */}
        <div style={{ marginBottom: '32px' }}>
          <div className="label-caps" style={{ marginBottom: '16px', opacity: 0.6 }}>SAFETY SCORE</div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[0,1,2,3,4,5,6,7,8,9,10].map(n => (
              <button
                key={n}
                onClick={() => setScore(n)}
                style={{
                  width: '40px', height: '40px',
                  background: n === score ? scoreColor : 'rgba(255,255,255,0.05)',
                  color: n === score ? '#000' : 'rgba(255,255,255,0.6)',
                  border: `1px solid ${n === score ? scoreColor : 'rgba(255,255,255,0.1)'}`,
                  cursor: 'pointer',
                  fontFamily: 'Space Grotesk',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  transition: 'all 0.2s'
                }}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="label-caps" style={{ marginTop: '12px', color: scoreColor, fontSize: '11px' }}>
            {score}/10 — {scoreLabel}
          </div>
        </div>

        {/* Comment */}
        <div style={{ marginBottom: '24px' }}>
          <div className="label-caps" style={{ marginBottom: '8px', opacity: 0.6 }}>COMMENT (OPTIONAL)</div>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Share your experience..."
            rows={3}
            style={{
              width: '100%', padding: '12px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff', fontFamily: 'Space Grotesk',
              fontSize: '0.8rem', resize: 'none'
            }}
          />
        </div>

        <button
          className="btn btn-primary"
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          onClick={handleSubmit}
          disabled={submitting}
        >
          <Send size={14} /> {submitting ? 'SUBMITTING...' : 'SUBMIT SAFETY RATING'}
        </button>
      </div>
    </div>
  )
}
