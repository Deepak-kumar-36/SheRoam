import { useState, useEffect, useRef } from 'react'
import { ShieldCheck, VideoOff, RefreshCw, Circle, Square, Upload, Clock, XCircle, ShieldAlert, Users } from 'lucide-react'
import { db } from '../lib/database'

const MAX_RECORD_SECONDS = 30

export default function VerificationPage({ onVerified, addToast }) {
  const videoRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)

  const [stream, setStream] = useState(null)
  const [phase, setPhase] = useState('loading')
  // loading → instructions → ready → recording → preview → uploading → submitted → approved → rejected → error
  const [errorDetails, setErrorDetails] = useState('')
  const [recordedBlob, setRecordedBlob] = useState(null)
  const [recordedUrl, setRecordedUrl] = useState(null)
  const [secondsLeft, setSecondsLeft] = useState(MAX_RECORD_SECONDS)
  const [existingStatus, setExistingStatus] = useState(null)
  const [rejectionNotes, setRejectionNotes] = useState('')

  // ── Check existing verification status on mount ──
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const request = await db.verification.getMyStatus()
        if (request) {
          setExistingStatus(request)
          if (request.status === 'approved') {
            setPhase('approved')
            setTimeout(() => onVerified(), 2000)
            return
          }
          if (request.status === 'pending') {
            setPhase('submitted')
            return
          }
          if (request.status === 'rejected') {
            setRejectionNotes(request.reviewer_notes || '')
            setPhase('rejected')
            return
          }
        }
        setPhase('instructions')
      } catch (err) {
        console.error('Status check failed:', err)
        setPhase('instructions')
      }
    }
    checkStatus()
  }, []) // eslint-disable-line

  // ── Start camera ──
  const startCamera = async () => {
    try {
      const str = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
        audio: true
      })
      setStream(str)
      if (videoRef.current) {
        videoRef.current.srcObject = str
      }
      setPhase('ready')
    } catch (err) {
      setPhase('error')
      setErrorDetails(err.message || 'Camera permission denied.')
      addToast('Camera access required for verification.', 'error')
    }
  }

  // ── Start recording ──
  const startRecording = () => {
    if (!stream) return
    chunksRef.current = []

    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' })
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data)
    }
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' })
      const url = URL.createObjectURL(blob)
      setRecordedBlob(blob)
      setRecordedUrl(url)
      setPhase('preview')
      // Stop camera
      stream.getTracks().forEach(t => t.stop())
    }

    mediaRecorderRef.current = recorder
    recorder.start()
    setPhase('recording')
    setSecondsLeft(MAX_RECORD_SECONDS)

    // Countdown timer
    timerRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          stopRecording()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  // ── Stop recording ──
  const stopRecording = () => {
    clearInterval(timerRef.current)
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
  }

  // ── Re-record ──
  const reRecord = () => {
    setRecordedBlob(null)
    setRecordedUrl(null)
    setPhase('loading')
    startCamera()
  }

  // ── Upload video ──
  const handleUpload = async () => {
    if (!recordedBlob) return
    setPhase('uploading')
    addToast('ENCRYPTING AND TRANSMITTING VIDEO...', 'info')

    try {
      const videoPath = await db.verification.uploadVideo(recordedBlob)
      await db.verification.submitRequest(videoPath)
      setPhase('submitted')
      addToast('VERIFICATION REQUEST SUBMITTED SUCCESSFULLY.', 'success')
    } catch (err) {
      console.error('Upload failed:', err)
      setPhase('preview') // Go back to preview so they can retry
      addToast('UPLOAD FAILED: ' + (err.message || 'Network error'), 'error')
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current)
      if (stream) stream.getTracks().forEach(t => t.stop())
    }
  }, [stream])

  // ── Render ──
  return (
    <div className="page flex-center" style={{ minHeight: '100vh', flexDirection: 'column' }}>
      <div className="container" style={{ maxWidth: '640px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div className="label-caps" style={{ color: 'var(--s-primary)' }}>SECURITY CLEARANCE</div>
          <h2 className="headline-md" style={{ textTransform: 'uppercase', marginTop: '8px' }}>IDENTITY VERIFICATION</h2>
        </div>

        {/* ── Instructions Phase ─────────────────────────────── */}
        {phase === 'instructions' && (
          <div className="glass-panel" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <ShieldAlert size={24} color="var(--s-primary)" />
              <span className="label-caps" style={{ color: 'var(--s-primary)', fontSize: '0.875rem' }}>VERIFICATION PROTOCOL</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
              <div className="glass-panel" style={{ padding: '16px', borderLeft: '2px solid var(--s-primary)' }}>
                <div className="label-caps" style={{ marginBottom: '8px', opacity: 0.5 }}>STEP 01</div>
                <div style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>
                  RECORD A SHORT VIDEO (MAX 30 SECONDS) SHOWING YOUR FACE CLEARLY AND ANY VALID GOVERNMENT-ISSUED ID PROOF.
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '16px', borderLeft: '2px solid var(--s-primary)' }}>
                <div className="label-caps" style={{ marginBottom: '8px', opacity: 0.5 }}>STEP 02</div>
                <div style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>
                  YOUR VIDEO WILL BE SECURELY TRANSMITTED TO OUR VERIFICATION CENTER FOR MANUAL REVIEW.
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '16px', borderLeft: '2px solid var(--s-primary)' }}>
                <div className="label-caps" style={{ marginBottom: '8px', opacity: 0.5 }}>STEP 03</div>
                <div style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>
                  ONCE APPROVED, YOU'LL GAIN FULL ACCESS TO THE SHEROAM NETWORK.
                </div>
              </div>
            </div>

            {/* Trust assurance */}
            <div className="glass-panel" style={{ padding: '16px', background: 'rgba(206,238,147,0.05)', border: '1px solid rgba(206,238,147,0.15)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <Users size={16} color="var(--s-primary)" />
                <span className="label-caps" style={{ color: 'var(--s-primary)' }}>SAFETY COMMITMENT</span>
              </div>
              <div style={{ fontSize: '0.8rem', lineHeight: 1.6, opacity: 0.8 }}>
                OUR VERIFICATION TEAM IS 100% FEMALE. YOUR VIDEO IS STORED WITH END-TO-END ENCRYPTION AND WILL BE DELETED AFTER REVIEW. YOUR PRIVACY IS NON-NEGOTIABLE.
              </div>
            </div>

            <button
              className="btn btn-primary btn-large neon-glow"
              onClick={startCamera}
              style={{ width: '100%', marginTop: '24px' }}
            >
              BEGIN VERIFICATION
            </button>
          </div>
        )}

        {/* ── Loading Phase ─────────────────────────────────── */}
        {phase === 'loading' && (
          <div className="glass-panel flex-center" style={{ padding: '64px', flexDirection: 'column', gap: '16px' }}>
            <div className="label-caps animate-pulse" style={{ color: 'var(--s-primary)' }}>INITIALIZING SECURE CHANNEL...</div>
          </div>
        )}

        {/* ── Error Phase ──────────────────────────────────── */}
        {phase === 'error' && (
          <div className="glass-panel flex-center" style={{ flexDirection: 'column', gap: '16px', padding: '48px 24px', textAlign: 'center' }}>
            <VideoOff size={48} color="var(--s-tertiary)" />
            <h3 className="label-caps" style={{ color: 'var(--s-tertiary)' }}>ACCESS DENIED: NO CAMERA DETECTED</h3>
            <p style={{ fontSize: '0.875rem', opacity: 0.7 }}>{errorDetails}</p>
            <button className="btn btn-secondary" onClick={() => window.location.reload()} style={{ marginTop: '24px' }}>
              <RefreshCw size={16} /> REBOOT SENSOR
            </button>
          </div>
        )}

        {/* ── Camera Ready / Recording ─────────────────────── */}
        {(phase === 'ready' || phase === 'recording') && (
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Camera viewport */}
              <div className="camera-wrapper">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />

                {/* Crosshairs overlay */}
                <div className="camera-overlay">
                  <div className="camera-crosshair crosshair-tl"></div>
                  <div className="camera-crosshair crosshair-tr"></div>
                  <div className="camera-crosshair crosshair-bl"></div>
                  <div className="camera-crosshair crosshair-br"></div>
                </div>

                {/* Recording indicator */}
                {phase === 'recording' && (
                  <div className="rec-indicator">
                    <div className="rec-dot"></div>
                    <span className="label-caps" style={{ color: '#ff4a8d' }}>REC · {secondsLeft}s</span>
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="verification-status">
                {phase === 'ready' && 'SHOW YOUR FACE AND ID PROOF. PRESS RECORD WHEN READY.'}
                {phase === 'recording' && `RECORDING IN PROGRESS — ${secondsLeft} SECONDS REMAINING`}
              </div>

              {/* Controls */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                {phase === 'ready' && (
                  <button className="btn btn-record" onClick={startRecording}>
                    <Circle size={20} fill="#ff4a8d" color="#ff4a8d" /> START RECORDING
                  </button>
                )}
                {phase === 'recording' && (
                  <button className="btn btn-record btn-record-active" onClick={stopRecording}>
                    <Square size={18} fill="#fff" color="#fff" /> STOP RECORDING
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Preview Phase ────────────────────────────────── */}
        {phase === 'preview' && recordedUrl && (
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div className="label-caps" style={{ color: 'var(--s-primary)', marginBottom: '16px' }}>REVIEW YOUR RECORDING</div>
            <div className="camera-wrapper">
              <video
                src={recordedUrl}
                controls
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div className="verification-status" style={{ marginTop: '16px' }}>
              REVIEW YOUR VIDEO. MAKE SURE YOUR FACE AND ID ARE CLEARLY VISIBLE.
            </div>
            <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
              <button className="btn btn-secondary" onClick={reRecord} style={{ flex: 1 }}>
                <RefreshCw size={16} /> RE-RECORD
              </button>
              <button className="btn btn-primary neon-glow" onClick={handleUpload} style={{ flex: 1 }}>
                <Upload size={16} /> SUBMIT FOR REVIEW
              </button>
            </div>
          </div>
        )}

        {/* ── Uploading Phase ──────────────────────────────── */}
        {phase === 'uploading' && (
          <div className="glass-panel flex-center" style={{ padding: '64px', flexDirection: 'column', gap: '16px' }}>
            <div className="laser-scan laser-scanning" style={{ position: 'relative', width: '100%', height: '4px' }}></div>
            <div className="label-caps animate-pulse" style={{ color: 'var(--s-primary)' }}>ENCRYPTING AND TRANSMITTING...</div>
            <div className="label-caps" style={{ opacity: 0.4, fontSize: '10px' }}>DO NOT CLOSE THIS WINDOW</div>
          </div>
        )}

        {/* ── Submitted / Pending Phase ─────────────────────── */}
        {phase === 'submitted' && (
          <div className="glass-panel flex-center" style={{ padding: '48px', flexDirection: 'column', gap: '24px', textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '2px solid #f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={40} color="#f59e0b" />
            </div>
            <div className="headline-sm" style={{ textTransform: 'uppercase' }}>VERIFICATION PENDING</div>
            <div className="label-caps" style={{ opacity: 0.6, lineHeight: 1.6 }}>
              YOUR VIDEO HAS BEEN SUBMITTED SUCCESSFULLY. OUR ALL-FEMALE VERIFICATION TEAM WILL REVIEW IT WITHIN 24 HOURS. YOU WILL BE NOTIFIED UPON APPROVAL.
            </div>
            <div className="glass-panel" style={{ padding: '12px 16px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', width: '100%' }}>
              <div className="label-caps" style={{ color: '#f59e0b', fontSize: '10px' }}>
                STATUS: UNDER REVIEW
              </div>
            </div>
          </div>
        )}

        {/* ── Approved Phase ────────────────────────────────── */}
        {phase === 'approved' && (
          <div className="glass-panel flex-center" style={{ padding: '48px', flexDirection: 'column', gap: '24px', textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '2px solid var(--s-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={40} color="var(--s-primary)" />
            </div>
            <div className="headline-sm" style={{ textTransform: 'uppercase', color: 'var(--s-primary)' }}>IDENTITY VERIFIED</div>
            <div className="label-caps" style={{ opacity: 0.6 }}>REDIRECTING TO COMMAND CENTER...</div>
          </div>
        )}

        {/* ── Rejected Phase ────────────────────────────────── */}
        {phase === 'rejected' && (
          <div className="glass-panel flex-center" style={{ padding: '48px', flexDirection: 'column', gap: '24px', textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '2px solid var(--s-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <XCircle size={40} color="var(--s-tertiary)" />
            </div>
            <div className="headline-sm" style={{ textTransform: 'uppercase', color: 'var(--s-tertiary)' }}>VERIFICATION REJECTED</div>
            {rejectionNotes && (
              <div className="glass-panel" style={{ padding: '16px', border: '1px solid rgba(255,180,171,0.2)', width: '100%' }}>
                <div className="label-caps" style={{ opacity: 0.5, marginBottom: '8px' }}>REVIEWER NOTES</div>
                <div style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>{rejectionNotes.toUpperCase()}</div>
              </div>
            )}
            <button className="btn btn-primary neon-glow" onClick={reRecord} style={{ width: '100%' }}>
              <RefreshCw size={16} /> SUBMIT NEW VIDEO
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
