// frontend/src/pages/Repartidor/Dashboard.jsx
import React from 'react'
import { Container, Row, Col, Card, Button, Badge, Alert } from 'react-bootstrap'
import { useAuth } from '../../context/AuthContext'
import { useBackgroundLocation } from '../../context/BackgroundLocation'
import { useQuery, useMutation } from '@tanstack/react-query'
import { apiClient } from '../../services/apiClient'

const RepartidorDashboard = () => {
  const { user: _user } = useAuth()
  const bg = useBackgroundLocation()

  const availableQ = useQuery({
    queryKey: ['orders-available-dashboard'],
    queryFn: async () => (await apiClient.orders.getAvailable({ limit: 50 })).data,
    refetchInterval: 5000,
  })
  const assignedQ = useQuery({
    queryKey: ['orders-assigned-dashboard'],
    queryFn: async () => (await apiClient.orders.getAll({ limit: 50 })).data,
    refetchInterval: 5000,
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, estado }) => apiClient.orders.updateStatus(id, estado),
    onSuccess: () => assignedQ.refetch(),
  })
  const claimMutation = useMutation({
    mutationFn: async (id) => apiClient.orders.claim(id),
    onSuccess: () => { availableQ.refetch(); assignedQ.refetch() },
  })

  const nextEstado = (estado) => {
    switch (estado) {
      case 'listo': return 'en_camino'
      case 'en_camino': return 'entregado'
      default: return null
    }
  }

  const disponibles = availableQ.data?.pedidos || []
  const asignados = assignedQ.data?.pedidos || []

  return (
    <Container className="py-4 text-center">
      <h2 className="text-yega-gold mb-1">Pedidos</h2>
      <div className="small text-white-50 mb-3">
        {bg?.enabled ? 'Ubicación en segundo plano activa' : 'Ubicación en segundo plano inactiva'}
        {bg?.error ? <span className="text-danger ms-2">{bg.error}</span> : null}
      </div>

      {(availableQ.isError || assignedQ.isError) && (
        <Alert variant="danger" className="text-center">No se pudieron cargar los pedidos.</Alert>
      )}

      {/* Disponibles primero */}
      <div className="mb-2 text-white-50">Disponibles</div>
      {availableQ.isLoading ? (
        <div className="text-center py-3"><div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" /></div>
      ) : (
        <Row className="g-3 justify-content-center">
          {disponibles.map((o) => (
            <Col md={6} lg={4} key={o._id}>
              <Card className="card-yega h-100 text-start">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <div className="fw-bold">{o.tiendaId?.nombre ?? '—'}</div>
                      <div className="text-muted small">Pedido {o.numero_pedido}</div>
                    </div>
                    <div className="text-end fw-bold">${o.total?.toFixed?.(2) ?? o.total}</div>
                  </div>
                  <div className="mt-3 d-flex gap-2 justify-content-end">
                    <Button size="sm" className="btn-yega-primary" disabled={claimMutation.isPending} onClick={() => claimMutation.mutate(o._id)}>Tomar pedido</Button>
                    {o.tiendaId?.ubicacion && (
                      <Button as="a" target="_blank" rel="noopener" size="sm" className="btn-yega-outline" href={`https://www.google.com/maps/dir/?api=1&destination=${o.tiendaId.ubicacion.latitud},${o.tiendaId.ubicacion.longitud}`}>Ir a Tienda</Button>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
          {disponibles.length === 0 && (
            <Col xs={12}><div className="text-center text-muted py-3">No hay pedidos disponibles</div></Col>
          )}
        </Row>
      )}

      <div className="mt-4 mb-2 text-white-50">Asignados</div>
      {assignedQ.isLoading ? (
        <div className="text-center py-3"><div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" /></div>
      ) : (
        <Row className="g-3 justify-content-center">
          {asignados.map((o) => (
            <Col md={6} lg={4} key={o._id}>
              <Card className="card-yega h-100 text-start">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <div className="fw-bold">{o.clienteId?.nombre ?? '—'}</div>
                      <div className="text-muted small">{o.tiendaId?.nombre ?? '—'} • Pedido {o.numero_pedido}</div>
                    </div>
                    <Badge bg="secondary">{o.estado}</Badge>
                  </div>
                  <div className="mt-2 fw-bold">${o.total?.toFixed?.(2) ?? o.total}</div>
                  <div className="mt-3 d-flex flex-wrap gap-2 justify-content-end">
                    {nextEstado(o.estado) && (
                      <Button size="sm" className="btn-yega-primary" disabled={updateMutation.isPending} onClick={() => updateMutation.mutate({ id: o._id, estado: nextEstado(o.estado) })}>Marcar {nextEstado(o.estado)}</Button>
                    )}
                    {o.tiendaId?.ubicacion && (
                      <Button as="a" target="_blank" rel="noopener" size="sm" className="btn-yega-outline" href={`https://www.google.com/maps/dir/?api=1&destination=${o.tiendaId.ubicacion.latitud},${o.tiendaId.ubicacion.longitud}`}>Ir a Tienda</Button>
                    )}
                    {o.direccion_envio?.latitud && o.direccion_envio?.longitud && (
                      <Button as="a" target="_blank" rel="noopener" size="sm" className="btn-yega-outline" href={`https://www.google.com/maps/dir/?api=1&destination=${o.direccion_envio.latitud},${o.direccion_envio.longitud}`}>Ir a Cliente</Button>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
          {asignados.length === 0 && (
            <Col xs={12}><div className="text-center text-muted py-3">No tienes pedidos asignados</div></Col>
          )}
        </Row>
      )}
    </Container>
  )
}

export default RepartidorDashboard
