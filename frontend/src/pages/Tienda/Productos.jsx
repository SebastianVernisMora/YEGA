import React, { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { apiClient } from '../../services/apiClient'
import { Container, Alert, Button, Spinner, Row, Col, Form, InputGroup, Card, Badge } from 'react-bootstrap'

const TiendaProductos = () => {
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ nombre: '', descripcion: '', precio: '', stock: '', categoria: 'comida' })

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['productos'],
    queryFn: async () => {
      const res = await apiClient.products.getAll({ limit: 50 })
      return res.data
    },
  })

  const productos = data?.productos || []

  const createMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        precio: parseFloat(form.precio),
        stock: parseInt(form.stock || '0', 10),
      }
      await apiClient.products.create(payload)
    },
    onSuccess: async () => {
      setShowCreate(false)
      setForm({ nombre: '', descripcion: '', precio: '', stock: '', categoria: 'comida' })
      await refetch()
    },
  })

  return (
    <Container className="py-4">
      <div className="text-center mb-3">
        <h2 className="text-yega-gold mb-2">Productos</h2>
        <div className="d-flex justify-content-center gap-2">
          <Button variant="outline-light" className="btn-yega-secondary" onClick={() => setShowCreate((s) => !s)}>
            {showCreate ? 'Cancelar' : 'Nuevo Producto'}
          </Button>
          <Button variant="outline-light" className="btn-yega-primary" onClick={() => refetch()}>
            Refrescar
          </Button>
        </div>
      </div>

      {showCreate && (
        <div className="mb-4">
          <Form
            onSubmit={(e) => {
              e.preventDefault()
              createMutation.mutate()
            }}
          >
            <Row className="g-2 align-items-end justify-content-center text-center">
              <Col md={3}>
                <Form.Label className="form-label-yega">Nombre</Form.Label>
                <Form.Control required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
              </Col>
              <Col md={4}>
                <Form.Label className="form-label-yega">Descripción</Form.Label>
                <Form.Control required value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
              </Col>
              <Col md={2}>
                <Form.Label className="form-label-yega">Precio</Form.Label>
                <InputGroup>
                  <InputGroup.Text>$</InputGroup.Text>
                  <Form.Control required type="number" step="0.01" min="0" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} />
                </InputGroup>
              </Col>
              <Col md={2}>
                <Form.Label className="form-label-yega">Stock</Form.Label>
                <Form.Control required type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
              </Col>
              <Col md={1}>
                <Form.Label className="form-label-yega">Cat.</Form.Label>
                <Form.Select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })}>
                  <option value="comida">comida</option>
                  <option value="bebida">bebida</option>
                  <option value="postre">postre</option>
                  <option value="snack">snack</option>
                  <option value="otro">otro</option>
                </Form.Select>
              </Col>
            </Row>
            <div className="mt-3 d-flex gap-2">
              <Button type="submit" className="btn-yega-primary" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creando...' : 'Crear'}
              </Button>
            </div>
          </Form>
        </div>
      )}

      {isLoading && (
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      )}

      {isError && (
        <Alert variant="danger">
          No se pudieron cargar los productos. Verifica tu conexión y sesión.
        </Alert>
      )}

      {!isLoading && !isError && (
        <>
          {productos.length === 0 ? (
            <Alert variant="warning">
              No hay productos aún. Si estás en desarrollo, puedes crear el producto demo ejecutando
              <code className="ms-1">cd backend && npm run seed</code>.
            </Alert>
          ) : (
            <Row className="g-3">
              {productos.map((p) => (
                <Col md={6} lg={4} key={p._id}>
                  <Card className="card-yega h-100">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="fw-bold">{p.nombre}</div>
                        <Badge bg={p.disponible ? 'success' : 'secondary'}>{p.disponible ? 'Disponible' : 'No disponible'}</Badge>
                      </div>
                      <div className="text-white-50 small mt-1">{p.categoria}</div>
                      <div className="mt-2 text-white-70" style={{ minHeight: 40 }}>{p.descripcion}</div>
                      <div className="mt-3 d-flex justify-content-between align-items-center">
                        <div className="fw-bold">${p.precio?.toFixed?.(2) ?? p.precio}</div>
                        <div className="small">Stock: {p.stock}</div>
                      </div>
                      {/* Espacio para acciones futuras: editar/eliminar/stock */}
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </>
      )}
    </Container>
  )
}

export default TiendaProductos
