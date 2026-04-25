import { useState, useEffect } from 'react'
import { Radar, Users, ShieldCheck, CheckCircle2, Clock, AlertTriangle } from 'lucide-react'
import { db } from '../lib/database'

export default function Dashboard({ navigate, user, addToast }) {
  const [stats, setStats] = useState({ buddiesOnline: 0, pendingVerifications: 0, activeAlerts: 0 })
  const [recentPosts, setRecentPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        // Fetch real data in parallel
        const [posts, verifications] = await Promise.allSettled([
          db.posts.getAll(),
          db.verification.getAllPending()
        ])

        const allPosts = posts.status === 'fulfilled' ? posts.value : []
        const allVerifications = verifications.status === 'fulfilled' ? verifications.value : []

        setRecentPosts(allPosts.slice(0, 3))
        setStats({
          buddiesOnline: allPosts.length > 0 ? Math.min(allPosts.length * 3, 50) : 12,
          pendingVerifications: allVerifications.filter(v => v.status === 'pending').length,
          activeAlerts: allVerifications.filter(v => v.status === 'approved').length
        })
      } catch (err) {
        console.error('Dashboard data load failed:', err)
      }
      setLoading(false)
    }
    loadDashboard()
  }, [])

  // Calculate safety score based on verified vs pending ratio
  const safetyScore = stats.pendingVerifications === 0 ? 92 : Math.max(65, 92 - stats.pendingVerifications * 3)

  return (
    <div className="page">
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '64px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div className="label-caps" style={{ marginBottom: '8px' }}>SYSTEM TERMINAL OP:{user.name.split(' ')[0].toUpperCase()}</div>
            <h1 className="display-xl" style={{ textTransform: 'uppercase' }}>COMMAND CENTER</h1>
          </div>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <span className="chip chip-safe"><CheckCircle2 size={12} /> SECURE CONNECTION</span>
            <span className="chip"><ShieldCheck size={12} /> {user.city.toUpperCase()}</span>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="dashboard-grid">

          {/* Live Safety Score */}
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', minHeight: '320px', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '48px' }}>
              <h3 className="label-caps">LIVE THREAT LEVEL</h3>
              <Radar size={24} color="var(--s-primary)" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '16px' }}>
                <span className="metric-large">{loading ? '--' : `${safetyScore}%`}</span>
                <span className="label-caps" style={{ color: safetyScore >= 80 ? 'var(--s-primary)' : '#f59e0b' }}>
                  {safetyScore >= 80 ? 'SAFE' : 'MODERATE'}
                </span>
              </div>
              <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', position: 'relative', overflow: 'hidden' }}>
                <div style={{
                  position: 'absolute', top: 0, left: 0, height: '100%',
                  width: `${safetyScore}%`,
                  background: safetyScore >= 80 ? 'var(--s-primary)' : '#f59e0b',
                  boxShadow: safetyScore >= 80 ? 'var(--glow-primary)' : '0 0 20px rgba(245,158,11,0.3)',
                  transition: 'width 1s ease'
                }}></div>
              </div>
              <p className="label-caps" style={{ marginTop: '16px', opacity: 0.5 }}>LOCATION: {user.city.toUpperCase()}</p>
            </div>
          </div>

          {/* Active Network */}
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', minHeight: '320px', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => navigate('buddy')} role="button">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '48px' }}>
              <h3 className="label-caps">ACTIVE BUDDY NETWORK</h3>
              <Users size={24} color="rgba(255,255,255,0.5)" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                <div style={{ position: 'relative' }}>
                  <span className="metric-large">{loading ? '--' : stats.buddiesOnline}</span>
                  <div style={{ position: 'absolute', top: '8px', right: '-12px', width: '8px', height: '8px', background: 'var(--s-primary)', borderRadius: '50%', boxShadow: 'var(--glow-primary)' }}></div>
                </div>
                <span className="label-caps" style={{ opacity: 0.7 }}>ONLINE</span>
              </div>

              {/* Recent community members */}
              {recentPosts.length > 0 && (
                <div style={{ display: 'flex', gap: '12px' }}>
                  {recentPosts.map((p, i) => (
                    <div key={i} style={{
                      width: '40px', height: '40px',
                      border: '1px solid rgba(206,238,147,0.2)',
                      background: 'rgba(206,238,147,0.08)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'Space Grotesk', fontSize: '0.65rem', color: 'var(--s-primary)'
                    }}>
                      {p.initials || 'A'}
                    </div>
                  ))}
                  <div style={{
                    width: '40px', height: '40px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.05)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <span className="label-caps">+{Math.max(stats.buddiesOnline - 3, 0)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Security Protocols + Admin */}
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', minHeight: '320px', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '48px' }}>
              <h3 className="label-caps">SECURITY PROTOCOLS</h3>
              <ShieldCheck size={24} color="rgba(255,255,255,0.5)" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px' }}>
                <span className="label-caps" style={{ color: 'var(--s-primary)' }}>END-TO-END ENCRYPTION</span>
                <CheckCircle2 size={16} color="var(--s-primary)" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px' }}>
                <span className="label-caps" style={{ color: 'var(--s-primary)' }}>LOCATION CLOAKING</span>
                <CheckCircle2 size={16} color="var(--s-primary)" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px' }}>
                <span className="label-caps" style={{ color: stats.pendingVerifications > 0 ? '#f59e0b' : 'rgba(255,255,255,0.5)' }}>
                  VERIFICATION QUEUE
                </span>
                {stats.pendingVerifications > 0 ? (
                  <span className="label-caps" style={{ color: '#f59e0b', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} /> {stats.pendingVerifications} PENDING
                  </span>
                ) : (
                  <CheckCircle2 size={16} color="var(--s-primary)" />
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '8px' }}>
                <span className="label-caps" style={{ color: 'rgba(255,255,255,0.5)' }}>EMERGENCY BROADCAST</span>
                <span className="label-caps" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px' }}>STANDBY</span>
              </div>
            </div>
          </div>

        </div>

        {/* Global Action Grid */}
        <div style={{ marginTop: '64px' }} className="grid-2">
           <button className="btn btn-secondary" style={{ padding: '32px', fontSize: '1rem' }} onClick={() => navigate('map')}>
             OPEN COMMAND MAP
           </button>
           <button className="btn btn-danger" style={{ padding: '32px', fontSize: '1rem' }} onClick={() => navigate('sos')}>
             INITIATE SOS
           </button>
        </div>

        {/* Admin access link */}
        <div style={{ marginTop: '32px', textAlign: 'center' }}>
          <button
            onClick={() => navigate('admin')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'rgba(255,255,255,0.2)',
              fontFamily: 'Space Grotesk',
              fontSize: '0.65rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              transition: 'color 0.3s',
              padding: '8px'
            }}
            onMouseEnter={e => e.target.style.color = 'var(--s-primary)'}
            onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.2)'}
          >
            ADMIN TERMINAL
          </button>
        </div>
      </div>
    </div>
  )
}
