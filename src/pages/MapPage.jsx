import { useState, useEffect, useRef, useMemo } from 'react'
import { Search, Navigation, Map as MapIcon, Home, Compass, MapPin, Shield, AlertTriangle, X, ShieldAlert, Star, BarChart3, Route } from 'lucide-react'
import { MapContainer, TileLayer, CircleMarker, Polyline, Popup as LeafletPopup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { db } from '../lib/database'
import { getRoute, calculateRouteSafety, formatDistance, formatDuration } from '../lib/routeService'
import SafeScoreModal from '../components/SafeScoreModal'
import IncidentReportModal from '../components/IncidentReportModal'

// ── India defaults ──
const INDIA_CENTER = [22.5, 78.5]
const INDIA_ZOOM = 5

const TYPE_COLORS = {
  safe_zone: '#ceee93',
  moderate_zone: '#f59e0b',
  danger_zone: '#ff4a8d',
  shestay: '#9b59b6',
  sheguide: '#3498db'
}

const TYPE_LABELS = {
  safe_zone: 'SAFE ZONE',
  moderate_zone: 'MODERATE RISK',
  danger_zone: 'HIGH RISK',
  shestay: 'SHESTAY',
  sheguide: 'SHEGUIDE'
}

// Component to programmatically fly the map
function FlyToPoint({ coords, zoom }) {
  const map = useMap()
  useEffect(() => {
    if (coords) map.flyTo(coords, zoom || 14, { duration: 1.5 })
  }, [coords, zoom, map])
  return null
}

export default function MapPage({ navigate, addToast }) {
  // ── Core State ──
  const [userPos, setUserPos] = useState(INDIA_CENTER)
  const [mapCenter, setMapCenter] = useState(null) // for flying to locations
  const [mapZoom, setMapZoom] = useState(null)
  const [locations, setLocations] = useState([])
  const [incidents, setIncidents] = useState([])
  const [safeScores, setSafeScores] = useState([])
  const [loading, setLoading] = useState(true)

  // ── Search State ──
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const searchTimeout = useRef(null)

  // ── Routing State ──
  const [routeFrom, setRouteFrom] = useState('')
  const [routeTo, setRouteTo] = useState('')
  const [routeFromCoords, setRouteFromCoords] = useState(null)
  const [routeToCoords, setRouteToCoords] = useState(null)
  const [routeData, setRouteData] = useState(null) // { coordinates, distance, duration }
  const [routeSafety, setRouteSafety] = useState(null) // { overallScore, segments }
  const [routeLoading, setRouteLoading] = useState(false)
  const [showRoutePanel, setShowRoutePanel] = useState(false)

  // ── Layer Toggles ──
  const [showZones, setShowZones] = useState(true)
  const [showStays, setShowStays] = useState(true)
  const [showIncidents, setShowIncidents] = useState(true)
  const [showScores, setShowScores] = useState(false)

  // ── Modals ──
  const [scoreModal, setScoreModal] = useState(null) // { lat, lng, placeName }
  const [incidentModal, setIncidentModal] = useState(null) // { lat, lng, locationName }

  // ── Selected Location (for sidebar) ──
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [placeStats, setPlaceStats] = useState(null)

  // ── GPS ──
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setUserPos([pos.coords.latitude, pos.coords.longitude])
        },
        () => {} // Silently fail — use India center
      )
    }
  }, [])

  // ── Load data from Supabase ──
  useEffect(() => {
    const load = async () => {
      try {
        const [locs, incs, scores] = await Promise.allSettled([
          db.locations.getAll(),
          db.incidents.getForArea(22.5, 78.5, 2000), // All India
          db.safeScores.getForArea(22.5, 78.5, 2000)
        ])
        setLocations(locs.status === 'fulfilled' ? locs.value : [])
        setIncidents(incs.status === 'fulfilled' ? incs.value : [])
        setSafeScores(scores.status === 'fulfilled' ? scores.value : [])
      } catch (err) {
        console.error('Map data load error:', err)
      }
      setLoading(false)
    }
    load()
  }, [])

  // ── Nominatim Search (India-locked, debounced) ──
  const handleSearch = (query) => {
    setSearchQuery(query)
    clearTimeout(searchTimeout.current)
    if (query.length < 3) { setSearchResults([]); return }

    searchTimeout.current = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&countrycodes=in&format=json&limit=6`,
          { headers: { 'User-Agent': 'SheRoam-SafetyApp/1.0' } }
        )
        const data = await res.json()
        setSearchResults(data.map(r => ({
          name: r.display_name.split(',').slice(0, 3).join(', '),
          full: r.display_name,
          lat: parseFloat(r.lat),
          lng: parseFloat(r.lon)
        })))
      } catch {
        setSearchResults([])
      }
      setSearching(false)
    }, 500)
  }

  const selectSearchResult = (result) => {
    setMapCenter([result.lat, result.lng])
    setMapZoom(14)
    setSearchResults([])
    setSearchQuery(result.name)
    setSelectedPlace({ label: result.name, lat: result.lat, lng: result.lng })
    // Fetch stats for this place
    loadPlaceStats(result.name)
  }

  const loadPlaceStats = async (placeName) => {
    try {
      const [scoreData, incidentData] = await Promise.allSettled([
        db.safeScores.getAggregateForPlace(placeName),
        db.incidents.getStatsForPlace(placeName)
      ])
      setPlaceStats({
        scores: scoreData.status === 'fulfilled' ? scoreData.value : { avgScore: 0, totalRatings: 0, percentage: 0 },
        incidents: incidentData.status === 'fulfilled' ? incidentData.value : { totalIncidents: 0, breakdown: {} }
      })
    } catch {
      setPlaceStats(null)
    }
  }

  // ── Search for route endpoints ──
  const searchForRouteEndpoint = async (query, setter, coordsSetter) => {
    setter(query)
    if (query === 'MY LOCATION') {
      coordsSetter(userPos)
      return
    }
    if (query.length < 3) return
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&countrycodes=in&format=json&limit=1`,
        { headers: { 'User-Agent': 'SheRoam-SafetyApp/1.0' } }
      )
      const data = await res.json()
      if (data[0]) coordsSetter([parseFloat(data[0].lat), parseFloat(data[0].lon)])
    } catch {}
  }

  // ── Find Route ──
  const findRoute = async () => {
    if (!routeFromCoords || !routeToCoords) {
      addToast('SET BOTH START AND END LOCATIONS.', 'error')
      return
    }
    setRouteLoading(true)
    try {
      const data = await getRoute(routeFromCoords[0], routeFromCoords[1], routeToCoords[0], routeToCoords[1])
      setRouteData(data)

      // Calculate safety
      const safety = calculateRouteSafety(data.coordinates, incidents, safeScores)
      setRouteSafety(safety)

      // Fly to show the route
      const midLat = (routeFromCoords[0] + routeToCoords[0]) / 2
      const midLng = (routeFromCoords[1] + routeToCoords[1]) / 2
      setMapCenter([midLat, midLng])
      setMapZoom(10)

      addToast(`ROUTE FOUND: ${formatDistance(data.distance)} — SAFETY: ${safety.overallScore}%`, safety.overallScore >= 65 ? 'success' : 'error')
    } catch (err) {
      addToast('ROUTE ERROR: ' + err.message, 'error')
    }
    setRouteLoading(false)
  }

  const clearRoute = () => {
    setRouteData(null)
    setRouteSafety(null)
    setRouteFrom('')
    setRouteTo('')
    setRouteFromCoords(null)
    setRouteToCoords(null)
    addToast('ROUTE CLEARED.', 'info')
  }

  // ── Filter locations by type ──
  const zones = useMemo(() => locations.filter(l => ['safe_zone','moderate_zone','danger_zone'].includes(l.type)), [locations])
  const stays = useMemo(() => locations.filter(l => l.type === 'shestay'), [locations])
  const guides = useMemo(() => locations.filter(l => l.type === 'sheguide'), [locations])

  // ── Safety score for sidebar ──
  const overallSafetyScore = routeSafety?.overallScore || (selectedPlace ? (placeStats?.scores?.percentage || 75) : 75)
  const scoreColor = overallSafetyScore >= 70 ? '#ceee93' : overallSafetyScore >= 45 ? '#f59e0b' : '#ff4a8d'
  const scorePercent = (overallSafetyScore / 100) * 283

  return (
    <div className="page" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ── Top Toolbar ── */}
      <div className="glass-panel" style={{ margin: '24px 24px 0', padding: '12px 16px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', zIndex: 10 }}>
        <span className="label-caps" style={{ color: 'var(--s-primary)', marginRight: '8px' }}>THREAT MAP</span>

        {/* Search Bar */}
        <div style={{ position: 'relative', flex: '1 1 200px', minWidth: '200px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 12px' }}>
            <Search size={14} color="rgba(255,255,255,0.4)" />
            <input
              type="text"
              placeholder="Search any Indian city or place..."
              value={searchQuery}
              onChange={e => handleSearch(e.target.value)}
              style={{
                flex: 1, background: 'none', border: 'none', color: '#fff',
                fontFamily: 'Space Grotesk', fontSize: '0.75rem', outline: 'none',
                letterSpacing: '0.05em'
              }}
            />
            {searching && <span className="label-caps" style={{ fontSize: '9px', color: 'var(--s-primary)' }}>SEARCHING...</span>}
          </div>

          {/* Search Dropdown */}
          {searchResults.length > 0 && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
              background: 'rgba(10,10,10,0.95)', border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(20px)', maxHeight: '240px', overflow: 'auto'
            }}>
              {searchResults.map((r, i) => (
                <div
                  key={i}
                  onClick={() => selectSearchResult(r)}
                  style={{
                    padding: '12px 16px', cursor: 'pointer',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={e => e.target.style.background = 'rgba(206,238,147,0.08)'}
                  onMouseLeave={e => e.target.style.background = 'transparent'}
                >
                  <div className="label-caps" style={{ fontSize: '10px' }}>{r.name}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Layer Toggles */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button className={`btn ${showZones ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '6px 12px', fontSize: '0.65rem' }} onClick={() => setShowZones(v => !v)}>
            <MapIcon size={12} style={{ marginRight: 4 }} /> ZONES
          </button>
          <button className={`btn ${showStays ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '6px 12px', fontSize: '0.65rem' }} onClick={() => setShowStays(v => !v)}>
            <Home size={12} style={{ marginRight: 4 }} /> STAYS
          </button>
          <button className={`btn ${showIncidents ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '6px 12px', fontSize: '0.65rem' }} onClick={() => setShowIncidents(v => !v)}>
            <AlertTriangle size={12} style={{ marginRight: 4 }} /> INCIDENTS
          </button>
          <button className={`btn ${showRoutePanel ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '6px 12px', fontSize: '0.65rem' }} onClick={() => setShowRoutePanel(v => !v)}>
            <Route size={12} style={{ marginRight: 4 }} /> ROUTE
          </button>
        </div>
      </div>

      {/* ── Map Body ── */}
      <div style={{ display: 'flex', flex: 1, padding: '24px', gap: '24px', minHeight: 0 }}>
        {/* Map Canvas */}
        <div className="glass-panel" style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          {loading && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="label-caps" style={{ color: 'var(--s-primary)' }}>LOADING THREAT DATA...</span>
            </div>
          )}
          <MapContainer center={INDIA_CENTER} zoom={INDIA_ZOOM} style={{ width: '100%', height: '100%', background: '#000' }} zoomControl={false}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution="&copy; CARTO" />
            {mapCenter && <FlyToPoint coords={mapCenter} zoom={mapZoom} />}

            {/* Zones */}
            {showZones && zones.map(z => (
              <CircleMarker
                key={z.id}
                center={[z.latitude, z.longitude]}
                radius={12}
                pathOptions={{ fillColor: TYPE_COLORS[z.type], fillOpacity: 0.25, color: TYPE_COLORS[z.type], weight: 1.5 }}
                eventHandlers={{
                  click: () => {
                    setSelectedPlace(z)
                    loadPlaceStats(z.label)
                    setMapCenter([z.latitude, z.longitude])
                    setMapZoom(14)
                  }
                }}
              >
                <LeafletPopup>
                  <div style={{ background: '#111', color: '#fff', padding: '8px', fontFamily: 'Space Grotesk', fontSize: '0.7rem' }}>
                    <div style={{ fontWeight: 600 }}>{z.label}</div>
                    <div style={{ color: TYPE_COLORS[z.type], marginTop: '4px' }}>{TYPE_LABELS[z.type]}{z.score ? ` — ${z.score}/100` : ''}</div>
                  </div>
                </LeafletPopup>
              </CircleMarker>
            ))}

            {/* Stays */}
            {showStays && stays.map(s => (
              <CircleMarker
                key={s.id}
                center={[s.latitude, s.longitude]}
                radius={7}
                pathOptions={{ fillColor: '#9b59b6', fillOpacity: 0.6, color: '#9b59b6', weight: 2 }}
                eventHandlers={{ click: () => addToast(`${s.label} — VERIFIED SHESTAY (${s.score}/100)`, 'success') }}
              />
            ))}

            {/* Guides */}
            {showStays && guides.map(g => (
              <CircleMarker
                key={g.id}
                center={[g.latitude, g.longitude]}
                radius={6}
                pathOptions={{ fillColor: '#3498db', fillOpacity: 0.6, color: '#3498db', weight: 2 }}
                eventHandlers={{ click: () => addToast(`${g.label} — ${g.metadata?.lang || 'GUIDE'}`, 'info') }}
              />
            ))}

            {/* Incident markers */}
            {showIncidents && incidents.map(inc => (
              <CircleMarker
                key={inc.id}
                center={[inc.latitude, inc.longitude]}
                radius={5}
                pathOptions={{ fillColor: '#ff4a8d', fillOpacity: 0.7, color: '#ff4a8d', weight: 1 }}
              >
                <LeafletPopup>
                  <div style={{ background: '#111', color: '#fff', padding: '8px', fontFamily: 'Space Grotesk', fontSize: '0.7rem' }}>
                    <div style={{ color: '#ff4a8d', fontWeight: 600 }}>{inc.incident_type.toUpperCase()}</div>
                    <div style={{ marginTop: '4px' }}>{inc.location_name}</div>
                    {inc.description && <div style={{ opacity: 0.6, marginTop: '4px' }}>{inc.description}</div>}
                  </div>
                </LeafletPopup>
              </CircleMarker>
            ))}

            {/* Safe Score markers */}
            {showScores && safeScores.map(s => (
              <CircleMarker
                key={s.id}
                center={[s.latitude, s.longitude]}
                radius={4}
                pathOptions={{
                  fillColor: s.score >= 7 ? '#ceee93' : s.score >= 4 ? '#f59e0b' : '#ff4a8d',
                  fillOpacity: 0.5, color: 'transparent'
                }}
              />
            ))}

            {/* Route polylines */}
            {routeSafety?.segments.map((seg, i) => (
              <Polyline
                key={`route-${i}`}
                positions={seg.coords}
                pathOptions={{ color: seg.color, weight: 5, opacity: 0.85 }}
              />
            ))}

            {/* Route endpoints */}
            {routeFromCoords && routeData && (
              <CircleMarker center={routeFromCoords} radius={8} pathOptions={{ fillColor: '#ceee93', fillOpacity: 1, color: '#ceee93', weight: 2 }} />
            )}
            {routeToCoords && routeData && (
              <CircleMarker center={routeToCoords} radius={8} pathOptions={{ fillColor: '#ff4a8d', fillOpacity: 1, color: '#ff4a8d', weight: 2 }} />
            )}

            {/* User Position */}
            <CircleMarker center={userPos} radius={6} pathOptions={{ fillColor: 'var(--s-primary)', fillOpacity: 0.9, color: '#fff', weight: 2 }} />
          </MapContainer>
        </div>

        {/* ── Sidebar ── */}
        <div style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>

          {/* Route Panel */}
          {showRoutePanel && (
            <div className="glass-panel" style={{ padding: '20px' }}>
              <div className="label-caps" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--s-primary)' }}>
                <Route size={14} /> SAFE ROUTE FINDER
              </div>

              {/* FROM */}
              <div style={{ marginBottom: '12px' }}>
                <div className="label-caps" style={{ fontSize: '9px', opacity: 0.5, marginBottom: '4px' }}>FROM</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={routeFrom}
                    onBlur={() => searchForRouteEndpoint(routeFrom, setRouteFrom, setRouteFromCoords)}
                    onChange={e => setRouteFrom(e.target.value)}
                    placeholder="Search or type location..."
                    className="route-input"
                  />
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '6px 10px', fontSize: '0.6rem', whiteSpace: 'nowrap' }}
                    onClick={() => { setRouteFrom('MY LOCATION'); setRouteFromCoords(userPos) }}
                  >
                    <Navigation size={10} /> GPS
                  </button>
                </div>
              </div>

              {/* TO */}
              <div style={{ marginBottom: '16px' }}>
                <div className="label-caps" style={{ fontSize: '9px', opacity: 0.5, marginBottom: '4px' }}>TO</div>
                <input
                  type="text"
                  value={routeTo}
                  onBlur={() => searchForRouteEndpoint(routeTo, setRouteTo, setRouteToCoords)}
                  onChange={e => setRouteTo(e.target.value)}
                  placeholder="Search destination..."
                  className="route-input"
                />
              </div>

              <button
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.75rem' }}
                onClick={findRoute}
                disabled={routeLoading}
              >
                <Shield size={14} /> {routeLoading ? 'ANALYZING...' : 'FIND SAFEST ROUTE'}
              </button>

              {routeData && (
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span className="label-caps" style={{ opacity: 0.5 }}>DISTANCE</span>
                    <span className="label-caps">{formatDistance(routeData.distance)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span className="label-caps" style={{ opacity: 0.5 }}>EST. TIME</span>
                    <span className="label-caps">{formatDuration(routeData.duration)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span className="label-caps" style={{ opacity: 0.5 }}>SAFETY</span>
                    <span className="label-caps" style={{ color: scoreColor }}>{routeSafety?.overallScore}%</span>
                  </div>

                  {routeSafety && routeSafety.overallScore < 60 && (
                    <div style={{ padding: '8px 12px', background: 'rgba(255,75,141,0.1)', border: '1px solid rgba(255,75,141,0.2)', marginBottom: '12px' }}>
                      <span className="label-caps" style={{ fontSize: '9px', color: '#ff4a8d', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <AlertTriangle size={12} /> ROUTE PASSES THROUGH HIGH-RISK AREAS
                      </span>
                    </div>
                  )}

                  <button className="btn btn-secondary" style={{ width: '100%', padding: '8px', fontSize: '0.65rem' }} onClick={clearRoute}>
                    <X size={12} /> CLEAR ROUTE
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Safety Score Ring */}
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <span className="label-caps">LIVE SAFETY SCORE</span>
            <svg width="100" height="100" viewBox="0 0 100 100" style={{ margin: '16px 0' }}>
              <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4"/>
              <circle cx="50" cy="50" r="45" fill="none" stroke={scoreColor} strokeWidth="4"
                strokeDasharray={`${scorePercent} 283`} transform="rotate(-90 50 50)"
                style={{ transition: 'stroke-dasharray 0.8s ease, stroke 0.5s ease' }} />
              <text x="50" y="55" fontSize="22" fontFamily="Space Grotesk" fill={scoreColor} textAnchor="middle">{overallSafetyScore}%</text>
            </svg>
            <div className="label-caps" style={{ opacity: 0.5, fontSize: '10px' }}>
              {selectedPlace ? selectedPlace.label?.toUpperCase() : 'INDIA — NATIONAL OVERVIEW'}
            </div>
          </div>

          {/* Place Stats (if selected) */}
          {selectedPlace && placeStats && (
            <div className="glass-panel" style={{ padding: '20px' }}>
              <div className="label-caps" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BarChart3 size={14} /> AREA INTEL
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <span className="label-caps" style={{ opacity: 0.5, fontSize: '10px' }}>COMMUNITY SCORE</span>
                <span className="label-caps" style={{ color: placeStats.scores.percentage >= 70 ? '#ceee93' : '#f59e0b' }}>
                  {placeStats.scores.percentage > 0 ? `${placeStats.scores.percentage}%` : 'N/A'} ({placeStats.scores.totalRatings} ratings)
                </span>
              </div>

              <div style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span className="label-caps" style={{ opacity: 0.5, fontSize: '10px' }}>INCIDENTS REPORTED</span>
                  <span className="label-caps" style={{ color: placeStats.incidents.totalIncidents > 0 ? '#ff4a8d' : '#ceee93' }}>
                    {placeStats.incidents.totalIncidents}
                  </span>
                </div>
                {Object.entries(placeStats.incidents.breakdown).map(([type, count]) => (
                  <div key={type} style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '12px', marginBottom: '4px' }}>
                    <span className="label-caps" style={{ opacity: 0.4, fontSize: '9px' }}>├─ {type.toUpperCase()}</span>
                    <span className="label-caps" style={{ fontSize: '9px' }}>{count}</span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '10px', fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  onClick={() => setScoreModal({ lat: selectedPlace.latitude || selectedPlace.lat, lng: selectedPlace.longitude || selectedPlace.lng, placeName: selectedPlace.label || selectedPlace.name })}
                >
                  <Star size={12} /> RATE
                </button>
                <button
                  className="btn btn-danger"
                  style={{ flex: 1, padding: '10px', fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  onClick={() => setIncidentModal({ lat: selectedPlace.latitude || selectedPlace.lat, lng: selectedPlace.longitude || selectedPlace.lng, locationName: selectedPlace.label || selectedPlace.name })}
                >
                  <AlertTriangle size={12} /> REPORT
                </button>
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div className="label-caps" style={{ marginBottom: '12px' }}>LEGEND</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.7rem' }}><div style={{ width: 8, height: 8, background: '#ceee93' }}></div> SAFE ZONE</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.7rem' }}><div style={{ width: 8, height: 8, background: '#f59e0b' }}></div> MODERATE RISK</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.7rem' }}><div style={{ width: 8, height: 8, background: '#ff4a8d' }}></div> HIGH RISK / INCIDENT</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.7rem' }}><div style={{ width: 8, height: 8, background: '#9b59b6', borderRadius: '50%' }}></div> SHESTAY</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.7rem' }}><div style={{ width: 8, height: 8, background: '#3498db', borderRadius: '50%' }}></div> SHEGUIDE</div>
            </div>
          </div>

          {/* SOS Button */}
          <button
            className="btn btn-danger neon-glow"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px' }}
            onClick={() => navigate('sos')}
          >
            <ShieldAlert size={16} /> INITIATE SOS
          </button>
        </div>
      </div>

      {/* ── Modals ── */}
      {scoreModal && (
        <SafeScoreModal
          lat={scoreModal.lat}
          lng={scoreModal.lng}
          placeName={scoreModal.placeName}
          onClose={() => setScoreModal(null)}
          addToast={addToast}
        />
      )}
      {incidentModal && (
        <IncidentReportModal
          lat={incidentModal.lat}
          lng={incidentModal.lng}
          locationName={incidentModal.locationName}
          onClose={() => setIncidentModal(null)}
          addToast={addToast}
        />
      )}
    </div>
  )
}
