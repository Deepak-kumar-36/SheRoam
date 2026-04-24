import { Home, Map, Users, MessageSquare, Shield, LogOut, Heart } from 'lucide-react'

export default function Navbar({ page, navigate, isLoggedIn, onLogin, onLogout }) {
  const navItems = isLoggedIn
    ? [
        { id: 'dashboard', icon: <Home size={18} />, label: 'Home' },
        { id: 'map',       icon: <Map size={18} />, label: 'Map' },
        { id: 'buddy',     icon: <Users size={18} />, label: 'Buddy' },
        { id: 'community', icon: <MessageSquare size={18} />, label: 'Talk' },
      ]
    : []

  return (
    <nav className="navbar">
      {/* Brand */}
      <button className="navbar-brand" onClick={() => navigate('landing')} id="navbar-brand">
        <Heart size={22} color="var(--s-primary)" />
        <span className="gradient-text">SheRoam</span>
      </button>

      {/* Nav Links */}
      {isLoggedIn && (
        <div className="navbar-nav">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`nav-link ${page === item.id ? 'active' : ''}`}
              onClick={() => navigate(item.id)}
              id={`nav-${item.id}`}
            >
              <span className="nav-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </div>
      )}

      {/* Right side */}
      <div className="navbar-sos" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        {isLoggedIn ? (
          <>
            <button
              className="btn btn-danger"
              style={{ padding: '8px 18px', fontSize: '0.82rem' }}
              onClick={() => navigate('sos')}
              id="navbar-sos-btn"
            >
              <Shield size={16} /> SOS
            </button>
            <button
              className="btn btn-secondary"
              style={{ padding: '8px 16px', fontSize: '0.82rem' }}
              onClick={onLogout}
              id="navbar-logout-btn"
            >
              <LogOut size={16} /> Sign Out
            </button>
          </>
        ) : (
          <button
            className="btn btn-primary"
            style={{ padding: '8px 20px', fontSize: '0.85rem' }}
            onClick={onLogin}
            id="navbar-signin-btn"
          >
            <Heart size={16} /> Join Free
          </button>
        )}
      </div>
    </nav>
  )
}
