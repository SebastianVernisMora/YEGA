import React, { createContext, useContext, useState, useEffect } from 'react'
import { apiClient } from '../services/apiClient'
import { toast } from 'react-toastify'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))

  // Función de logout
  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    apiClient.setAuthToken(null)
    toast.info('Sesión cerrada')
  }

  // Cargar perfil del usuario
  const loadUserProfile = async () => {
    try {
      const response = await apiClient.get('/auth/profile')
      setUser(response.data.usuario)
    } catch (error) {
      console.error('Error cargando perfil:', error)
      logout() // Si hay error, cerrar sesión
    } finally {
      setLoading(false)
    }
  }

  // Configurar token en apiClient al cargar
  useEffect(() => {
    if (token) {
      apiClient.setAuthToken(token)
      loadUserProfile()
    } else {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  // Función de login
  const login = async (email, password) => {
    try {
      setLoading(true)
      const response = await apiClient.post('/auth/login', { email, password })
      
      const { token: newToken, usuario } = response.data
      
      // Guardar token y usuario
      localStorage.setItem('token', newToken)
      setToken(newToken)
      setUser(usuario)
      apiClient.setAuthToken(newToken)
      
      toast.success('Inicio de sesión exitoso')
      return { success: true, user: usuario }
      
    } catch (error) {
      const status = error.response?.status
      const data = error.response?.data || {}
      const message = data.message || 'Error al iniciar sesión'
      toast.error(message)
      // Si la cuenta está pendiente, devolver señal para redirigir a OTP
      if (status === 403 && (data.requires_otp || data.requiresOTP)) {
        return { 
          success: false, 
          error: message, 
          requiresOTP: true, 
          email: data.email || email, 
          telefono: data.telefono
        }
      }
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }

  // Función de registro
  const register = async (userData) => {
    try {
      setLoading(true)
      const response = await apiClient.post('/auth/register', userData)
      
      const { token: newToken, usuario, requiere_otp } = response.data
      
      if (requiere_otp) {
        toast.info('Se ha enviado un código de verificación a tu teléfono')
        return { success: true, requiresOTP: true, email: userData.email }
      } else {
        // Auto-login para clientes
        localStorage.setItem('token', newToken)
        setToken(newToken)
        setUser(usuario)
        apiClient.setAuthToken(newToken)
        toast.success('Registro exitoso')
        return { success: true, user: usuario }
      }
      
    } catch (error) {
      const message = error.response?.data?.message || 'Error al registrarse'
      toast.error(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }

  // Función de verificación OTP
  const verifyOTP = async (email, otp, telefono = undefined) => {
    try {
      setLoading(true)
      const response = await apiClient.post('/auth/verify-otp', { email, otp, telefono })
      
      // Si el backend devuelve token/usuario, iniciar sesión automática
      if (response.data?.token && response.data?.usuario) {
        const newToken = response.data.token
        const usuario = response.data.usuario
        localStorage.setItem('token', newToken)
        setToken(newToken)
        setUser(usuario)
        apiClient.setAuthToken(newToken)
      }
      
      toast.success('Cuenta verificada exitosamente')
      return { success: true, user: response.data?.usuario }
      
    } catch (error) {
      const message = error.response?.data?.message || 'Error verificando código'
      toast.error(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }

  // Función de reenvío de OTP
  const resendOTP = async (email) => {
    try {
      await apiClient.post('/auth/resend-otp', { email })
      toast.success('Nuevo código enviado')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Error reenviando código'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  // logout ya definido arriba

  // Función para actualizar perfil
  const updateProfile = async (profileData) => {
    try {
      const response = await apiClient.put('/auth/profile', profileData)
      setUser(response.data.usuario)
      toast.success('Perfil actualizado exitosamente')
      return { success: true, user: response.data.usuario }
    } catch (error) {
      const message = error.response?.data?.message || 'Error actualizando perfil'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  // Función para actualizar ubicación
  const updateLocation = async (ubicacion) => {
    try {
      const response = await apiClient.put('/location/update', ubicacion)
      
      // Actualizar usuario con nueva ubicación
      setUser(prev => ({
        ...prev,
        ubicacion: response.data.ubicacion
      }))
      
      return { success: true, ubicacion: response.data.ubicacion }
    } catch (error) {
      const message = error.response?.data?.message || 'Error actualizando ubicación'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const value = {
    user,
    loading,
    login,
    register,
    verifyOTP,
    resendOTP,
    logout,
    updateProfile,
    updateLocation,
    isAuthenticated: !!user,
    isClient: user?.rol === 'cliente',
    isStore: user?.rol === 'tienda',
    isDelivery: user?.rol === 'repartidor',
    isAdmin: user?.rol === 'administrador'
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
