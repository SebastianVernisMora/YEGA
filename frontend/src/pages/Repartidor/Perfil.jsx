import React from 'react'
import { Container, Card } from 'react-bootstrap'
import { useAuth } from '../../context/AuthContext'
import DocumentUploader from '../../components/DocumentUploader'

const RepartidorPerfil = () => {
  const { user } = useAuth()
  const v = user?.verificaciones || {}
  return (
    <Container className="py-4 text-center">
      <h2 className="text-yega-gold">Perfil de Repartidor</h2>
      <Card className="card-yega mt-3">
        <Card.Body className="text-center">
          <div className="mb-2">Sube la documentación requerida para validar tu cuenta.</div>
          <DocumentUploader tipo="id_doc" label="Identificación oficial" current={v.id_doc} />
          <DocumentUploader tipo="licencia" label="Licencia de conducir" current={v.licencia} />
          <DocumentUploader tipo="tarjeta_circulacion" label="Tarjeta de circulación" current={v.tarjeta_circulacion} />
          <DocumentUploader tipo="poliza_seguro" label="Póliza de seguro" current={v.poliza_seguro} />
        </Card.Body>
      </Card>
    </Container>
  )
}

export default RepartidorPerfil
