import React, { useEffect, useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Container, Spinner, Alert, Button, Badge, Nav, Row, Col, Card } from 'react-bootstrap'
import { apiClient } from '../../services/apiClient'

const RepartidorPedidos = () => {
  const [tab, setTab] = useState('asignados')
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['orders-delivery'],
    queryFn: async () => {
      const res = await apiClient.orders.getAll({ limit: 50 })
      return res.data
    },
  })

  const pedidos = data?.pedidos || []

  const availableQ = useQuery({
    queryKey: ['orders-available'],
    queryFn: async () => {
      const res = await apiClient.orders.getAvailable({ limit: 50 })
      return res.data
    }
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, estado }) => {
      await apiClient.orders.updateStatus(id, estado)
    },
    onSuccess: () => refetch(),
  })

  const claimMutation = useMutation({
    mutationFn: async (id) => apiClient.orders.claim(id),
    onSuccess: () => {
      availableQ.refetch();
      refetch();
    },
  })

  // Enviar ubicación cada 10s
  useEffect(() => {
    let timer
    const send = async (pos) => {
      try {
        await apiClient.location.update({ latitud: pos.coords.latitude, longitud: pos.coords.longitude })
      } catch {}
    }
    const tick = () => {
      if (!navigator.geolocation) return
      navigator.geolocation.getCurrentPosition(send, () => {})
    }
    tick()
    timer = setInterval(tick, 10000)
    return () => clearInterval(timer)
  }, [])

  return (
    <Container className="py-4 text-center">
      <h2 className="text-yega-gold mb-2">Pedidos</h2>
      <div className="d-flex justify-content-center gap-2 mb-2">
        <Button variant="outline-light" className="btn-yega-secondary" onClick={() => availableQ.refetch()}>Refrescar disponibles</Button>
        <Button className="btn-yega-primary" onClick={() => refetch()}>Refrescar asignados</Button>
      </div>

      <Nav variant="tabs" activeKey={tab} onSelect={k => setTab(k || 'asignados')} className="mb-3 justify-content-center">
        <Nav.Item>
          <Nav.Link eventKey="disponibles">Disponibles</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="asignados">Asignados</Nav.Link>
        </Nav.Item>
      </Nav>

      {tab === 'disponibles' ? (
        availableQ.isLoading ? (
          <div className="text-center py-5"><Spinner animation="border" /></div>
        ) : availableQ.isError ? (
          <Alert variant="danger">No se pudieron cargar los pedidos disponibles.</Alert>
        ) : (
          <Row className="g-3">
            {(availableQ.data?.pedidos || []).map(o => (
              <Col md={6} lg={4} key={o._id}>
                <Card className="card-yega h-100">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <div className="fw-bold">{o.tiendaId?.nombre ?? '—'}</div>
                        <div className="text-muted small">Pedido {o.numero_pedido}</div>
                      </div>
                      <div className="text-end">
                        <div className="fw-bold">${o.total?.toFixed?.(2) ?? o.total}</div>
                      </div>
                    </div>
                    <div className="mt-3 d-flex gap-2">
                      <Button size="sm" className="btn-yega-primary" disabled={claimMutation.isPending} onClick={() => claimMutation.mutate(o._id)}>Tomar pedido</Button>
                      {o.tiendaId?.ubicacion && (
                        <Button as="a" target="_blank" rel="noopener" size="sm" className="btn-yega-outline" href={`https://www.google.com/maps/dir/?api=1&destination=${o.tiendaId.ubicacion.latitud},${o.tiendaId.ubicacion.longitud}`}>Ir a Tienda</Button>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
            {((availableQ.data?.pedidos || []).length === 0) && (
              <Col xs={12}><div className="text-center text-muted py-4">No hay pedidos disponibles</div></Col>
            )}
          </Row>
        )
      ) : (
        <>
          {isLoading && <div className="text-center py-5"><Spinner animation="border" /></div>}
          {isError && <Alert variant="danger">No se pudieron cargar los pedidos.</Alert>}
          {!isLoading && !isError && (
            <Row className="g-3">
              {pedidos.map((o) => (
                <Col md={6} lg={4} key={o._id}>
                  <Card className="card-yega h-100">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <div className="fw-bold">{o.clienteId?.nombre ?? '—'}</div>
                          <div className="text-muted small">{o.tiendaId?.nombre ?? '—'} • Pedido {o.numero_pedido}</div>
                        </div>
                        <Badge bg="secondary">{o.estado}</Badge>
                      </div>
                      <div className="mt-2 fw-bold">${o.total?.toFixed?.(2) ?? o.total}</div>
                      <div className="mt-3 d-flex flex-wrap gap-2">
                        <Button size="sm" className="btn-yega-secondary" disabled={updateMutation.isPending || o.estado !== 'listo'} onClick={() => updateMutation.mutate({ id: o._id, estado: 'en_camino' })}>Marcar en camino</Button>
                        <Button size="sm" className="btn-yega-primary" disabled={updateMutation.isPending || o.estado !== 'en_camino'} onClick={() => updateMutation.mutate({ id: o._id, estado: 'entregado' })}>Marcar entregado</Button>
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
              {pedidos.length === 0 && (
                <Col xs={12}><div className="text-center text-muted py-4">No tienes pedidos asignados</div></Col>
              )}
            </Row>
          )}
        </>
      )}
    </Container>
  )
}

export default RepartidorPedidos
