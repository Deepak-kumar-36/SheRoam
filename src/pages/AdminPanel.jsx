import { useState, useEffect, useRef } from 'react'
import { ShieldCheck, XCircle, Play, Pause, Lock, Users, Clock, CheckCircle2, AlertTriangle } from 'lucide-react'
import { db } from '../lib/database'

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'sheroam-admin-2026'

export default function AdminPanel({ addToast }) {
  const [authenticated, setAuthenticated] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [videoUrl, setVideoUrl] = useState(null)
  const [videoLoading, setVideoLoading] = useState(false)
  const [rejectNotes, setRejectNotes] = useState('')
  const [filter, setFilter] = useState('pending') // pending | approved | rejected | all
  const [actionLoading, setActionLoading] = useState(false)
  const videoPlayerRef = useRef(null)

  // ── Password gate ──
  const handleAuth = (e) => {
    e.preventDefault()
    if (passwordInput === ADMIN_PASSWORD) {
      setAuthenticated(true)
      addToast('ADMIN ACCESS GRANTED.', 'success')
    } else {
      addToast('INVALID CREDENTIALS. ACCESS DENIED.', 'error')
    }
  }

  // ── Load requests ──
  const loadRequests = async () => {
    setLoading(true)
    try {
      const data = await db.verification.getAllPending()
      setRequests(data || [])
    } catch (err) {
      console.error('Failed to load requests:', err)
      addToast('FAILED TO LOAD VERIFICATION QUEUE.', 'error')
    }
    setLoading(false)
  }

  useEffect(() => {
    if (authenticated) loadRequests()
  }, [authenticated])

  // ── Select a request & load the video ──
  const selectRequest = async (req) => {
    setSelectedRequest(req)
    setRejectNotes('')
    setVideoUrl(null)
    setVideoLoading(true)

    try {
      const url = await db.verification.getVideoSignedUrl(req.video_url)
      setVideoUrl(url)
    } catch (err) {
      console.error('Video URL failed:', err)
      // Fallback to public URL
      const url = db.verification.getVideoUrl(req.video_url)
      setVideoUrl(url)
    }
    setVideoLoading(false)
  }

  // ── Approve ──
  const handleApprove = async () => {
    if (!selectedRequest) return
    setActionLoading(true)
    try {
      await db.verification.approve(selectedRequest.id, selectedRequest.user_id)
      addToast(`USER ${selectedRequest.user?.name?.toUpperCase() || 'UNKNOWN'} VERIFIED SUCCESSFULLY.`, 'success')
      setSelectedRequest(null)
      setVideoUrl(null)
      await loadRequests()
    } catch (err) {
      console.error('Approve failed:', err)
      addToast('APPROVAL FAILED: ' + err.message, 'error')
    }
    setActionLoading(false)
  }

  // ── Reject ──
  const handleReject = async () => {
    if (!selectedRequest) return
    setActionLoading(true)
    try {
      await db.verification.reject(selectedRequest.id, rejectNotes)
      addToast(`VERIFICATION REJECTED FOR ${selectedRequest.user?.name?.toUpperCase() || 'UNKNOWN'}.`, 'info')
      setSelectedRequest(null)
      setVideoUrl(null)
      setRejectNotes('')
      await loadRequests()
    } catch (err) {
      console.error('Reject failed:', err)
      addToast('REJECTION FAILED: ' + err.message, 'error')
    }
    setActionLoading(false)
  }

  const filtered = filter === 'all'
    ? requests
    : requests.filter(r => r.status === filter)

  const statusColor = (s) => {
    if (s === 'approved') return 'var(--s-primary)'
    if (s === 'rejected') return 'var(--s-tertiary)'
    return '#f59e0b'
  }

  const statusIcon = (s) => {
    if (s === 'approved') return <CheckCircle2 size={14} />
    if (s === 'rejected') return <XCircle size={14} />
    return <Clock size={14} />
  }

  const timeAgo = (date) => {
    const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000)
    if (mins < 1) return 'JUST NOW'
    if (mins < 60) return `${mins}m AGO`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h AGO`
    return `${Math.floor(hrs / 24)}d AGO`
  }

  // ── Password gate UI ──
  if (!authenticated) {
    return (
      <div className="page flex-center" style={{ minHeight: '100vh', flexDirection: 'column' }}>
        <div style={{ maxWidth: '420px', width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div className="label-caps" style={{ color: 'var(--s-tertiary)' }}>RESTRICTED ACCESS</div>
            <h2 className="headline-md" style={{ textTransform: 'uppercase', marginTop: '8px' }}>ADMIN TERMINAL</h2>
          </div>

          <form onSubmit={handleAuth}>
            <div className="glass-panel" style={{ padding: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <Lock size={20} color="var(--s-tertiary)" />
                <span className="label-caps" style={{ opacity: 0.5 }}>ENTER ADMIN CREDENTIALS</span>
              </div>

              <input
                type="password"
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                placeholder="ADMIN PASSWORD"
                className="admin-input"
                style={{
                  width: '100%',
                  padding: '16px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff',
                  fontFamily: 'Space Grotesk',
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  fontSize: '0.8rem',
                  marginBottom: '16px'
                }}
              />

              <button className="btn btn-primary neon-glow" type="submit" style={{ width: '100%' }}>
                AUTHENTICATE
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  // ── Admin Dashboard UI ──
  return (
    <div className="page" style={{ minHeight: '100vh', padding: '24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <div className="label-caps" style={{ color: 'var(--s-primary)' }}>VERIFICATION CENTER</div>
            <h2 className="headline-md" style={{ textTransform: 'uppercase', marginTop: '4px' }}>ADMIN PANEL</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Users size={16} color="var(--s-primary)" />
            <span className="label-caps" style={{ color: 'var(--s-primary)' }}>
              {requests.filter(r => r.status === 'pending').length} PENDING
            </span>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {['pending', 'approved', 'rejected', 'all'].map(f => (
            <button
              key={f}
              className={`btn ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '8px 20px', fontSize: '0.75rem' }}
              onClick={() => setFilter(f)}
            >
              {f.toUpperCase()} {f !== 'all' && `(${requests.filter(r => f === 'all' || r.status === f).length})`}
            </button>
          ))}
          <button className="btn btn-secondary" onClick={loadRequests} style={{ padding: '8px 20px', fontSize: '0.75rem', marginLeft: 'auto' }}>
            REFRESH QUEUE
          </button>
        </div>

        {/* Main layout: Queue + Preview */}
        <div style={{ display: 'flex', gap: '24px', minHeight: '500px' }}>
          {/* Queue panel */}
          <div className="glass-panel" style={{ flex: 1, padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <span className="label-caps" style={{ opacity: 0.5 }}>VERIFICATION QUEUE</span>
            </div>
            
            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
              {loading ? (
                <div className="flex-center" style={{ padding: '48px' }}>
                  <div className="label-caps animate-pulse" style={{ color: 'var(--s-primary)' }}>LOADING QUEUE...</div>
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex-center" style={{ padding: '48px', flexDirection: 'column', gap: '8px' }}>
                  <CheckCircle2 size={32} color="var(--s-primary)" />
                  <div className="label-caps" style={{ opacity: 0.5 }}>NO REQUESTS IN THIS CATEGORY</div>
                </div>
              ) : (
                filtered.map(req => (
                  <div
                    key={req.id}
                    onClick={() => selectRequest(req)}
                    className="admin-queue-item"
                    style={{
                      padding: '16px 24px',
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      cursor: 'pointer',
                      background: selectedRequest?.id === req.id ? 'rgba(206,238,147,0.05)' : 'transparent',
                      borderLeft: selectedRequest?.id === req.id ? '2px solid var(--s-primary)' : '2px solid transparent',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '50%',
                          background: 'rgba(206,238,147,0.1)', border: '1px solid rgba(206,238,147,0.2)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: 'Space Grotesk', fontSize: '0.7rem', color: 'var(--s-primary)'
                        }}>
                          {req.user?.initials || '??'}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{req.user?.name?.toUpperCase() || 'UNKNOWN USER'}</div>
                          <div className="label-caps" style={{ opacity: 0.4, fontSize: '10px' }}>
                            {req.user?.city?.toUpperCase() || 'GLOBAL'} · {timeAgo(req.created_at)}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: statusColor(req.status) }}>
                        {statusIcon(req.status)}
                        <span className="label-caps" style={{ fontSize: '10px' }}>{req.status.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Preview panel */}
          <div className="glass-panel" style={{ width: '480px', padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {!selectedRequest ? (
              <div className="flex-center" style={{ flex: 1, flexDirection: 'column', gap: '12px' }}>
                <Play size={32} style={{ opacity: 0.2 }} />
                <div className="label-caps" style={{ opacity: 0.3 }}>SELECT A REQUEST TO REVIEW</div>
              </div>
            ) : (
              <>
                {/* Video player */}
                <div style={{ position: 'relative', background: '#000', aspectRatio: '4/3' }}>
                  {videoLoading ? (
                    <div className="flex-center" style={{ position: 'absolute', inset: 0 }}>
                      <div className="label-caps animate-pulse" style={{ color: 'var(--s-primary)' }}>LOADING SECURE STREAM...</div>
                    </div>
                  ) : videoUrl ? (
                    <video
                      ref={videoPlayerRef}
                      src={videoUrl}
                      controls
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  ) : (
                    <div className="flex-center" style={{ position: 'absolute', inset: 0 }}>
                      <div className="label-caps" style={{ color: 'var(--s-tertiary)' }}>VIDEO UNAVAILABLE</div>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <div className="label-caps" style={{ opacity: 0.5, marginBottom: '4px' }}>APPLICANT</div>
                    <div style={{ fontSize: '1rem', fontWeight: 600 }}>{selectedRequest.user?.name?.toUpperCase() || 'UNKNOWN'}</div>
                  </div>

                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <div className="label-caps" style={{ opacity: 0.5, marginBottom: '4px' }}>LOCATION</div>
                      <div style={{ fontSize: '0.875rem' }}>{selectedRequest.user?.city?.toUpperCase() || 'NOT SET'}</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="label-caps" style={{ opacity: 0.5, marginBottom: '4px' }}>SUBMITTED</div>
                      <div style={{ fontSize: '0.875rem' }}>{timeAgo(selectedRequest.created_at)}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: statusColor(selectedRequest.status) }}>
                    {statusIcon(selectedRequest.status)}
                    <span className="label-caps">{selectedRequest.status.toUpperCase()}</span>
                  </div>

                  {/* Actions (only for pending) */}
                  {selectedRequest.status === 'pending' && (
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px', marginTop: 'auto' }}>
                      <textarea
                        value={rejectNotes}
                        onChange={e => setRejectNotes(e.target.value)}
                        placeholder="REJECTION NOTES (OPTIONAL)..."
                        rows={2}
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: '#fff',
                          fontFamily: 'Space Grotesk',
                          textTransform: 'uppercase',
                          letterSpacing: '0.1em',
                          fontSize: '0.7rem',
                          resize: 'none',
                          marginBottom: '12px'
                        }}
                      />
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                          className="btn btn-danger"
                          onClick={handleReject}
                          disabled={actionLoading}
                          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        >
                          <XCircle size={16} /> {actionLoading ? 'PROCESSING...' : 'REJECT'}
                        </button>
                        <button
                          className="btn btn-primary neon-glow"
                          onClick={handleApprove}
                          disabled={actionLoading}
                          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        >
                          <ShieldCheck size={16} /> {actionLoading ? 'PROCESSING...' : 'APPROVE'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Reviewed info (for already processed) */}
                  {selectedRequest.status !== 'pending' && selectedRequest.reviewed_at && (
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px', marginTop: 'auto' }}>
                      <div className="label-caps" style={{ opacity: 0.4, marginBottom: '4px' }}>REVIEWED</div>
                      <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>{new Date(selectedRequest.reviewed_at).toLocaleString()}</div>
                      {selectedRequest.reviewer_notes && (
                        <div style={{ marginTop: '8px', fontSize: '0.8rem', opacity: 0.7 }}>
                          NOTES: {selectedRequest.reviewer_notes.toUpperCase()}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
