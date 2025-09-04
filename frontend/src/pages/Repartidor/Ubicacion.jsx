import React, { useEffect, useRef, useState } from 'react'
import { Container, Row, Col, Button, Alert, Form, Badge } from 'react-bootstrap'
import { apiClient } from '../../services/apiClient'
import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from 'react-leaflet'

const RepartidorUbicacion = () => {
  const [coords, setCoords] = useState(null)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState(null)
  const [direccion, setDireccion] = useState('')
  const [intervalo, setIntervalo] = useState(15)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => setError(err.message)
    )
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const enviarUbicacion = async () => {
    if (!coords) return
    try {
      setStatus('sending')
      await apiClient.location.update({ latitud: coords.lat, longitud: coords.lng, direccion })
      setStatus('ok')
      setTimeout(() => setStatus('idle'), 2000)
    } catch (e) {
      setError(e.response?.data?.message || e.message)
      setStatus('idle')
    }
  }

  // Arranque automático de envío en background al montar
  useEffect(() => {
    if (!navigator.geolocation) return
    intervalRef.current = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
          apiClient.location.update({ latitud: pos.coords.latitude, longitud: pos.coords.longitude, direccion })
            .catch(() => {})
        },
        () => {}
      )
    }, Math.max(5, intervalo) * 1000)
    return () => intervalRef.current && clearInterval(intervalRef.current)
  }, [intervalo, direccion])

  const FitToCoord = ({ coord }) => {
    const map = useMap()
    useEffect(() => {
      if (coord?.lat && coord?.lng) {
        map.setView([coord.lat, coord.lng], 14)
      }
    }, [coord, map])
    return null
  }

  return (
    <Container className="py-4">
      <h2 className="text-yega-gold">Ubicación</h2>
      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
      <Row className="g-3 align-items-end">
        <Col md={4}>
          <Form.Label className="form-label-yega">Dirección (opcional)</Form.Label>
          <Form.Control value={direccion} onChange={(e) => setDireccion(e.target.value)} placeholder="Calle y número" />
        </Col>
        <Col md={3}>
          <Form.Label className="form-label-yega">Intervalo auto (seg)</Form.Label>
          <Form.Control type="number" min={5} value={intervalo} onChange={(e) => setIntervalo(parseInt(e.target.value || '5', 10))} />
        </Col>
        <Col md="auto" className="d-flex gap-2">
          <Button className="btn-yega-primary" onClick={enviarUbicacion} disabled={!coords || status === 'sending'}>
            {status === 'sending' ? 'Enviando...' : 'Enviar ubicación ahora'}
          </Button>
          <Button as="a" target="_blank" rel="noopener" className="btn-yega-primary" href={coords ? `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}` : '#'}>
            Abrir en Maps
          </Button>
        </Col>
      </Row>
      <div className="mt-3">
        <Badge bg="secondary">Lat: {coords?.lat?.toFixed?.(6) ?? '—'}</Badge>{' '}
        <Badge bg="secondary">Lng: {coords?.lng?.toFixed?.(6) ?? '—'}</Badge>
      </div>

      {/* Mapa en vivo del repartidor */}
      <div className="mt-3" style={{ height: 360 }}>
        <MapContainer style={{ height: '100%', width: '100%' }} center={coords || { lat: -34.6037, lng: -58.3816 }} zoom={12} scrollWheelZoom={false}>
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitToCoord coord={coords} />
          {coords && (
            <CircleMarker center={coords} radius={10} pathOptions={{ color: '#0d6efd' }}>
              <Tooltip permanent>Tu ubicación</Tooltip>
            </CircleMarker>
          )}
        </MapContainer>
        <div className="small text-muted mt-1">Marcador azul: tu ubicación actual</div>
      </div>
    </Container>
  )
}

export default RepartidorUbicacion
