import { Map, Users, ShieldAlert, MessageCircle, MapPin, Calendar, CheckCircle2, ShieldCheck } from 'lucide-react'

export default function Dashboard({ navigate, addToast, user }) {
  const alerts = [
    { color: 'alert-dot-safe', text: 'Le Marais (Paris 4th) rated 8.7/10 for women\'s safety — ideal evening walks', time: '2 min ago' },
    { color: 'alert-dot-warning', text: 'Avoid Rue de Rivoli metro after 11pm — multiple reports of harassment this week', time: '14 min ago' },
    { color: 'alert-dot-safe', text: 'SheStay "Hôtel du Temple" confirmed as women-safe pick nearby', time: '1 hr ago' },
    { color: 'alert-dot-warning', text: 'Eiffel Tower crowds high today — keep belongings secure', time: '2 hr ago' },
  ]

  const upcomingBuddies = [
    { name: 'Amara K.', city: 'Paris', dates: 'Apr 24–28', initials: 'AK', color: '#7C3AED' },
    { name: 'Lisa H.', city: 'Paris', dates: 'Apr 25–30', initials: 'LH', color: '#EC4899' },
    { name: 'Nour A.', city: 'Paris', dates: 'Apr 23–26', initials: 'NA', color: '#10B981' },
  ]

  return (
    <div className="page-wrapper">
      <div className="container" style={{ padding: '40px 24px' }}>

        {/* Header */}
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
              Good Evening,
            </div>
            <h1 className="page-title">Welcome back, <span className="gradient-text">{user.name.split(' ')[0]}</span></h1>
            <p className="page-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} /> {user.city} · {user.tripDates}</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <span className="badge badge-purple" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><ShieldCheck size={14} /> Verified Traveler</span>
            <span className="badge badge-safe" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle2 size={14} /> All Good</span>
          </div>
        </div>

        <div className="dashboard-grid" style={{ marginTop: '32px' }}>

          {/* Left Column */}
          <div>
            {/* Trip Card */}
            <div className="trip-card" style={{ marginBottom: '20px' }}>
              <div className="trip-card-glow"></div>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                      CURRENT TRIP
                    </div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>{user.city} <MapPin size={24} color="var(--s-primary)" /></h2>
                    <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={14} /> {user.tripDates} · Day 1 of 13
                    </div>
                  </div>
                  <span className="badge badge-safe">SAFE ZONE</span>
                </div>

                <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
                  <div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--color-safe-light)' }}>8.4</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>City Safety Score</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--color-primary-light)' }}>3</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Potential Buddies</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--color-secondary-light)' }}>4</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Emergency Contacts</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '10px', padding: '12px 16px', fontSize: '0.85rem', color: 'var(--color-safe-light)' }}>
                  <ShieldCheck size={16} /> SOS contacts active · Location sharing: ON · Guardian mode: ARMED
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px', color: 'var(--color-text-secondary)' }}>QUICK ACTIONS</h3>
              <div className="quick-actions">
                <button className="quick-action-btn" onClick={() => navigate('map')} id="dash-map-btn">
                  <div className="action-icon action-map">
                    <Map size={20} color="var(--color-primary-light)" />
                  </div>
                  Safety Map
                </button>
                <button className="quick-action-btn" onClick={() => navigate('buddy')} id="dash-buddy-btn">
                  <div className="action-icon action-buddy">
                    <Users size={20} color="var(--color-secondary-light)" />
                  </div>
                  Find Buddy
                </button>
                <button className="quick-action-btn" onClick={() => navigate('sos')} id="dash-sos-btn" style={{ borderColor: 'rgba(239,68,68,0.3)' }}>
                  <div className="action-icon action-sos">
                    <ShieldAlert size={20} color="var(--color-sos-light)" />
                  </div>
                  SOS Alert
                </button>
                <button className="quick-action-btn" onClick={() => navigate('community')} id="dash-forum-btn">
                  <div className="action-icon action-forum">
                    <MessageCircle size={20} color="#60a5fa" />
                  </div>
                  Forum
                </button>
              </div>
            </div>

            {/* Nearby Buddies */}
            <div className="alerts-card">
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={16} /> WOMEN NEARBY — Same Trip
              </div>
              {upcomingBuddies.map(b => (
                <div key={b.name} className="alert-item" style={{ alignItems: 'center' }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: `linear-gradient(135deg, ${b.color}, ${b.color}88)`, color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.8rem', fontWeight: 'bold', flexShrink: 0,
                  }}>
                    {b.initials}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{b.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={12} /> {b.dates}</div>
                  </div>
                  <button
                    className="btn btn-primary"
                    style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                    onClick={() => {
                      addToast(`Chat request sent to ${b.name}!`, 'success')
                    }}
                  >
                    Connect
                  </button>
                </div>
              ))}
              <button
                className="btn btn-secondary"
                style={{ width: '100%', marginTop: '12px' }}
                onClick={() => navigate('buddy')}
              >
                View All Buddies →
              </button>
            </div>
          </div>

          {/* Right Column */}
          <div>
            {/* Safety Score */}
            <div className="safety-score-card" style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                AREA SAFETY SCORE
              </div>
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{
                  position: 'relative',
                  width: 100, height: 100, margin: '0 auto 12px',
                  borderRadius: '50%',
                  background: 'conic-gradient(#10B981 0% 84%, #F59E0B 84% 95%, #1a0e36 95% 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <div style={{
                    position: 'absolute',
                    width: 72, height: 72, background: 'var(--color-bg)',
                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--color-safe-light)' }}>8.4</div>
                  </div>
                </div>
                <span className="badge badge-safe">VERY SAFE</span>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '10px' }}>Le Marais, Paris · Updated 5min ago</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { label: 'Women Safety', score: 9.1, color: '#10B981' },
                  { label: 'Night Safety', score: 7.8, color: '#F59E0B' },
                  { label: 'Transit Safety', score: 8.5, color: '#10B981' },
                ].map(s => (
                  <div key={s.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--color-text-secondary)' }}>{s.label}</span>
                      <span style={{ fontWeight: 600, color: s.color }}>{s.score}</span>
                    </div>
                    <div style={{ height: 4, background: 'var(--color-border)', borderRadius: 4 }}>
                      <div style={{ width: `${s.score * 10}%`, height: '100%', background: s.color, borderRadius: 4 }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Alerts */}
            <div className="alerts-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  LIVE ALERTS
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="pulse-dot"></span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-safe-light)' }}>Live</span>
                </div>
              </div>
              {alerts.map((a, i) => (
                <div key={i} className="alert-item">
                  <div className={`alert-dot ${a.color}`}></div>
                  <div>
                    <div className="alert-text">{a.text}</div>
                    <div className="alert-time">{a.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
