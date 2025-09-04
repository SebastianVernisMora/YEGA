export async function reverseGeocode(lat, lng) {
  try {
    const token = import.meta.env.VITE_MAPBOX_TOKEN || import.meta.env.MAPBOX_TOKEN
    if (!token) return null
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(lng)},${encodeURIComponent(lat)}.json?access_token=${token}&language=es&limit=1`
    const res = await fetch(url)
    if (!res.ok) return null
    const data = await res.json()
    const feature = data.features?.[0]
    if (!feature) return null
    const place = feature.place_name || ''
    return place
  } catch {
    return null
  }
}
