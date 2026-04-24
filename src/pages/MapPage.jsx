import { useState, useEffect, useRef } from 'react'
import { Map as MapIcon, Home, Compass, MapPin, Shield, AlertTriangle, X, ShieldAlert } from 'lucide-react'

// ── Static Map Zone Data ──────────────────────────────────────────────────────
const ZONES = [
  { id: 'z1', label: 'LE MARAIS',    type: 'safe',    color: '#ceee93', opacity: 0.18, path: 'M 200,120 L 310,120 L 310,230 L 200,230 Z', cx: 255, cy: 175, score: 91 },
  { id: 'z2', label: 'PIGALLE',      type: 'danger',  color: '#ff4a8d', opacity: 0.22, path: 'M 480,80  L 590,80  L 590,180 L 480,180 Z', cx: 535, cy: 130, score: 44 },
  { id: 'z3', label: 'CHAMPS-ÉLYSÉES', type: 'moderate', color: '#f59e0b', opacity: 0.18, path: 'M 320,200 L 460,200 L 460,290 L 320,290 Z', cx: 390, cy: 245, score: 68 },
  { id: 'z4', label: 'SAINT-GERMAIN', type: 'safe',   color: '#ceee93', opacity: 0.18, path: 'M 180,300 L 310,300 L 310,400 L 180,400 Z', cx: 245, cy: 350, score: 88 },
  { id: 'z5', label: 'BANLIEUE NORD', type: 'danger', color: '#ff4a8d', opacity: 0.22, path: 'M 580,160 L 700,160 L 700,280 L 580,280 Z', cx: 640, cy: 220, score: 38 },
  { id: 'z6', label: 'OPÉRA',        type: 'moderate', color: '#f59e0b', opacity: 0.18, path: 'M 340,110 L 470,110 L 470,195 L 340,195 Z', cx: 405, cy: 152, score: 72 },
  { id: 'z7', label: 'MONTMARTRE',   type: 'safe',   color: '#ceee93', opacity: 0.18, path: 'M 460,40  L 570,40  L 570,130 L 460,130 Z', cx: 515, cy: 85,  score: 84 },
  { id: 'z8', label: 'BELLEVILLE',   type: 'moderate', color: '#f59e0b', opacity: 0.18, path: 'M 600,80  L 720,80  L 720,165 L 600,165 Z', cx: 660, cy: 122, score: 61 },
]

const SHESTAYS = [
  { id: 's1', label: 'HOTEL BELLA',  x: 260, y: 160, score: 9.4, type: 'SheStay' },
  { id: 's2', label: 'HOSTEL LUNA',  x: 240, y: 340, score: 9.1, type: 'SheStay' },
  { id: 's3', label: 'VILLA AMARA',  x: 510, y: 75,  score: 9.7, type: 'SheStay' },
]

const SHEGUIDES = [
  { id: 'g1', label: 'AMARA K.', x: 390, y: 270, type: 'SheGuide', lang: 'FR/EN' },
  { id: 'g2', label: 'LÉA P.',   x: 400, y: 140, type: 'SheGuide', lang: 'FR/DE' },
]

// Route point pairs (from → to)
const ROUTE_SEGMENTS = [
  { x1: 260, y1: 160, x2: 390, y2: 245, type: 'safe' },
  { x1: 390, y1: 245, x2: 536, y2: 130, type: 'danger' },
  { x1: 536, y1: 130, x2: 510, y2: 75,  type: 'safe' },
  // safe detour
  { x1: 390, y1: 245, x2: 405, y2: 152, type: 'moderate' },
  { x1: 405, y1: 152, x2: 510, y2: 75,  type: 'safe' },
]

const USER_POS = { x: 260, y: 160 }

const ZONE_TYPE_LABELS = {
  safe: 'SAFE',
  moderate: 'MODERATE RISK',
  danger: 'HIGH RISK',
}

