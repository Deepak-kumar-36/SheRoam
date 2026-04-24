import { useState, useEffect, useRef } from 'react'
import { db } from '../lib/database'
import { ShieldAlert, CheckCircle2, Shield, Phone, Globe, Radio, User, MapPin } from 'lucide-react'

const CONTACTS = [
  { id: 1, name: 'MOM',       initials: 'MM', color: '#ff4a8d', phone: '+1 (555) 210-0001' },
  { id: 2, name: 'PRIYA',     initials: 'PR', color: '#f59e0b', phone: '+91 98800 11223' },
  { id: 3, name: 'SHEROAM GUARDIAN', icon: <Shield size={16} />, color: '#ceee93', phone: 'PLATFORM' },
  { id: 4, name: 'LOCAL POLICE', icon: <ShieldAlert size={16} />, color: '#ffffff', phone: '17 (FR)' },
]

const EMERGENCY_NUMBERS = [
  { country: 'FRANCE',      police: '17', ambulance: '15', fire: '18', women: '3919' },
  { country: 'INDIA',       police: '100', ambulance: '108', fire: '101', women: '181' },
  { country: 'USA',         police: '911', ambulance: '911', fire: '911', women: '1-800-799-7233' },
  { country: 'UK',          police: '999', ambulance: '999', fire: '999', women: '0808 2000 247' },
  { country: 'GERMANY',     police: '110', ambulance: '112', fire: '112', women: '08000 116 016' },
]

// Simulated GPS
const GPS_COORDS = '48.8613° N, 2.3522° E'

