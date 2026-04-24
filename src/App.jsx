import { useState, useCallback, useEffect } from 'react'
import Navbar from './components/Navbar'
import ToastContainer from './components/ToastContainer'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import MapPage from './pages/MapPage'
import BuddyPage from './pages/BuddyPage'
import SOSPage from './pages/SOSPage'
import CommunityPage from './pages/CommunityPage'
import VerificationPage from './pages/VerificationPage'
import { useAuth } from './context/AuthProvider'

const DEMO_USER = { name: 'Anika R.', city: 'Paris', initials: 'AR', tripDates: 'Apr 24–28' }

export default function App() {
  const [page, setPage] = useState('landing')
  const { session, signIn, signOut } = useAuth()
  const isLoggedIn = !!session
  const [toasts, setToasts] = useState([])

  // Watch session state to redirect automatically
  useEffect(() => {
    if (session && page === 'landing') {
      setPage('verification') // Force verification flow for new sessions/demo
    } else if (!session && page !== 'landing') {
      setPage('landing')
    }
  }, [session])

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }, [])

  const navigate = useCallback((target) => setPage(target), [])

  const handleLogin = async () => {
    try {
      if (session) return;
      await signIn('test@example.com', 'password123')
      addToast(`Initiating Verification...`, 'info')
      setPage('verification')
    } catch {
      addToast(`Error connecting to backend database.`, 'error')
    }
  }

  const handleLogout = async () => {
    await signOut()
    setPage('landing')
    addToast('Signed out. Stay safe!', 'info')
  }

  const sharedProps = { navigate, addToast, user: DEMO_USER }

  return (
    <>
      {/* Stitch decorative background lines */}
      <div className="stitch-lines" aria-hidden="true">
        <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
          <path d="M -100 600 Q 300 200 700 500 Q 1100 800 1540 300" stroke="white" fill="none" strokeWidth="2"/>
          <path d="M -50 800 Q 400 400 800 650 Q 1200 900 1490 450" stroke="white" fill="none" strokeWidth="1"/>
          <path d="M 200 -50 Q 400 300 600 150 Q 900 0 1100 400" stroke="white" fill="none" strokeWidth="1.5"/>
        </svg>
      </div>

      <Navbar page={page} navigate={navigate} isLoggedIn={isLoggedIn} onLogin={handleLogin} onLogout={handleLogout} />

      <main className="page">
        {page === 'landing'   && <Landing   {...sharedProps} onLogin={handleLogin} />}
        {page === 'verification'&& <VerificationPage onVerified={() => setPage('dashboard')} addToast={addToast} />}
        {page === 'dashboard' && <Dashboard {...sharedProps} />}
        {page === 'map'       && <MapPage   {...sharedProps} />}
        {page === 'buddy'     && <BuddyPage {...sharedProps} />}
        {page === 'sos'       && <SOSPage   {...sharedProps} />}
        {page === 'community' && <CommunityPage {...sharedProps} />}
      </main>

      <ToastContainer toasts={toasts} />
    </>
  )
}
