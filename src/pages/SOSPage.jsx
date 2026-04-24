import { useState, useEffect, useRef } from 'react'
import { mockApi } from '../lib/mockApi'
import { ShieldAlert, CheckCircle2, Shield, Phone, Globe, Radio, User, MapPin } from 'lucide-react'

const CONTACTS = [
  { id: 1, name: 'Mom',       initials: 'MM', color: '#EC4899', phone: '+1 (555) 210-0001' },
  { id: 2, name: 'Priya',     initials: 'PR', color: '#7C3AED', phone: '+91 98800 11223' },
  { id: 3, name: 'SheRoam Guardian', icon: <Shield size={16} />, color: '#D84AFF', phone: 'platform' },
  { id: 4, name: 'Local Police', icon: <ShieldAlert size={16} />, color: '#3B82F6', phone: '17 (FR)' },
]

const EMERGENCY_NUMBERS = [
  { country: 'France',      police: '17', ambulance: '15', fire: '18', women: '3919' },
  { country: 'India',       police: '100', ambulance: '108', fire: '101', women: '181' },
  { country: 'USA',         police: '911', ambulance: '911', fire: '911', women: '1-800-799-7233' },
  { country: 'UK',          police: '999', ambulance: '999', fire: '999', women: '0808 2000 247' },
  { country: 'Germany',     police: '110', ambulance: '112', fire: '112', women: '08000 116 016' },
]

// Simulated GPS
const GPS_COORDS = '48.8613° N, 2.3522° E'

