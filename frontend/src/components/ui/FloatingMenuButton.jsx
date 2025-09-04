import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { FaEllipsisV } from 'react-icons/fa'

const getRoute = (rol, kind) => {
  if (kind === 'perfil') {
    if (rol === 'cliente') return '/cliente/perfil'
    if (rol === 'tienda') return '/tienda/perfil'
    if (rol === 'repartidor') return '/repartidor/perfil'
    return '/admin'
  }
  if (kind === 'stats') {
    if (rol === 'cliente') return '/cliente/historial'
    if (rol === 'tienda') return '/tienda/estadisticas'
    if (rol === 'repartidor') return '/repartidor/estadisticas'
    return '/admin/reportes'
  }
  if (kind === 'pagos') {
    if (rol === 'tienda') return '/tienda/perfil'
    if (rol === 'repartidor') return '/repartidor/perfil'
    if (rol === 'cliente') return '/cliente/perfil'
    return '/admin'
  }
  return '/'
}

const FloatingMenuButton = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  if (!user) return null

  const go = (kind) => () => navigate(getRoute(user.rol, kind))
  const isAdmin = user.rol === 'administrador'
  const hidden = location.pathname.startsWith('/admin') && isAdmin

  if (hidden) return null

  return (
    <div style={{ position: 'fixed', top: 12, right: 12, zIndex: 9999 }}>
      <div
        title="Menú"
        role="button"
        onClick={() => {
          const menu = document.getElementById('yega-fab-menu')
          if (menu) menu.classList.toggle('d-none')
        }}
        style={{
          width: 42,
          height: 42,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 9999, border: '1px solid rgba(255,255,255,0.15)',
          background: 'rgba(0,0,0,0.6)', color: '#fff', backdropFilter: 'blur(6px)',
          cursor: 'pointer'
        }}
      >
        <FaEllipsisV size={18} />
      </div>
      <div id="yega-fab-menu" className="d-none" style={{
        position: 'absolute', right: 0, marginTop: 8,
        background: 'rgba(18,18,18,0.98)', border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: 12, minWidth: 200, boxShadow: '0 8px 30px rgba(0,0,0,.3)'
      }}>
        <div className="p-2">
          <button className="w-100 text-start btn btn-sm btn-link text-decoration-none" onClick={go('perfil')}>Editar perfil</button>
          <button className="w-100 text-start btn btn-sm btn-link text-decoration-none" onClick={go('pagos')}>Medios de pago/cobro</button>
          <button className="w-100 text-start btn btn-sm btn-link text-decoration-none" onClick={go('stats')}>Estadísticas</button>
        </div>
      </div>
    </div>
  )
}

export default FloatingMenuButton
