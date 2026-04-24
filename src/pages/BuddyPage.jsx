import { useState, useEffect } from 'react'
import { mockApi } from '../lib/mockApi'
import { Search, CheckCircle2, MapPin, Calendar, Star, Plane, MessageCircle, X, ShieldCheck } from 'lucide-react'

const BUDDIES = [
  {
    id: 1, name: 'Amara Kone', from: 'Accra, Ghana', initials: 'AK', color: '#7C3AED',
    city: 'Paris', dates: 'Apr 24 – May 2', verified: true,
    interests: ['Art Museums', 'Cafés', 'Solo Hiking'],
    bio: 'Solo traveler for 4 years. Love connecting with local culture and off-the-beaten-path spots.',
    rating: 4.9, trips: 23, online: true,
  },
  {
    id: 2, name: 'Lisa Hofmann', from: 'Vienna, Austria', initials: 'LH', color: '#EC4899',
    city: 'Paris', dates: 'Apr 25 – Apr 30', verified: true,
    interests: ['Foodie', 'Architecture', 'Photography'],
    bio: 'Digital nomad based in EU. Here for a work conference + exploration. Looking for dinner company!',
    rating: 5.0, trips: 11, online: true,
  },
  {
    id: 3, name: 'Nour Al-Rashid', from: 'Dubai, UAE', initials: 'NA', color: '#10B981',
    city: 'Paris', dates: 'Apr 23 – Apr 26', verified: false,
    interests: ['Shopping', 'Fashion', 'History'],
    bio: 'First solo trip! Excited but a bit nervous. Would love a buddy for day trips around the city.',
    rating: null, trips: 1, online: true,
  },
  {
    id: 4, name: 'Yuki Tanaka', from: 'Osaka, Japan', initials: 'YT', color: '#F59E0B',
    city: 'Paris', dates: 'Apr 28 – May 5', verified: true,
    interests: ['Bakeries', 'Metro Exploring', 'Bookshops'],
    bio: 'Slow traveler who loves spending days in local neighborhoods. Always up for a coffee date.',
    rating: 4.8, trips: 7, online: false,
  },
  {
    id: 5, name: 'Sofia Mendez', from: 'Mexico City, MX', initials: 'SM', color: '#6366F1',
    city: 'Paris', dates: 'May 1 – May 8', verified: true,
    interests: ['Dancing', 'Street Food', 'Nightlife'],
    bio: 'Travel writer covering Latin women abroad. Love making friends from all over the world.',
    rating: 4.7, trips: 34, online: false,
  },
  {
    id: 6, name: 'Fatima Malik', from: 'Lahore, Pakistan', initials: 'FM', color: '#EF4444',
    city: 'Paris', dates: 'Apr 23 – Apr 29', verified: true,
    interests: ['Halal Food', 'Mosques', 'Gardens'],
    bio: 'Medical student on holiday. Looking for a peaceful companion for museum and garden days.',
    rating: 4.9, trips: 5, online: true,
  },
]

