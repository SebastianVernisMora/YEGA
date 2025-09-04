import React, { useMemo } from 'react'
import { Container, Spinner, Alert, Badge, Table } from 'react-bootstrap'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../../services/apiClient'
import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, CircleMarker, Marker, Polyline, Tooltip, useMap } from 'react-leaflet'
import L from 'leaflet'

const FitToMarkers = ({ points }) => {
  const map = useMap()
  React.useEffect(() => {
    if (!points || points.length === 0) return
    const latlngs = points.map(p => [p.lat, p.lng])
    if (latlngs.length === 1) {
      map.setView(latlngs[0], 14)
    } else {
      map.fitBounds(latlngs, { padding: [30, 30] })
    }
  }, [points, map])
  return null
}

const ClienteSeguimiento = () => {
  const [params] = useSearchParams()
  const id = params.get('id')
  const { data, isLoading, isError } = useQuery({
    enabled: !!id,
    queryKey: ['order-track', id],
    queryFn: async () => {
      const res = await apiClient.orders.getById(id)
      return res.data
    },
    refetchInterval: 5000,
  })

  const pedido = data?.pedido
  const estado = pedido?.estado
  const tiendaPos = useMemo(() => {
    const u = pedido?.tiendaId?.ubicacion
    if (u?.latitud && u?.longitud) return { lat: u.latitud, lng: u.longitud }
    return null
  }, [pedido])
  const destinoPos = useMemo(() => {
    const d = pedido?.direccion_envio
    if (d?.latitud && d?.longitud) return { lat: d.latitud, lng: d.longitud }
    return null
  }, [pedido])
  const repPos = useMemo(() => {
    const r = pedido?.repartidorId?.ubicacion
    if (r?.latitud && r?.longitud) return { lat: r.latitud, lng: r.longitud }
    return null
  }, [pedido])
  const allPoints = [tiendaPos, destinoPos, repPos].filter(Boolean)

  // Iconos para meta (cliente) y repartidor
  const metaIcon = useMemo(() => L.divIcon({
    className: 'yega-flag-icon',
    html: '<div style="font-size:22px;line-height:22px">🏁</div>',
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  }), [])
  const riderIcon = useMemo(() => L.divIcon({
    className: 'yega-rider-icon',
    html: '<div style="font-size:22px;line-height:22px">🛵</div>',
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  }), [])

  const estadoStyles = (est) => {
    // Colores y estilos de ruta según estado
    switch (est) {
      case 'pendiente':
      case 'confirmado':
      case 'preparando':
        return { color: '#6c757d', dashArray: '6 6', weight: 3 } // gris punteado
      case 'listo':
        return { color: '#0d6efd', dashArray: '6 6', weight: 3 } // azul punteado (listo para salir)
      case 'en_camino':
        return { color: '#ffc107', weight: 4 } // amarillo sólido
      case 'entregado':
        return { color: '#28a745', weight: 4 } // verde sólido
      case 'cancelado':
        return { color: '#dc3545', dashArray: '4 8', weight: 3 } // rojo punteado
      default:
        return { color: '#6c757d', weight: 3 }
    }
  }

  return (
    <Container className="py-4">
      <h2 className="text-yega-gold">Seguimiento</h2>
      {!id && <Alert variant="warning" className="mt-3">No se proporcionó ID de pedido</Alert>}
      {isLoading && <div className="text-center py-5"><Spinner animation="border" /></div>}
      {isError && <Alert variant="danger">No se pudo obtener el pedido</Alert>}
      {pedido && (
        <div className="mt-3">
          <div className="d-flex gap-3 align-items-center">
            <div><strong>Pedido:</strong> {pedido.numero_pedido}</div>
            <div><Badge bg="secondary">{pedido.estado}</Badge></div>
            <div><strong>Total:</strong> ${pedido.total?.toFixed?.(2) ?? pedido.total}</div>
          </div>
          <div className="text-muted small mt-2">ETA aprox: {pedido.tiempo_estimado ?? 30} min</div>
          <hr />
          <h6>Productos</h6>
          <Table size="sm" responsive>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cant.</th>
                <th>Precio</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {pedido.productos?.map((it, idx) => (
                <tr key={idx}>
                  <td>{it.producto?.nombre ?? 'Producto'}</td>
                  <td>{it.cantidad}</td>
                  <td>${it.precio_unitario?.toFixed?.(2) ?? it.precio_unitario}</td>
                  <td>${it.subtotal?.toFixed?.(2) ?? it.subtotal}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          <hr />
          <h6>Repartidor</h6>
          {pedido.repartidorId ? (
            <div className="text-muted">
              {pedido.repartidorId?.nombre ?? '—'}
              {pedido.repartidorId?.ubicacion?.latitud && (
                <span> — Última ubicación: {pedido.repartidorId.ubicacion.latitud.toFixed(5)}, {pedido.repartidorId.ubicacion.longitud.toFixed(5)}</span>
              )}
            </div>
          ) : (
            <div className="text-muted">Aún no asignado</div>
          )}

          {/* Mapa de seguimiento */}
          {allPoints.length > 0 && (
            <div className="mt-3 position-relative" style={{ height: 360 }}>
              <MapContainer style={{ height: '100%', width: '100%' }} center={allPoints[0] || { lat: 0, lng: 0 }} zoom={13} scrollWheelZoom={false}>
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <FitToMarkers points={allPoints} />
                {tiendaPos && (
                  <CircleMarker center={tiendaPos} radius={8} pathOptions={{ color: '#0d6efd' }}>
                    <Tooltip>Tienda: {pedido?.tiendaId?.nombre || '—'}</Tooltip>
                  </CircleMarker>
                )}
                {destinoPos && (
                  <Marker position={destinoPos} icon={metaIcon}>
                    <Tooltip permanent>Meta (cliente)</Tooltip>
                  </Marker>
                )}
                {repPos && (
                  <Marker position={repPos} icon={riderIcon}>
                    <Tooltip>Repartidor: {pedido?.repartidorId?.nombre || '—'}</Tooltip>
                  </Marker>
                )}
                {/* Priorizar ruta repartidor -> meta; si no hay repartidor, mostrar tienda -> meta */}
                {repPos && destinoPos ? (
                  <Polyline
                    positions={[[repPos.lat, repPos.lng], [destinoPos.lat, destinoPos.lng]]}
                    pathOptions={estadoStyles(estado)}
                  />
                ) : (tiendaPos && destinoPos ? (
                  <Polyline
                    positions={[[tiendaPos.lat, tiendaPos.lng], [destinoPos.lat, destinoPos.lng]]}
                    pathOptions={estado === 'entregado' ? estadoStyles('entregado') : estadoStyles('confirmado')}
                  />
                ) : null)}
              </MapContainer>
              {/* Leyenda */}
              <div style={{ position: 'absolute', right: 8, bottom: 8 }} className="bg-dark bg-opacity-75 text-white rounded px-2 py-1 small">
                <div className="d-flex align-items-center gap-2">
                  <span className="d-inline-block" style={{ width: 10, height: 10, backgroundColor: '#0d6efd', borderRadius: 999 }} />
                  <span>Tienda</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <span className="d-inline-block" style={{ width: 14, textAlign: 'center' }}>🏁</span>
                  <span>Meta (cliente)</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <span className="d-inline-block" style={{ width: 14, textAlign: 'center' }}>🛵</span>
                  <span>Repartidor</span>
                </div>
                <div className="mt-1 text-white-50">Estado: {estado || '—'}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </Container>
  )
}

export default ClienteSeguimiento
