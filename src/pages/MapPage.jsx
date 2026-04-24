import { useState, useEffect, useRef } from 'react'
import { Map as MapIcon, Home, Compass, MapPin, Shield, AlertTriangle, X, ShieldAlert } from 'lucide-react'

// ── Static Map Zone Data ──────────────────────────────────────────────────────
// SVG-coordinate zones (viewBox 0 0 900 540)
const ZONES = [
  { id: 'z1', label: 'Le Marais',    type: 'safe',    color: '#22c55e', opacity: 0.18, path: 'M 200,120 L 310,120 L 310,230 L 200,230 Z', cx: 255, cy: 175, score: 91 },
  { id: 'z2', label: 'Pigalle',      type: 'danger',  color: '#ff4a8d', opacity: 0.22, path: 'M 480,80  L 590,80  L 590,180 L 480,180 Z', cx: 535, cy: 130, score: 44 },
  { id: 'z3', label: 'Champs-Élysées', type: 'moderate', color: '#f59e0b', opacity: 0.18, path: 'M 320,200 L 460,200 L 460,290 L 320,290 Z', cx: 390, cy: 245, score: 68 },
  { id: 'z4', label: 'Saint-Germain', type: 'safe',   color: '#22c55e', opacity: 0.18, path: 'M 180,300 L 310,300 L 310,400 L 180,400 Z', cx: 245, cy: 350, score: 88 },
  { id: 'z5', label: 'Banlieue Nord', type: 'danger', color: '#ff4a8d', opacity: 0.22, path: 'M 580,160 L 700,160 L 700,280 L 580,280 Z', cx: 640, cy: 220, score: 38 },
  { id: 'z6', label: 'Opéra',        type: 'moderate', color: '#f59e0b', opacity: 0.18, path: 'M 340,110 L 470,110 L 470,195 L 340,195 Z', cx: 405, cy: 152, score: 72 },
  { id: 'z7', label: 'Montmartre',   type: 'safe',   color: '#22c55e', opacity: 0.18, path: 'M 460,40  L 570,40  L 570,130 L 460,130 Z', cx: 515, cy: 85,  score: 84 },
  { id: 'z8', label: 'Belleville',   type: 'moderate', color: '#f59e0b', opacity: 0.18, path: 'M 600,80  L 720,80  L 720,165 L 600,165 Z', cx: 660, cy: 122, score: 61 },
]

const SHESTAYS = [
  { id: 's1', label: 'Hotel Bella',  x: 260, y: 160, score: 9.4, type: 'SheStay' },
  { id: 's2', label: 'Hostel Luna',  x: 240, y: 340, score: 9.1, type: 'SheStay' },
  { id: 's3', label: 'Villa Amara',  x: 510, y: 75,  score: 9.7, type: 'SheStay' },
]

const SHEGUIDES = [
  { id: 'g1', label: 'Amara K.', x: 390, y: 270, type: 'SheGuide', lang: 'FR/EN' },
  { id: 'g2', label: 'Léa P.',   x: 400, y: 140, type: 'SheGuide', lang: 'FR/DE' },
]

// Route point pairs (from → to) in svg coordinates
const ROUTE_SEGMENTS = [
  { x1: 260, y1: 160, x2: 390, y2: 245, type: 'safe' },
  { x1: 390, y1: 245, x2: 536, y2: 130, type: 'danger' },   // passes Pigalle
  { x1: 536, y1: 130, x2: 510, y2: 75,  type: 'safe' },
  // safe detour
  { x1: 390, y1: 245, x2: 405, y2: 152, type: 'moderate' },
  { x1: 405, y1: 152, x2: 510, y2: 75,  type: 'safe' },
]

// User location
const USER_POS = { x: 260, y: 160 }

const ZONE_TYPE_LABELS = {
  safe: 'Safe',
  moderate: 'Moderate Risk',
  danger: 'High Risk',
}

