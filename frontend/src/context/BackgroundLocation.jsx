import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { useAuth } from './AuthContext'
import { apiClient } from '../services/apiClient'

const BackgroundLocationContext = createContext(null)

export const useBackgroundLocation = () => useContext(BackgroundLocationContext)

export const BackgroundLocationProvider = ({ children, minIntervalMs = 10000, minDeltaMeters = 10 }) => {
  const { user } = useAuth()
  const [enabled, setEnabled] = useState(false)
  const [error, setError] = useState(null)
  const lastSentRef = useRef(0)
  const lastPosRef = useRef(null)
  const watchIdRef = useRef(null)

  useEffect(() => {
    // Solo activar para repartidores autenticados
    if (!user || user.rol !== 'repartidor') {
      cleanup()
      setEnabled(false)
      return
    }

    if (!('geolocation' in navigator)) {
      setError('Geolocation no soportada')
      setEnabled(false)
      return
    }

    let cancelled = false
    setError(null)

    // Intentar solicitar permiso proactivamente
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then((perm) => {
        if (perm.state === 'denied') setError('Permiso de ubicación denegado')
      }).catch(() => {})
    }

    const maybeSend = async (coords) => {
      const now = Date.now()
      const elapsed = now - lastSentRef.current
      const lat = coords.latitude
      const lng = coords.longitude

      // Filtrar por distancia mínima
      const prev = lastPosRef.current
      const movedEnough = !prev || distanceMeters(prev.lat, prev.lng, lat, lng) >= minDeltaMeters
      if (elapsed < minIntervalMs || !movedEnough) return

      try {
        await apiClient.location.update({ latitud: lat, longitud: lng })
        lastSentRef.current = now
        lastPosRef.current = { lat, lng }
      } catch (e) {
        // Mantener en silencio para no molestar al usuario; exponer en estado
        setError(e.response?.data?.message || e.message)
      }
    }

    // Arrancar watchPosition para updates continuos
    try {
      const id = navigator.geolocation.watchPosition(
        (pos) => {
          setEnabled(true)
          maybeSend(pos.coords)
        },
        (err) => {
          if (!cancelled) {
            setError(err.message)
            setEnabled(false)
          }
        },
        {
          enableHighAccuracy: true,
          maximumAge: 5000,
          timeout: 15000,
        }
      )
      watchIdRef.current = id
    } catch (e) {
      setError(e.message)
      setEnabled(false)
    }

    return () => {
      cancelled = true
      cleanup()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.rol])

  const cleanup = () => {
    if (watchIdRef.current !== null && navigator.geolocation && navigator.geolocation.clearWatch) {
      try { navigator.geolocation.clearWatch(watchIdRef.current) } catch {}
    }
    watchIdRef.current = null
  }

  const value = { enabled, error }
  return (
    <BackgroundLocationContext.Provider value={value}>
      {children}
    </BackgroundLocationContext.Provider>
  )
}

// Distancia aproximada en metros (Haversine)
function distanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000
  const toRad = (d) => d * Math.PI / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a = Math.sin(dLat/2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export default BackgroundLocationProvider

