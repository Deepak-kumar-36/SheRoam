import { useState, useEffect, useRef } from 'react'
import { Map as MapIcon, Home, Compass, MapPin, Shield, AlertTriangle, X, ShieldAlert } from 'lucide-react'

import { MapContainer, TileLayer, Polygon, CircleMarker, Marker, Popup as LeafletPopup, Polyline } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

// ── Real Map Zone Data (Paris coordinates) ───────────────────────────────────
const ZONES = [
  { id: 'z1', label: 'LE MARAIS',    type: 'safe',    color: '#ceee93', positions: [[48.86, 2.35], [48.865, 2.35], [48.865, 2.36], [48.86, 2.36]], score: 91 },
  { id: 'z2', label: 'PIGALLE',      type: 'danger',  color: '#ff4a8d', positions: [[48.88, 2.33], [48.885, 2.33], [48.885, 2.34], [48.88, 2.34]], score: 44 },
  { id: 'z3', label: 'CHAMPS-ÉLYSÉES', type: 'moderate', color: '#f59e0b', positions: [[48.87, 2.30], [48.875, 2.30], [48.875, 2.31], [48.87, 2.31]], score: 68 },
  { id: 'z4', label: 'SAINT-GERMAIN', type: 'safe',   color: '#ceee93', positions: [[48.85, 2.33], [48.855, 2.33], [48.855, 2.34], [48.85, 2.34]], score: 88 }
]

const SHESTAYS = [
  { id: 's1', label: 'HOTEL BELLA',  lat: 48.863, lng: 2.355, score: 9.4, type: 'SheStay' },
  { id: 's2', label: 'HOSTEL LUNA',  lat: 48.852, lng: 2.335, score: 9.1, type: 'SheStay' },
]

const SHEGUIDES = [
  { id: 'g1', label: 'AMARA K.', lat: 48.868, lng: 2.345, type: 'SheGuide', lang: 'FR/EN' }
]

// Route point pairs (from → to)
const ROUTE_SEGMENTS = [
  { positions: [[48.863, 2.355], [48.875, 2.31]], type: 'safe' }
]

const USER_POS = [48.863, 2.355]

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
  const [userPos, setUserPos] = useState(USER_POS)
  const [popup, setPopup] = useState(null)
  const routeAnimRef = useRef(null)

  useEffect(() => {
    if ('geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        pos => setUserPos([pos.coords.latitude, pos.coords.longitude]),
        err => console.error("GPS error:", err)
      )
      return () => navigator.geolocation.clearWatch(watchId)
    }
  }, [])

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
          <MapContainer center={userPos} zoom={13} style={{ width: '100%', height: '100%', background: '#000' }} zoomControl={false}>
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; CARTO'
            />
            {/* Zones */}
            {showZones && ZONES.map(z => (
              <Polygon 
                key={z.id} 
                positions={z.positions} 
                pathOptions={{ fillColor: z.color, fillOpacity: z.opacity || 0.2, color: z.color, weight: 1, opacity: 0.5 }}
                eventHandlers={{
                  click: () => {
                    setPopup({
                      label: z.label,
                      info: `${ZONE_TYPE_LABELS[z.type]} — SAFETY SCORE: ${z.score}/100`,
                      latlng: z.positions[0]
                    })
                    setTimeout(() => setPopup(null), 3000)
                  }
                }}
              />
            ))}

            {/* Route Lines */}
            {showRoute && ROUTE_SEGMENTS.map((seg, i) => (
              <Polyline
                key={i}
                positions={seg.positions}
                pathOptions={{ color: seg.type === 'safe' ? '#ceee93' : seg.type === 'danger' ? '#ff4a8d' : '#f59e0b', weight: 4, dashArray: seg.type === 'safe' ? "4 4" : "none" }}
              />
            ))}
            {showRoute && ROUTE_SEGMENTS.map((seg, i) => (
              <CircleMarker key={'start-'+i} center={seg.positions[0]} pathOptions={{ color: 'var(--s-primary)' }} radius={4} />
            ))}

            {/* Stays */}
            {showStays && SHESTAYS.map(m => (
              <CircleMarker 
                key={m.id} 
                center={[m.lat, m.lng]} 
                radius={6} 
                pathOptions={{ color: '#ceee93', fillColor: 'rgba(206,238,147,0.2)', fillOpacity: 1 }}
                eventHandlers={{
                  click: () => addToast(`${m.label} — SheStay Verified (${m.score})`, 'success')
                }}
              />
            ))}

            {/* Guides */}
            {showGuides && SHEGUIDES.map(m => (
              <CircleMarker 
                key={m.id} 
                center={[m.lat, m.lng]} 
                radius={6} 
                pathOptions={{ color: '#fff', fillColor: 'rgba(255,255,255,0.2)', fillOpacity: 1 }}
                eventHandlers={{
                  click: () => addToast(`${m.label} — SheGuide (${m.lang})`, 'info')
                }}
              />
            ))}

            {/* Location (User) */}
            {showUser && (
              <CircleMarker 
                center={userPos} 
                radius={8} 
                pathOptions={{ color: 'var(--s-primary)', weight: 2, fillOpacity: 0.8 }}
              />
            )}

            {/* Zone Popup */}
            {popup && (
              <LeafletPopup position={popup.latlng} closeButton={false}>
                <div style={{ padding: '8px', background: '#111', color: '#fff', border: '1px solid #333' }}>
                  <div className="label-caps">{popup.label}</div>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>{popup.info}</div>
                </div>
              </LeafletPopup>
            )}
          </MapContainer>
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