export default function MapPage({ navigate, addToast }) {
  const [safetyScore, setSafetyScore] = useState(82)
  const [scoreColor, setScoreColor] = useState('#f3aeff')  // Stitch primary
  const [scoreWarning, setScoreWarning] = useState(false)
  const [showRoute, setShowRoute] = useState(false)
  const [showZones, setShowZones] = useState(true)
  const [showStays, setShowStays] = useState(true)
  const [showGuides, setShowGuides] = useState(true)
  const [showUser, setShowUser] = useState(true)
  const [aiComplete, setAiComplete] = useState(false)
  const [aiAnalyzing, setAiAnalyzing] = useState(false)
  const [popup, setPopup] = useState(null)  // { label, x, y, info }
  const routeAnimRef = useRef(null)

  // ── Check Route Safety ─────────────────────────────────────────────────────
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
        setScoreColor('#ff4a8d')   // Stitch tertiary-container = danger
        setScoreWarning(true)
        setAiAnalyzing(false)
        setAiComplete(true)
        addToast('Route passes through high-risk zones. Safer detour suggested.', 'error')
      }
    }
    routeAnimRef.current = setTimeout(step, 400)
  }

  // ── Reset ──────────────────────────────────────────────────────────────────
  const resetRoute = () => {
    clearTimeout(routeAnimRef.current)
    setSafetyScore(82)
    setScoreColor('#f3aeff')
    setScoreWarning(false)
    setShowRoute(false)
    setAiComplete(false)
    setAiAnalyzing(false)
    addToast('Route cleared.', 'info')
  }

  // Show popup on zone click
  const handleZoneClick = (zone, e) => {
    const svgEl = e.currentTarget.closest('svg')
    const rect = svgEl.getBoundingClientRect()
    setPopup({
      label: zone.label,
      info: `${ZONE_TYPE_LABELS[zone.type]} — Safety score: ${zone.score}/100`,
      x: (zone.cx / 900) * rect.width,
      y: (zone.cy / 540) * rect.height,
    })
    setTimeout(() => setPopup(null), 3000)
  }

  useEffect(() => () => clearTimeout(routeAnimRef.current), [])

  const scoreColorStyle = scoreColor
  const scorePercent = (safetyScore / 100) * 283  // SVG circle circumference

  return (
    <div className="map-page">
      {/* Stitch Toolbar */}
      <div className="map-toolbar">
        <span className="label-caps" style={{ color: 'var(--s-primary)', marginRight: 8 }}>Safety Map</span>
        <button
          className={`map-filter-btn ${showZones ? 'active' : ''}`}
          onClick={() => setShowZones(v => !v)}
          id="toggle-zones-btn"
        ><MapIcon size={14} style={{ marginRight: 6 }} /> Safety Zones</button>
        <button
          className={`map-filter-btn ${showStays ? 'active' : ''}`}
          onClick={() => setShowStays(v => !v)}
          id="toggle-stays-btn"
        ><Home size={14} style={{ marginRight: 6 }} /> SheStays</button>
        <button
          className={`map-filter-btn ${showGuides ? 'active' : ''}`}
          onClick={() => setShowGuides(v => !v)}
          id="toggle-guides-btn"
        ><Compass size={14} style={{ marginRight: 6 }} /> SheGuides</button>
        <button
          className={`map-filter-btn ${showUser ? 'active' : ''}`}
          onClick={() => setShowUser(v => !v)}
          id="toggle-user-btn"
        ><MapPin size={14} style={{ marginRight: 6 }} /> My Location</button>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            className="btn btn-primary"
            style={{ padding: '8px 20px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={checkRouteSafety}
            disabled={aiAnalyzing || showRoute}
            id="check-route-btn"
          >
            {aiAnalyzing ? 'Analyzing…' : <><Shield size={16} /> Check Route Safety</>}
          </button>
          {showRoute && (
            <button className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={resetRoute} id="reset-route-btn">
              <X size={16} /> Reset
            </button>
          )}
        </div>
      </div>

      {/* Map Body */}
      <div className="map-body">
        {/* ── Canvas SVG Map ──────────────────────────────────────────────── */}
        <div className="map-canvas" style={{ position: 'relative' }}>
          <svg
            viewBox="0 0 900 540"
            width="100%"
            height="100%"
            style={{ display: 'block' }}
          >
            {/* Background grid lines (Stitch decorative curves) */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>
              </pattern>
              <filter id="glow-green">
                <feGaussianBlur stdDeviation="3" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              <filter id="glow-red">
                <feGaussianBlur stdDeviation="4" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>
            <rect width="900" height="540" fill="#0d0d10"/>
            <rect width="900" height="540" fill="url(#grid)"/>

            {/* Decorative "road" lines */}
            {[
              'M 0,180 L 900,180', 'M 0,360 L 900,360',
              'M 150,0 L 150,540', 'M 450,0 L 450,540', 'M 720,0 L 720,540',
              'M 0,270 L 900,270', 'M 300,0 L 300,540',
            ].map((d, i) => (
              <path key={i} d={d} stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" fill="none"/>
            ))}

            {/* Labels */}
            <text x="20" y="530" fill="rgba(255,255,255,0.2)" fontSize="11" fontFamily="Manrope">Paris · SheRoam Safety Map</text>

            {/* ── Safety Zones ─────────────────────────────────────────── */}
            {showZones && ZONES.map(z => (
              <g
                key={z.id}
                onClick={e => handleZoneClick(z, e)}
                style={{ cursor: 'pointer' }}
              >
                <path
                  d={z.path}
                  fill={z.color}
                  fillOpacity={z.opacity}
                  stroke={z.color}
                  strokeOpacity={0.4}
                  strokeWidth="1.5"
                />
                <text x={z.cx} y={z.cy - 6} textAnchor="middle" fill={z.color} fontSize="10" fontWeight="700" fontFamily="Manrope">
                  {z.label}
                </text>
                <text x={z.cx} y={z.cy + 10} textAnchor="middle" fill={z.color} fontSize="9" fontFamily="Manrope" fillOpacity={0.85}>
                  {z.score}/100
                </text>
              </g>
            ))}

            {/* ── Route Lines ───────────────────────────────────────────── */}
            {showRoute && ROUTE_SEGMENTS.map((seg, i) => (
              <line
                key={i}
                x1={seg.x1} y1={seg.y1} x2={seg.x2} y2={seg.y2}
                className={`route-${seg.type}`}
                strokeLinecap="round"
              />
            ))}

            {/* Route origin/destination dots */}
            {showRoute && (
              <>
                <circle cx={260} cy={160} r={7} fill="var(--s-primary)" stroke="#fff" strokeWidth={2}/>
                <circle cx={510} cy={75}  r={7} fill="#22c55e" stroke="#fff" strokeWidth={2}/>
                <text x={270} y={157} fill="var(--s-primary)" fontSize="9" fontFamily="Manrope" fontWeight="700">START</text>
                <text x={520} y={72}  fill="#22c55e" fontSize="9" fontFamily="Manrope" fontWeight="700">END</text>
              </>
            )}

            {/* ── SheStay Markers ───────────────────────────────────────── */}
            {showStays && SHESTAYS.map(m => (
              <g
                key={m.id}
                style={{ cursor: 'pointer' }}
                onClick={() => addToast(`${m.label} — SheStay Verified (${m.score})`, 'success')}
              >
                <circle cx={m.x} cy={m.y} r={12} fill="rgba(34,197,94,0.15)" stroke="#22c55e" strokeWidth="1.5"/>
                {/* SVG Home Icon representation for the map marker */}
                <path d="M12 3l9 9h-3v9H6v-9H3l9-9z" fill="#4ade80" transform={`translate(${m.x - 12}, ${m.y - 12}) scale(1)`} />
                <text x={m.x} y={m.y + 22} textAnchor="middle" fill="#4ade80" fontSize="8" fontFamily="Manrope" fontWeight="700">{m.label}</text>
              </g>
            ))}

            {/* ── SheGuide Markers ──────────────────────────────────────── */}
            {showGuides && SHEGUIDES.map(m => (
              <g
                key={m.id}
                style={{ cursor: 'pointer' }}
                onClick={() => addToast(`${m.label} — SheGuide (${m.lang})`, 'info')}
              >
                <circle cx={m.x} cy={m.y} r={12} fill="rgba(243,174,255,0.12)" stroke="var(--s-primary)" strokeWidth="1.5"/>
                {/* SVG Compass Icon representation for the map marker */}
                <circle cx={m.x} cy={m.y} r="5" fill="none" stroke="var(--s-primary)" strokeWidth="2"/>
                <path d={`M${m.x} ${m.y-7} L${m.x+2} ${m.y-2} L${m.x+7} ${m.y} L${m.x+2} ${m.y+2} L${m.x} ${m.y+7} L${m.x-2} ${m.y+2} L${m.x-7} ${m.y} L${m.x-2} ${m.y-2} Z`} fill="var(--s-primary)"/>
                <text x={m.x} y={m.y + 22} textAnchor="middle" fill="var(--s-primary)" fontSize="8" fontFamily="Manrope" fontWeight="700">{m.label}</text>
              </g>
            ))}

            {/* ── User Location "You are here" ──────────────────────────── */}
            {showUser && (
              <g>
                <circle cx={USER_POS.x} cy={USER_POS.y} r={18} fill="rgba(216,74,255,0.08)" stroke="rgba(216,74,255,0.3)" strokeWidth="1">
                  <animate attributeName="r" values="16;22;16" dur="2s" repeatCount="indefinite"/>
                  <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2s" repeatCount="indefinite"/>
                </circle>
                <circle cx={USER_POS.x} cy={USER_POS.y} r={7} fill="var(--s-primary)" stroke="#fff" strokeWidth="2.5"/>
                {/* Label */}
                <rect x={USER_POS.x - 38} y={USER_POS.y - 30} width={76} height={18} rx={9} fill="rgba(19,19,22,0.88)" stroke="rgba(216,74,255,0.35)" strokeWidth="1"/>
                <text x={USER_POS.x} y={USER_POS.y - 18} textAnchor="middle" fill="var(--s-primary)" fontSize="9" fontWeight="700" fontFamily="Manrope">You are here</text>
              </g>
            )}
          </svg>

          {/* Zone popup */}
          {popup && (
            <div className="map-popup" style={{ left: popup.x + 12, top: popup.y + 12 }}>
              <div style={{ fontWeight: 700, color: 'var(--s-on-surface)', marginBottom: 4 }}>{popup.label}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--s-on-surface-variant)' }}>{popup.info}</div>
            </div>
          )}
        </div>

        {/* ── Stitch Sidebar ───────────────────────────────────────────────── */}
        <div className="map-sidebar">
          {/* Safety Score Ring */}
          <div className="map-score-ring">
            <span className="label-caps">Live Safety Score</span>
            <svg width="100" height="100" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8"/>
              <circle
                cx="50" cy="50" r="45" fill="none"
                stroke={scoreColorStyle}
                strokeWidth="8"
                strokeDasharray={`${scorePercent} 283`}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
                style={{ transition: 'stroke-dasharray 0.3s ease, stroke 0.5s ease' }}
              />
            </svg>
            <div className="map-score-num" style={{ color: scoreColorStyle }}>{safetyScore}%</div>
            <div className="map-score-label">Paris, FR</div>

            {scoreWarning && (
              <div className="score-warning">
                <AlertTriangle size={14} style={{ marginRight: 4 }} /> Route risk detected
              </div>
            )}
          </div>

          {/* AI Feedback */}
          {aiAnalyzing && (
            <div className="ai-feedback-card">
              <div className="ai-feedback-title">Analyzing route…</div>
              <div style={{ color: 'var(--s-on-surface-variant)', fontSize: '0.82rem' }}>Scanning zones, lighting data, and community reports…</div>
            </div>
          )}
          {aiComplete && !aiAnalyzing && (
            <div className="ai-feedback-card">
              <div className="ai-feedback-title">AI Safety Analysis Complete</div>
              <div style={{ color: 'var(--s-on-surface-variant)', fontSize: '0.82rem', lineHeight: 1.6 }}>
                This route passes through <span style={{ color: 'var(--s-tertiary)' }}>2 high-risk zones</span> (Pigalle, Banlieue Nord). A safer detour via Opéra reduces risk by <strong style={{ color: 'var(--s-primary)' }}>38%</strong>.
              </div>
            </div>
          )}

          {/* Legend */}
          <div>
            <div className="label-caps" style={{ marginBottom: 12 }}>Zone Legend</div>
            <div className="map-legend-item"><div className="legend-dot" style={{ background: '#22c55e' }}/>Safe zone</div>
            <div className="map-legend-item"><div className="legend-dot" style={{ background: '#f59e0b' }}/>Moderate risk</div>
            <div className="map-legend-item"><div className="legend-dot" style={{ background: '#ff4a8d' }}/>High risk</div>
            <div className="map-legend-item"><div className="legend-dot" style={{ background: 'var(--s-primary)' }}/>Your location</div>
            <div className="map-legend-item"><Home size={14} color="#4ade80" /> SheStay verified</div>
            <div className="map-legend-item"><Compass size={14} color="var(--s-primary)" /> SheGuide</div>
          </div>

          {/* Route legend */}
          {showRoute && (
            <div>
              <div className="label-caps" style={{ marginBottom: 12, marginTop: 12 }}>Route Lines</div>
              <div className="map-legend-item">
                <svg width="24" height="8"><line x1="0" y1="4" x2="24" y2="4" stroke="#22c55e" strokeWidth="3" strokeDasharray="5,3"/></svg>
                Safe segment
              </div>
              <div className="map-legend-item">
                <svg width="24" height="8"><line x1="0" y1="4" x2="24" y2="4" stroke="#f59e0b" strokeWidth="3"/></svg>
                Moderate
              </div>
              <div className="map-legend-item">
                <svg width="24" height="8"><line x1="0" y1="4" x2="24" y2="4" stroke="#ff4a8d" strokeWidth="3"/></svg>
                High risk
              </div>
            </div>
          )}

          {/* SOS CTA */}
          <button
            className="btn btn-danger"
            style={{ width: '100%', marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            onClick={() => navigate('sos')}
            id="map-sos-btn"
          >
            <ShieldAlert size={16} /> SOS Emergency
          </button>
        </div>
      </div>
    </div>
  )
}
