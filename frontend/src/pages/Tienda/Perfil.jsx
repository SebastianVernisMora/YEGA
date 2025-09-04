import React from 'react'
import { Container, Card } from 'react-bootstrap'
import { useAuth } from '../../context/AuthContext'
import DocumentUploader from '../../components/DocumentUploader'

const TiendaPerfil = () => {
  const { user } = useAuth()
  const v = user?.verificaciones || {}
  return (
    <Container className="py-4 text-center">
      <h2 className="text-yega-gold">Perfil de Tienda</h2>
      <Card className="card-yega mt-3">
        <Card.Body className="text-center">
          <div className="mb-2">Sube la documentación para validar tu cuenta.</div>
          <DocumentUploader tipo="id_doc" label="Identificación oficial" current={v.id_doc} />
          <DocumentUploader tipo="comprobante_domicilio" label="Comprobante de domicilio" current={v.comprobante_domicilio} />
        </Card.Body>
      </Card>
    </Container>
  )
}

export default TiendaPerfil