export default function SOSPage({ addToast }) {
  const [phase, setPhase] = useState('idle')   // idle | confirm | alerting | sent
  const [alertedCount, setAlertedCount] = useState(0)
  const intervalRef = useRef(null)

  const openConfirm = () => setPhase('confirm')
  const cancelSOS   = () => { setPhase('idle'); setAlertedCount(0); }

  const sendSOS = async () => {
    setPhase('alerting')
    setAlertedCount(0)
    
    setAlertedCount(1)
    await db.sos.sendAlert(CONTACTS)
    setAlertedCount(CONTACTS.length)
    
    setPhase('sent')
  }

  const markSafe = () => {
    clearInterval(intervalRef.current)
    setPhase('idle')
    setAlertedCount(0)
    addToast('YOU ARE MARKED SAFE. EMERGENCY CONTACTS NOTIFIED.', 'success')
  }

  useEffect(() => () => clearInterval(intervalRef.current), [])

  const isSending = phase === 'alerting' || phase === 'sent'

  return (
    <div className="page flex-center" style={{ minHeight: '100vh', flexDirection: 'column' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '32px' }}>
          <div className="label-caps" style={{ color: '#ff4a8d', marginBottom: '8px' }}>EMERGENCY OVERRIDE</div>
          <h1 className="headline-xl" style={{ textTransform: 'uppercase' }}>S.O.S. PROTOCOL</h1>
          <p className="label-caps" style={{ opacity: 0.5, marginTop: '8px' }}>
            INITIATE SECURE DISTRESS SIGNAL TO AUTHORITIES AND NETWORK
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: '32px', alignItems: 'start' }}>
          {/* ── Left: SOS Button Area ──────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', alignItems: 'center' }}>
            {phase === 'idle' && (
              <>
                <div style={{ position: 'relative', width: '240px', height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ position: 'absolute', inset: 0, border: '1px solid #ff4a8d', borderRadius: '50%', opacity: 0.2, animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite' }}></div>
                  <div style={{ position: 'absolute', inset: '20px', border: '1px solid #ff4a8d', borderRadius: '50%', opacity: 0.4, animation: 'ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite' }}></div>
                  <button 
                    className="btn btn-danger neon-glow"
                    style={{ position: 'relative', zIndex: 10, width: '160px', height: '160px', borderRadius: '50%', padding: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                    onClick={openConfirm}
                  >
                    <ShieldAlert size={48} />
                    <span className="headline-sm" style={{ marginTop: '8px' }}>SOS</span>
                  </button>
                </div>

                {/* Live Tracking status */}
                <div className="glass-panel" style={{ width: '100%', padding: '24px' }}>
                  <div className="label-caps" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--s-primary)', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
                    <div style={{ width: 8, height: 8, background: 'var(--s-primary)', borderRadius: '50%', boxShadow: 'var(--glow-primary)' }}></div>
                    LIVE TRACKING READY
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="label-caps" style={{ opacity: 0.5, display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={14} /> COORDINATES</span>
                      <span className="label-caps" style={{ color: '#fff' }}>{GPS_COORDS}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="label-caps" style={{ opacity: 0.5, display: 'flex', alignItems: 'center', gap: '8px' }}><User size={14} /> CONTACTS READY</span>
                      <span className="label-caps" style={{ color: '#fff' }}>{CONTACTS.length} OPERATIVES</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="label-caps" style={{ opacity: 0.5, display: 'flex', alignItems: 'center', gap: '8px' }}><Shield size={14} /> ENCRYPTION</span>
                      <span className="label-caps" style={{ color: 'var(--s-primary)' }}>E2E ACTIVE</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ── Alerting state ──────────────────────────────────────── */}
            {(phase === 'alerting' || phase === 'sent') && (
              <>
                <div style={{ position: 'relative', width: '200px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ position: 'absolute', inset: 0, border: '1px solid var(--s-primary)', borderRadius: '50%', opacity: 0.2, animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite' }}></div>
                  <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(206,238,147,0.1)', border: '1px solid var(--s-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--s-primary)' }}>
                    {phase === 'sent' ? <CheckCircle2 size={36} /> : <Radio size={36} className="animate-pulse" />}
                  </div>
                </div>

                <div className="glass-panel" style={{ width: '100%', padding: '24px', textAlign: 'center' }}>
                  <div className="label-caps" style={{ color: 'var(--s-primary)', fontSize: '1rem', marginBottom: '8px' }}>
                    {phase === 'sent' ? 'EMERGENCY ALERT SENT' : 'TRANSMITTING ALERTS...'}
                  </div>
                  <div className="label-caps" style={{ opacity: 0.6, fontSize: '10px', marginBottom: '24px' }}>
                    {phase === 'sent'
                      ? 'HELP IS EN ROUTE. DO NOT CLOSE TERMINAL.'
                      : 'BROADCASTING GPS COORDINATES...'}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
                    {CONTACTS.map((c, i) => {
                      const sent = i < alertedCount
                      return (
                        <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', opacity: sent ? 1 : 0.3, transition: 'opacity 0.5s' }}>
                          <span style={{ fontSize: '1rem' }}>
                            {sent ? <CheckCircle2 size={16} color="var(--s-primary)" /> : <div style={{ width: 8, height: 8, background: 'var(--s-primary)', borderRadius: '50%' }}></div>}
                          </span>
                          <div style={{ flex: 1 }}>
                            <div className="label-caps">{c.name}</div>
                            <div className="label-caps" style={{ opacity: 0.5, fontSize: '9px' }}>{c.phone}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {phase === 'sent' && (
                    <button
                      className="btn btn-secondary"
                      style={{ width: '100%', marginTop: '32px', borderColor: 'var(--s-primary)', color: 'var(--s-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                      onClick={markSafe}
                    >
                      <CheckCircle2 size={16} /> <span className="label-caps">I AM SAFE — CANCEL ALERT</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          {/* ── Right sidebar: Emergency numbers ───────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div className="label-caps" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={14} /> EMERGENCY CONTACTS
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {CONTACTS.map(c => (
                  <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '24px', height: '24px', border: `1px solid ${c.color}`, color: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>
                        {c.icon || c.initials}
                      </div>
                      <span className="label-caps">{c.name}</span>
                    </div>
                    <span className="label-caps" style={{ opacity: 0.5, fontSize: '10px' }}>{c.phone}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '24px' }}>
              <div className="label-caps" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Globe size={14} /> GLOBAL EMERGENCY FREQUENCIES
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr 1fr', gap: '12px', alignItems: 'center' }}>
                <div className="label-caps" style={{ opacity: 0.5, fontSize: '9px' }}>SECTOR</div>
                <div className="label-caps" style={{ opacity: 0.5, fontSize: '9px' }}>POLICE</div>
                <div className="label-caps" style={{ opacity: 0.5, fontSize: '9px' }}>MED</div>
                <div className="label-caps" style={{ opacity: 0.5, fontSize: '9px' }}>WOMEN</div>
                {EMERGENCY_NUMBERS.map(r => (
                  <div style={{ display: 'contents' }} key={r.country}>
                    <div className="label-caps" style={{ color: '#fff' }}>{r.country}</div>
                    <span className="label-caps">{r.police}</span>
                    <span className="label-caps">{r.ambulance}</span>
                    <span className="label-caps" style={{ color: '#ff4a8d' }}>{r.women}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── SOS Confirmation Modal ──────────────────── */}
      {phase === 'confirm' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }} onClick={e => e.target === e.currentTarget && cancelSOS()}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', borderTop: '2px solid #ff4a8d', padding: '32px', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
              <ShieldAlert size={48} color="#ff4a8d" />
            </div>
            <div className="headline-sm" style={{ marginBottom: '16px', textTransform: 'uppercase' }}>SEND EMERGENCY DISTRESS?</div>
            <div className="label-caps" style={{ opacity: 0.7, marginBottom: '32px', lineHeight: 1.6, fontSize: '10px' }}>
              YOUR CURRENT COORDINATES ({GPS_COORDS}) AND A DISTRESS SIGNAL WILL BE BROADCAST TO <strong style={{ color: 'var(--s-primary)' }}>{CONTACTS.length} OPERATIVES</strong>.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <button
                className="btn btn-danger neon-glow"
                style={{ width: '100%', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                onClick={sendSOS}
              >
                <ShieldAlert size={16} /> <span className="label-caps">INITIATE BROADCAST</span>
              </button>
              <button
                className="btn btn-secondary"
                style={{ width: '100%', padding: '16px' }}
                onClick={cancelSOS}
              >
                <span className="label-caps">ABORT</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
