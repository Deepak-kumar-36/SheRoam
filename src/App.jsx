import { useState, useCallback, useEffect } from 'react'
import Navbar from './components/Navbar'
import ToastContainer from './components/ToastContainer'
import AuthModal from './components/AuthModal'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import MapPage from './pages/MapPage'
import BuddyPage from './pages/BuddyPage'
import SOSPage from './pages/SOSPage'
import CommunityPage from './pages/CommunityPage'
import VerificationPage from './pages/VerificationPage'
import AdminPanel from './pages/AdminPanel'
import { useAuth } from './context/AuthProvider'

export default function App() {
  const [page, setPage] = useState('landing')
  const { session, user: authUser, signIn, signUp, signOut } = useAuth()
  const isLoggedIn = !!session
  const [toasts, setToasts] = useState([])
  const [showAuthModal, setShowAuthModal] = useState(false)

  // Build user object from real session data
  const user = authUser
    ? {
        name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Operative',
        city: authUser.user_metadata?.city || 'Global',
        initials: authUser.user_metadata?.initials || authUser.email?.slice(0, 2).toUpperCase() || 'OP',
        tripDates: 'Active'
      }
    : { name: 'Guest', city: 'Global', initials: 'G', tripDates: '' }

  // Watch session state for auto-redirects
  useEffect(() => {
    if (session && page === 'landing') {
      setPage('verification')
    } else if (!session && page !== 'landing') {
      setPage('landing')
    }
  }, [session]) // eslint-disable-line

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }, [])

  const navigate = useCallback((target) => setPage(target), [])

  const handleOpenAuth = () => {
    setShowAuthModal(true)
  }

  const handleAuth = async (mode, email, password, metadata) => {
    if (mode === 'signup') {
      const { error } = await signUp(email, password, metadata)
      if (error) throw error
    } else {
      const { error } = await signIn(email, password)
      if (error) throw error
    }
  }

  const handleLogout = async () => {
    await signOut()
    setPage('landing')
    addToast('SIGNED OUT. STAY SAFE.', 'info')
  }

  const sharedProps = { navigate, addToast, user }

  return (
    <>
      <Navbar page={page} navigate={navigate} isLoggedIn={isLoggedIn} onLogin={handleOpenAuth} onLogout={handleLogout} />

      <main>
        {page === 'landing'      && <Landing   {...sharedProps} onLogin={handleOpenAuth} />}
        {page === 'verification' && <VerificationPage onVerified={() => setPage('dashboard')} addToast={addToast} />}
        {page === 'dashboard'    && <Dashboard {...sharedProps} />}
        {page === 'map'          && <MapPage   {...sharedProps} />}
        {page === 'buddy'        && <BuddyPage {...sharedProps} />}
        {page === 'sos'          && <SOSPage   {...sharedProps} />}
        {page === 'community'    && <CommunityPage {...sharedProps} />}
        {page === 'admin'        && <AdminPanel {...sharedProps} />}
      </main>

      {showAuthModal && (
        <AuthModal
          mode="signin"
          onClose={() => setShowAuthModal(false)}
          onAuth={handleAuth}
          addToast={addToast}
        />
      )}

      <ToastContainer toasts={toasts} />
    </>
  )
}