export default function BuddyPage({ addToast }) {
  const [search, setSearch] = useState('')
  const [chatOpen, setChatOpen] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMsg, setNewMsg] = useState('')

  // Sync with mockApi on chatOpen
  useEffect(() => {
    if (!chatOpen) return
    mockApi.chat.getChatHistory(chatOpen.id).then(setMessages)
    const timer = setInterval(async () => {
      const msgs = await mockApi.chat.getChatHistory(chatOpen.id)
      setMessages(msgs)
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
    const updated = await mockApi.chat.sendMessage(chatOpen.id, msgCopy)
    setMessages(updated)
  }

  const openChat = (buddy) => {
    setChatOpen(buddy)
    addToast(`Chat opened with ${buddy.name}`, 'info')
  }

  return (
    <div className="buddy-page">
      <div className="container">
        <div className="page-header">
          <div className="section-label">BUDDY FINDER</div>
          <h1 className="page-title">Find your <span className="gradient-text">travel companion</span></h1>
          <p className="page-subtitle">Connect with verified solo women travelers in your city & dates</p>
        </div>

        {/* Search + Filters */}
        <div className="buddy-search-bar">
          <div className="search-input-wrapper" style={{ maxWidth: '400px' }}>
            <span className="search-icon"><Search size={16} /></span>
            <input
              type="text"
              placeholder="Search by name or interest..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              id="buddy-search-input"
            />
          </div>
          <button className="btn btn-secondary" id="filter-verified-btn" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={14} color="#22c55e" /> Verified Only
          </button>
          <button className="btn btn-secondary" id="filter-online-btn" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div className="online-dot" style={{ position: 'static' }}></div> Online Now
          </button>
          <button className="btn btn-secondary" id="filter-dates-btn" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={14} /> Same Dates
          </button>
          <div style={{ marginLeft: 'auto', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            {filtered.length} travelers found in Paris
          </div>
        </div>

        {/* Cards */}
        <div className="buddy-cards-grid">
          {filtered.map(buddy => (
            <div key={buddy.id} className="buddy-card">
              {/* Card top */}
              <div className="buddy-card-top">
                <div
                  className="buddy-avatar"
                  style={{ background: `linear-gradient(135deg, ${buddy.color}, ${buddy.color}88)`, fontSize: '1.2rem', color: '#fff', fontWeight: 'bold' }}
                >
                  {buddy.initials}
                  {buddy.online && <div className="online-dot"></div>}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="buddy-name">{buddy.name}</div>
                    {buddy.verified && (
                      <span title="Identity Verified" style={{ display: 'flex' }}><ShieldCheck size={16} color="#4ade80" /></span>
                    )}
                  </div>
                  <div className="buddy-origin" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={12} /> {buddy.from}
                  </div>
                  <div style={{ display: 'flex', gap: '10px', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                    {buddy.rating && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Star size={12} fill="currentColor" color="var(--s-primary)" /> {buddy.rating}</span>}
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Plane size={12} /> {buddy.trips} trips</span>
                  </div>
                </div>
              </div>

              {/* Trip Info */}
              <div className="buddy-trip-info">
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={14} /> {buddy.city}</span>
                <span>·</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14} /> {buddy.dates}</span>
              </div>

              {/* Bio */}
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '12px' }}>
                {buddy.bio}
              </p>

              {/* Interests */}
              <div className="buddy-interests">
                {buddy.interests.map(i => (
                  <span key={i} className="interest-tag">{i}</span>
                ))}
              </div>

              {/* Actions */}
              <div className="buddy-actions">
                <button
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '9px 14px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  id={`chat-buddy-${buddy.id}`}
                  onClick={() => openChat(buddy)}
                >
                  <MessageCircle size={16} /> Chat
                </button>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '9px 14px', fontSize: '0.85rem' }}
                  id={`view-buddy-${buddy.id}`}
                  onClick={() => addToast(`Viewing ${buddy.name}'s full profile`, 'info')}
                >
                  View Profile
                </button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--color-text-muted)' }}>
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
              <Search size={48} color="var(--color-border)" />
            </div>
            <div style={{ fontWeight: 600 }}>No buddies found</div>
            <div style={{ fontSize: '0.9rem', marginTop: '8px' }}>Try different search terms</div>
          </div>
        )}
      </div>

      {/* Chat Modal */}
      {chatOpen && (
        <div className="chat-modal-overlay" onClick={e => e.target === e.currentTarget && setChatOpen(null)}>
          <div className="chat-modal">
            <div className="chat-header">
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: `linear-gradient(135deg, ${chatOpen.color}, ${chatOpen.color}88)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: '1.1rem', fontWeight: 'bold'
              }}>
                {chatOpen.initials}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{chatOpen.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-safe-light)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span className="pulse-dot" style={{ width: 6, height: 6 }}></span>
                  Online · Paris
                </div>
              </div>
              {chatOpen.verified && <span className="badge badge-purple" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><ShieldCheck size={12} /> Verified</span>}
              <button
                onClick={() => setChatOpen(null)}
                style={{ color: 'var(--color-text-muted)', fontSize: '1.2rem', padding: '4px 8px' }}
                id="close-chat-btn"
              >
                <X size={18} />
              </button>
            </div>

            <div className="chat-messages">
              {messages.map(msg => (
                <div key={msg.id} className={`message-bubble ${msg.sent ? 'sent' : 'received'}`}>
                  {msg.text}
                </div>
              ))}
            </div>

            <div className="chat-input-area">
              <input
                className="chat-input"
                placeholder="Type a message..."
                value={newMsg}
                onChange={e => setNewMsg(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                id="chat-message-input"
              />
              <button
                className="btn btn-primary"
                style={{ padding: '10px 16px' }}
                onClick={sendMessage}
                id="send-message-btn"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
