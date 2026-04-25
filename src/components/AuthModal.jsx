import { useState } from 'react'
import { X, Eye, EyeOff, ShieldCheck } from 'lucide-react'

export default function AuthModal({ mode: initialMode = 'signin', onClose, onAuth, addToast }) {
  const [mode, setMode] = useState(initialMode) // signin | signup
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [city, setCity] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) return addToast('ALL FIELDS REQUIRED.', 'error')
    if (mode === 'signup' && !name) return addToast('NAME IS REQUIRED.', 'error')

    setLoading(true)
    try {
      if (mode === 'signup') {
        const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
        await onAuth('signup', email, password, { name, initials, city: city || 'India' })
        addToast('ACCOUNT CREATED. CHECK EMAIL FOR VERIFICATION.', 'success')
      } else {
        await onAuth('signin', email, password)
        addToast('SECURE ACCESS GRANTED.', 'success')
      }
      onClose()
    } catch (err) {
      addToast((err.message || 'Authentication failed').toUpperCase(), 'error')
    }
    setLoading(false)
  }

  const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff',
    fontFamily: 'Space Grotesk',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    fontSize: '0.8rem'
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '0', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '24px 24px 0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="label-caps" style={{ color: 'var(--s-primary)', marginBottom: '4px' }}>
              {mode === 'signin' ? 'SECURE ACCESS' : 'NEW OPERATIVE'}
            </div>
            <h3 className="headline-sm" style={{ textTransform: 'uppercase' }}>
              {mode === 'signin' ? 'SIGN IN' : 'CREATE ACCOUNT'}
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', opacity: 0.5 }}>
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {mode === 'signup' && (
            <>
              <div>
                <label className="label-caps" style={{ display: 'block', marginBottom: '8px', opacity: 0.5 }}>FULL NAME</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="YOUR NAME"
                  style={inputStyle}
                  required
                />
              </div>
              <div>
                <label className="label-caps" style={{ display: 'block', marginBottom: '8px', opacity: 0.5 }}>CITY / BASE</label>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="E.G. PARIS, TOKYO, GLOBAL"
                  style={inputStyle}
                />
              </div>
            </>
          )}

          <div>
            <label className="label-caps" style={{ display: 'block', marginBottom: '8px', opacity: 0.5 }}>EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="OPERATIVE@EMAIL.COM"
              style={inputStyle}
              required
            />
          </div>

          <div>
            <label className="label-caps" style={{ display: 'block', marginBottom: '8px', opacity: 0.5 }}>PASSWORD</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="MIN 6 CHARACTERS"
                style={{ ...inputStyle, paddingRight: '48px' }}
                minLength={6}
                required
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)' }}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            className="btn btn-primary neon-glow"
            type="submit"
            disabled={loading}
            style={{ width: '100%', marginTop: '8px', padding: '16px' }}
          >
            {loading
              ? 'AUTHENTICATING...'
              : mode === 'signin'
                ? 'AUTHENTICATE'
                : 'CREATE ACCOUNT'}
          </button>
        </form>

        {/* Toggle mode */}
        <div style={{ padding: '0 24px 24px 24px', textAlign: 'center' }}>
          <button
            onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--s-primary)', fontFamily: 'Space Grotesk', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}
          >
            {mode === 'signin' ? 'NO ACCOUNT? CREATE ONE' : 'ALREADY REGISTERED? SIGN IN'}
          </button>
        </div>

        {/* Trust badge */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <ShieldCheck size={12} color="var(--s-primary)" />
          <span className="label-caps" style={{ opacity: 0.3, fontSize: '9px' }}>END-TO-END ENCRYPTED · ZERO DATA RETENTION</span>
        </div>
      </div>
    </div>
  )
}
