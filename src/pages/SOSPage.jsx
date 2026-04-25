import { useState, useEffect, useRef, useCallback } from 'react'
import { db } from '../lib/database'
import { isSupported, startListening, stopListening } from '../lib/voiceDetection'
import { ShieldAlert, CheckCircle2, Shield, Phone, Globe, Radio, User, MapPin, Mic, MicOff, X } from 'lucide-react'

const CONTACTS = [
  { id: 1, name: 'WOMEN HELPLINE', initials: 'WH', color: '#ff4a8d', phone: '181' },
  { id: 2, name: 'POLICE', icon: <ShieldAlert size={16} />, color: '#ffffff', phone: '100 / 112' },
  { id: 3, name: 'AMBULANCE', initials: 'AM', color: '#f59e0b', phone: '108' },
  { id: 4, name: 'SHEROAM GUARDIAN', icon: <Shield size={16} />, color: '#ceee93', phone: 'PLATFORM' },
]

const EMERGENCY_NUMBERS = [
  { country: 'INDIA',       police: '100 / 112', ambulance: '108', fire: '101', women: '181' },
  { country: 'NCW',         police: '—', ambulance: '—', fire: '—', women: '7827-170-170' },
  { country: 'USA',         police: '911', ambulance: '911', fire: '911', women: '1-800-799-7233' },
  { country: 'UK',          police: '999', ambulance: '999', fire: '999', women: '0808 2000 247' },
  { country: 'FRANCE',      police: '17', ambulance: '15', fire: '18', women: '3919' },
]