export default function SOSPage({ addToast }) {
  const [phase, setPhase] = useState('idle')   // idle | confirm | alerting | sent
  const [alertedCount, setAlertedCount] = useState(0)
  const intervalRef = useRef(null)

  // ── Open confirmation modal ────────────────────────────────────────────────
  const openConfirm = () => setPhase('confirm')
  const cancelSOS   = () => { setPhase('idle'); setAlertedCount(0); }

  // ── Send SOS ───────────────────────────────────────────────────────────────
  const sendSOS = async () => {
    setPhase('alerting')
    setAlertedCount(0)
    
    await mockApi.sos.sendAlert(CONTACTS, (count, contact) => {
      setAlertedCount(count)
      addToast(`Alert sent to ${contact.name || 'contact'}`, 'error')
    })
    
    setPhase('sent')
  }

  // ── Mark safe ──────────────────────────────────────────────────────────────
  const markSafe = () => {
    clearInterval(intervalRef.current)
    setPhase('idle')
    setAlertedCount(0)
    addToast('You are marked safe. Emergency contacts notified.', 'success')
  }

  useEffect(() => () => clearInterval(intervalRef.current), [])

  const isSending = phase === 'alerting' || phase === 'sent'

  return (
    <div className="sos-page">
      <div className="container">
        {/* Header */}
        <div className="page-header" style={{ textAlign: 'center', maxWidth: 520, margin: '0 auto 32px' }}>
          <div className="section-label">EMERGENCY SYSTEM</div>
          <h1 className="sos-title">Emergency <span className="gradient-text">Assistance</span></h1>
          <p className="sos-subtitle">
            Tap the button below to instantly alert your emergency contacts and local authorities.
          </p>
        </div>

        <div className="sos-layout">
          {/* ── Left: SOS Button Area ──────────────────────────────────── */}
          <div className="sos-main">
            {phase === 'idle' && (
              <>
                {/* Stitch SOS ring button */}
                <div className={`sos-btn-wrapper ${isSending ? 'sos-btn-active' : ''}`}>
                  <div className="sos-ring-1"/>
                  <div className="sos-ring-2"/>
                  <div className="sos-ring-3"/>
                  <button className="sos-btn" onClick={openConfirm} id="sos-main-btn" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="sos-icon"><ShieldAlert size={36} /></span>
                    <span style={{ marginTop: '8px' }}>SEND SOS</span>
                    <span className="sos-btn-label">Hold to activate</span>
                  </button>
                </div>

                {/* Live Tracking status */}
                <div className="glass-card" style={{ width: '100%', maxWidth: 400 }}>
                  <div className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="pulse-dot pulse-dot-safe"/>
                    Live Tracking Ready
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem' }}>
                      <span style={{ color: 'var(--s-outline)', display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={14} /> Current Location</span>
                      <span style={{ color: 'var(--s-on-surface)', fontWeight: 600 }}>{GPS_COORDS}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem' }}>
                      <span style={{ color: 'var(--s-outline)', display: 'flex', alignItems: 'center', gap: '6px' }}><User size={14} /> Contacts Ready</span>
                      <span style={{ color: 'var(--s-on-surface)', fontWeight: 600 }}>{CONTACTS.length} contacts</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem' }}>
                      <span style={{ color: 'var(--s-outline)', display: 'flex', alignItems: 'center', gap: '6px' }}><Shield size={14} /> Encryption</span>
                      <span style={{ color: '#4ade80', fontWeight: 600 }}>E2E Active</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ── Alerting state ──────────────────────────────────────── */}
            {(phase === 'alerting' || phase === 'sent') && (
              <>
                {/* Pulsing active SOS button */}
                <div className="sos-btn-wrapper sos-btn-active" style={{ marginBottom: 8 }}>
                  <div className="sos-ring-1"/>
                  <div className="sos-ring-2"/>
                  <div className="sos-ring-3"/>
                  <button className="sos-btn" style={{ cursor: 'default', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="sos-icon">{phase === 'sent' ? <CheckCircle2 size={36} /> : <Radio size={36} />}</span>
                    <span style={{ marginTop: '8px' }}>{phase === 'sent' ? 'ALERT SENT' : 'ALERTING…'}</span>
                    <span className="sos-btn-label">{alertedCount}/{CONTACTS.length} notified</span>
                  </button>
                </div>

                {/* Stitch: "Emergency Alert Sent" panel */}
                <div className="sos-success-panel">
                  <div style={{ fontSize: '2.2rem', marginBottom: 8, display: 'flex', justifyContent: 'center' }}>
                    {phase === 'sent' ? <CheckCircle2 size={42} color="#4ade80" /> : <Radio size={42} color="var(--s-tertiary)" className="pulse-icon" />}
                  </div>
                  <div style={{ fontFamily: 'var(--font-headline)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--s-on-surface)', marginBottom: 6 }}>
                    {phase === 'sent' ? 'Emergency Alert Sent' : 'Sending Alerts…'}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--s-on-surface-variant)', marginBottom: 18 }}>
                    {phase === 'sent'
                      ? 'Help is on the way. Do not close the app.'
                      : 'Notifying your contacts with GPS location…'}
                  </div>

                  {/* Contacts sent list */}
                  <div className="sos-contacts-sent">
                    {CONTACTS.map((c, i) => {
                      const sent = i < alertedCount
                      return (
                        <div key={c.id} className="contact-sent" style={{ opacity: sent ? 1 : 0.35, transition: 'opacity 0.5s' }}>
                          <div className="contact-avatar" style={{ background: `${c.color}22`, color: c.color, fontSize: '0.8rem', fontWeight: 'bold' }}>
                            {c.icon || c.initials}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{c.name}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--s-outline)' }}>{c.phone}</div>
                          </div>
                          <span style={{ fontSize: '1rem', display: 'flex' }}>
                            {sent ? <CheckCircle2 size={16} color="#4ade80" /> : <div className="pulse-dot" style={{ position: 'static' }}></div>}
                          </span>
                        </div>
                      )
                    })}
                  </div>

                  {phase === 'sent' && (
                    <button
                      className="btn btn-secondary"
                      style={{ width: '100%', marginTop: 20, borderColor: 'rgba(34,197,94,0.3)', color: '#4ade80', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      onClick={markSafe}
                      id="mark-safe-btn"
                    >
                      <CheckCircle2 size={16} /> I Am Safe — Cancel Alert
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          {/* ── Right sidebar: Emergency numbers ───────────────────────── */}
          <div>
            {/* Contacts */}
            <div className="sos-emergency-table" style={{ marginBottom: 20 }}>
              <div className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={14} /> Emergency Contacts</div>
              {CONTACTS.map(c => (
                <div key={c.id} className="emergency-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="contact-avatar" style={{ width: 30, height: 30, background: `${c.color}22`, color: c.color, fontSize: '0.7rem', fontWeight: 'bold' }}>
                      {c.icon || c.initials}
                    </div>
                    <span className="emergency-country">{c.name}</span>
                  </div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--s-outline)' }}>{c.phone}</span>
                </div>
              ))}
            </div>

            {/* International Numbers */}
            <div className="sos-emergency-table">
              <div className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Globe size={14} /> International Emergency Numbers</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr 1fr', gap: '6px 12px', alignItems: 'center', fontSize: '0.78rem' }}>
                <div style={{ color: 'var(--s-outline)', fontWeight: 700 }}>Country</div>
                <div style={{ color: 'var(--s-outline)', fontWeight: 700 }}>Police</div>
                <div style={{ color: 'var(--s-outline)', fontWeight: 700 }}>Ambulance</div>
                <div style={{ color: 'var(--s-outline)', fontWeight: 700 }}>Women</div>
                {EMERGENCY_NUMBERS.map(r => (
                  <div style={{ display: 'contents' }} key={r.country}>
                    <div style={{ color: 'var(--s-on-surface)', fontWeight: 600, paddingTop: 6 }}>{r.country}</div>
                    <span className="emergency-num">{r.police}</span>
                    <span className="emergency-num">{r.ambulance}</span>
                    <span className="emergency-num" style={{ color: 'var(--s-tertiary)' }}>{r.women}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── SOS Confirmation Modal (Stitch glass-elevated) ──────────────────── */}
      {phase === 'confirm' && (
        <div className="sos-modal-backdrop" onClick={e => e.target === e.currentTarget && cancelSOS()}>
          <div className="sos-modal" id="sos-confirm-modal">
            <div className="sos-modal-icon">
              <ShieldAlert size={36} color="var(--s-tertiary)" />
            </div>
            <div className="sos-modal-title">Send Emergency Alert?</div>
            <div className="sos-modal-subtitle">
              Your GPS location ({GPS_COORDS}) and a distress message will be sent
              to <strong style={{ color: 'var(--s-primary)' }}>{CONTACTS.length} contacts</strong> including local authorities.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button
                className="btn btn-danger"
                style={{ width: '100%', padding: '14px', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                onClick={sendSOS}
                id="confirm-sos-btn"
              >
                <ShieldAlert size={18} /> SEND SOS NOW
              </button>
              <button
                className="btn btn-secondary"
                style={{ width: '100%' }}
                onClick={cancelSOS}
                id="cancel-sos-btn"
              >
                Cancel — I'm Safe
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
