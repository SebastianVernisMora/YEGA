import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { FaHome } from 'react-icons/fa'

const getDashboardPath = (rol) => {
  switch (rol) {
    case 'cliente':
      return '/cliente/tiendas'
    case 'tienda':
      return '/tienda'
    case 'repartidor':
      return '/repartidor'
    case 'administrador':
      return '/admin'
    default:
      return '/dashboard'
  }
}

const ReturnHomeButton = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  if (!user) return null

  const target = getDashboardPath(user.rol)
  const isOnTarget = location.pathname === target

  const handleClick = () => {
    navigate(target)
  }

  return (
    <button
      type="button"
      aria-label="Ir al dashboard"
      title="Ir al dashboard"
      onClick={handleClick}
      disabled={isOnTarget}
      style={{
        position: 'fixed',
        top: 12,
        left: 12,
        zIndex: 9999,
        width: 42,
        height: 42,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 9999,
        padding: 0,
        border: '1px solid rgba(255,255,255,0.15)',
        background: 'rgba(0,0,0,0.6)',
        color: '#fff',
        backdropFilter: 'blur(6px)',
        cursor: isOnTarget ? 'default' : 'pointer',
      }}
    >
      <FaHome size={18} />
    </button>
  )
}

export default ReturnHomeButton
