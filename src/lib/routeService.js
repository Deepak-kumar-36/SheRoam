const ORS_KEY = import.meta.env.VITE_ORS_API_KEY

const ORS_BASE = 'https://api.openrouteservice.org'

/**
 * Get walking/driving route between two points using OpenRouteService
 * @param {number} startLng
 * @param {number} startLat
 * @param {number} endLng
 * @param {number} endLat
 * @param {string} profile - 'foot-walking' | 'driving-car' | 'cycling-regular'
 * @returns {{ coordinates: [lat, lng][], distance: number, duration: number, bbox: number[] }}
 */
export async function getRoute(startLat, startLng, endLat, endLng, profile = 'foot-walking') {
  const url = `${ORS_BASE}/v2/directions/${profile}`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': ORS_KEY
    },
    body: JSON.stringify({
      coordinates: [[startLng, startLat], [endLng, endLat]],
      instructions: false,
      geometry: true
    })
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message || `Route API error: ${res.status}`)
  }

  const data = await res.json()
  const route = data.routes?.[0]
  if (!route) throw new Error('No route found')

  // ORS returns coordinates as [lng, lat] — flip them for Leaflet [lat, lng]
  const coordinates = decodeGeometry(route.geometry)
  
  return {
    coordinates,
    distance: route.summary.distance, // meters
    duration: route.summary.duration, // seconds
    bbox: route.bbox || null
  }
}

/**
 * Decode ORS encoded polyline geometry into [[lat, lng]] array
 */
function decodeGeometry(encoded) {
  // ORS returns encoded polyline by default
  const coords = []
  let index = 0, lat = 0, lng = 0

  while (index < encoded.length) {
    let shift = 0, result = 0, byte
    do {
      byte = encoded.charCodeAt(index++) - 63
      result |= (byte & 0x1f) << shift
      shift += 5
    } while (byte >= 0x20)
    lat += (result & 1) ? ~(result >> 1) : (result >> 1)

    shift = 0
    result = 0
    do {
      byte = encoded.charCodeAt(index++) - 63
      result |= (byte & 0x1f) << shift
      shift += 5
    } while (byte >= 0x20)
    lng += (result & 1) ? ~(result >> 1) : (result >> 1)

    coords.push([lat / 1e5, lng / 1e5])
  }
  return coords
}

/**
 * Calculate safety score for a route based on nearby incidents and safe scores
 * @param {Array} routeCoords - [[lat, lng], ...]
 * @param {Array} incidents - [{ latitude, longitude, incident_type }, ...]
 * @param {Array} safeScores - [{ latitude, longitude, score }, ...]
 * @returns {{ overallScore: number, segments: { coords: [lat, lng][], color: string }[] }}
 */
export function calculateRouteSafety(routeCoords, incidents = [], safeScores = []) {
  if (routeCoords.length < 2) return { overallScore: 75, segments: [] }

  const INCIDENT_RADIUS_KM = 0.5 // 500m
  const SCORE_RADIUS_KM = 1

  // Break route into segments of ~10 points each
  const segmentSize = Math.max(2, Math.ceil(routeCoords.length / 15))
  const segments = []
  let totalScore = 0
  let segmentCount = 0

  for (let i = 0; i < routeCoords.length; i += segmentSize) {
    const segCoords = routeCoords.slice(i, i + segmentSize + 1)
    if (segCoords.length < 2) continue

    const midpoint = segCoords[Math.floor(segCoords.length / 2)]
    
    // Count nearby incidents
    const nearbyIncidents = incidents.filter(inc =>
      haversineKm(midpoint[0], midpoint[1], inc.latitude, inc.longitude) < INCIDENT_RADIUS_KM
    ).length

    // Average nearby safe scores
    const nearbyScores = safeScores.filter(s =>
      haversineKm(midpoint[0], midpoint[1], s.latitude, s.longitude) < SCORE_RADIUS_KM
    )
    const avgScore = nearbyScores.length > 0
      ? nearbyScores.reduce((sum, s) => sum + s.score, 0) / nearbyScores.length
      : 7 // default neutral

    // Calculate segment safety (0-100)
    let segSafety = (avgScore / 10) * 100
    segSafety -= nearbyIncidents * 12 // each incident reduces by 12%
    segSafety = Math.max(10, Math.min(100, segSafety))

    const color = segSafety >= 70 ? '#ceee93' : segSafety >= 45 ? '#f59e0b' : '#ff4a8d'

    segments.push({ coords: segCoords, safety: segSafety, color })
    totalScore += segSafety
    segmentCount++
  }

  const overallScore = segmentCount > 0 ? Math.round(totalScore / segmentCount) : 75

  return { overallScore, segments }
}

/**
 * Format distance (meters) to human readable
 */
export function formatDistance(meters) {
  if (meters < 1000) return `${Math.round(meters)}m`
  return `${(meters / 1000).toFixed(1)} km`
}

/**
 * Format duration (seconds) to human readable
 */
export function formatDuration(seconds) {
  if (seconds < 60) return `${Math.round(seconds)}s`
  const mins = Math.round(seconds / 60)
  if (mins < 60) return `${mins} min`
  const hrs = Math.floor(mins / 60)
  return `${hrs}h ${mins % 60}m`
}

/**
 * Haversine distance in km
 */
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}
