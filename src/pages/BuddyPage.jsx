import { useState, useEffect } from 'react'
import { db } from '../lib/database'
import { Search, CheckCircle2, MapPin, Calendar, Star, Plane, MessageCircle, X, ShieldCheck } from 'lucide-react'

const BUDDIES = [
  {
    id: 1, name: 'Amara Kone', from: 'Accra, Ghana', initials: 'AK', color: '#ceee93',
    city: 'Paris', dates: 'Apr 24 – May 2', verified: true,
    interests: ['ART MUSEUMS', 'CAFÉS', 'SOLO HIKING'],
    bio: 'SOLO TRAVELER FOR 4 YEARS. LOVE CONNECTING WITH LOCAL CULTURE AND OFF-THE-BEATEN-PATH SPOTS.',
    rating: 4.9, trips: 23, online: true,
  },
  {
    id: 2, name: 'Lisa Hofmann', from: 'Vienna, Austria', initials: 'LH', color: '#f59e0b',
    city: 'Paris', dates: 'Apr 25 – Apr 30', verified: true,
    interests: ['FOODIE', 'ARCHITECTURE', 'PHOTOGRAPHY'],
    bio: 'DIGITAL NOMAD BASED IN EU. HERE FOR A WORK CONFERENCE + EXPLORATION. LOOKING FOR DINNER COMPANY.',
    rating: 5.0, trips: 11, online: true,
  },
  {
    id: 3, name: 'Nour Al-Rashid', from: 'Dubai, UAE', initials: 'NA', color: '#ff4a8d',
    city: 'Paris', dates: 'Apr 23 – Apr 26', verified: false,
    interests: ['SHOPPING', 'FASHION', 'HISTORY'],
    bio: 'FIRST SOLO TRIP. EXCITED BUT A BIT NERVOUS. WOULD LOVE A BUDDY FOR DAY TRIPS AROUND THE CITY.',
    rating: null, trips: 1, online: true,
  },
  {
    id: 4, name: 'Yuki Tanaka', from: 'Osaka, Japan', initials: 'YT', color: '#ceee93',
    city: 'Paris', dates: 'Apr 28 – May 5', verified: true,
    interests: ['BAKERIES', 'METRO EXPLORING', 'BOOKSHOPS'],
    bio: 'SLOW TRAVELER WHO LOVES SPENDING DAYS IN LOCAL NEIGHBORHOODS. ALWAYS UP FOR A COFFEE DATE.',
    rating: 4.8, trips: 7, online: false,
  },
  {
    id: 5, name: 'Sofia Mendez', from: 'Mexico City, MX', initials: 'SM', color: '#f59e0b',
    city: 'Paris', dates: 'May 1 – May 8', verified: true,
    interests: ['DANCING', 'STREET FOOD', 'NIGHTLIFE'],
    bio: 'TRAVEL WRITER COVERING LATIN WOMEN ABROAD. LOVE MAKING FRIENDS FROM ALL OVER THE WORLD.',
    rating: 4.7, trips: 34, online: false,
  },
  {
    id: 6, name: 'Fatima Malik', from: 'Lahore, Pakistan', initials: 'FM', color: '#ceee93',
    city: 'Paris', dates: 'Apr 23 – Apr 29', verified: true,
    interests: ['HALAL FOOD', 'MOSQUES', 'GARDENS'],
    bio: 'MEDICAL STUDENT ON HOLIDAY. LOOKING FOR A PEACEFUL COMPANION FOR MUSEUM AND GARDEN DAYS.',
    rating: 4.9, trips: 5, online: true,
  },
]

