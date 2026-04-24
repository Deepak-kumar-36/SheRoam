import { useState, useEffect } from 'react'
import { db } from '../lib/database'
import {
  Globe, Shield, Home, Map, Calendar, Heart, MessageCircle, Bookmark,
  TrendingUp, Users, Lightbulb, MapPin, Paperclip, Send, ShieldCheck
} from 'lucide-react'

const INITIAL_POSTS = [
  {
    id: 1, category: 'safety', catLabel: 'Safety Tips',
    author: 'Priya S.', initials: 'PS', color: '#7C3AED',
    time: '2 min ago', verified: true,
    title: 'Watch out for the "broken taxi meter" scam in Paris!',
    content: 'Just had this happen to me near CDG airport. Driver claimed his meter was broken and tried to charge 3x the normal fare. Tip: Always book via app (Uber/G7) and screenshot the price BEFORE getting in. Estimated CDG→Paris centre: €35-55.',
    likes: 47, comments: 12, bookmarks: 23, liked: false, bookmarked: false,
  },
  {
    id: 2, category: 'accommodation', catLabel: 'Accommodation',
    author: 'Lisa H.', initials: 'LH', color: '#EC4899',
    time: '18 min ago', verified: true,
    title: 'SheStay Review: Generator Hostel Paris — 9.5/10',
    content: 'Stayed here for 5 nights solo. Female-only dorms available, secure lockers, 24/7 reception, and the staff actually checked that everyone returning after midnight showed their key card. Also hosted a solo women travelers meetup — 20+ women showed up! Highly recommend.',
    likes: 93, comments: 28, bookmarks: 61, liked: true, bookmarked: true,
  },
  {
    id: 3, category: 'routes', catLabel: 'Routes',
    author: 'Nour A.', initials: 'NA', color: '#10B981',
    time: '1 hr ago', verified: false,
    title: 'Best safe walking route: Eiffel Tower → Champ de Mars (evening)',
    content: 'I was nervous about walking alone at dusk but this route is well-lit and always busy with families and tourists. Took Ave de la Motte-Picquet instead of quiet side streets. Felt totally safe at 9pm. Saved the SheRoam safety map as offline just in case!',
    likes: 34, comments: 9, bookmarks: 15, liked: false, bookmarked: false,
  },
  {
    id: 4, category: 'meetups', catLabel: 'Meetups',
    author: 'Amara K.', initials: 'AK', color: '#F59E0B',
    time: '3 hr ago', verified: true,
    title: 'Paris SheRoam Meetup — Sunday Apr 27 @ Café de Flore!',
    content: 'Hey Paris ladies! Organizing a Sunday afternoon meetup for solo travelers. Plan: meet at Café de Flore at 3pm, afternoon stroll through Saint-Germain, then optional dinner. All SheRoam members welcome. DM me or RSVP in comments. We\'re at 12 people so far!',
    likes: 78, comments: 41, bookmarks: 38, liked: true, bookmarked: false,
  },
  {
    id: 5, category: 'safety', catLabel: 'Safety Tips',
    author: 'Sofia M.', initials: 'SM', color: '#6366F1',
    time: '5 hr ago', verified: true,
    title: 'Night Metro safety in Paris — lines to avoid after 10pm',
    content: 'After 3 solo trips here, here\'s my take: Lines 4 & 9 are generally fine. Avoid Line 13 after 10pm (too many reports). Line 2 in Pigalle area — take a cab instead. RER B to airport is fine if you sit in the first/middle cars near the conductor. Always stay on platform with others.',
    likes: 156, comments: 34, bookmarks: 89, liked: false, bookmarked: true,
  },
]

const TRENDING_DATA = [
  { tag: '#ParisSafety', count: 243 },
  { tag: '#SoloFemale', count: 189 },
  { tag: '#SheStay', count: 156 },
  { tag: '#NightSafety', count: 121 },
  { tag: '#TravelBuddy', count: 98 },
  { tag: '#DigitalNomad', count: 87 },
  { tag: '#SOSNetwork', count: 65 }
]

const ONLINE_USERS = [
  { name: 'Amara K.', location: 'Le Marais', initials: 'AK', color: '#F59E0B' },
  { name: 'Lisa H.', location: 'Opéra', initials: 'LH', color: '#EC4899' },
  { name: 'Fatima M.', location: 'Marais', initials: 'FM', color: '#EF4444' },
  { name: 'Yuki T.', location: 'Montmartre', initials: 'YT', color: '#6366F1' },
]

