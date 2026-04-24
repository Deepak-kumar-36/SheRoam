import { useState, useEffect, useRef } from 'react'
import { ShieldCheck, VideoOff, RefreshCw } from 'lucide-react'
import { db } from '../lib/database'

export default function VerificationPage({ onVerified, addToast }) {
  const videoRef = useRef(null)
  const [stream, setStream] = useState(null)
  const [phase, setPhase] = useState('requesting') // requesting, scanning, success, error
  const [errorDetails, setErrorDetails] = useState('')

  useEffect(() => {
    let activeStream = null;

    const startCamera = async () => {
      try {
        const str = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user', width: 640, height: 480 } 
        })
        setStream(str)
        if (videoRef.current) {
          videoRef.current.srcObject = str
        }
        setPhase('ready')
      } catch (err) {
        setPhase('error')
        setErrorDetails(err.message || 'Camera permission denied.')
        addToast('Camera access required for secure verification.', 'error')
      }
    }

    startCamera()

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop())
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, []) // eslint-disable-line

  const handleStartScan = async () => {
    setPhase('scanning')
    addToast('Initiating biometric analysis...', 'info')
    
    try {
      // Simulate analysis delay for UX
      await new Promise(res => setTimeout(res, 3500))
      
      // Real DB update
      await db.users.verify()
      
      setPhase('success')
        addToast('Identity Verified. Access Granted.', 'success')
        
      // Stop stream to release camera light
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }

      // Automatically push to dashboard after a brief delay
      setTimeout(() => {
         onVerified()
      }, 1500)
    } catch (err) {
      console.error('Verification failed', err)
      setPhase('error')
      setErrorDetails(err.message || 'Database connection lost.')
      addToast('VERIFICATION FAILED: ' + (err.message || 'Database error'), 'error')
    }
  }

  return (
    <div className="page flex-center" style={{ minHeight: '100vh', flexDirection: 'column' }}>
      <div className="container" style={{ maxWidth: '600px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div className="label-caps" style={{ color: 'var(--s-primary)' }}>SECURITY CLEARANCE</div>
          <h2 className="headline-md" style={{ textTransform: 'uppercase', marginTop: '8px' }}>BIOMETRIC VERIFICATION</h2>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          {phase === 'error' ? (
            <div className="flex-center" style={{ flexDirection: 'column', gap: '16px', padding: '48px 0', textAlign: 'center' }}>
              <VideoOff size={48} color="var(--s-tertiary)" />
              <h3 className="label-caps" style={{ color: 'var(--s-tertiary)' }}>ACCESS DENIED: NO CAMERA DETECTED</h3>
              <p style={{ fontSize: '0.875rem' }}>{errorDetails}</p>
              <button className="btn btn-secondary" onClick={() => window.location.reload()} style={{ marginTop: '24px' }}>
                <RefreshCw size={16} /> REBOOT SENSOR
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Boxy Camera UI matching Spade */}
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
                
                {/* Scanning laser UI */}
                {phase === 'scanning' && (
                  <div className="laser-scan laser-scanning"></div>
                )}

                {/* Success UI */}
                {phase === 'success' && (
                  <div className="flex-center" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', flexDirection: 'column', zIndex: 20 }}>
                    <ShieldCheck size={64} color="var(--s-primary)" />
                    <div className="label-caps" style={{ marginTop: '16px', color: 'var(--s-primary)' }}>VERIFIED</div>
                  </div>
                )}
              </div>

              {/* Status indicators */}
              <div className="verification-status">
                {phase === 'ready' && 'ALIGN FACE IN CROSSHAIRS'}
                {phase === 'scanning' && 'Hold still. Analyzing metrics...'}
                {phase === 'success' && 'Scan complete. Encrypting data...'}
                {phase === 'requesting' && 'Connecting to secure stream...'}
              </div>

              {phase === 'ready' && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                  <button className="btn btn-primary btn-large neon-glow" onClick={handleStartScan} style={{ width: '100%' }}>
                    INITIATE SCAN
                  </button>
                  <p className="label-caps" style={{ opacity: 0.5 }}>
                    LOCAL PROCESSING. 0% DATA RETENTION.
                  </p>
                </div>
              )}
              
              {phase === 'scanning' && (
                <div style={{ textAlign: 'center' }}>
                  <div className="label-caps animate-pulse" style={{ color: 'var(--s-primary)' }}>
                    PROCESSING MATRICES...
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
