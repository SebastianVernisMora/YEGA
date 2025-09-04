import React, { useState } from 'react'
import { Container, Card, Form, Button } from 'react-bootstrap'
import { useAuth } from '../../context/AuthContext'

const ClientePerfil = () => {
  const { user, updateProfile } = useAuth()
  const [form, setForm] = useState({ nombre: user?.nombre || '', telefono: user?.telefono || '' })
  const [saving, setSaving] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateProfile({ nombre: form.nombre, telefono: form.telefono })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Container className="py-4">
      <h2 className="text-yega-gold">Mi Perfil</h2>
      <Card className="card-yega mt-3">
        <Card.Body>
          <Form onSubmit={onSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="form-label-yega">Nombre</Form.Label>
              <Form.Control value={form.nombre} onChange={(e)=> setForm({...form, nombre: e.target.value})} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="form-label-yega">Teléfono</Form.Label>
              <Form.Control value={form.telefono} onChange={(e)=> setForm({...form, telefono: e.target.value})} />
            </Form.Group>
            <Button type="submit" className="btn-yega-primary" disabled={saving}>{saving?'Guardando...':'Guardar'}</Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  )
}

export default ClientePerfil