export default function MapPage({ navigate, addToast }) {
  const [safetyScore, setSafetyScore] = useState(82)
  const [scoreColor, setScoreColor] = useState('#ceee93')  
  const [scoreWarning, setScoreWarning] = useState(false)
  const [showRoute, setShowRoute] = useState(false)
  const [showZones, setShowZones] = useState(true)
  const [showStays, setShowStays] = useState(true)
  const [showGuides, setShowGuides] = useState(true)
  const [showUser, setShowUser] = useState(true)
  const [aiComplete, setAiComplete] = useState(false)
  const [aiAnalyzing, setAiAnalyzing] = useState(false)
  const [popup, setPopup] = useState(null)
  const routeAnimRef = useRef(null)

  const checkRouteSafety = () => {
    setAiAnalyzing(true)
    setShowRoute(true)

    // Animate score 82→62
    let current = 82
    const target = 62
    const step = () => {
      current -= 2
      setSafetyScore(current)
      if (current > target) {
        routeAnimRef.current = setTimeout(step, 40)
      } else {
        setSafetyScore(target)
        setScoreColor('#ff4a8d')
        setScoreWarning(true)
        setAiAnalyzing(false)
        setAiComplete(true)
        addToast('ROUTE PASSES THROUGH HIGH-RISK ZONES. SAFER DETOUR SUGGESTED.', 'error')
      }
    }
    routeAnimRef.current = setTimeout(step, 400)
  }

  const resetRoute = () => {
    clearTimeout(routeAnimRef.current)
    setSafetyScore(82)
    setScoreColor('#ceee93')
    setScoreWarning(false)
    setShowRoute(false)
    setAiComplete(false)
    setAiAnalyzing(false)
    addToast('ROUTE CLEARED.', 'info')
  }

  const handleZoneClick = (zone, e) => {
    const svgEl = e.currentTarget.closest('svg')
    const rect = svgEl.getBoundingClientRect()
    setPopup({
      label: zone.label,
      info: `${ZONE_TYPE_LABELS[zone.type]} — SAFETY SCORE: ${zone.score}/100`,
      x: (zone.cx / 900) * rect.width,
      y: (zone.cy / 540) * rect.height,
    })
    setTimeout(() => setPopup(null), 3000)
  }

  useEffect(() => () => clearTimeout(routeAnimRef.current), [])

  const scorePercent = (safetyScore / 100) * 283  // SVG circle circumference

  return (
    <div className="page" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Spade Toolbar */}
      <div className="glass-panel" style={{ margin: '24px 24px 0 24px', padding: '16px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', zIndex: 10 }}>
        <span className="label-caps" style={{ color: 'var(--s-primary)', marginRight: '16px' }}>COMMAND MAP</span>
        <button
          className={`btn ${showZones ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '8px 16px', fontSize: '0.75rem' }}
          onClick={() => setShowZones(v => !v)}
        ><MapIcon size={14} style={{ marginRight: 6 }} /> ZONES</button>
        <button
          className={`btn ${showStays ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '8px 16px', fontSize: '0.75rem' }}
          onClick={() => setShowStays(v => !v)}
        ><Home size={14} style={{ marginRight: 6 }} /> STAYS</button>
        <button
          className={`btn ${showGuides ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '8px 16px', fontSize: '0.75rem' }}
          onClick={() => setShowGuides(v => !v)}
        ><Compass size={14} style={{ marginRight: 6 }} /> GUIDES</button>
        <button
          className={`btn ${showUser ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '8px 16px', fontSize: '0.75rem' }}
          onClick={() => setShowUser(v => !v)}
        ><MapPin size={14} style={{ marginRight: 6 }} /> LOCATION</button>
        <div style={{ flex: 1 }}></div>
        <button
          className="btn btn-primary"
          style={{ padding: '8px 16px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          onClick={checkRouteSafety}
          disabled={aiAnalyzing || showRoute}
        >
          {aiAnalyzing ? 'ANALYZING…' : <><Shield size={16} /> CHECK ROUTE SAFETY</>}
        </button>
        {showRoute && (
          <button className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={resetRoute}>
            <X size={16} /> RESET
          </button>
        )}
      </div>

      {/* Map Body */}
      <div style={{ display: 'flex', flex: 1, padding: '24px', gap: '24px', minHeight: 0 }}>
        {/* Canvas SVG Map */}
        <div className="glass-panel" style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <svg viewBox="0 0 900 540" width="100%" height="100%" style={{ display: 'block' }}>
            <rect width="900" height="540" fill="#000000"/>
            {/* Grid */}
            <defs>
              <pattern id="gridMap" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="900" height="540" fill="url(#gridMap)"/>

            <text x="20" y="520" fill="rgba(255,255,255,0.3)" fontSize="10" fontFamily="Space Grotesk" style={{ letterSpacing: '0.2em' }}>PARIS · TERMINAL MAP</text>

            {/* Zones */}
            {showZones && ZONES.map(z => (
              <g key={z.id} onClick={e => handleZoneClick(z, e)} style={{ cursor: 'pointer' }}>
                <path d={z.path} fill={z.color} fillOpacity={z.opacity} stroke={z.color} strokeOpacity={0.4} strokeWidth="1"/>
                <text x={z.cx} y={z.cy - 6} textAnchor="middle" fill={z.color} fontSize="10" fontFamily="Space Grotesk" style={{ letterSpacing: '0.1em' }}>{z.label}</text>
                <text x={z.cx} y={z.cy + 10} textAnchor="middle" fill={z.color} fontSize="8" fontFamily="Space Grotesk" fillOpacity={0.8}>{z.score}/100</text>
              </g>
            ))}

            {/* Route Lines */}
            {showRoute && ROUTE_SEGMENTS.map((seg, i) => (
              <line key={i} x1={seg.x1} y1={seg.y1} x2={seg.x2} y2={seg.y2} stroke={seg.type === 'safe' ? '#ceee93' : seg.type === 'danger' ? '#ff4a8d' : '#f59e0b'} strokeWidth="2" strokeDasharray={seg.type === 'safe' ? "4 4" : "none"} />
            ))}

            {showRoute && (
              <>
                <circle cx={260} cy={160} r={6} fill="var(--s-primary)" />
                <circle cx={510} cy={75}  r={6} fill="#ceee93" />
                <text x={270} y={157} fill="var(--s-primary)" fontSize="8" fontFamily="Space Grotesk">START</text>
                <text x={520} y={72}  fill="#ceee93" fontSize="8" fontFamily="Space Grotesk">END</text>
              </>
            )}

            {/* Stays */}
            {showStays && SHESTAYS.map(m => (
              <g key={m.id} style={{ cursor: 'pointer' }} onClick={() => addToast(`${m.label} — SheStay Verified (${m.score})`, 'success')}>
                <rect x={m.x-10} y={m.y-10} width="20" height="20" fill="rgba(206,238,147,0.1)" stroke="#ceee93" strokeWidth="1"/>
                <text x={m.x} y={m.y + 22} textAnchor="middle" fill="#ceee93" fontSize="8" fontFamily="Space Grotesk" letterSpacing="0.1em">{m.label}</text>
              </g>
            ))}

            {/* Guides */}
            {showGuides && SHEGUIDES.map(m => (
              <g key={m.id} style={{ cursor: 'pointer' }} onClick={() => addToast(`${m.label} — SheGuide (${m.lang})`, 'info')}>
                <circle cx={m.x} cy={m.y} r={10} fill="rgba(255,255,255,0.1)" stroke="#fff" strokeWidth="1"/>
                <text x={m.x} y={m.y + 22} textAnchor="middle" fill="#fff" fontSize="8" fontFamily="Space Grotesk" letterSpacing="0.1em">{m.label}</text>
              </g>
            ))}

            {/* Location */}
            {showUser && (
              <g>
                <circle cx={USER_POS.x} cy={USER_POS.y} r={24} fill="rgba(206,238,147,0.1)">
                  <animate attributeName="r" values="20;30;20" dur="2s" repeatCount="indefinite"/>
                  <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite"/>
                </circle>
                <circle cx={USER_POS.x} cy={USER_POS.y} r={6} fill="var(--s-primary)" />
                <rect x={USER_POS.x - 38} y={USER_POS.y - 30} width={76} height={16} fill="#000" stroke="var(--s-primary)" strokeWidth="1"/>
                <text x={USER_POS.x} y={USER_POS.y - 19} textAnchor="middle" fill="var(--s-primary)" fontSize="8" fontFamily="Space Grotesk">YOU ARE HERE</text>
              </g>
            )}
          </svg>

          {/* Zone popup */}
          {popup && (
            <div className="glass-panel" style={{ position: 'absolute', left: popup.x + 12, top: popup.y + 12, padding: '12px', zIndex: 10 }}>
              <div className="label-caps">{popup.label}</div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>{popup.info}</div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <span className="label-caps">LIVE SAFETY SCORE</span>
            <svg width="120" height="120" viewBox="0 0 100 100" style={{ margin: '24px 0' }}>
              <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4"/>
              <circle
                cx="50" cy="50" r="45" fill="none"
                stroke={scoreColor}
                strokeWidth="4"
                strokeDasharray={`${scorePercent} 283`}
                transform="rotate(-90 50 50)"
                style={{ transition: 'stroke-dasharray 0.5s ease, stroke 0.5s ease' }}
              />
              <text x="50" y="55" fontSize="24" fontFamily="Space Grotesk" fill={scoreColor} textAnchor="middle" fillOpacity="1">{safetyScore}%</text>
            </svg>
            <div className="label-caps" style={{ opacity: 0.5 }}>PARIS, FR</div>

            {scoreWarning && (
              <div style={{ color: '#ff4a8d', fontSize: '0.75rem', marginTop: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={14} /> ROUTE RISK DETECTED
              </div>
            )}
          </div>

          <div className="glass-panel" style={{ padding: '24px', flex: 1 }}>
            <div className="label-caps" style={{ marginBottom: '16px' }}>LEGEND</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem' }}><div style={{ width: 8, height: 8, background: '#ceee93' }}></div> SAFE ZONE</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem' }}><div style={{ width: 8, height: 8, background: '#f59e0b' }}></div> MODERATE RISK</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem' }}><div style={{ width: 8, height: 8, background: '#ff4a8d' }}></div> HIGH RISK</div>
            </div>
            
            {(aiAnalyzing || aiComplete) && (
              <div style={{ marginTop: '32px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="label-caps" style={{ color: 'var(--s-primary)', marginBottom: '8px' }}>
                  {aiAnalyzing ? 'ANALYZING...' : 'AI ANALYSIS COMPLETE'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                  {aiAnalyzing 
                    ? 'SCANNING ZONES, LIGHTING DATA, AND COMMUNITY REPORTS...' 
                    : 'ROUTE PASSES THROUGH 2 HIGH-RISK ZONES. DETOUR REDUCES RISK BY 38%.'}
                </div>
              </div>
            )}
          </div>

          <button
            className="btn btn-danger neon-glow"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '16px' }}
            onClick={() => navigate('sos')}
          >
            <ShieldAlert size={16} /> INITIATE SOS
          </button>
        </div>
      </div>
    </div>
  )
}
