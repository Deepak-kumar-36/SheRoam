import { Map, Users, ShieldAlert, MessageCircle, MapPin, Building, Compass, Search, Globe, Lock, ShieldCheck, CheckCircle2, Sparkles } from 'lucide-react'

// Using a custom Ethereal flower/sparkle icon since the design had a lot of 🌸
const BrandIcon = ({ size = 24, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={{ display: 'inline-block', verticalAlign: 'middle' }}
  >
    <path d="M12 2v20M17 5l-10 14M7 5l10 14" />
    <circle cx="12" cy="12" r="8" />
  </svg>
)

export default function Landing({ navigate, onLogin }) {
  const features = [
    {
      icon: <Map size={32} strokeWidth={1.5} />,
      iconClass: 'feature-icon-map',
      title: 'AI Safety Maps',
      desc: 'Real-time neighborhood safety scores, crime heatmaps, and women-specific risk ratings for 65,000+ cities worldwide.',
    },
    {
      icon: <Users size={32} strokeWidth={1.5} />,
      iconClass: 'feature-icon-buddy',
      title: 'Buddy Finder',
      desc: 'Connect with verified solo women travelers matching your dates and destination. Vetted profiles, peer reviews.',
    },
    {
      icon: <ShieldAlert size={32} strokeWidth={1.5} />,
      iconClass: 'feature-icon-sos',
      title: 'One-Tap SOS',
      desc: 'Instant GPS-tagged alerts to your emergency contacts, local authorities, and SheRoam guardians. Never alone.',
    },
    {
      icon: <MessageCircle size={32} strokeWidth={1.5} />,
      iconClass: 'feature-icon-community',
      title: 'SheRoam Community',
      desc: 'A trusted forum with 300,000+ women sharing safety tips, accommodation reviews, and local guidance.',
    },
  ]

  const testimonials = [
    {
      text: "SheRoam's safety map completely changed how I planned my solo trip to Vietnam. I felt so informed and empowered.",
      author: 'Anika R.',
      from: 'Solo Traveler, 29 \u2022 Berlin',
      color: '#7C3AED',
      initials: 'AR',
      stars: 5,
    },
    {
      text: "I found my travel buddy for Morocco through SheRoam. We are now best friends. The verification process made me trust her immediately.",
      author: 'Sofia M.',
      from: 'Digital Nomad, 33 \u2022 São Paulo',
      color: '#EC4899',
      initials: 'SM',
      stars: 5,
    },
    {
      text: "The SOS feature gave me such peace of mind hiking alone. My contacts got my location in under 3 seconds.",
      author: 'Yuki T.',
      from: 'Adventure Traveler, 27 \u2022 Tokyo',
      color: '#10B981',
      initials: 'YT',
      stars: 5,
    },
  ]

  const stats = [
    { value: '300K+', label: 'Women Protected' },
    { value: '180+', label: 'Countries' },
    { value: '65K', label: 'Cities Scored' },
    { value: '99.9%', label: 'Uptime SLA' },
  ]

  return (
    <div>
      {/* HERO */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-glow-1"></div>
        <div className="hero-glow-2"></div>
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="pulse-dot"></span>
              <span>300,000+ women traveling safely worldwide</span>
            </div>

            <h1 className="hero-title">
              Travel Free.<br />
              <span className="gradient-text">Stay Safe. Always.</span>
            </h1>

            <p className="hero-subtitle">
              The world's first women-first travel safety platform — combining real-time AI safety maps,
              a verified buddy network, and instant SOS response. Because every woman deserves to explore fearlessly.
            </p>

            <div className="hero-cta">
              <button className="btn btn-primary" style={{ padding: '14px 32px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={onLogin} id="hero-join-btn">
                <Sparkles size={18} /> Join SheRoam Free
              </button>
              <button className="btn btn-secondary" style={{ padding: '14px 28px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => navigate('map')} id="hero-map-btn">
                <Map size={18} /> View Safety Map
              </button>
            </div>

            <div className="hero-stats">
              {stats.map(s => (
                <div key={s.label} className="stat-item">
                  <span className="stat-value">{s.value}</span>
                  <span className="stat-label">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SAFETY ALERT BAR */}
      <div style={{
        background: 'rgba(16,185,129,0.08)',
        borderTop: '1px solid rgba(16,185,129,0.2)',
        borderBottom: '1px solid rgba(16,185,129,0.2)',
        padding: '14px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '32px',
        flexWrap: 'wrap',
        fontSize: '0.875rem',
        color: 'var(--color-safe-light)',
        fontWeight: 500,
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle2 size={16} /> GDPR Compliant</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Lock size={16} /> End-to-End Encrypted</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><ShieldCheck size={16} /> Women-First Verification</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={16} /> Real-Time Location Sharing</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Globe size={16} /> 179 Country Coverage</span>
      </div>

      {/* FEATURES */}
      <section className="features-section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <div className="section-label">CORE FEATURES</div>
            <h2 className="section-title">Everything you need to <span className="gradient-text">travel fearlessly</span></h2>
            <p className="section-subtitle" style={{ margin: '16px auto 0' }}>
              Built by women, for women. Every feature designed around your real travel needs.
            </p>
          </div>

          <div className="grid-2" style={{ gap: '20px' }}>
            {features.map(f => (
              <div key={f.title} className="feature-card">
                <div className={`feature-icon ${f.iconClass}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST SECTION */}
      <section style={{ padding: '80px 0', background: 'rgba(124,58,237,0.04)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container">
          <div className="grid-2" style={{ alignItems: 'center', gap: '60px' }}>
            <div>
              <div className="section-label">THE TRUST MODEL</div>
              <h2 className="section-title" style={{ marginBottom: '20px' }}>
                A verified network you can <span className="gradient-text">actually trust</span>
              </h2>
              <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8, marginBottom: '28px' }}>
                SheRoam uses a three-layer trust model: verified institutions (SheStays & SheGuides),
                community peer reviews, and optional ID verification for premium users. We partner with
                certified hostels, local NGOs, and tourism boards so you always have a trusted anchor.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { icon: <Building size={24} color="#7C3AED" />, title: 'SheStay Certified', desc: '1,200+ vetted women-friendly accommodations' },
                  { icon: <Compass size={24} color="#EC4899" />, title: 'SheGuide Network', desc: '400+ verified local guides in 80 cities' },
                  { icon: <Search size={24} color="#10B981" />, title: 'ID Verified Users', desc: 'Optional KYC via Jumio for maximum trust' },
                ].map(item => (
                  <div key={item.title} style={{
                    display: 'flex', gap: '14px', alignItems: 'flex-start',
                    padding: '16px', background: 'var(--color-bg-card)',
                    border: '1px solid var(--color-border)', borderRadius: '12px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px' }}>{item.icon}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px' }}>{item.title}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ position: 'relative' }}>
              <div style={{
                background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(236,72,153,0.05))',
                border: '1px solid var(--color-border)',
                borderRadius: '24px',
                padding: '32px',
                textAlign: 'center',
              }}>
                {/* Simulated phone mockup */}
                <div style={{
                  background: '#0a0612',
                  border: '2px solid rgba(124,58,237,0.3)',
                  borderRadius: '20px',
                  padding: '24px',
                  margin: '0 auto',
                  maxWidth: '280px',
                }}>
                  <div style={{ marginBottom: '16px', fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <BrandIcon size={18} color="var(--color-primary-light)" /> SheRoam
                  </div>
                  <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '12px', padding: '14px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                      <Building size={16} color="var(--color-safe-light)" />
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontWeight: 600, color: 'var(--color-safe-light)' }}>SheStay Verified</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Hotel Bella Vienna · 0.3km away</div>
                      </div>
                    </div>
                  </div>
                  <div style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '12px', padding: '14px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                      <Users size={16} color="var(--color-primary-light)" />
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontWeight: 600, color: 'var(--color-primary-light)' }}>3 buddies nearby</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Same city, same dates</div>
                      </div>
                    </div>
                  </div>
                  <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '14px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--color-sos-light)', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ShieldAlert size={16} /> SOS Ready
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px', textAlign: 'left' }}>4 contacts watching your trip</div>
                  </div>
                </div>
                <div style={{ marginTop: '20px', fontSize: '0.85rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <Sparkles size={14} color="var(--color-secondary-light)" /> Your safety dashboard, always on
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div className="section-label">REAL STORIES</div>
            <h2 className="section-title">Women who travel <span className="gradient-text">with confidence</span></h2>
          </div>
          <div className="testimonials-grid">
            {testimonials.map(t => (
              <div key={t.author} className="testimonial-card">
                <div className="stars">{'★'.repeat(t.stars)}</div>
                <p className="testimonial-text">{t.text}</p>
                <div className="testimonial-author">
                  <div className="author-avatar" style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}88)`, color: '#fff', fontSize: '0.9rem', fontWeight: 'bold' }}>
                    {t.initials}
                  </div>
                  <div>
                    <div className="author-name">{t.author}</div>
                    <div className="author-tag">{t.from}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MARKET STATS */}
      <section style={{ padding: '60px 0', background: 'rgba(10,6,18,0.8)', borderTop: '1px solid var(--color-border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div className="section-label">MARKET OPPORTUNITY</div>
            <h2 className="section-title">A <span className="gradient-text">$550B market</span> with no dominant safety player</h2>
          </div>
          <div className="grid-4">
            {[
              { value: '$549.8B', label: 'Solo Travel Market 2025', color: '#7C3AED' },
              { value: '54.6%', label: 'Women\'s Share of Solo Travel', color: '#EC4899' },
              { value: '64%', label: 'Women Anxious About Safety', color: '#F59E0B' },
              { value: '14.6%', label: 'CAGR Through 2033', color: '#10B981' },
            ].map(s => (
              <div key={s.label} style={{
                textAlign: 'center', padding: '28px 20px',
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                borderRadius: '16px',
              }}>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: s.color, marginBottom: '8px' }}>{s.value}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div className="cta-banner">
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 900, marginBottom: '16px' }}>
                Ready to explore the world <span className="gradient-text">fearlessly?</span>
              </h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem', marginBottom: '32px', maxWidth: '480px', margin: '16px auto 32px' }}>
                Join 300,000+ women who travel smarter, safer, and with community.
              </p>
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="btn btn-primary" style={{ padding: '14px 36px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={onLogin} id="cta-join-btn">
                  <Sparkles size={18} /> Get Started Free
                </button>
                <button className="btn btn-secondary" style={{ padding: '14px 28px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => navigate('map')} id="cta-map-btn">
                  <Map size={18} /> Explore Safety Map
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        borderTop: '1px solid var(--color-border)',
        padding: '32px 0',
        background: 'rgba(10,6,18,0.8)',
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 800 }}>
            <BrandIcon size={24} color="var(--color-primary)" className="gradient-text" /> 
            <span className="gradient-text">SheRoam</span>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            © 2026 SheRoam. Built with care for women who roam free.
          </div>
          <div style={{ display: 'flex', gap: '20px', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            <span style={{ cursor: 'pointer' }}>Privacy</span>
            <span style={{ cursor: 'pointer' }}>Terms</span>
            <span style={{ cursor: 'pointer' }}>Safety</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