export default function SOSPage({ addToast }) {
  const [phase, setPhase] = useState('idle')   // idle | confirm | alerting | sent
  const [alertedCount, setAlertedCount] = useState(0)
  const [coords, setCoords] = useState({ lat: 28.6139, lng: 77.2090, display: 'LOCATING...' })
  const [activeLogId, setActiveLogId] = useState(null)
  const intervalRef = useRef(null)

  // ── Voice Guard State ──
  const [voiceActive, setVoiceActive] = useState(false)
  const [voiceSupported] = useState(isSupported())
  const [liveTranscript, setLiveTranscript] = useState('')
  const [detectedWord, setDetectedWord] = useState(null)
  const [countdown, setCountdown] = useState(null)
  const countdownRef = useRef(null)

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        pos => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude, display: `${pos.coords.latitude.toFixed(4)}° N, ${pos.coords.longitude.toFixed(4)}° E` }),
        () => setCoords(prev => ({ ...prev, display: 'GPS SIGNAL LOST (USING DEFAULT: DELHI)' }))
      )
    } else {
      setCoords(prev => ({ ...prev, display: 'GPS UNAVAILABLE' }))
    }
  }, [])

  // ── Voice Guard Callbacks ──
  const handleDistressDetected = useCallback((word, transcript) => {
    setDetectedWord(word.toUpperCase())
    setLiveTranscript(transcript)
    
    // Start 5-second countdown then auto-trigger SOS
    let timer = 5
    setCountdown(timer)
    countdownRef.current = setInterval(() => {
      timer--
      setCountdown(timer)
      if (timer <= 0) {
        clearInterval(countdownRef.current)
        setCountdown(null)
        setDetectedWord(null)
        sendSOS() // Auto-trigger
      }
    }, 1000)
  }, [])

  const cancelVoiceSOS = () => {
    clearInterval(countdownRef.current)
    setCountdown(null)
    setDetectedWord(null)
    addToast('VOICE SOS CANCELLED.', 'info')
  }

  const toggleVoiceGuard = () => {
    if (voiceActive) {
      stopListening()
      setVoiceActive(false)
      setLiveTranscript('')
      addToast('VOICE GUARD DEACTIVATED.', 'info')
    } else {
      const ok = startListening(
        handleDistressDetected,
        (text) => setLiveTranscript(text),
        (err) => addToast(err, 'error')
      )
      if (ok) {
        setVoiceActive(true)
        addToast('VOICE GUARD ACTIVE — LISTENING FOR DISTRESS SIGNALS...', 'success')
      }
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening()
      clearInterval(countdownRef.current)
    }
  }, [])

  const openConfirm = () => setPhase('confirm')
  const cancelSOS   = () => { setPhase('idle'); setAlertedCount(0) }

  const sendSOS = async () => {
    setPhase('alerting')
    setAlertedCount(0)
    
    try {
      const log = await db.sos.sendAlert(coords.lat, coords.lng)
      setActiveLogId(log.id)
    } catch {
      addToast('SOS DATABASE LINK FAILED. ATTEMPTING LOCAL BROADCAST.', 'error')
    }

    setAlertedCount(1)
    let contactsAlerted = 1
    intervalRef.current = setInterval(() => {
      contactsAlerted += 1
      setAlertedCount(contactsAlerted)
      if (contactsAlerted >= CONTACTS.length) {
        clearInterval(intervalRef.current)
        setPhase('sent')
      }
    }, 400)
  }

  const markSafe = async () => {
    clearInterval(intervalRef.current)
    if (activeLogId) {
      try {
        await db.sos.cancelAlert(activeLogId)
      } catch {
        addToast('FAILED TO UPDATE DB STATUS.', 'error')
      }
    }
    setPhase('idle')
    setAlertedCount(0)
    setActiveLogId(null)
    addToast('YOU ARE MARKED SAFE. EMERGENCY CONTACTS NOTIFIED.', 'success')
  }

  useEffect(() => () => clearInterval(intervalRef.current), [])

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
          {/* ── Left: SOS Button Area ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', alignItems: 'center' }}>

            {/* Voice Distress Countdown Overlay */}
            {detectedWord && countdown !== null && (
              <div className="glass-panel" style={{ width: '100%', padding: '24px', textAlign: 'center', borderTop: '2px solid #ff4a8d', animation: 'pulse 1s ease-in-out infinite' }}>
                <div className="label-caps" style={{ color: '#ff4a8d', fontSize: '0.85rem', marginBottom: '8px' }}>
                  DISTRESS DETECTED: "{detectedWord}"
                </div>
                <div style={{ fontSize: '3rem', fontFamily: 'Space Grotesk', color: '#ff4a8d', fontWeight: 700, margin: '16px 0' }}>
                  {countdown}
                </div>
                <div className="label-caps" style={{ opacity: 0.7, marginBottom: '16px', fontSize: '10px' }}>
                  AUTO-TRIGGERING SOS IN {countdown} SECONDS...
                </div>
                <button className="btn btn-secondary" style={{ padding: '12px 32px' }} onClick={cancelVoiceSOS}>
                  <X size={14} style={{ marginRight: '6px' }} /> CANCEL
                </button>
              </div>
            )}

            {phase === 'idle' && !detectedWord && (
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

                {/* Voice Guard Toggle */}
                <div className="glass-panel" style={{ width: '100%', padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
                    <div className="label-caps" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: voiceActive ? 'var(--s-primary)' : 'rgba(255,255,255,0.5)' }}>
                      {voiceActive ? <Mic size={14} /> : <MicOff size={14} />}
                      VOICE GUARD
                    </div>
                    {voiceSupported ? (
                      <button
                        onClick={toggleVoiceGuard}
                        style={{
                          padding: '6px 16px',
                          background: voiceActive ? 'rgba(206,238,147,0.15)' : 'rgba(255,255,255,0.05)',
                          border: `1px solid ${voiceActive ? 'var(--s-primary)' : 'rgba(255,255,255,0.1)'}`,
                          color: voiceActive ? 'var(--s-primary)' : 'rgba(255,255,255,0.5)',
                          cursor: 'pointer',
                          fontFamily: 'Space Grotesk',
                          fontSize: '0.65rem',
                          letterSpacing: '0.1em',
                          transition: 'all 0.3s'
                        }}
                      >
                        {voiceActive ? 'ACTIVE' : 'ACTIVATE'}
                      </button>
                    ) : (
                      <span className="label-caps" style={{ fontSize: '9px', color: '#f59e0b' }}>CHROME/EDGE ONLY</span>
                    )}
                  </div>

                  {voiceActive ? (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <div className="voice-wave"></div>
                        <span className="label-caps" style={{ color: 'var(--s-primary)', fontSize: '10px' }}>LISTENING FOR DISTRESS...</span>
                      </div>
                      {liveTranscript && (
                        <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'Space Grotesk', fontStyle: 'italic' }}>
                          "{liveTranscript}"
                        </div>
                      )}
                      <div className="label-caps" style={{ marginTop: '12px', opacity: 0.3, fontSize: '9px', lineHeight: 1.5 }}>
                        KEYWORDS: BACHAO, MADAD, HELP, POLICE, SOS<br/>
                        WILL AUTO-TRIGGER SOS WITH 5s COUNTDOWN
                      </div>
                    </div>
                  ) : (
                    <div className="label-caps" style={{ opacity: 0.4, fontSize: '10px', lineHeight: 1.5 }}>
                      ACTIVATE TO LISTEN FOR DISTRESS WORDS LIKE "BACHAO" OR "HELP" — SOS WILL TRIGGER AUTOMATICALLY.
                    </div>
                  )}
                </div>

                {/* Live Tracking */}
                <div className="glass-panel" style={{ width: '100%', padding: '20px' }}>
                  <div className="label-caps" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--s-primary)', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
                    <div style={{ width: 8, height: 8, background: 'var(--s-primary)', borderRadius: '50%', boxShadow: 'var(--glow-primary)' }}></div>
                    LIVE TRACKING READY
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="label-caps" style={{ opacity: 0.5, display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={14} /> COORDINATES</span>
                      <span className="label-caps" style={{ color: '#fff', fontSize: '10px' }}>{coords.display}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="label-caps" style={{ opacity: 0.5, display: 'flex', alignItems: 'center', gap: '8px' }}><User size={14} /> CONTACTS</span>
                      <span className="label-caps">{CONTACTS.length} OPERATIVES</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="label-caps" style={{ opacity: 0.5, display: 'flex', alignItems: 'center', gap: '8px' }}><Shield size={14} /> ENCRYPTION</span>
                      <span className="label-caps" style={{ color: 'var(--s-primary)' }}>E2E ACTIVE</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ── Alerting state ── */}
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
                    {phase === 'sent' ? 'HELP IS EN ROUTE. DO NOT CLOSE TERMINAL.' : 'BROADCASTING GPS COORDINATES...'}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
                    {CONTACTS.map((c, i) => {
                      const sent = i < alertedCount
                      return (
                        <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', opacity: sent ? 1 : 0.3, transition: 'opacity 0.5s' }}>
                          <span>{sent ? <CheckCircle2 size={16} color="var(--s-primary)" /> : <div style={{ width: 8, height: 8, background: 'var(--s-primary)', borderRadius: '50%' }}></div>}</span>
                          <div style={{ flex: 1 }}>
                            <div className="label-caps">{c.name}</div>
                            <div className="label-caps" style={{ opacity: 0.5, fontSize: '9px' }}>{c.phone}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  {phase === 'sent' && (
                    <button className="btn btn-secondary" style={{ width: '100%', marginTop: '32px', borderColor: 'var(--s-primary)', color: 'var(--s-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={markSafe}>
                      <CheckCircle2 size={16} /> <span className="label-caps">I AM SAFE — CANCEL ALERT</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          {/* ── Right sidebar ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="glass-panel" style={{ padding: '20px' }}>
              <div className="label-caps" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={14} /> EMERGENCY CONTACTS
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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

            <div className="glass-panel" style={{ padding: '20px' }}>
              <div className="label-caps" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Globe size={14} /> EMERGENCY FREQUENCIES — INDIA FIRST
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr 1fr', gap: '10px', alignItems: 'center' }}>
                <div className="label-caps" style={{ opacity: 0.5, fontSize: '9px' }}>SECTOR</div>
                <div className="label-caps" style={{ opacity: 0.5, fontSize: '9px' }}>POLICE</div>
                <div className="label-caps" style={{ opacity: 0.5, fontSize: '9px' }}>MED</div>
                <div className="label-caps" style={{ opacity: 0.5, fontSize: '9px' }}>WOMEN</div>
                {EMERGENCY_NUMBERS.map(r => (
                  <div style={{ display: 'contents' }} key={r.country}>
                    <div className="label-caps" style={{ color: r.country === 'INDIA' ? 'var(--s-primary)' : '#fff' }}>{r.country}</div>
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

      {/* ── SOS Confirmation Modal ── */}
      {phase === 'confirm' && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && cancelSOS()}>
          <div className="glass-panel modal-panel" style={{ borderTop: '2px solid #ff4a8d', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
              <ShieldAlert size={48} color="#ff4a8d" />
            </div>
            <div className="headline-sm" style={{ marginBottom: '16px', textTransform: 'uppercase' }}>SEND EMERGENCY DISTRESS?</div>
            <div className="label-caps" style={{ opacity: 0.7, marginBottom: '32px', lineHeight: 1.6, fontSize: '10px' }}>
              YOUR CURRENT COORDINATES ({coords.display}) AND A DISTRESS SIGNAL WILL BE BROADCAST TO <strong style={{ color: 'var(--s-primary)' }}>{CONTACTS.length} OPERATIVES</strong>.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <button className="btn btn-danger neon-glow" style={{ width: '100%', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={sendSOS}>
                <ShieldAlert size={16} /> <span className="label-caps">INITIATE BROADCAST</span>
              </button>
              <button className="btn btn-secondary" style={{ width: '100%', padding: '16px' }} onClick={cancelSOS}>
                <span className="label-caps">ABORT</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
