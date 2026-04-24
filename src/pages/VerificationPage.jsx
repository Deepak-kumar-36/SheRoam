import { useState, useEffect, useRef } from 'react'
import { ShieldCheck, VideoOff, Camera, RefreshCw, ExternalLink } from 'lucide-react'

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
        addToast('We need camera access to verify your identity.', 'error')
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

  const handleStartScan = () => {
    setPhase('scanning')
    addToast('Analyzing facial features...', 'info')
    
    // Simulate 4 second AI analysis
    setTimeout(() => {
      setPhase('success')
      addToast('Identity Verified! Matches female biometrics.', 'success')
      
      // Stop stream to release camera light
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }

      // Automatically push to dashboard after a brief delay
      setTimeout(() => {
         onVerified()
      }, 1500)
    }, 4000)
  }

  return (
    <div className="verification-page">
      <div className="verification-header">
        <div className="brand">SheRoam</div>
        <h2>Identity Verification</h2>
        <p>To keep our community completely safe and authentic, we require a quick biometric check.</p>
      </div>

      <div className="verification-container">
        {phase === 'error' ? (
          <div className="video-error">
            <VideoOff size={48} color="var(--color-text-muted)" />
            <h3>Camera Access Required</h3>
            <p>{errorDetails}</p>
            <p style={{fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '8px'}}>
              SheRoam relies on a strict verification process. Please allow camera permissions in your browser.
            </p>
            <button className="btn btn-primary" onClick={() => window.location.reload()} style={{marginTop: '24px'}}>
              <RefreshCw size={18} /> Retry
            </button>
          </div>
        ) : (
          <div className={`video-wrapper ${phase === 'scanning' ? 'scanning' : ''} ${phase === 'success' ? 'success' : ''}`}>
            {/* The oval mask for the video feed */}
            <div className="video-mask">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted
                className="live-video"
              />
              
              {/* Scanning laser UI */}
              {phase === 'scanning' && (
                <>
                  <div className="scanning-laser"></div>
                  <div className="scanning-overlay"></div>
                </>
              )}

              {/* Success UI */}
              {phase === 'success' && (
                <div className="success-overlay">
                  <ShieldCheck size={64} color="#4ade80" />
                  <div style={{fontWeight: 600, marginTop: '8px', color: '#fff'}}>Verified</div>
                </div>
              )}
            </div>

            {/* Status indicators */}
            <div className="camera-status">
              {phase === 'ready' && 'Position your face fully within the oval.'}
              {phase === 'scanning' && 'Hold still. Analyzing metrics...'}
              {phase === 'success' && 'Scan complete. Encrypting data...'}
              {phase === 'requesting' && 'Connecting to secure stream...'}
            </div>
          </div>
        )}
      </div>

      {phase === 'ready' && (
        <div className="verification-actions">
           <button className="btn btn-primary btn-pulse" onClick={handleStartScan} style={{width: '100%', maxWidth: '300px'}}>
             <Camera size={20} /> Start Biometric Scan
           </button>
           <p className="privacy-notice">
             <ShieldCheck size={14} /> Images are processed locally on your device and never stored.
           </p>
        </div>
      )}
      
      {phase === 'scanning' && (
        <div className="verification-actions">
           <div className="ai-processing-badging">
              <span className="spinner"></span> Processing with SheRoam AI...
           </div>
        </div>
      )}
    </div>
  )
}
