import React from 'react'
import { Container, Row, Col, Button } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'
import { useAuth } from '../context/AuthContext'
import { FaShoppingCart, FaTruck, FaCog } from 'react-icons/fa'

const Home = () => {
  const { isAuthenticated } = useAuth()

  

  return (
    <div className="fade-in">
      {/* Hero Section */}
      <section className="bg-yega-dark py-5">
        <Container>
          <Row className="align-items-center min-vh-50">
            <Col lg={6}>
              <h1 className="display-4 fw-bold text-yega-gold mb-4">
                Bienvenido a YEGA
              </h1>
              <p className="lead mb-4">
                La plataforma de delivery que conecta clientes, tiendas y repartidores 
                de manera eficiente y segura. Únete a nuestra comunidad y forma parte 
                del futuro del comercio digital.
              </p>
              
              {!isAuthenticated ? (
                <div className="d-flex gap-3 flex-wrap">
                  <LinkContainer to="/register">
                    <Button variant="outline-light" size="lg" className="btn-yega-primary">
                      Comenzar Ahora
                    </Button>
                  </LinkContainer>
                  <LinkContainer to="/login">
                    <Button variant="outline-light" size="lg" className="btn-yega-secondary">
                      Iniciar Sesión
                    </Button>
                  </LinkContainer>
                </div>
              ) : (
                <LinkContainer to="/dashboard">
                  <Button variant="outline-light" size="lg" className="btn-yega-primary">
                    Ir al Dashboard
                  </Button>
                </LinkContainer>
              )}
            </Col>
            
            <Col lg={6} className="text-center">
              <div className="p-4">
                <div 
                  className="rounded-circle bg-yega-darker d-inline-flex align-items-center justify-content-center"
                  style={{ width: '300px', height: '300px' }}
                >
                  <div className="text-center">
                    <FaShoppingCart size={80} className="text-yega-gold mb-3" />
                    <h4 className="text-yega-silver">Tu Delivery</h4>
                    <p className="text-muted">Rápido y Confiable</p>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      

      {/* Features Section */}
      <section className="bg-yega-darker py-5">
        <Container>
          <Row>
            <Col lg={8} className="mx-auto text-center mb-5">
              <h2 className="display-5 fw-bold text-yega-gold mb-4">
                ¿Por qué elegir YEGA?
              </h2>
            </Col>
          </Row>
          
          <Row>
            <Col md={4} className="mb-4">
              <div className="text-center">
                <div className="bg-yega-dark rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                     style={{ width: '80px', height: '80px' }}>
                  <FaShoppingCart size={32} className="text-yega-gold" />
                </div>
                <h5 className="text-yega-silver">Fácil de Usar</h5>
                <p className="text-muted">
                  Interfaz intuitiva diseñada para una experiencia de usuario excepcional.
                </p>
              </div>
            </Col>
            
            <Col md={4} className="mb-4">
              <div className="text-center">
                <div className="bg-yega-dark rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                     style={{ width: '80px', height: '80px' }}>
                  <FaTruck size={32} className="text-yega-gold" />
                </div>
                <h5 className="text-yega-silver">Entrega Rápida</h5>
                <p className="text-muted">
                  Sistema de geolocalización para entregas eficientes y seguimiento en tiempo real.
                </p>
              </div>
            </Col>
            
            <Col md={4} className="mb-4">
              <div className="text-center">
                <div className="bg-yega-dark rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                     style={{ width: '80px', height: '80px' }}>
                  <FaCog size={32} className="text-yega-gold" />
                </div>
                <h5 className="text-yega-silver">Gestión Completa</h5>
                <p className="text-muted">
                  Herramientas avanzadas para gestionar productos, pedidos y entregas.
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="py-5">
          <Container>
            <Row>
              <Col lg={8} className="mx-auto text-center">
                <h2 className="display-5 fw-bold text-yega-gold mb-4">
                  ¿Listo para comenzar?
                </h2>
                <p className="lead mb-4">
                  Únete a miles de usuarios que ya confían en YEGA para sus necesidades de delivery.
                </p>
                <div className="d-flex gap-3 justify-content-center flex-wrap">
                  <LinkContainer to="/register">
                    <Button variant="outline-light" size="lg" className="btn-yega-primary">
                      Crear Cuenta Gratis
                    </Button>
                  </LinkContainer>
                  <LinkContainer to="/contact">
                    <Button variant="outline-light" size="lg" className="btn-yega-secondary">
                      Contactar Ventas
                    </Button>
                  </LinkContainer>
                </div>
              </Col>
            </Row>
          </Container>
        </section>
      )}
    </div>
  )
}

export default Home
