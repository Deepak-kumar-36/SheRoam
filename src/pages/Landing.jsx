import { ShieldAlert, Compass, Target, Globe } from 'lucide-react'

export default function Landing({ navigate, onLogin }) {
  const stats = [
    { value: '300K+', label: 'Protected Entities' },
    { value: '180+', label: 'Operational Zones' },
    { value: '65K', label: 'Nodes Monitored' },
    { value: '99.9%', label: 'System Integrity' },
  ]

  return (
    <div className="page" style={{ paddingTop: 0 }}>
      {/* HERO */}
      <section className="hero">
        <div className="container">
          <div className="flex-center" style={{ flexDirection: 'column', gap: '32px' }}>
            <div className="chip chip-primary" style={{ marginBottom: '16px' }}>
              <span className="pulse-dot pulse-dot-primary"></span>
              <span>GLOBAL PROTECTION ACTIVE</span>
            </div>

            <h1 className="hero-title">
              TRAVEL SOLO.<br />
              <span className="text-primary" style={{ color: 'var(--s-primary)' }}>STAY SAFE.</span>
            </h1>

            <p className="hero-subtitle">
              Advanced threat detection, verified peer networks, and real-time emergency mitigation protocols. Designed specifically for female travelers.
            </p>

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '64px' }}>
              <button className="btn btn-primary btn-large neon-glow" onClick={onLogin} id="hero-join-btn">
                INITIALIZE PROTECTION
              </button>
              <button className="btn btn-secondary" onClick={() => navigate('map')} id="hero-map-btn">
                VIEW GLOBAL THREAT MAP
              </button>
            </div>

            <div className="grid-4" style={{ maxWidth: '800px', margin: '0 auto' }}>
              {stats.map(s => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-headline)', fontSize: '2rem', fontWeight: 500, color: 'var(--s-on-surface)' }}>{s.value}</div>
                  <div className="label-caps">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PROTOCOL OVERVIEW */}
      <section style={{ padding: '80px 0', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div className="label-caps">SYSTEM ARCHITECTURE</div>
            <h2 className="headline-lg" style={{ marginTop: '8px' }}>CORE PROTOCOLS</h2>
          </div>

          <div className="grid-4">
            <div className="glass-panel">
              <Compass size={24} color="var(--s-primary)" style={{ marginBottom: '24px' }} />
              <h3 style={{ fontSize: '1rem', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Intelligence Map</h3>
              <p style={{ fontSize: '0.875rem' }}>Real-time neighborhood risk analytics and crowd-sourced danger zones.</p>
            </div>
            
            <div className="glass-panel">
              <Target size={24} color="var(--s-primary)" style={{ marginBottom: '24px' }} />
              <h3 style={{ fontSize: '1rem', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Vetted Network</h3>
              <p style={{ fontSize: '0.875rem' }}>Cryptographically verified peer matching for secure co-travel.</p>
            </div>

            <div className="glass-panel" style={{ borderColor: 'rgba(255,180,171,0.3)' }}>
              <ShieldAlert size={24} color="var(--s-tertiary)" style={{ marginBottom: '24px' }} />
              <h3 style={{ fontSize: '1rem', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--s-tertiary)' }}>SOS Dispatch</h3>
              <p style={{ fontSize: '0.875rem' }}>Instant emergency broadcast with biometrics and live geolocation.</p>
            </div>

            <div className="glass-panel">
              <Globe size={24} color="var(--s-primary)" style={{ marginBottom: '24px' }} />
              <h3 style={{ fontSize: '1rem', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Data Encrypted</h3>
              <p style={{ fontSize: '0.875rem' }}>End-to-end encryption. Your location data remains strictly confidential.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: '32px 0' }}>
        <div className="container flex-center" style={{ justifyContent: 'space-between' }}>
          <div className="label-caps" style={{ color: 'var(--s-on-surface)' }}>SHEROAM // EST. 2026</div>
          <div className="label-caps">END-TO-END SECURE</div>
        </div>
      </footer>
    </div>
  )
}
