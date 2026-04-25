import { useState } from 'react'
import { AlertTriangle, X, Send, MapPin } from 'lucide-react'
import { db } from '../lib/database'

const INCIDENT_TYPES = [
  { value: 'harassment', label: 'HARASSMENT' },
  { value: 'theft', label: 'THEFT' },
  { value: 'stalking', label: 'STALKING' },
  { value: 'assault', label: 'ASSAULT' },
  { value: 'unsafe_area', label: 'UNSAFE AREA' },
  { value: 'other', label: 'OTHER' }
]

export default function IncidentReportModal({ lat, lng, locationName, onClose, addToast }) {
  const [type, setType] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!type) {
      addToast('SELECT AN INCIDENT TYPE.', 'error')
      return
    }
    setSubmitting(true)
    try {
      await db.incidents.report(lat, lng, locationName, type, description)
      addToast('INCIDENT REPORTED SUCCESSFULLY. STAY SAFE.', 'success')
      onClose()
    } catch (err) {
      addToast('FAILED TO REPORT: ' + err.message, 'error')
    }
    setSubmitting(false)
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="glass-panel modal-panel" style={{ borderTop: '2px solid #ff4a8d' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div className="label-caps" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ff4a8d' }}>
            <AlertTriangle size={14} /> REPORT INCIDENT
          </div>
          <button className="btn-icon" onClick={onClose}><X size={16} /></button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px', padding: '12px', background: 'rgba(255,75,141,0.05)', border: '1px solid rgba(255,75,141,0.15)' }}>
          <MapPin size={14} color="#ff4a8d" />
          <span className="label-caps" style={{ fontSize: '10px' }}>{locationName}</span>
        </div>

        {/* Type Selector */}
        <div style={{ marginBottom: '24px' }}>
          <div className="label-caps" style={{ marginBottom: '12px', opacity: 0.6 }}>INCIDENT TYPE</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {INCIDENT_TYPES.map(t => (
              <button
                key={t.value}
                onClick={() => setType(t.value)}
                style={{
                  padding: '10px',
                  background: type === t.value ? 'rgba(255,75,141,0.15)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${type === t.value ? '#ff4a8d' : 'rgba(255,255,255,0.1)'}`,
                  color: type === t.value ? '#ff4a8d' : 'rgba(255,255,255,0.6)',
                  cursor: 'pointer',
                  fontFamily: 'Space Grotesk',
                  fontSize: '0.7rem',
                  letterSpacing: '0.1em',
                  transition: 'all 0.2s'
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div style={{ marginBottom: '24px' }}>
          <div className="label-caps" style={{ marginBottom: '8px', opacity: 0.6 }}>DESCRIPTION (OPTIONAL)</div>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="What happened? Any details help the community..."
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
          className="btn btn-danger"
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          onClick={handleSubmit}
          disabled={submitting || !type}
        >
          <Send size={14} /> {submitting ? 'REPORTING...' : 'SUBMIT INCIDENT REPORT'}
        </button>

        <p className="label-caps" style={{ marginTop: '16px', textAlign: 'center', opacity: 0.4, fontSize: '9px' }}>
          YOUR REPORT HELPS KEEP THE COMMUNITY SAFE. ALL REPORTS ARE ANONYMOUS.
        </p>
      </div>
    </div>
  )
}
