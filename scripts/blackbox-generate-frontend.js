#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const axios = require('axios');

// --- Configuración ---
const BLACKBOX_API_KEY = process.env.BLACKBOX_API_KEY || 'TU_API_KEY_AQUI';
const BLACKBOX_API_URL = 'https://api.blackbox.ai/chat/completions';
const PROJECT_ROOT = process.cwd();
const FRONTEND_DIR = path.join(PROJECT_ROOT, 'frontend');

// --- Funciones de Utilidad ---

/**
 * Crea un directorio si no existe.
 */
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Directorio creado: ${dirPath}`);
  }
}

/**
 * Escribe contenido en un archivo.
 */
function writeToFile(filePath, content) {
  fs.writeFileSync(filePath, content.trim() + '\n');
  console.log(`📝 Archivo generado: ${filePath}`);
}

/**
 * Lee el contexto de blackbox.md si existe
 */
function readBlackboxContext() {
  const blackboxPath = path.join(FRONTEND_DIR, 'blackbox.md');
  if (fs.existsSync(blackboxPath)) {
    return fs.readFileSync(blackboxPath, 'utf8');
  }
  return '';
}

/**
 * Llama a la API de Blackbox para generar código
 */
async function generateWithBlackbox(prompt, context = '') {
  const systemMessage = {
    role: 'system',
    content: `Eres un experto desarrollador frontend especializado en React, Vite, React Bootstrap y desarrollo moderno.
    Genera código limpio, bien documentado y siguiendo las mejores prácticas de React.
    
    Contexto del proyecto YEGA:
    - Frontend React con Vite
    - UI: React Bootstrap + Styled Components
    - Routing: React Router con protección por roles
    - Estado: Context API + React Query
    - Mapas: React Leaflet para geolocalización
    - Roles: Cliente, Tienda, Repartidor, Administrador
    - Paleta: Negro (#000), Blanco (#FFF), Plata (#C0C0C0), Oro (#D4AF37)
    - Diseño: Mobile-first, responsive
    
    ${context ? `Contexto adicional:\n${context}` : ''}`
  };

  const userMessage = {
    role: 'user',
    content: prompt
  };

  try {
    const response = await axios.post(BLACKBOX_API_URL, {
      model: 'blackboxai',
      messages: [systemMessage, userMessage],
      max_tokens: 3000,
      temperature: 0.3,
    }, {
      headers: {
        'Authorization': `Bearer ${BLACKBOX_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('❌ Error llamando a Blackbox API:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Extrae código de la respuesta de Blackbox
 */
function extractCode(response, language = 'jsx') {
  const codeBlockRegex = new RegExp(`\`\`\`${language}\\n([\\s\\S]*?)\`\`\``, 'g');
  const matches = [...response.matchAll(codeBlockRegex)];
  
  if (matches.length > 0) {
    return matches[0][1];
  }
  
  // Buscar bloques de JavaScript/JSX
  const jsRegex = /```(?:javascript|js|jsx|tsx)\n([\s\S]*?)```/g;
  const jsMatches = [...response.matchAll(jsRegex)];
  
  if (jsMatches.length > 0) {
    return jsMatches[0][1];
  }
  
  // Buscar cualquier bloque de código
  const anyCodeRegex = /```[\s\S]*?\n([\s\S]*?)```/g;
  const anyMatches = [...response.matchAll(anyCodeRegex)];
  
  if (anyMatches.length > 0) {
    return anyMatches[0][1];
  }
  
  return response;
}

// --- Tareas de Generación ---

const frontendTasks = [
  {
    name: 'Package.json',
    description: 'Configuración del proyecto React',
    prompt: `Genera el package.json para el frontend React con:
    - Información del proyecto: nombre "yega-frontend", versión, descripción
    - type: "module" para ES modules
    - Scripts: dev (vite), build, preview, lint
    - Dependencias principales: react, react-dom, react-router-dom, react-bootstrap, bootstrap, styled-components, axios, react-leaflet, leaflet, react-hook-form, @tanstack/react-query, react-toastify, react-icons, date-fns, lodash
    - DevDependencies: @vitejs/plugin-react, vite, eslint y plugins de React
    - Configuración de browserslist
    - Versiones actualizadas y compatibles
    
    Configuración moderna de React con Vite.`,
    outputPath: 'package.json'
  },
  
  {
    name: 'Vite Config',
    description: 'Configuración de Vite',
    prompt: `Genera vite.config.js con:
    - Plugin de React
    - Configuración del servidor de desarrollo en puerto 3000
    - Proxy para /api hacia http://localhost:5000
    - Configuración de build con sourcemap
    - Alias para imports si es necesario
    - Configuración optimizada para desarrollo
    
    Configuración completa de Vite para desarrollo y producción.`,
    outputPath: 'vite.config.js'
  },
  
  {
    name: 'Index HTML',
    description: 'Archivo HTML principal',
    prompt: `Genera index.html con:
    - DOCTYPE y estructura HTML5
    - Meta tags para viewport, charset, descripción
    - Título "YEGA - Tu plataforma de delivery"
    - Links a Leaflet CSS desde CDN
    - Links a Bootstrap CSS desde CDN
    - Div root para React
    - Script module para main.jsx
    - Meta tags para SEO básico
    
    HTML optimizado y bien estructurado.`,
    outputPath: 'index.html'
  },
  
  {
    name: 'Main.jsx',
    description: 'Punto de entrada de React',
    prompt: `Genera src/main.jsx con:
    - Imports de React, ReactDOM
    - Import de App component
    - Import de AuthProvider
    - Import de QueryClient y QueryClientProvider de @tanstack/react-query
    - Import de ToastContainer de react-toastify
    - Imports de CSS: react-toastify, bootstrap, global.css
    - Configuración de QueryClient con opciones por defecto
    - Estructura de providers: QueryClient > Auth > App
    - ToastContainer con configuración (position, theme dark)
    - createRoot y render con StrictMode
    
    Configuración completa del punto de entrada.`,
    outputPath: 'src/main.jsx'
  },
  
  {
    name: 'App.jsx',
    description: 'Componente principal de la aplicación',
    prompt: `Genera src/App.jsx con:
    - Imports de React Router: BrowserRouter, Routes, Route, Navigate
    - Import de useAuth hook
    - Imports de componentes: Navbar, Footer, LoadingSpinner
    - Imports de páginas: Home, Login, Register, VerifyOTP
    - Imports de dashboards por rol: Cliente, Tienda, Repartidor, Admin
    - Componente ProtectedRoute que verifica autenticación y roles
    - Componente RoleBasedRedirect que redirige según el rol del usuario
    - Rutas públicas y protegidas
    - Rutas para cada rol con protección
    - Páginas de error 404 y unauthorized
    - Estructura con Navbar, main content, Footer
    - Clase CSS min-vh-100 para altura completa
    
    Router completo con protección por roles.`,
    outputPath: 'src/App.jsx'
  },
  
  {
    name: 'AuthContext',
    description: 'Context de autenticación',
    prompt: `Genera src/context/AuthContext.jsx con:
    - createContext y useContext hook personalizado
    - Estado: user, loading, token
    - Funciones: login, register, verifyOTP, resendOTP, logout, updateProfile, updateLocation
    - Integración con apiClient para llamadas HTTP
    - Manejo de token en localStorage
    - Configuración automática de token en apiClient
    - Carga de perfil al inicializar
    - Toast notifications para feedback
    - Propiedades computadas: isAuthenticated, isClient, isStore, isDelivery, isAdmin
    - Manejo de errores y loading states
    - Limpieza de token en logout
    
    Context completo con todas las funcionalidades de auth.`,
    outputPath: 'src/context/AuthContext.jsx'
  },
  
  {
    name: 'API Client',
    description: 'Cliente para comunicación con API',
    prompt: `Genera src/services/apiClient.js con:
    - Configuración de axios con baseURL desde variables de entorno
    - Interceptor de request para agregar token automáticamente
    - Interceptor de response para manejar errores 401 y redirección
    - Objeto apiClient con métodos: get, post, put, patch, delete
    - Método setAuthToken para configurar token
    - Métodos específicos agrupados:
      - auth: login, register, verifyOTP, resendOTP, getProfile, updateProfile
      - products: getAll, getById, create, update, delete, updateStock, getCategories
      - orders: getAll, getById, create, updateStatus, assignDelivery, rate
      - location: update, getNearbyDelivery, getNearbyStores
    - Método uploadFile para subida de archivos
    - Timeout configurado
    - Headers por defecto
    - Manejo de errores de red
    
    Cliente API completo y bien estructurado.`,
    outputPath: 'src/services/apiClient.js'
  },
  
  {
    name: 'Global CSS',
    description: 'Estilos globales con paleta YEGA',
    prompt: `Genera src/styles/global.css con:
    - Variables CSS para paleta YEGA: --color-primary (#000), --color-secondary (#FFF), --color-accent-silver (#C0C0C0), --color-accent-gold (#D4AF37)
    - Variables para grises, estados (success, warning, danger, info)
    - Variables de tipografía: font-family, font-sizes
    - Variables de espaciado y border-radius
    - Variables de sombras
    - Reset básico con box-sizing
    - Estilos base para body con font-family y colores
    - Clases de botones personalizados: .btn-yega-primary, .btn-yega-secondary, .btn-yega-outline
    - Clases de cards: .card-yega con hover effects
    - Clases de formularios: .form-control-yega, .form-label-yega
    - Clases de navbar: .navbar-yega
    - Clases de footer: .footer-yega
    - Utilidades de color y background
    - Animaciones: fadeIn, slideInLeft
    - Responsive breakpoints
    - Loading spinner
    - Estilos para mapas
    - Badges y alertas personalizados
    - Scrollbar personalizado
    
    Sistema de diseño completo con paleta YEGA.`,
    outputPath: 'src/styles/global.css'
  },
  
  {
    name: 'Navbar Component',
    description: 'Barra de navegación',
    prompt: `Genera src/components/Navbar.jsx con:
    - Imports de React Bootstrap: Navbar, Nav, Container, NavDropdown, Badge
    - Import de LinkContainer de react-router-bootstrap
    - Import de useAuth hook
    - Import de iconos de react-icons/fa
    - Función getRoleIcon que retorna icono según rol
    - Función getRoleName que retorna nombre del rol en español
    - Navbar responsive con toggle
    - Brand "YEGA" con enlace a home
    - Navegación diferente para usuarios autenticados/no autenticados
    - Dropdown de usuario con nombre, rol, perfil y logout
    - Badge con rol del usuario
    - Iconos para cada rol
    - Manejo de logout
    - Clases CSS personalizadas navbar-yega
    - Variant dark
    
    Navbar completa con funcionalidad por roles.`,
    outputPath: 'src/components/Navbar.jsx'
  },
  
  {
    name: 'Footer Component',
    description: 'Pie de página',
    prompt: `Genera src/components/Footer.jsx con:
    - Imports de React Bootstrap: Container, Row, Col
    - Import de iconos de react-icons/fa
    - Información de la empresa YEGA
    - Enlaces organizados en columnas: Enlaces, Para Negocios, Contacto
    - Redes sociales con iconos
    - Información de contacto con iconos
    - Enlaces para registro de tienda y repartidor
    - Copyright dinámico con año actual
    - Enlaces a política de privacidad y términos
    - Clases CSS footer-yega
    - Estructura responsive
    - Separador horizontal
    
    Footer completo e informativo.`,
    outputPath: 'src/components/Footer.jsx'
  },
  
  {
    name: 'LoadingSpinner Component',
    description: 'Componente de carga',
    prompt: `Genera src/components/LoadingSpinner.jsx con:
    - Imports de React Bootstrap: Spinner, Container, Row, Col
    - Props: size, text, fullScreen, variant
    - Spinner de Bootstrap con configuración
    - Texto de carga opcional
    - Modo fullScreen para pantalla completa
    - Centrado vertical y horizontal
    - Variantes de color
    - Valores por defecto
    - Estructura responsive
    
    Componente de loading reutilizable.`,
    outputPath: 'src/components/LoadingSpinner.jsx'
  },
  
  {
    name: 'Home Page',
    description: 'Página de inicio',
    prompt: `Genera src/pages/Home.jsx con:
    - Imports de React Bootstrap: Container, Row, Col, Button, Card
    - Import de LinkContainer
    - Import de useAuth
    - Import de iconos de react-icons/fa
    - Hero section con título, descripción y botones CTA
    - Sección de roles con cards para cada tipo de usuario
    - Información de cada rol: Cliente, Tienda, Repartidor, Administrador
    - Iconos representativos para cada rol
    - Enlaces de registro específicos por rol
    - Sección de características/beneficios
    - Sección CTA final para usuarios no autenticados
    - Diseño responsive
    - Clases CSS personalizadas
    - Animación fade-in
    
    Landing page atractiva y funcional.`,
    outputPath: 'src/pages/Home.jsx'
  },
  
  {
    name: 'Login Page',
    description: 'Página de inicio de sesión',
    prompt: `Genera src/pages/Login.jsx con:
    - Imports de React Bootstrap: Container, Row, Col, Card, Form, Button, Alert, Spinner
    - Imports de React Router: Link, useNavigate, useLocation
    - Import de useAuth hook
    - Import de iconos de react-icons/fa
    - Estado para formData, showPassword, error, isLoading
    - useEffect para redirección si ya está autenticado
    - Función handleChange para inputs
    - Función handleSubmit con validaciones
    - Formulario con email y password
    - Toggle para mostrar/ocultar password
    - Validaciones de entrada
    - Manejo de errores con Alert
    - Loading state con Spinner
    - Enlaces a registro y recuperación de password
    - Card con información de roles
    - Diseño responsive y centrado
    - Clases CSS personalizadas
    
    Página de login completa con validaciones.`,
    outputPath: 'src/pages/Login.jsx'
  },
  
  {
    name: 'Register Page',
    description: 'Página de registro',
    prompt: `Genera src/pages/Register.jsx con:
    - Imports de React Bootstrap y React Router
    - Import de useAuth hook
    - Estado para formulario completo: nombre, telefono, email, password, confirmPassword, rol, ubicacion
    - Validaciones de entrada: email, teléfono, passwords coincidentes
    - Selector de rol con descripciones
    - Campos de ubicación para tienda/repartidor
    - Integración con geolocalización del navegador
    - Manejo de registro con OTP
    - Redirección a verificación OTP si es necesario
    - Términos y condiciones
    - Validaciones en tiempo real
    - Mensajes de error específicos
    - Loading states
    - Diseño responsive
    
    Formulario de registro completo con validaciones.`,
    outputPath: 'src/pages/Register.jsx'
  },
  
  {
    name: 'VerifyOTP Page',
    description: 'Página de verificación OTP',
    prompt: `Genera src/pages/VerifyOTP.jsx con:
    - Imports necesarios de React y React Bootstrap
    - Import de useAuth hook
    - Estado para código OTP y errores
    - Inputs para código de 6 dígitos
    - Auto-focus y navegación entre inputs
    - Validación de formato de código
    - Función de verificación con API
    - Función de reenvío de código
    - Countdown timer para reenvío
    - Manejo de errores específicos
    - Redirección después de verificación exitosa
    - Información sobre el proceso
    - Diseño centrado y responsive
    
    Página de verificación OTP intuitiva.`,
    outputPath: 'src/pages/VerifyOTP.jsx'
  },
  
  {
    name: 'Cliente Dashboard',
    description: 'Dashboard para clientes',
    prompt: `Genera src/pages/Cliente/Dashboard.jsx con:
    - Imports de React Bootstrap y hooks
    - Import de useAuth y apiClient
    - Estado para tiendas, productos, pedidos
    - Sección de tiendas cercanas con mapas
    - Catálogo de productos con filtros
    - Carrito de compras funcional
    - Historial de pedidos
    - Tracking de pedidos en tiempo real
    - Integración con mapas para ubicación
    - Búsqueda y filtros
    - Paginación
    - Responsive design
    - Paleta de colores YEGA
    
    Dashboard completo para clientes.`,
    outputPath: 'src/pages/Cliente/Dashboard.jsx'
  },
  
  {
    name: 'Tienda Dashboard',
    description: 'Dashboard para tiendas',
    prompt: `Genera src/pages/Tienda/Dashboard.jsx con:
    - Gestión de productos: crear, editar, eliminar
    - Gestión de inventario con stock
    - Gestión de pedidos recibidos
    - Estadísticas de ventas
    - Asignación de repartidores
    - Configuración de tienda
    - Actualización de ubicación
    - Estados de pedidos
    - Notificaciones
    - Diseño responsive
    - Paleta YEGA
    
    Dashboard completo para gestión de tienda.`,
    outputPath: 'src/pages/Tienda/Dashboard.jsx'
  },
  
  {
    name: 'Repartidor Dashboard',
    description: 'Dashboard para repartidores',
    prompt: `Genera src/pages/Repartidor/Dashboard.jsx con:
    - Lista de pedidos asignados
    - Mapa con rutas de entrega
    - Actualización de ubicación en tiempo real
    - Estados de entrega
    - Historial de entregas
    - Estadísticas de entregas
    - Navegación GPS
    - Notificaciones de nuevos pedidos
    - Perfil y configuración
    - Diseño mobile-first
    - Paleta YEGA
    
    Dashboard optimizado para repartidores móviles.`,
    outputPath: 'src/pages/Repartidor/Dashboard.jsx'
  },
  
  {
    name: 'Admin Dashboard',
    description: 'Dashboard para administradores',
    prompt: `Genera src/pages/Admin/Dashboard.jsx con:
    - Gestión de usuarios: aprobar, rechazar, desactivar
    - Estadísticas generales de la plataforma
    - Gestión de tiendas y repartidores
    - Monitoreo de pedidos
    - Reportes y analytics
    - Configuración del sistema
    - Logs de actividad
    - Gestión de contenido
    - Herramientas de moderación
    - Diseño de escritorio
    - Paleta YEGA
    
    Panel de administración completo.`,
    outputPath: 'src/pages/Admin/Dashboard.jsx'
  },
  
  {
    name: 'useGeolocation Hook',
    description: 'Hook para geolocalización',
    prompt: `Genera src/hooks/useGeolocation.js con:
    - Hook personalizado para obtener ubicación del navegador
    - Estado: location, loading, error
    - Función getCurrentLocation
    - Función watchPosition para seguimiento continuo
    - Manejo de errores de geolocalización
    - Opciones configurables: enableHighAccuracy, timeout, maximumAge
    - Cleanup de watchers
    - Permisos de geolocalización
    - Fallback para navegadores sin soporte
    
    Hook completo para geolocalización.`,
    outputPath: 'src/hooks/useGeolocation.js'
  },
  
  {
    name: 'useLocalStorage Hook',
    description: 'Hook para localStorage',
    prompt: `Genera src/hooks/useLocalStorage.js con:
    - Hook personalizado para manejar localStorage
    - Función para leer, escribir y eliminar del localStorage
    - Sincronización con estado de React
    - Manejo de errores de serialización
    - Soporte para valores por defecto
    - Cleanup automático
    - TypeScript-friendly
    
    Hook útil para persistencia local.`,
    outputPath: 'src/hooks/useLocalStorage.js'
  },
  
  {
    name: 'Environment Example',
    description: 'Variables de entorno',
    prompt: `Genera .env.example con:
    - VITE_API_URL para la URL del backend
    - VITE_GOOGLE_MAPS_API_KEY para mapas
    - VITE_APP_NAME y VITE_APP_VERSION
    - VITE_SUPPORT_URL y VITE_DOCS_URL
    - VITE_DEBUG y VITE_LOG_LEVEL para desarrollo
    - Comentarios explicativos para cada variable
    
    Configuración de variables de entorno para frontend.`,
    outputPath: '.env.example'
  }
];

// --- Función Principal ---

async function generateFrontendWithBlackbox() {
  console.log('🤖 GENERADOR DE FRONTEND CON BLACKBOX AI');
  console.log('═'.repeat(50));
  
  // Verificar API key
  if (BLACKBOX_API_KEY === 'TU_API_KEY_AQUI') {
    console.error('❌ Error: Configura tu BLACKBOX_API_KEY en las variables de entorno');
    console.log('💡 Obtén tu API key en: https://www.blackbox.ai/');
    console.log('💡 Configura: export BLACKBOX_API_KEY="tu_api_key_aqui"');
    process.exit(1);
  }
  
  // Crear estructura de directorios
  console.log('📁 Creando estructura de directorios...');
  ensureDirectoryExists(FRONTEND_DIR);
  ensureDirectoryExists(path.join(FRONTEND_DIR, 'src'));
  ensureDirectoryExists(path.join(FRONTEND_DIR, 'src', 'components'));
  ensureDirectoryExists(path.join(FRONTEND_DIR, 'src', 'pages'));
  ensureDirectoryExists(path.join(FRONTEND_DIR, 'src', 'pages', 'Cliente'));
  ensureDirectoryExists(path.join(FRONTEND_DIR, 'src', 'pages', 'Tienda'));
  ensureDirectoryExists(path.join(FRONTEND_DIR, 'src', 'pages', 'Repartidor'));
  ensureDirectoryExists(path.join(FRONTEND_DIR, 'src', 'pages', 'Admin'));
  ensureDirectoryExists(path.join(FRONTEND_DIR, 'src', 'services'));
  ensureDirectoryExists(path.join(FRONTEND_DIR, 'src', 'context'));
  ensureDirectoryExists(path.join(FRONTEND_DIR, 'src', 'hooks'));
  ensureDirectoryExists(path.join(FRONTEND_DIR, 'src', 'styles'));
  
  // Leer contexto existente
  const context = readBlackboxContext();
  
  // Generar cada archivo
  for (const task of frontendTasks) {
    console.log(`\n🤖 Generando: ${task.name}`);
    console.log(`📝 Descripción: ${task.description}`);
    
    try {
      const response = await generateWithBlackbox(task.prompt, context);
      const code = extractCode(response);
      
      const outputPath = path.join(FRONTEND_DIR, task.outputPath);
      writeToFile(outputPath, code);
      
      console.log(`✅ ${task.name} generado exitosamente`);
      
      // Pausa entre llamadas para evitar rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ Error generando ${task.name}:`, error.message);
      console.log(`⏭️  Continuando con el siguiente archivo...`);
    }
  }
  
  console.log('\n🎉 ¡Generación de frontend completada!');
  console.log('\n📋 Próximos pasos:');
  console.log('1. cd frontend && npm install');
  console.log('2. cp .env.example .env');
  console.log('3. Configurar variables en .env');
  console.log('4. npm run dev');
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  generateFrontendWithBlackbox().catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
}

module.exports = { generateFrontendWithBlackbox };