export default function BuddyPage({ addToast }) {
  const [search, setSearch] = useState('')
  const [chatOpen, setChatOpen] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMsg, setNewMsg] = useState('')

  // Sync with real db on chatOpen
  useEffect(() => {
    if (!chatOpen) return
    db.messages.getHistory().then(msgs => {
      setMessages(msgs.filter(m => m.receiver_id === chatOpen.id || m.sender_id === chatOpen.id))
    })
    const timer = setInterval(async () => {
      try {
        const msgs = await db.messages.getHistory()
        setMessages(msgs.filter(m => m.receiver_id === chatOpen.id || m.sender_id === chatOpen.id))
      } catch (e) {
        // fail silently for polling
      }
    }, 1500)
    return () => clearInterval(timer)
  }, [chatOpen])

  const filtered = BUDDIES.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.interests.some(i => i.toLowerCase().includes(search.toLowerCase()))
  )

  const sendMessage = async () => {
    if (!newMsg.trim()) return
    const msgCopy = newMsg
    setNewMsg('')
    try {
      await db.messages.send(msgCopy, chatOpen.id)
      const msgs = await db.messages.getHistory()
      setMessages(msgs.filter(m => m.receiver_id === chatOpen.id || m.sender_id === chatOpen.id))
    } catch {
      addToast('FAILED TO SEND MESSAGE. ARE YOU LOGGED IN?', 'error')
    }
  }

  const openChat = (buddy) => {
    setChatOpen(buddy)
    addToast(`COMMUNICATION LINK OPENED: ${buddy.name.toUpperCase()}`, 'info')
  }

  return (
    <div className="page">
      <div className="container">
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '32px', marginBottom: '48px' }}>
          <div className="label-caps" style={{ color: 'var(--s-primary)', marginBottom: '8px' }}>NETWORK PROTOCOL</div>
          <h1 className="headline-lg" style={{ textTransform: 'uppercase' }}>BUDDY FINDER</h1>
          <p className="label-caps" style={{ opacity: 0.5, marginTop: '8px' }}>CONNECT WITH VERIFIED OPERATIVES IN YOUR SECTOR</p>
        </div>

        {/* Search + Filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '48px', alignItems: 'center' }}>
          <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', flex: '1 1 300px' }}>
            <Search size={16} color="rgba(255,255,255,0.5)" style={{ marginRight: '12px' }} />
            <input
              type="text"
              placeholder="SEARCH ALIAS OR INTEL..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: '#fff', width: '100%', outline: 'none', fontFamily: 'Space Grotesk', letterSpacing: '0.1em', fontSize: '0.875rem', textTransform: 'uppercase' }}
            />
          </div>
          <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 20px' }}>
            <CheckCircle2 size={16} color="var(--s-primary)" /> <span className="label-caps">VERIFIED ONLY</span>
          </button>
          <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 20px' }}>
            <div style={{ width: 8, height: 8, background: 'var(--s-primary)', borderRadius: '50%', boxShadow: 'var(--glow-primary)' }}></div> <span className="label-caps">ONLINE NOW</span>
          </button>
          <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 20px' }}>
            <Calendar size={16} /> <span className="label-caps">SAME DATES</span>
          </button>
          <div className="label-caps" style={{ marginLeft: 'auto', opacity: 0.5 }}>
            {filtered.length} OPERATIVES FOUND
          </div>
        </div>

        {/* Cards */}
        <div className="grid-3">
          {filtered.map(buddy => (
            <div key={buddy.id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', borderTop: `2px solid ${buddy.color}` }}>
              {/* Card top */}
              <div style={{ padding: '24px', flex: 1 }}>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                  <div
                    style={{ width: '48px', height: '48px', border: `1px solid ${buddy.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: buddy.color, fontFamily: 'Space Grotesk', fontWeight: 700, position: 'relative' }}
                  >
                    {buddy.initials}
                    {buddy.online && <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '8px', height: '8px', background: 'var(--s-primary)', borderRadius: '50%', boxShadow: 'var(--glow-primary)' }}></div>}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="label-caps" style={{ color: '#fff' }}>{buddy.name.toUpperCase()}</div>
                      {buddy.verified && <ShieldCheck size={16} color="var(--s-primary)" />}
                    </div>
                    <div className="label-caps" style={{ opacity: 0.5, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={12} /> {buddy.from.toUpperCase()}
                    </div>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '10px', textTransform: 'uppercase', fontFamily: 'Space Grotesk', letterSpacing: '0.1em', marginTop: '8px', color: buddy.color }}>
                      {buddy.rating && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Star size={10} fill="currentColor" /> {buddy.rating}</span>}
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Plane size={10} /> {buddy.trips} TRIPS</span>
                    </div>
                  </div>
                </div>

                {/* Trip Info */}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '12px 0', marginBottom: '24px' }}>
                  <span className="label-caps" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={14} color="var(--s-primary)" /> {buddy.city.toUpperCase()}</span>
                  <span className="label-caps" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14} color="var(--s-primary)" /> {buddy.dates.toUpperCase()}</span>
                </div>

                {/* Bio */}
                <p className="label-caps" style={{ opacity: 0.7, lineHeight: 1.6, marginBottom: '24px', fontSize: '10px' }}>
                  {buddy.bio}
                </p>

                {/* Interests */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {buddy.interests.map(i => (
                    <span key={i} style={{ padding: '6px 12px', border: '1px solid rgba(255,255,255,0.2)', fontSize: '9px', fontFamily: 'Space Grotesk', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.8)' }}>
                      {i}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <button
                  className="btn btn-secondary"
                  style={{ flex: 1, border: 'none', borderRight: '1px solid rgba(255,255,255,0.1)', borderRadius: 0, padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  onClick={() => openChat(buddy)}
                >
                  <MessageCircle size={16} /> <span className="label-caps">INITIATE CHAT</span>
                </button>
                <button
                  className="btn btn-secondary"
                  style={{ flex: 1, border: 'none', borderRadius: 0, padding: '16px' }}
                  onClick={() => addToast(`VIEWING INTEL: ${buddy.name.toUpperCase()}`, 'info')}
                >
                  <span className="label-caps">VIEW INTEL</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="glass-panel flex-center" style={{ padding: '64px', flexDirection: 'column', gap: '16px' }}>
            <Search size={48} color="rgba(255,255,255,0.2)" />
            <div className="label-caps">NO OPERATIVES FOUND</div>
            <div className="label-caps" style={{ opacity: 0.5 }}>ADJUST SEARCH PARAMETERS</div>
          </div>
        )}
      </div>

      {/* Chat Modal */}
      {chatOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }} onClick={e => e.target === e.currentTarget && setChatOpen(null)}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', height: '80vh', borderTop: `2px solid ${chatOpen.color}` }}>
            <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '40px', height: '40px', border: `1px solid ${chatOpen.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: chatOpen.color, fontFamily: 'Space Grotesk', fontWeight: 700 }}>
                {chatOpen.initials}
              </div>
              <div style={{ flex: 1 }}>
                <div className="label-caps" style={{ color: '#fff' }}>{chatOpen.name.toUpperCase()}</div>
                <div className="label-caps" style={{ fontSize: '9px', color: 'var(--s-primary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: 6, height: 6, background: 'currentColor', borderRadius: '50%', boxShadow: 'var(--glow-primary)' }}></div>
                  ACTIVE LINK · {chatOpen.city.toUpperCase()}
                </div>
              </div>
              {chatOpen.verified && <span className="label-caps" style={{ color: 'var(--s-primary)', display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid currentColor', padding: '4px 8px', fontSize: '9px' }}><ShieldCheck size={12} /> VERIFIED</span>}
              <button
                className="btn btn-secondary"
                onClick={() => setChatOpen(null)}
                style={{ padding: '8px' }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="label-caps" style={{ textAlign: 'center', opacity: 0.3, marginBottom: '16px' }}>END-TO-END ENCRYPTION ENABLED</div>
              {messages.map(msg => (
                <div key={msg.id} style={{ alignSelf: msg.sent ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                  <div style={{ 
                    padding: '12px 16px', 
                    background: msg.sent ? 'var(--s-primary)' : 'rgba(255,255,255,0.05)', 
                    color: msg.sent ? '#000' : '#fff', 
                    border: msg.sent ? 'none' : '1px solid rgba(255,255,255,0.1)',
                    fontFamily: 'Manrope',
                    fontSize: '0.875rem'
                  }}>
                    {msg.text.toUpperCase()}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ padding: '24px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '16px' }}>
              <input
                style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0 16px', color: '#fff', fontFamily: 'Space Grotesk', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '10px' }}
                placeholder="TYPE TRANSMISSION..."
                value={newMsg}
                onChange={e => setNewMsg(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
              />
              <button
                className="btn btn-primary"
                style={{ padding: '12px 24px' }}
                onClick={sendMessage}
              >
                TRANSMIT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
