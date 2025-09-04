#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// --- Configuración ---
const PROJECT_ROOT = process.cwd();
const FRONTEND_DIR = path.join(PROJECT_ROOT, 'frontend');
const SRC_DIR = path.join(FRONTEND_DIR, 'src');
const COMPONENTS_DIR = path.join(SRC_DIR, 'components');
const PAGES_DIR = path.join(SRC_DIR, 'pages');
const SERVICES_DIR = path.join(SRC_DIR, 'services');
const STYLES_DIR = path.join(SRC_DIR, 'styles');
const HOOKS_DIR = path.join(SRC_DIR, 'hooks');
const UTILS_DIR = path.join(SRC_DIR, 'utils');
const CONTEXT_DIR = path.join(SRC_DIR, 'context');

// --- Funciones de Utilidad ---

/**
 * Crea un directorio si no existe.
 * @param {string} dirPath - La ruta del directorio a crear.
 */
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Directorio creado: ${dirPath}`);
  }
}

/**
 * Escribe contenido en un archivo.
 * @param {string} filePath - La ruta del archivo.
 * @param {string} content - El contenido a escribir.
 */
function writeToFile(filePath, content) {
  fs.writeFileSync(filePath, content.trim() + '\n');
  console.log(`📝 Archivo generado: ${filePath}`);
}

// --- Contenido de Archivos ---

const packageJsonContent = `
{
  "name": "yega-frontend",
  "version": "1.0.0",
  "description": "Frontend para YEGA - Plataforma de e-commerce con múltiples roles",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.15.0",
    "react-bootstrap": "^2.8.0",
    "bootstrap": "^5.3.0",
    "styled-components": "^6.0.7",
    "axios": "^1.5.0",
    "react-leaflet": "^4.2.1",
    "leaflet": "^1.9.4",
    "react-hook-form": "^7.45.4",
    "react-query": "^3.39.3",
    "react-toastify": "^9.1.3",
    "react-icons": "^4.10.1",
    "date-fns": "^2.30.0",
    "lodash": "^4.17.21"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.3",
    "vite": "^4.4.5",
    "eslint": "^8.45.0",
    "eslint-plugin-react": "^7.32.2",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.3"
  },
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
`;

const viteConfigContent = `
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
`;

const indexHtmlContent = `
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>YEGA - Tu plataforma de delivery</title>
    <meta name="description" content="YEGA - Plataforma de delivery que conecta clientes, tiendas y repartidores" />
    
    <!-- Leaflet CSS -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossorigin=""/>
    
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`;

const mainJsxContent = `
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles/global.css'

// Configurar React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
`;

const appJsxContent = `
import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import LoadingSpinner from './components/LoadingSpinner'

// Páginas públicas
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import VerifyOTP from './pages/VerifyOTP'

// Páginas por rol
import ClienteDashboard from './pages/Cliente/Dashboard'
import TiendaDashboard from './pages/Tienda/Dashboard'
import RepartidorDashboard from './pages/Repartidor/Dashboard'
import AdminDashboard from './pages/Admin/Dashboard'

// Componente de ruta protegida
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.rol)) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}

// Componente para redireccionar según el rol
const RoleBasedRedirect = () => {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  switch (user.rol) {
    case 'cliente':
      return <Navigate to="/cliente" replace />
    case 'tienda':
      return <Navigate to="/tienda" replace />
    case 'repartidor':
      return <Navigate to="/repartidor" replace />
    case 'administrador':
      return <Navigate to="/admin" replace />
    default:
      return <Navigate to="/login" replace />
  }
}

