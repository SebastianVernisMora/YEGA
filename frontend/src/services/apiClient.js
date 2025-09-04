import axios from 'axios'

// Configuración base de la API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Crear instancia de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para requests - agregar token automáticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para responses - manejar errores globalmente
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    const status = error.response?.status
    if (status === 401) {
      // Limpiar token expirado/inválido
      localStorage.removeItem('token')
      // No forzar redirección en pantallas públicas o flujos OTP
      const path = window.location?.pathname || ''
      const safePaths = ['/login', '/register', '/verify-otp']
      const url = error.config?.url || ''
      const isOtpFlow = url.includes('/otp/') || url.includes('/auth/verify-otp') || url.includes('/auth/resend-otp')
      if (!safePaths.includes(path) && !isOtpFlow) {
        // Redirigir solo si no estamos ya en login/register/verify-otp y no es un request OTP
        try { window.location.assign('/login') } catch { /* noop */ }
      }
    }

    if (!error.response) {
      console.error('Error de red:', error.message)
    }
    return Promise.reject(error)
  }
)

// Cliente API con métodos útiles
export const apiClient = {
  // Configurar token de autenticación
  setAuthToken: (token) => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete api.defaults.headers.common['Authorization']
    }
  },

  // Métodos HTTP básicos
  get: (url, config = {}) => api.get(url, config),
  post: (url, data = {}, config = {}) => api.post(url, data, config),
  put: (url, data = {}, config = {}) => api.put(url, data, config),
  patch: (url, data = {}, config = {}) => api.patch(url, data, config),
  delete: (url, config = {}) => api.delete(url, config),

  // Métodos específicos para autenticación
  auth: {
    login: (email, password) => 
      api.post('/auth/login', { email, password }),
    
    register: (userData) => 
      api.post('/auth/register', userData),
    
    verifyOTP: (email, otp) => 
      api.post('/auth/verify-otp', { email, otp }),
    
    resendOTP: (email) => 
      api.post('/auth/resend-otp', { email }),
    
    getProfile: () => 
      api.get('/auth/profile'),
    
    updateProfile: (profileData) => 
      api.put('/auth/profile', profileData),
  },

  // Métodos para productos
  products: {
    getAll: (params = {}) => 
      api.get('/products', { params }),
    
    getById: (id) => 
      api.get(`/products/${id}`),
    
    create: (productData) => 
      api.post('/products', productData),
    
    update: (id, productData) => 
      api.put(`/products/${id}`, productData),
    
    delete: (id) => 
      api.delete(`/products/${id}`),
    
    updateStock: (id, stockData) => 
      api.patch(`/products/${id}/stock`, stockData),
    
    getCategories: () => 
      api.get('/products/categories'),
  },

  // Métodos para pedidos
  orders: {
    getAll: (params = {}) => 
      api.get('/orders', { params }),
    
    getById: (id) => 
      api.get(`/orders/${id}`),
    
    create: (orderData) => 
      api.post('/orders', orderData),
    
    updateStatus: (id, estado) => 
      api.put(`/orders/${id}/status`, { estado }),
    
    assignDelivery: (id, repartidorId) => 
      api.put(`/orders/${id}/assign-delivery`, { repartidorId }),
    
    rate: (id, calificacion) => 
      api.put(`/orders/${id}/rate`, calificacion),

    // Disponibles para repartidores y tomar pedido
    getAvailable: (params = {}) =>
      api.get('/orders/available', { params }),
    claim: (id) =>
      api.put(`/orders/${id}/claim`),
  },

  // Métodos para ubicación
  location: {
    update: (ubicacion) => 
      api.put('/location/update', ubicacion),
    
    getNearbyDelivery: (params) => 
      api.get('/location/nearby-delivery', { params }),
    
    getNearbyStores: (params) => 
      api.get('/location/nearby-stores', { params }),
  },

  // Documentos de verificación
  documents: {
    upload: (tipo, file) => {
      const formData = new FormData()
      formData.append('file', file)
      return api.post(`/documents/${tipo}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    },
  },

  // Método para subir archivos
  uploadFile: (file, onUploadProgress = null) => {
    const formData = new FormData()
    formData.append('file', file)
    
    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    })
  },
}

// Exportar instancia de axios para casos especiales
export default api
