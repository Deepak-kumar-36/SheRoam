import { useState, useEffect } from 'react'
import { db } from '../lib/database'
import {
  Globe, Shield, Home, Map, Calendar, Heart, MessageCircle, Bookmark,
  TrendingUp, Users, Lightbulb, MapPin, Paperclip, Send, ShieldCheck
} from 'lucide-react'

const INITIAL_POSTS = [
  {
    id: 1, category: 'safety', catLabel: 'SAFETY TIPS',
    author: 'PRIYA S.', initials: 'PS', color: '#ceee93',
    time: '2 MIN AGO', verified: true,
    title: 'WATCH OUT FOR THE "BROKEN TAXI METER" SCAM IN PARIS',
    content: 'JUST HAD THIS HAPPEN TO ME NEAR CDG AIRPORT. DRIVER CLAIMED HIS METER WAS BROKEN AND TRIED TO CHARGE 3X THE NORMAL FARE. TIP: ALWAYS BOOK VIA APP (UBER/G7) AND SCREENSHOT THE PRICE BEFORE GETTING IN. ESTIMATED CDG→PARIS CENTRE: €35-55.',
    likes: 47, comments: 12, bookmarks: 23, liked: false, bookmarked: false,
  },
  {
    id: 2, category: 'accommodation', catLabel: 'STAYS',
    author: 'LISA H.', initials: 'LH', color: '#ff4a8d',
    time: '18 MIN AGO', verified: true,
    title: 'SHESTAY REVIEW: GENERATOR HOSTEL PARIS — 9.5/10',
    content: 'STAYED HERE FOR 5 NIGHTS SOLO. FEMALE-ONLY DORMS AVAILABLE, SECURE LOCKERS, 24/7 RECEPTION, AND THE STAFF ACTUALLY CHECKED THAT EVERYONE RETURNING AFTER MIDNIGHT SHOWED THEIR KEY CARD. ALSO HOSTED A SOLO WOMEN TRAVELERS MEETUP — 20+ WOMEN SHOWED UP. HIGHLY RECOMMEND.',
    likes: 93, comments: 28, bookmarks: 61, liked: true, bookmarked: true,
  },
  {
    id: 3, category: 'routes', catLabel: 'ROUTES',
    author: 'NOUR A.', initials: 'NA', color: '#f59e0b',
    time: '1 HR AGO', verified: false,
    title: 'BEST SAFE WALKING ROUTE: EIFFEL TOWER → CHAMP DE MARS (EVENING)',
    content: 'I WAS NERVOUS ABOUT WALKING ALONE AT DUSK BUT THIS ROUTE IS WELL-LIT AND ALWAYS BUSY WITH FAMILIES AND TOURISTS. TOOK AVE DE LA MOTTE-PICQUET INSTEAD OF QUIET SIDE STREETS. FELT TOTALLY SAFE AT 9PM. SAVED THE SHEROAM SAFETY MAP AS OFFLINE JUST IN CASE.',
    likes: 34, comments: 9, bookmarks: 15, liked: false, bookmarked: false,
  },
  {
    id: 4, category: 'meetups', catLabel: 'MEETUPS',
    author: 'AMARA K.', initials: 'AK', color: '#ceee93',
    time: '3 HR AGO', verified: true,
    title: 'PARIS SHEROAM MEETUP — SUNDAY APR 27 @ CAFÉ DE FLORE',
    content: 'HEY PARIS OPERATIVES. ORGANIZING A SUNDAY AFTERNOON MEETUP FOR SOLO TRAVELERS. PLAN: MEET AT CAFÉ DE FLORE AT 3PM, AFTERNOON STROLL THROUGH SAINT-GERMAIN, THEN OPTIONAL DINNER. ALL SHEROAM MEMBERS WELCOME. DM ME OR RSVP IN COMMENTS. WE\'RE AT 12 PEOPLE SO FAR.',
    likes: 78, comments: 41, bookmarks: 38, liked: true, bookmarked: false,
  },
  {
    id: 5, category: 'safety', catLabel: 'SAFETY TIPS',
    author: 'SOFIA M.', initials: 'SM', color: '#f59e0b',
    time: '5 HR AGO', verified: true,
    title: 'NIGHT METRO SAFETY IN PARIS — LINES TO AVOID AFTER 10PM',
    content: 'AFTER 3 SOLO TRIPS HERE, HERE\'S MY TAKE: LINES 4 & 9 ARE GENERALLY FINE. AVOID LINE 13 AFTER 10PM (TOO MANY REPORTS). LINE 2 IN PIGALLE AREA — TAKE A CAB INSTEAD. RER B TO AIRPORT IS FINE IF YOU SIT IN THE FIRST/MIDDLE CARS NEAR THE CONDUCTOR. ALWAYS STAY ON PLATFORM WITH OTHERS.',
    likes: 156, comments: 34, bookmarks: 89, liked: false, bookmarked: true,
  },
]

