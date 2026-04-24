import { Radar, Users, ShieldCheck, CheckCircle2 } from 'lucide-react'

export default function Dashboard({ navigate, user }) {
  const upcomingBuddies = [
    { initials: 'AK', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD1qG6HTqUk9zTan8S-VxtZSogytgWyPcRgY5RswPQiRDCffAxj2OVcqBnoBDG7OOVFLY3NtUMBoAa9JKB4a4PTKggq5yv4u9Dyt_KetYe5BRg108Sq3YXVh5ELy9neuK4RaVLIXnPuYgqPLoU87tpUZ8EfV2ZJxUTkBCQlG2YjtLsKHUCZZDDLGW2Qhn6R73Kc-21lFqdD0yApQ6sHsBGHXPHF0axc0UTH-1JsnYjGZmkxRtryIfyatvhxqjoxVWsx1yg-cMoitdEE' },
    { initials: 'LH', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDh6zy5drWPZTXCYuPpRKuoLkgfeP37PkH-A2jUcq_7GiB3UzzGYUhG8hXUivMHeppb_8iEKvoI1_Zp2XuVIbePqWuA3XSkA-gzzK4bDPZ_1E9cOipvxWLrnDae8OvNJnU5xu-Hk4cWHI3sqWd0hBJX67ZBnVgFnQzhvXLo7_KkFqwfYJkVBTHdERZZsRcGVjUCR8EMAwoneR-NKYj35lvE6bAtJdOFABlHx1HY4yFEMQfJe76uE6JDZamMv4vvKXtueSlk4SW5zmHu' },
    { initials: 'NA', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB3U5GtjbdtSsWJL4CGDCVdTh8iAAk1EpVkVFlzW57RPZva5Ig3XrDDjnIiYuFWbA0bKRHbCYfiPNAc22D4yV5vKo89sh95xgIA-qDGK4_feSTaTI645KzrDMtqwCJKrJNz1l_-Mu8uOwphZtbNbMohkEFx5cFSS5lYaFJbCaJATnyO60lE80R_k2immQnblAzHwpUNfsnVg4VdzkvxrO9geaHHozOVwsAt_IVpzJjPpHkVko7PjyYlFo-8PC67A37G2WM0nfCa6KSE' },
  ]

  return (
    <div className="page">
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '64px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '24px' }}>
          <div>
            <div className="label-caps" style={{ marginBottom: '8px' }}>SYSTEM TERMINAL OP:{user.name.split(' ')[0]}</div>
            <h1 className="display-xl" style={{ textTransform: 'uppercase' }}>COMMAND CENTER</h1>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span className="chip chip-safe"><CheckCircle2 size={12} /> SECURE CONNECTION</span>
            <span className="chip"><ShieldCheck size={12} /> {user.city}</span>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="dashboard-grid">
          
          {/* Threat Level */}
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', minHeight: '320px', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '48px' }}>
              <h3 className="label-caps">LIVE THREAT LEVEL</h3>
              <Radar size={24} color="var(--s-primary)" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '16px' }}>
                <span className="metric-large">82%</span>
                <span className="label-caps" style={{ color: 'var(--s-primary)' }}>SAFE</span>
              </div>
              <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: '82%', background: 'var(--s-primary)', boxShadow: 'var(--glow-primary)' }}></div>
                <div style={{ position: 'absolute', top: 0, left: '82%', height: '100%', width: '8px', background: '#fff', filter: 'blur(2px)' }}></div>
              </div>
              <p className="label-caps" style={{ marginTop: '16px', opacity: 0.5 }}>LOCATION: {user.city.toUpperCase()}</p>
            </div>
          </div>

          {/* Active Buddy Network */}
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', minHeight: '320px', justifyContent: 'space-between' }} onClick={() => navigate('buddy')} role="button">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '48px' }}>
              <h3 className="label-caps">ACTIVE BUDDY NETWORK</h3>
              <Users size={24} color="rgba(255,255,255,0.5)" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                <div style={{ position: 'relative' }}>
                  <span className="metric-large">12</span>
                  <div style={{ position: 'absolute', top: '8px', right: '-12px', width: '8px', height: '8px', background: 'var(--s-primary)', borderRadius: '50%', boxShadow: 'var(--glow-primary)' }}></div>
                </div>
                <span className="label-caps" style={{ opacity: 0.7 }}>ONLINE</span>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                {upcomingBuddies.map((b, i) => (
                  <div key={i} style={{ width: '40px', height: '40px', border: '1px solid rgba(255,255,255,0.2)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={b.img} alt={b.initials} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(100%)', opacity: 0.8 }} />
                  </div>
                ))}
                <div style={{ width: '40px', height: '40px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="label-caps">+9</span>
                </div>
              </div>
            </div>
          </div>

          {/* Security Protocols */}
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
      </div>
    </div>
  )
}