function App() {
  return (
    <Router>
      <div className="App d-flex flex-column min-vh-100">
        <Navbar />
        
        <main className="flex-grow-1">
          <Routes>
            {/* Rutas públicas */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
            
            {/* Redirección basada en rol */}
            <Route path="/dashboard" element={<RoleBasedRedirect />} />
            
            {/* Rutas protegidas por rol */}
            <Route 
              path="/cliente/*" 
              element={
                <ProtectedRoute allowedRoles={['cliente']}>
                  <ClienteDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/tienda/*" 
              element={
                <ProtectedRoute allowedRoles={['tienda']}>
                  <TiendaDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/repartidor/*" 
              element={
                <ProtectedRoute allowedRoles={['repartidor']}>
                  <RepartidorDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin/*" 
              element={
                <ProtectedRoute allowedRoles={['administrador']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Página de no autorizado */}
            <Route 
              path="/unauthorized" 
              element={
                <div className="container mt-5 text-center">
                  <h2>Acceso No Autorizado</h2>
                  <p>No tienes permisos para acceder a esta página.</p>
                </div>
              } 
            />
            
            {/* Página 404 */}
            <Route 
              path="*" 
              element={
                <div className="container mt-5 text-center">
                  <h2>Página No Encontrada</h2>
                  <p>La página que buscas no existe.</p>
                </div>
              } 
            />
          </Routes>
        </main>
        
        <Footer />
      </div>
    </Router>
  )
}

export default App
`;

const authContextContent = `
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

  // Configurar token en apiClient al cargar
  useEffect(() => {
    if (token) {
      apiClient.setAuthToken(token)
      loadUserProfile()
    } else {
      setLoading(false)
    }
  }, [token])

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
      const message = error.response?.data?.message || 'Error al iniciar sesión'
      toast.error(message)
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
  const verifyOTP = async (email, otp) => {
    try {
      setLoading(true)
      await apiClient.post('/auth/verify-otp', { email, otp })
      
      toast.success('Cuenta verificada exitosamente. Puedes iniciar sesión.')
      return { success: true }
      
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

  // Función de logout
  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    apiClient.setAuthToken(null)
    toast.info('Sesión cerrada')
  }

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
`;

const apiClientContent = `
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
      config.headers.Authorization = \`Bearer \${token}\`
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
    // Manejar errores de autenticación
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    
    // Manejar errores de red
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
      api.defaults.headers.common['Authorization'] = \`Bearer \${token}\`
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
      api.get(\`/products/\${id}\`),
    
    create: (productData) => 
      api.post('/products', productData),
    
    update: (id, productData) => 
      api.put(\`/products/\${id}\`, productData),
    
    delete: (id) => 
      api.delete(\`/products/\${id}\`),
    
    updateStock: (id, stockData) => 
      api.patch(\`/products/\${id}/stock\`, stockData),
    
    getCategories: () => 
      api.get('/products/categories'),
  },

  // Métodos para pedidos
  orders: {
    getAll: (params = {}) => 
      api.get('/orders', { params }),
    
    getById: (id) => 
      api.get(\`/orders/\${id}\`),
    
    create: (orderData) => 
      api.post('/orders', orderData),
    
    updateStatus: (id, estado) => 
      api.put(\`/orders/\${id}/status\`, { estado }),
    
    assignDelivery: (id, repartidorId) => 
      api.put(\`/orders/\${id}/assign-delivery\`, { repartidorId }),
    
    rate: (id, calificacion) => 
      api.put(\`/orders/\${id}/rate\`, calificacion),
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
`;

const globalCssContent = `
/* Estilos globales para YEGA */

:root {
  /* Paleta de colores YEGA */
  --color-primary: #000000;      /* Negro */
  --color-secondary: #FFFFFF;    /* Blanco */
  --color-accent-silver: #C0C0C0; /* Plata */
  --color-accent-gold: #D4AF37;   /* Oro metálico */
  
  /* Variaciones de grises */
  --color-gray-100: #f8f9fa;
  --color-gray-200: #e9ecef;
  --color-gray-300: #dee2e6;
  --color-gray-400: #ced4da;
  --color-gray-500: #adb5bd;
  --color-gray-600: #6c757d;
  --color-gray-700: #495057;
  --color-gray-800: #343a40;
  --color-gray-900: #212529;
  
  /* Estados */
  --color-success: #28a745;
  --color-warning: #ffc107;
  --color-danger: #dc3545;
  --color-info: #17a2b8;
  
  /* Tipografía */
  --font-family-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;
  
  /* Espaciado */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-2xl: 3rem;
  
  /* Bordes */
  --border-radius-sm: 0.25rem;
  --border-radius-md: 0.375rem;
  --border-radius-lg: 0.5rem;
  --border-radius-xl: 0.75rem;
  
  /* Sombras */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

/* Reset y estilos base */
* {
  box-sizing: border-box;
}

body {
  font-family: var(--font-family-primary);
  background-color: var(--color-primary);
  color: var(--color-secondary);
  line-height: 1.6;
  margin: 0;
  padding: 0;
}

/* Estilos para enlaces */
a {
  color: var(--color-accent-gold);
  text-decoration: none;
  transition: color 0.2s ease;
}

a:hover {
  color: var(--color-accent-silver);
  text-decoration: underline;
}

/* Botones personalizados */
.btn-yega-primary {
  background-color: var(--color-accent-gold);
  border-color: var(--color-accent-gold);
  color: var(--color-primary);
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-yega-primary:hover {
  background-color: var(--color-accent-silver);
  border-color: var(--color-accent-silver);
  color: var(--color-primary);
  transform: translateY(-1px);
}

.btn-yega-secondary {
  background-color: transparent;
  border: 2px solid var(--color-accent-silver);
  color: var(--color-accent-silver);
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-yega-secondary:hover {
  background-color: var(--color-accent-silver);
  color: var(--color-primary);
}

.btn-yega-outline {
  background-color: transparent;
  border: 1px solid var(--color-secondary);
  color: var(--color-secondary);
  transition: all 0.2s ease;
}

.btn-yega-outline:hover {
  background-color: var(--color-secondary);
  color: var(--color-primary);
}

/* Cards personalizadas */
.card-yega {
  background-color: var(--color-gray-900);
  border: 1px solid var(--color-gray-700);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  transition: all 0.2s ease;
}

.card-yega:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-accent-gold);
}

.card-yega .card-header {
  background-color: var(--color-gray-800);
  border-bottom: 1px solid var(--color-gray-700);
  color: var(--color-accent-gold);
  font-weight: 600;
}

.card-yega .card-body {
  color: var(--color-secondary);
}

/* Formularios */
.form-control-yega {
  background-color: var(--color-gray-800);
  border: 1px solid var(--color-gray-600);
  color: var(--color-secondary);
  border-radius: var(--border-radius-md);
  transition: all 0.2s ease;
}

.form-control-yega:focus {
  background-color: var(--color-gray-700);
  border-color: var(--color-accent-gold);
  box-shadow: 0 0 0 0.2rem rgba(212, 175, 55, 0.25);
  color: var(--color-secondary);
}

.form-control-yega::placeholder {
  color: var(--color-gray-400);
}

.form-label-yega {
  color: var(--color-accent-silver);
  font-weight: 500;
  margin-bottom: var(--spacing-sm);
}

/* Navegación */
.navbar-yega {
  background-color: var(--color-primary) !important;
  border-bottom: 2px solid var(--color-accent-gold);
  box-shadow: var(--shadow-md);
}

.navbar-yega .navbar-brand {
  color: var(--color-accent-gold) !important;
  font-weight: 700;
  font-size: var(--font-size-xl);
}

.navbar-yega .nav-link {
  color: var(--color-secondary) !important;
  font-weight: 500;
  transition: color 0.2s ease;
}

.navbar-yega .nav-link:hover {
  color: var(--color-accent-gold) !important;
}

.navbar-yega .nav-link.active {
  color: var(--color-accent-gold) !important;
}

/* Footer */
.footer-yega {
  background-color: var(--color-gray-900);
  border-top: 2px solid var(--color-accent-gold);
  color: var(--color-gray-300);
  padding: var(--spacing-xl) 0;
}

/* Utilidades */
.text-yega-gold {
  color: var(--color-accent-gold) !important;
}

.text-yega-silver {
  color: var(--color-accent-silver) !important;
}

.bg-yega-dark {
  background-color: var(--color-gray-900) !important;
}

.bg-yega-darker {
  background-color: var(--color-gray-800) !important;
}

/* Animaciones */
.fade-in {
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.slide-in-left {
  animation: slideInLeft 0.5s ease-out;
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .container-fluid {
    padding-left: var(--spacing-md);
    padding-right: var(--spacing-md);
  }
  
  .card-yega {
    margin-bottom: var(--spacing-md);
  }
}

/* Estados de carga */
.loading-spinner {
  border: 3px solid var(--color-gray-600);
  border-top: 3px solid var(--color-accent-gold);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Estilos para mapas */
.map-container {
  height: 400px;
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  border: 2px solid var(--color-gray-700);
}

.map-container .leaflet-container {
  height: 100%;
  width: 100%;
}

/* Badges personalizados */
.badge-yega-gold {
  background-color: var(--color-accent-gold);
  color: var(--color-primary);
}

.badge-yega-silver {
  background-color: var(--color-accent-silver);
  color: var(--color-primary);
}

/* Alertas personalizadas */
.alert-yega {
  border-radius: var(--border-radius-md);
  border: none;
  font-weight: 500;
}

.alert-yega-success {
  background-color: rgba(40, 167, 69, 0.1);
  color: var(--color-success);
  border-left: 4px solid var(--color-success);
}

.alert-yega-warning {
  background-color: rgba(255, 193, 7, 0.1);
  color: var(--color-warning);
  border-left: 4px solid var(--color-warning);
}

.alert-yega-danger {
  background-color: rgba(220, 53, 69, 0.1);
  color: var(--color-danger);
  border-left: 4px solid var(--color-danger);
}

.alert-yega-info {
  background-color: rgba(23, 162, 184, 0.1);
  color: var(--color-info);
  border-left: 4px solid var(--color-info);
}

/* Scrollbar personalizado */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: var(--color-gray-800);
}

::-webkit-scrollbar-thumb {
  background: var(--color-gray-600);
  border-radius: var(--border-radius-sm);
}

::-webkit-scrollbar-thumb:hover {
  background: var(--color-accent-gold);
}
`;

const navbarComponentContent = `
import React from 'react'
import { Navbar, Nav, Container, NavDropdown, Badge } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'
import { useAuth } from '../context/AuthContext'
import { FaUser, FaShoppingCart, FaTruck, FaCog, FaSignOutAlt } from 'react-icons/fa'

const CustomNavbar = () => {
  const { user, logout, isAuthenticated } = useAuth()

  const handleLogout = () => {
    logout()
  }

  const getRoleIcon = (rol) => {
    switch (rol) {
      case 'cliente':
        return <FaShoppingCart className="me-1" />
      case 'tienda':
        return <FaCog className="me-1" />
      case 'repartidor':
        return <FaTruck className="me-1" />
      case 'administrador':
        return <FaUser className="me-1" />
      default:
        return <FaUser className="me-1" />
    }
  }

  const getRoleName = (rol) => {
    const roles = {
      cliente: 'Cliente',
      tienda: 'Tienda',
      repartidor: 'Repartidor',
      administrador: 'Administrador'
    }
    return roles[rol] || rol
  }

  return (
    <Navbar expand="lg" className="navbar-yega" variant="dark">
      <Container>
        <LinkContainer to="/">
          <Navbar.Brand>
            <strong>YEGA</strong>
          </Navbar.Brand>
        </LinkContainer>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {!isAuthenticated && (
              <>
                <LinkContainer to="/">
                  <Nav.Link>Inicio</Nav.Link>
                </LinkContainer>
              </>
            )}
            
            {isAuthenticated && (
              <>
                <LinkContainer to="/dashboard">
                  <Nav.Link>Dashboard</Nav.Link>
                </LinkContainer>
              </>
            )}
          </Nav>

          <Nav>
            {!isAuthenticated ? (
              <>
                <LinkContainer to="/login">
                  <Nav.Link>Iniciar Sesión</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/register">
                  <Nav.Link>Registrarse</Nav.Link>
                </LinkContainer>
              </>
            ) : (
              <NavDropdown
                title={
                  <span>
                    {getRoleIcon(user.rol)}
                    {user.nombre}
                    <Badge bg="secondary" className="ms-2">
                      {getRoleName(user.rol)}
                    </Badge>
                  </span>
                }
                id="user-dropdown"
                align="end"
              >
                <NavDropdown.Item>
                  <FaUser className="me-2" />
                  {user.email}
                </NavDropdown.Item>
                
                <NavDropdown.Divider />
                
                <LinkContainer to="/profile">
                  <NavDropdown.Item>
                    <FaCog className="me-2" />
                    Mi Perfil
                  </NavDropdown.Item>
                </LinkContainer>
                
                <NavDropdown.Divider />
                
                <NavDropdown.Item onClick={handleLogout}>
                  <FaSignOutAlt className="me-2" />
                  Cerrar Sesión
                </NavDropdown.Item>
              </NavDropdown>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default CustomNavbar
`;

const footerComponentContent = `
import React from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer-yega mt-auto">
      <Container>
        <Row>
          <Col md={4} className="mb-4">
            <h5 className="text-yega-gold mb-3">YEGA</h5>
            <p className="mb-3">
              Tu plataforma de delivery que conecta clientes, tiendas y repartidores 
              de manera eficiente y segura.
            </p>
            <div className="d-flex gap-3">
              <a href="#" className="text-decoration-none">
                <FaFacebook size={20} />
              </a>
              <a href="#" className="text-decoration-none">
                <FaTwitter size={20} />
              </a>
              <a href="#" className="text-decoration-none">
                <FaInstagram size={20} />
              </a>
              <a href="#" className="text-decoration-none">
                <FaLinkedin size={20} />
              </a>
            </div>
          </Col>

          <Col md={2} className="mb-4">
            <h6 className="text-yega-silver mb-3">Enlaces</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a href="/" className="text-decoration-none">Inicio</a>
              </li>
              <li className="mb-2">
                <a href="/about" className="text-decoration-none">Acerca de</a>
              </li>
              <li className="mb-2">
                <a href="/services" className="text-decoration-none">Servicios</a>
              </li>
              <li className="mb-2">
                <a href="/contact" className="text-decoration-none">Contacto</a>
              </li>
            </ul>
          </Col>

          <Col md={3} className="mb-4">
            <h6 className="text-yega-silver mb-3">Para Negocios</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a href="/register?rol=tienda" className="text-decoration-none">
                  Registra tu Tienda
                </a>
              </li>
              <li className="mb-2">
                <a href="/register?rol=repartidor" className="text-decoration-none">
                  Únete como Repartidor
                </a>
              </li>
              <li className="mb-2">
                <a href="/business-support" className="text-decoration-none">
                  Soporte Empresarial
                </a>
              </li>
              <li className="mb-2">
                <a href="/api-docs" className="text-decoration-none">
                  API para Desarrolladores
                </a>
              </li>
            </ul>
          </Col>

          <Col md={3} className="mb-4">
            <h6 className="text-yega-silver mb-3">Contacto</h6>
            <div className="mb-2">
              <FaPhone className="me-2" />
              <span>+1 (555) 123-4567</span>
            </div>
            <div className="mb-2">
              <FaEnvelope className="me-2" />
              <span>contacto@yega.com</span>
            </div>
            <div className="mb-2">
              <FaMapMarkerAlt className="me-2" />
              <span>123 Calle Principal, Ciudad</span>
            </div>
          </Col>
        </Row>

        <hr className="my-4" style={{ borderColor: 'var(--color-gray-700)' }} />

        <Row>
          <Col md={6}>
            <p className="mb-0">
              &copy; {currentYear} YEGA. Todos los derechos reservados.
            </p>
          </Col>
          <Col md={6} className="text-md-end">
            <a href="/privacy" className="text-decoration-none me-3">
              Política de Privacidad
            </a>
            <a href="/terms" className="text-decoration-none">
              Términos de Servicio
            </a>
          </Col>
        </Row>
      </Container>
    </footer>
  )
}

export default Footer
`;

const loadingSpinnerContent = `
import React from 'react'
import { Spinner, Container, Row, Col } from 'react-bootstrap'

const LoadingSpinner = ({ 
  size = 'lg', 
  text = 'Cargando...', 
  fullScreen = false,
  variant = 'warning' 
}) => {
  const content = (
    <div className="text-center">
      <Spinner 
        animation="border" 
        variant={variant} 
        size={size}
        className="mb-3"
      />
      {text && (
        <div className="text-muted">
          {text}
        </div>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <Container fluid className="d-flex align-items-center justify-content-center min-vh-100">
        <Row>
          <Col>
            {content}
          </Col>
        </Row>
      </Container>
    )
  }

  return content
}

export default LoadingSpinner
`;

const homePageContent = `
import React from 'react'
import { Container, Row, Col, Button, Card } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'
import { useAuth } from '../context/AuthContext'
import { FaShoppingCart, FaStore, FaTruck, FaCog } from 'react-icons/fa'

const Home = () => {
  const { isAuthenticated } = useAuth()

  const roles = [
    {
      title: 'Cliente',
      description: 'Descubre y ordena de tus tiendas favoritas',
      icon: <FaShoppingCart size={48} />,
      color: 'primary',
      registerLink: '/register?rol=cliente'
    },
    {
      title: 'Tienda',
      description: 'Vende tus productos y gestiona tu negocio',
      icon: <FaStore size={48} />,
      color: 'success',
      registerLink: '/register?rol=tienda'
    },
    {
      title: 'Repartidor',
      description: 'Gana dinero entregando pedidos',
      icon: <FaTruck size={48} />,
      color: 'info',
      registerLink: '/register?rol=repartidor'
    },
    {
      title: 'Administrador',
      description: 'Gestiona la plataforma completa',
      icon: <FaCog size={48} />,
      color: 'warning',
      registerLink: '/register?rol=administrador'
    }
  ]

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

      {/* Roles Section */}
      <section className="py-5">
        <Container>
          <Row>
            <Col lg={8} className="mx-auto text-center mb-5">
              <h2 className="display-5 fw-bold text-yega-gold mb-4">
                ¿Cómo quieres participar?
              </h2>
              <p className="lead text-muted">
                YEGA ofrece oportunidades para todos. Elige tu rol y comienza 
                a formar parte de nuestra plataforma.
              </p>
            </Col>
          </Row>
          
          <Row>
            {roles.map((role, index) => (
              <Col lg={3} md={6} className="mb-4" key={index}>
                <Card className="card-yega h-100 text-center">
                  <Card.Body className="d-flex flex-column">
                    <div className="text-yega-gold mb-3">
                      {role.icon}
                    </div>
                    <Card.Title className="text-yega-silver">
                      {role.title}
                    </Card.Title>
                    <Card.Text className="flex-grow-1">
                      {role.description}
                    </Card.Text>
                    
                    {!isAuthenticated && (
                      <LinkContainer to={role.registerLink}>
                        <Button 
                          variant={role.color} 
                          className="mt-auto"
                        >
                          Registrarse como {role.title}
                        </Button>
                      </LinkContainer>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            ))}
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
`;

const loginPageContent = `
import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Redireccionar si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/dashboard'
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, location])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Limpiar error al escribir
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Validaciones básicas
    if (!formData.email || !formData.password) {
      setError('Todos los campos son requeridos')
      setIsLoading(false)
      return
    }

    if (!formData.email.includes('@')) {
      setError('Por favor ingresa un email válido')
      setIsLoading(false)
      return
    }

    try {
      const result = await login(formData.email, formData.password)
      
      if (result.success) {
        // Redireccionar según el rol
        const redirectPath = location.state?.from?.pathname || '/dashboard'
        navigate(redirectPath, { replace: true })
      } else {
        setError(result.error || 'Error al iniciar sesión')
      }
    } catch (err) {
      setError('Error inesperado. Por favor intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card className="card-yega">
            <Card.Header className="text-center">
              <h3 className="mb-0">Iniciar Sesión</h3>
            </Card.Header>
            
            <Card.Body className="p-4">
              {error && (
                <Alert variant="danger" className="alert-yega-danger">
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label className="form-label-yega">
                    <FaEnvelope className="me-2" />
                    Email
                  </Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="tu@email.com"
                    className="form-control-yega"
                    disabled={isLoading}
                    autoComplete="email"
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="form-label-yega">
                    <FaLock className="me-2" />
                    Contraseña
                  </Form.Label>
                  <div className="position-relative">
                    <Form.Control
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Tu contraseña"
                      className="form-control-yega pe-5"
                      disabled={isLoading}
                      autoComplete="current-password"
                    />
                    <Button
                      variant="link"
                      className="position-absolute end-0 top-50 translate-middle-y border-0 text-muted"
                      style={{ zIndex: 10 }}
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </Button>
                  </div>
                </Form.Group>

                <Button
                  type="submit"
                  className="w-100 btn-yega-primary"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Iniciando sesión...
                    </>
                  ) : (
                    'Iniciar Sesión'
                  )}
                </Button>
              </Form>

              <hr className="my-4" />

              <div className="text-center">
                <p className="mb-2">
                  ¿No tienes una cuenta?{' '}
                  <Link to="/register" className="text-decoration-none">
                    Regístrate aquí
                  </Link>
                </p>
                <p className="mb-0">
                  <Link to="/forgot-password" className="text-decoration-none text-muted">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </p>
              </div>
            </Card.Body>
          </Card>

          {/* Información adicional */}
          <Card className="card-yega mt-4">
            <Card.Body className="text-center">
              <h6 className="text-yega-gold mb-3">Acceso por Rol</h6>
              <div className="row text-sm">
                <div className="col-6 mb-2">
                  <strong>Cliente:</strong> Realiza pedidos
                </div>
                <div className="col-6 mb-2">
                  <strong>Tienda:</strong> Gestiona productos
                </div>
                <div className="col-6">
                  <strong>Repartidor:</strong> Entrega pedidos
                </div>
                <div className="col-6">
                  <strong>Admin:</strong> Gestiona plataforma
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default Login
`;

const envExampleContent = `
# Variables de entorno para el frontend de YEGA

# URL de la API del backend
VITE_API_URL=http://localhost:5000/api

# Configuración de mapas
VITE_GOOGLE_MAPS_API_KEY=tu_google_maps_api_key

# Configuración de la aplicación
VITE_APP_NAME=YEGA
VITE_APP_VERSION=1.0.0

# URLs externas
VITE_SUPPORT_URL=https://support.yega.com
VITE_DOCS_URL=https://docs.yega.com

# Configuración de desarrollo
VITE_DEBUG=true
VITE_LOG_LEVEL=debug
`;

// --- Lógica Principal ---

async function generateFrontend() {
  console.log('🚀 Iniciando generación de la estructura del frontend YEGA...\n');

  try {
    // 1. Crear directorios principales
    console.log('📁 Creando estructura de directorios...');
    ensureDirectoryExists(FRONTEND_DIR);
    ensureDirectoryExists(SRC_DIR);
    ensureDirectoryExists(COMPONENTS_DIR);
    ensureDirectoryExists(PAGES_DIR);
    ensureDirectoryExists(SERVICES_DIR);
    ensureDirectoryExists(STYLES_DIR);
    ensureDirectoryExists(HOOKS_DIR);
    ensureDirectoryExists(UTILS_DIR);
    ensureDirectoryExists(CONTEXT_DIR);

    // Crear subdirectorios para páginas por rol
    ensureDirectoryExists(path.join(PAGES_DIR, 'Cliente'));
    ensureDirectoryExists(path.join(PAGES_DIR, 'Tienda'));
    ensureDirectoryExists(path.join(PAGES_DIR, 'Repartidor'));
    ensureDirectoryExists(path.join(PAGES_DIR, 'Admin'));

    // 2. Crear archivos de configuración
    console.log('\n⚙️  Generando archivos de configuración...');
    writeToFile(path.join(FRONTEND_DIR, 'package.json'), packageJsonContent);
    writeToFile(path.join(FRONTEND_DIR, 'vite.config.js'), viteConfigContent);
    writeToFile(path.join(FRONTEND_DIR, 'index.html'), indexHtmlContent);
    writeToFile(path.join(FRONTEND_DIR, '.env.example'), envExampleContent);

    // 3. Crear archivos principales de React
    console.log('\n⚛️  Generando archivos principales de React...');
    writeToFile(path.join(SRC_DIR, 'main.jsx'), mainJsxContent);
    writeToFile(path.join(SRC_DIR, 'App.jsx'), appJsxContent);

    // 4. Crear contexto de autenticación
    console.log('\n🔐 Generando contexto de autenticación...');
    writeToFile(path.join(CONTEXT_DIR, 'AuthContext.jsx'), authContextContent);

    // 5. Crear servicios
    console.log('\n🌐 Generando servicios de API...');
    writeToFile(path.join(SERVICES_DIR, 'apiClient.js'), apiClientContent);

    // 6. Crear estilos globales
    console.log('\n🎨 Generando estilos globales...');
    writeToFile(path.join(STYLES_DIR, 'global.css'), globalCssContent);

    // 7. Crear componentes básicos
    console.log('\n🧩 Generando componentes básicos...');
    writeToFile(path.join(COMPONENTS_DIR, 'Navbar.jsx'), navbarComponentContent);
    writeToFile(path.join(COMPONENTS_DIR, 'Footer.jsx'), footerComponentContent);
    writeToFile(path.join(COMPONENTS_DIR, 'LoadingSpinner.jsx'), loadingSpinnerContent);

    // 8. Crear páginas básicas
    console.log('\n📄 Generando páginas básicas...');
    writeToFile(path.join(PAGES_DIR, 'Home.jsx'), homePageContent);
    writeToFile(path.join(PAGES_DIR, 'Login.jsx'), loginPageContent);

    // 9. Crear archivo .gitignore
    const gitignoreContent = `
# Dependencies
node_modules/
/.pnp
.pnp.js

# Testing
/coverage

# Production
/build
/dist

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Editor directories and files
.vscode/
.idea/
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Temporary files
*.tmp
*.temp
`;
    writeToFile(path.join(FRONTEND_DIR, '.gitignore'), gitignoreContent);

    console.log('\n✅ Frontend generado exitosamente!');
    console.log('\n📋 Pasos siguientes:');
    console.log('1. 📦 Instalar dependencias:');
    console.log('   cd frontend && npm install');
    console.log('\n2. ⚙️  Configurar variables de entorno:');
    console.log('   cp .env.example .env');
    console.log('   # Editar .env con tus configuraciones');
    console.log('\n3. 🚀 Iniciar servidor de desarrollo:');
    console.log('   npm run dev');
    console.log('\n4. 🏗️  Para producción:');
    console.log('   npm run build');
    console.log('\n🌐 El frontend estará disponible en: http://localhost:3000');
    console.log('\n📝 Próximos pasos recomendados:');
    console.log('   - Completar páginas por rol (Cliente, Tienda, Repartidor, Admin)');
    console.log('   - Implementar componentes de mapa con react-leaflet');
    console.log('   - Agregar formularios de registro y verificación OTP');
    console.log('   - Crear hooks personalizados para geolocalización');

  } catch (error) {
    console.error('❌ Error generando frontend:', error);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  generateFrontend();
}

module.exports = { generateFrontend };