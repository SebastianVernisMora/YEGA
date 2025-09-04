// frontend/src/pages/Cliente/Dashboard.jsx
import React from 'react'
import { Container, Row, Col, Card, Button } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'
import { useAuth } from '../../context/AuthContext'
import { FaShoppingCart, FaList, FaMapMarkerAlt, FaHistory } from 'react-icons/fa'

const ClienteDashboard = () => {
  const { user } = useAuth()

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h2 className="text-yega-gold">¡Bienvenido, {user?.nombre}!</h2>
          <p className="text-muted">Cliente - Panel de Control</p>
        </Col>
      </Row>

      <Row>
        <Col md={6} lg={3} className="mb-4">
          <Card className="card-yega h-100">
            <Card.Body className="text-center">
              <FaShoppingCart size={48} className="text-yega-gold mb-3" />
              <Card.Title>Explorar Tiendas</Card.Title>
              <Card.Text>
                Descubre nuevas tiendas y productos disponibles cerca de ti.
              </Card.Text>
              <LinkContainer to="/cliente/tiendas">
                <Button variant="outline-light" className="btn-yega-primary">
                  Ver Tiendas
                </Button>
              </LinkContainer>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3} className="mb-4">
          <Card className="card-yega h-100">
            <Card.Body className="text-center">
              <FaList size={48} className="text-yega-gold mb-3" />
              <Card.Title>Mis Pedidos</Card.Title>
              <Card.Text>
                Revisa el estado de tus pedidos actuales y pasados.
              </Card.Text>
              <LinkContainer to="/cliente/pedidos">
                <Button variant="outline-light" className="btn-yega-primary">
                  Ver Pedidos
                </Button>
              </LinkContainer>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3} className="mb-4">
          <Card className="card-yega h-100">
            <Card.Body className="text-center">
              <FaMapMarkerAlt size={48} className="text-yega-gold mb-3" />
              <Card.Title>Seguimiento</Card.Title>
              <Card.Text>
                Sigue en tiempo real la ubicación de tu pedido.
              </Card.Text>
              <LinkContainer to="/cliente/seguimiento">
                <Button variant="outline-light" className="btn-yega-primary">
                  Seguir Pedido
                </Button>
              </LinkContainer>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3} className="mb-4">
          <Card className="card-yega h-100">
            <Card.Body className="text-center">
              <FaHistory size={48} className="text-yega-gold mb-3" />
              <Card.Title>Historial</Card.Title>
              <Card.Text>
                Consulta tu historial de compras y favoritos.
              </Card.Text>
              <LinkContainer to="/cliente/historial">
                <Button variant="outline-light" className="btn-yega-primary">
                  Ver Historial
                </Button>
              </LinkContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card className="card-yega">
            <Card.Header>
              <h5 className="mb-0">Información del Perfil</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <p><strong>Nombre:</strong> {user?.nombre}</p>
                  <p><strong>Email:</strong> {user?.email}</p>
                </Col>
                <Col md={6}>
                  <p><strong>Teléfono:</strong> {user?.telefono}</p>
                  <p><strong>Rol:</strong> Cliente</p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default ClienteDashboard