export default function CommunityPage({ navigate, addToast, user }) {
  const [posts, setPosts] = useState([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [newPostText, setNewPostText] = useState('')
  const [newPostTitle, setNewPostTitle] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    db.posts.getAll().then((data) => {
      setPosts(data)
      setLoading(false)
    }).catch(err => {
      console.error(err)
      setLoading(false)
    })
  }, [])

  const categories = [
    { id: 'all', label: 'All', icon: <Globe size={14} /> },
    { id: 'safety', label: 'Safety', icon: <Shield size={14} /> },
    { id: 'accommodation', label: 'Stays', icon: <Home size={14} /> },
    { id: 'routes', label: 'Routes', icon: <Map size={14} /> },
    { id: 'meetups', label: 'Meetups', icon: <Calendar size={14} /> },
  ]

  const filtered = activeCategory === 'all'
    ? posts
    : posts.filter(p => p.category === activeCategory)

  const toggleLike = async (id) => {
    // Optimistic UI
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
    addToast('Post saved to your reading list', 'info')
  }

  const submitPost = async () => {
    if (!newPostTitle.trim() || !newPostText.trim()) return
    
    const newPostPayload = {
      category: 'general', cat_label: 'General',
      color: '#7C3AED',
      verified: true,
      title: newPostTitle,
      content: newPostText,
    }
    
    try {
      const resultingPost = await db.posts.create(newPostPayload)
      setPosts(prev => [{
        ...resultingPost,
        author: user?.name || 'You',
        initials: user?.initials || 'U'
      }, ...prev])
      setNewPostTitle('')
      setNewPostText('')
      addToast('Your post is live!', 'success')
    } catch (e) {
      addToast('Failed to post. Have you logged in?', 'error')
    }
  }

  const catStyle = {
    safety: 'cat-safety',
    accommodation: 'cat-accommodation',
    routes: 'cat-routes',
    meetups: 'cat-meetups',
    general: 'cat-general',
  }

  return (
    <div className="community-page">
      <div className="container">

        {/* Header */}
        <div className="page-header">
          <div className="section-label">COMMUNITY FORUM</div>
          <h1 className="page-title">
            SheRoam <span className="gradient-text">Community</span>
          </h1>
          <p className="page-subtitle">Real advice from real women travelers — no fluff, no ads</p>
        </div>

        {/* Category Filter */}
        <div style={{ display: 'flex', gap: '8px', margin: '24px 0', flexWrap: 'wrap' }}>
          {categories.map(c => (
            <button
              key={c.id}
              className={`map-filter-btn ${activeCategory === c.id ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              onClick={() => setActiveCategory(c.id)}
              id={`cat-${c.id}-btn`}
            >
              {c.icon} {c.label}
            </button>
          ))}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="pulse-dot"></span>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>247 online now</span>
          </div>
        </div>

        <div className="community-layout">

          {/* Main Feed */}
          <div>
            {/* Compose */}
            <div className="post-compose">
              <div
                className="compose-avatar"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #7C3AED88)', color: '#fff', fontSize: '1rem', fontWeight: 'bold' }}
              >
                {user.initials || 'ME'}
              </div>
              <div style={{ flex: 1 }}>
                <input
                  style={{
                    width: '100%', background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--color-border)', borderRadius: '8px',
                    padding: '10px 14px', color: 'var(--color-text-primary)',
                    fontSize: '0.85rem', fontFamily: 'inherit', outline: 'none',
                    marginBottom: '8px',
                  }}
                  placeholder="Post title (e.g. 'Safest neighborhood in Barcelona?')"
                  value={newPostTitle}
                  onChange={e => setNewPostTitle(e.target.value)}
                  id="post-title-input"
                />
                <textarea
                  className="compose-input"
                  placeholder="Share a safety tip, accommodation review, or find travel buddies..."
                  value={newPostText}
                  onChange={e => setNewPostText(e.target.value)}
                  id="post-content-input"
                />
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px', justifyContent: 'flex-end' }}>
                  <button className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Paperclip size={14} /> Attach
                  </button>
                  <button
                    className="btn btn-primary"
                    style={{ padding: '8px 20px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                    onClick={submitPost}
                    id="submit-post-btn"
                  >
                    Post <Send size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Feed */}
            {filtered.map(post => (
              <div key={post.id} className="post-card">
                <div className="post-header">
                  <div
                    className="post-avatar"
                    style={{ background: `linear-gradient(135deg, ${post.color}, ${post.color}88)`, color: '#fff', fontSize: '1.1rem', fontWeight: 'bold' }}
                  >
                    {post.initials}
                  </div>
                  <div className="post-meta">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="post-author">{post.author}</span>
                      {post.verified && <span title="Identity Verified" style={{ display: 'flex' }}><ShieldCheck size={14} color="#4ade80" /></span>}
                    </div>
                    <div className="post-timestamp">{post.time}</div>
                  </div>
                  <span className={`post-category ${catStyle[post.category] || 'cat-general'}`}>
                    {post.catLabel}
                  </span>
                </div>

                <h3 className="post-title">{post.title}</h3>
                <p className="post-content">{post.content}</p>

                <div className="post-actions">
                  <button
                    className={`post-action-btn ${post.liked ? 'liked' : ''}`}
                    onClick={() => toggleLike(post.id)}
                    id={`like-post-${post.id}`}
                  >
                    <Heart size={16} fill={post.liked ? 'currentColor' : 'none'} /> {post.likes}
                  </button>
                  <button
                    className="post-action-btn"
                    onClick={() => addToast('Comments coming in v1!', 'info')}
                  >
                    <MessageCircle size={16} /> {post.comments}
                  </button>
                  <button
                    className={`post-action-btn ${post.bookmarked ? 'bookmarked' : ''}`}
                    onClick={() => toggleBookmark(post.id)}
                    id={`bookmark-post-${post.id}`}
                  >
                    <Bookmark size={16} fill={post.bookmarked ? 'currentColor' : 'none'} /> Save
                  </button>
                  <div style={{ marginLeft: 'auto', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                    {post.bookmarks} saved
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div>
            {/* Trending */}
            <div className="sidebar-card">
              <div className="sidebar-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <TrendingUp size={16} color="var(--s-primary)" /> Trending Topics
              </div>
              {TRENDING_DATA.map((item, i) => (
                <div key={item.tag} className="trending-item" onClick={() => addToast(`Filtering by ${item.tag}`, 'info')}>
                  <span className="trending-rank">{i + 1}</span>
                  <span className="trending-tag">{item.tag}</span>
                  <span className="trending-count">{item.count} posts</span>
                </div>
              ))}
            </div>

            {/* Online Now */}
            <div className="sidebar-card">
              <div className="sidebar-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Users size={16} color="#4ade80" /> Online Now in Paris
              </div>
              <div className="who-online">
                {ONLINE_USERS.map(u => (
                  <div key={u.name} className="online-user">
                    <div
                      className="online-user-avatar"
                      style={{ background: `linear-gradient(135deg, ${u.color}, ${u.color}88)`, color: '#fff', fontSize: '0.8rem', fontWeight: 'bold' }}
                    >
                      {u.initials}
                    </div>
                    <div className="online-user-name">{u.name}</div>
                    <div className="online-user-location" style={{ display: 'flex', alignItems: 'center', gap: '2px' }}><MapPin size={10} /> {u.location}</div>
                  </div>
                ))}
              </div>
              <button
                className="btn btn-secondary"
                style={{ width: '100%', marginTop: '12px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                onClick={() => navigate('buddy')}
                id="sidebar-find-buddy-btn"
              >
                <Users size={14} /> Find Travel Buddy
              </button>
            </div>

            {/* Safety Tip Box */}
            <div className="sidebar-card" style={{
              background: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(236,72,153,0.05))',
              border: '1px solid rgba(124,58,237,0.2)',
            }}>
              <div className="sidebar-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lightbulb size={16} color="#F59E0B" /> Daily Safety Tip
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.7, marginBottom: '14px' }}>
                <strong>Shared location:</strong> Before heading somewhere unfamiliar, share your Google Maps live location with a trusted contact — it auto-expires in 1 hour. Fast and effective.
              </p>
              <button
                className="btn btn-primary"
                style={{ width: '100%', fontSize: '0.82rem', padding: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                onClick={() => navigate('map')}
              >
                <Map size={14} /> Open Safety Map
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
