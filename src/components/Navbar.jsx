import { LogOut } from 'lucide-react'

export default function Navbar({ page, navigate, isLoggedIn, onLogin, onLogout }) {
  const navItems = isLoggedIn
    ? [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'map',       label: 'Map' },
        { id: 'buddy',     label: 'Network' },
        { id: 'community', label: 'Community' },
      ]
    : []

  return (
    <nav className="navbar">
      {/* Brand */}
      <button className="navbar-brand" onClick={() => navigate('landing')} id="navbar-brand" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
        SHEROAM
      </button>

      {/* Nav Links */}
      {isLoggedIn && (
        <div className="navbar-nav w-full max-md:hidden">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`nav-link ${page === item.id ? 'active' : ''}`}
              onClick={() => navigate(item.id)}
              id={`nav-${item.id}`}
              style={{ background: 'none', border: 'none' }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      {/* Right side */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginLeft: 'auto' }}>
        {isLoggedIn ? (
          <>
            <button
              className="btn btn-danger"
              onClick={() => navigate('sos')}
              id="navbar-sos-btn"
            >
              SOS PROTOCOL
            </button>
            <button
              className="btn btn-secondary"
              onClick={onLogout}
              id="navbar-logout-btn"
            >
              <LogOut size={16} /> END SESSION
            </button>
          </>
        ) : (
          <button
            className="btn btn-primary"
            onClick={onLogin}
            id="navbar-signin-btn"
          >
            SECURE ACCESS
          </button>
        )}
      </div>
    </nav>
  )
}