const TRENDING_DATA = [
  { tag: '#PARISSAFETY', count: 243 },
  { tag: '#SOLOFEMALE', count: 189 },
  { tag: '#SHESTAY', count: 156 },
  { tag: '#NIGHTSAFETY', count: 121 },
  { tag: '#TRAVELBUDDY', count: 98 },
  { tag: '#DIGITALNOMAD', count: 87 },
  { tag: '#SOSNETWORK', count: 65 }
]

const ONLINE_USERS = [
  { name: 'AMARA K.', location: 'LE MARAIS', initials: 'AK', color: '#ceee93' },
  { name: 'LISA H.', location: 'OPÉRA', initials: 'LH', color: '#ff4a8d' },
  { name: 'FATIMA M.', location: 'MARAIS', initials: 'FM', color: '#f59e0b' },
  { name: 'YUKI T.', location: 'MONTMARTRE', initials: 'YT', color: '#ceee93' },
]

export default function CommunityPage({ navigate, addToast, user }) {
  const [posts, setPosts] = useState([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [newPostText, setNewPostText] = useState('')
  const [newPostTitle, setNewPostTitle] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    db.posts.getAll().then((data) => {
      // Use the static ones if db returns empty for purely stylistic purposes, or map over returned data
      if(data.length === 0) setPosts(INITIAL_POSTS)
      else setPosts(data)
      setLoading(false)
    }).catch(err => {
      console.error(err)
      setPosts(INITIAL_POSTS)
      setLoading(false)
    })
  }, [])

  const categories = [
    { id: 'all', label: 'ALL FREQUENCIES', icon: <Globe size={14} /> },
    { id: 'safety', label: 'SAFETY Intel', icon: <Shield size={14} /> },
    { id: 'accommodation', label: 'STAYS', icon: <Home size={14} /> },
    { id: 'routes', label: 'ROUTES', icon: <Map size={14} /> },
    { id: 'meetups', label: 'MEETUPS', icon: <Calendar size={14} /> },
  ]

  const filtered = activeCategory === 'all'
    ? posts
    : posts.filter(p => p.category === activeCategory)

  const toggleLike = async (id) => {
    const targetPost = posts.find(p => p.id === id)
    if (!targetPost) return

    setPosts(prev => prev.map(p =>
      p.id === id
        ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
        : p
    ))
    
    try {
      await db.posts.like(id, targetPost.likes)
    } catch {
      // Revert optimistic if fails
    }
  }

  const toggleBookmark = (id) => {
    setPosts(prev => prev.map(p =>
      p.id === id ? { ...p, bookmarked: !p.bookmarked } : p
    ))
    addToast('INTEL SAVED TO ARCHIVE', 'info')
  }

  const submitPost = async () => {
    if (!newPostTitle.trim() || !newPostText.trim()) return
    
    const newPostPayload = {
      category: 'general', cat_label: 'GENERAL INTEL',
      color: '#ceee93',
      verified: true,
      title: newPostTitle.toUpperCase(),
      content: newPostText.toUpperCase(),
    }
    
    try {
      const resultingPost = await db.posts.create(newPostPayload)
      setPosts(prev => [{
        ...resultingPost,
        author: (user?.name || 'YOU').toUpperCase(),
        initials: user?.initials || 'U'
      }, ...prev])
      setNewPostTitle('')
      setNewPostText('')
      addToast('TRANSMISSION SUCCESSFUL', 'success')
    } catch (e) {
      addToast('TRANSMISSION FAILED. CHECK CONNECTION.', 'error')
    }
  }

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '1200px' }}>

        {/* Header */}
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '32px', marginBottom: '48px' }}>
          <div className="label-caps" style={{ color: 'var(--s-primary)', marginBottom: '8px' }}>SECURE NETWORK</div>
          <h1 className="headline-lg" style={{ textTransform: 'uppercase' }}>GLOBAL CHANNELS</h1>
          <p className="label-caps" style={{ opacity: 0.5, marginTop: '8px' }}>VERIFIED INTEL FROM FIELD OPERATIVES. ENCRYPTED COMMUNICATIONS.</p>
        </div>

        {/* Category Filter */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '48px', flexWrap: 'wrap', alignItems: 'center' }}>
          {categories.map(c => (
            <button
              key={c.id}
              className={`btn ${activeCategory === c.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '8px 16px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}
              onClick={() => setActiveCategory(c.id)}
            >
              {c.icon} <span className="label-caps">{c.label}</span>
            </button>
          ))}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: 8, height: 8, background: 'var(--s-primary)', borderRadius: '50%', boxShadow: 'var(--glow-primary)' }}></span>
            <span className="label-caps" style={{ color: 'var(--s-primary)', opacity: 0.8 }}>247 ACTIVE</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: '32px', alignItems: 'start' }}>

          {/* Main Feed */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Compose */}
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', gap: '16px' }}>
              <div
                style={{ width: '40px', height: '40px', border: '1px solid var(--s-primary)', color: 'var(--s-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Space Grotesk', fontWeight: 'bold' }}
              >
                {user.initials || 'ME'}
              </div>
              <div style={{ flex: 1 }}>
                <input
                  style={{
                    width: '100%', background: 'transparent',
                    border: 'none', borderBottom: '1px solid rgba(255,255,255,0.2)',
                    padding: '8px 0', color: '#fff',
                    fontFamily: 'Space Grotesk', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '10px',
                    outline: 'none', marginBottom: '16px',
                  }}
                  placeholder="TRANSMISSION SUBJECT..."
                  value={newPostTitle}
                  onChange={e => setNewPostTitle(e.target.value)}
                />
                <textarea
                  style={{
                    width: '100%', background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    padding: '12px', color: '#fff',
                    fontFamily: 'Manrope', fontSize: '0.875rem',
                    outline: 'none', minHeight: '80px', resize: 'vertical'
                  }}
                  placeholder="INPUT INTEL HERE..."
                  value={newPostText}
                  onChange={e => setNewPostText(e.target.value)}
                />
                <div style={{ display: 'flex', gap: '12px', marginTop: '16px', justifyContent: 'flex-end' }}>
                  <button className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Paperclip size={14} /> <span className="label-caps">ATTACH</span>
                  </button>
                  <button
                    className="btn btn-primary"
                    style={{ padding: '8px 24px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                    onClick={submitPost}
                  >
                    <span className="label-caps">BROADCAST</span> <Send size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Feed */}
            {filtered.map(post => (
              <div key={post.id} className="glass-panel" style={{ padding: '24px', borderLeft: `2px solid ${post.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div
                      style={{ width: '40px', height: '40px', border: `1px solid ${post.color}`, color: post.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Space Grotesk', fontWeight: 'bold' }}
                    >
                      {post.initials}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="label-caps" style={{ color: '#fff' }}>{post.author}</span>
                        {post.verified && <ShieldCheck size={14} color="var(--s-primary)" />}
                      </div>
                      <div className="label-caps" style={{ opacity: 0.5, marginTop: '4px', fontSize: '9px' }}>{post.time}</div>
                    </div>
                  </div>
                  <span className="label-caps" style={{ color: post.color, padding: '4px 8px', border: `1px solid ${post.color}`, fontSize: '9px' }}>
                    {post.catLabel}
                  </span>
                </div>

                <h3 className="label-caps" style={{ fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '16px', color: '#fff' }}>{post.title}</h3>
                <p className="label-caps" style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, marginBottom: '24px' }}>{post.content}</p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
                  <button
                    style={{ background: 'none', border: 'none', color: post.liked ? 'var(--s-primary)' : 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', outline: 'none' }}
                    onClick={() => toggleLike(post.id)}
                  >
                    <Heart size={16} fill={post.liked ? 'currentColor' : 'none'} /> <span className="label-caps" style={{ fontSize: '10px' }}>{post.likes} ENDORSEMENTS</span>
                  </button>
                  <button
                    style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', outline: 'none' }}
                    onClick={() => addToast('COMMENTS LOCKED IN BETA MODULE', 'info')}
                  >
                    <MessageCircle size={16} /> <span className="label-caps" style={{ fontSize: '10px' }}>{post.comments} INQUIRIES</span>
                  </button>
                  <div style={{ flex: 1 }}></div>
                  <button
                    style={{ background: 'none', border: 'none', color: post.bookmarked ? 'var(--s-primary)' : 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', outline: 'none' }}
                    onClick={() => toggleBookmark(post.id)}
                  >
                    <Bookmark size={16} fill={post.bookmarked ? 'currentColor' : 'none'} /> <span className="label-caps" style={{ fontSize: '10px' }}>ARCHIVE</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Trending */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div className="label-caps" style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px', marginBottom: '16px' }}>
                <TrendingUp size={14} color="var(--s-primary)" /> ACTIVE FREQUENCIES
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {TRENDING_DATA.map((item, i) => (
                  <div key={item.tag} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => addToast(`FILTERING BY ${item.tag}`, 'info')}>
                    <span className="label-caps" style={{ width: '24px', color: 'var(--s-primary)', opacity: 0.5 }}>0{i + 1}</span>
                    <span className="label-caps" style={{ flex: 1, color: '#fff' }}>{item.tag}</span>
                    <span className="label-caps" style={{ opacity: 0.5, fontSize: '9px' }}>{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Online Now */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div className="label-caps" style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px', marginBottom: '16px' }}>
                <Users size={14} color="#ceee93" /> OPERATIVES IN SECTOR
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {ONLINE_USERS.map(u => (
                  <div key={u.name} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{ width: '32px', height: '32px', border: `1px solid ${u.color}`, color: u.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Space Grotesk', fontSize: '9px', fontWeight: 'bold' }}
                    >
                      {u.initials}
                    </div>
                    <div>
                      <div className="label-caps" style={{ color: '#fff' }}>{u.name}</div>
                      <div className="label-caps" style={{ opacity: 0.5, fontSize: '9px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={10} /> {u.location.toUpperCase()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                className="btn btn-secondary"
                style={{ width: '100%', marginTop: '24px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px' }}
                onClick={() => navigate('buddy')}
              >
                <Users size={14} /> <span className="label-caps">SCAN NETWORK</span>
              </button>
            </div>

            {/* Safety Tip Box */}
            <div className="glass-panel" style={{ padding: '24px', border: '1px solid var(--s-primary)' }}>
              <div className="label-caps" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--s-primary)', marginBottom: '16px' }}>
                <Lightbulb size={14} /> DIRECTIVE PROTOCOL
              </div>
              <p className="label-caps" style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, marginBottom: '24px', fontSize: '10px' }}>
                <strong style={{ color: '#fff' }}>LOCATION SHARING:</strong> BEFORE ENTERING UNCHARTED ZONES, BROADCAST YOUR LIVE POSITION TO A TRUSTED OPERATIVE. UTILIZE AUTO-EXPIRING DEAD DROPS FOR 1-HOUR TRACKING.
              </p>
              <button
                className="btn btn-primary"
                style={{ width: '100%', fontSize: '0.75rem', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                onClick={() => navigate('map')}
              >
                <Map size={14} /> <span className="label-caps">ACCESS TERMINAL MAP</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
