import { createContext, useContext, useEffect, useState } from 'react'
import { mockApi } from '../lib/mockApi'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check local session
    mockApi.auth.getSession().then(({ session }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })
  }, [])

  // Will be passed down to contexts
  const value = {
    session,
    user,
    signIn: async (email, password) => {
      const res = await mockApi.auth.signIn(email, password)
      setSession({ user: res.user })
      setUser(res.user)
      return res
    },
    signOut: async () => {
      await mockApi.auth.signOut()
      setSession(null)
      setUser(null)
    },
  }

  // To prevent children from rendering before we gather user session
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
