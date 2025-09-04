import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Container, Spinner, Alert, Badge, Row, Col, Card } from 'react-bootstrap'
import api from '../../services/apiClient'
import { useNavigate } from 'react-router-dom'

const ClientePedidos = () => {
  const navigate = useNavigate()
  const { data, isLoading, isError } = useQuery({
    queryKey: ['orders-client'],
    queryFn: async () => {
      const res = await api.get('/orders', { params: { limit: 50 } })
      return res.data
    },
  })

  const pedidos = data?.pedidos || []

  return (
    <Container className="py-4 text-center">
      <h2 className="text-yega-gold mb-3">Mis Pedidos</h2>
      {isLoading && <div className="text-center py-5"><Spinner animation="border" /></div>}
      {isError && <Alert variant="danger">No se pudieron cargar tus pedidos.</Alert>}
      {!isLoading && !isError && (
        <Row className="g-3 justify-content-center">
          {pedidos.map((o) => (
            <Col md={6} lg={4} key={o._id}>
              <Card className="card-yega h-100" role="button" onClick={() => navigate(`/cliente/seguimiento?id=${o._id}`)}>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <div className="fw-bold">{o.tiendaId?.nombre ?? '—'}</div>
                      <div className="text-muted small">Pedido {o.numero_pedido}</div>
                    </div>
                    <Badge bg="secondary">{o.estado}</Badge>
                  </div>
                  <div className="mt-2 small text-white-50">{new Date(o.createdAt).toLocaleString()}</div>
                  <div className="mt-2 fw-bold">${o.total?.toFixed?.(2) ?? o.total}</div>
                </Card.Body>
              </Card>
            </Col>
          ))}
          {pedidos.length === 0 && (
            <Col xs={12}><div className="text-center text-muted py-4">Aún no tienes pedidos</div></Col>
          )}
        </Row>
      )}
    </Container>
  )
}

export default ClientePedidos
