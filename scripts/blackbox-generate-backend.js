#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const axios = require('axios');

// --- Configuración ---
const BLACKBOX_API_KEY = process.env.BLACKBOX_API_KEY || 'TU_API_KEY_AQUI';
const BLACKBOX_API_URL = 'https://api.blackbox.ai/chat/completions';
const PROJECT_ROOT = process.cwd();
const BACKEND_DIR = path.join(PROJECT_ROOT, 'backend');

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
  const blackboxPath = path.join(BACKEND_DIR, 'blackbox.md');
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
    content: `Eres un experto desarrollador full-stack especializado en Node.js, Express, MongoDB y arquitectura MVC. 
    Genera código limpio, bien documentado y siguiendo las mejores prácticas.
    
    Contexto del proyecto YEGA:
    - E-commerce con roles: Cliente, Tienda, Repartidor, Administrador
    - Backend: Node.js + Express + MongoDB + Mongoose
    - Autenticación: JWT con roles
    - Funcionalidades: OTP, geolocalización, gestión de pedidos
    - Arquitectura: MVC con modelos, controladores y rutas
    
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
function extractCode(response, language = 'javascript') {
  const codeBlockRegex = new RegExp(`\`\`\`${language}\\n([\\s\\S]*?)\`\`\``, 'g');
  const matches = [...response.matchAll(codeBlockRegex)];
  
  if (matches.length > 0) {
    return matches[0][1];
  }
  
  // Si no hay bloques de código específicos, buscar cualquier bloque
  const anyCodeRegex = /```[\s\S]*?\n([\s\S]*?)```/g;
  const anyMatches = [...response.matchAll(anyCodeRegex)];
  
  if (anyMatches.length > 0) {
    return anyMatches[0][1];
  }
  
  return response; // Devolver respuesta completa si no hay bloques de código
}

// --- Tareas de Generación ---

const backendTasks = [
  {
    name: 'server.js',
    description: 'Archivo principal del servidor',
    prompt: `Genera el archivo server.js principal para el backend de YEGA con:
    - Configuración de Express
    - Conexión a MongoDB con Mongoose
    - Middleware de CORS, JSON parsing
    - Configuración de rutas para auth, productos, pedidos, ubicación
    - Middleware de manejo de errores
    - Variables de entorno con dotenv
    - Puerto configurable
    - Mensaje de inicio del servidor
    
    Incluye comentarios explicativos y manejo robusto de errores.`,
    outputPath: 'server.js'
  },
  
  {
    name: 'Usuario Model',
    description: 'Modelo de Usuario con roles y ubicación',
    prompt: `Genera el modelo Mongoose para Usuario (backend/models/Usuario.js) con:
    - Campos: nombre, telefono, email, password, rol, estado_validacion
    - Campo ubicacion con latitud, longitud, direccion, timestamp
    - Roles: cliente, tienda, repartidor, administrador
    - Estados: pendiente, aprobado, rechazado
    - Campos para OTP: otp, otp_expires
    - Validaciones apropiadas y mensajes de error
    - Hash de password con bcrypt en pre-save
    - Método matchPassword para comparar passwords
    - Método actualizarUbicacion
    - Índices para optimizar consultas
    - Timestamps automáticos
    
    Incluye comentarios y validaciones robustas.`,
    outputPath: 'models/Usuario.js'
  },
  
  {
    name: 'Producto Model',
    description: 'Modelo de Producto',
    prompt: `Genera el modelo Mongoose para Producto (backend/models/Producto.js) con:
    - Campos: nombre, descripcion, precio, stock, tiendaId (ref Usuario)
    - Campos adicionales: categoria, imagen, disponible, peso, tiempo_preparacion
    - Campo tags como array de strings
    - Validaciones de precio y stock no negativos
    - Referencia a Usuario (tienda)
    - Métodos: reducirStock, aumentarStock
    - Virtual enStock que verifica stock > 0 y disponible = true
    - Índices para optimizar consultas
    - Middleware pre-save para validar que tiendaId sea una tienda válida
    - Timestamps automáticos
    
    Incluye validaciones completas y métodos útiles.`,
    outputPath: 'models/Producto.js'
  },
  
  {
    name: 'Pedido Model',
    description: 'Modelo de Pedido complejo',
    prompt: `Genera el modelo Mongoose para Pedido (backend/models/Pedido.js) con:
    - Campos principales: numero_pedido (único), clienteId, tiendaId, repartidorId
    - Array productos con: producto (ref), cantidad, precio_unitario, subtotal
    - Campos de precio: subtotal, costo_envio, total
    - Estados: pendiente, confirmado, preparando, listo, en_camino, entregado, cancelado
    - Dirección de envío como subdocumento con: calle, numero, ciudad, referencias, coordenadas
    - Método de pago: efectivo, tarjeta, transferencia
    - Campos de tiempo: tiempo_estimado, fecha_entrega_estimada, fecha_entrega_real
    - Sistema de calificación: puntuacion (1-5), comentario
    - Método calcularTotales()
    - Método cambiarEstado() con validaciones de transición
    - Pre-save para generar numero_pedido automático
    - Índices para consultas eficientes
    - Virtual estadoTexto para mostrar estado en español
    
    Incluye lógica de negocio robusta y validaciones.`,
    outputPath: 'models/Pedido.js'
  },
  
  {
    name: 'Auth Controller',
    description: 'Controlador de autenticación',
    prompt: `Genera el controlador de autenticación (backend/controllers/authController.js) con:
    - registerUser: registro con validaciones, OTP para no-clientes, hash password
    - loginUser: validación de credenciales, verificación de estado, generación JWT
    - verifyOTP: verificación de código OTP y aprobación de cuenta
    - resendOTP: reenvío de código OTP con límites de tiempo
    - getProfile: obtener perfil del usuario autenticado
    - updateProfile: actualizar datos del perfil
    - Manejo robusto de errores con try-catch
    - Validaciones de entrada
    - Respuestas JSON consistentes con success, message, data
    - Integración con utils de OTP y SMS
    - Logs de seguridad
    
    Incluye comentarios JSDoc y manejo de errores completo.`,
    outputPath: 'controllers/authController.js'
  },
  
  {
    name: 'Product Controller',
    description: 'Controlador de productos',
    prompt: `Genera el controlador de productos (backend/controllers/productController.js) con:
    - getProducts: listar con paginación, filtros (tienda, categoría, precio), búsqueda por texto
    - getProductById: obtener producto específico con populate de tienda
    - createProduct: crear producto (solo tiendas), validaciones
    - updateProduct: actualizar producto (solo propietario), validaciones
    - deleteProduct: eliminar producto (solo propietario)
    - getCategories: obtener categorías disponibles
    - updateStock: actualizar stock con operaciones (set, add, subtract)
    - Autorización por roles
    - Validaciones de entrada
    - Paginación con metadata
    - Populate de relaciones
    - Manejo de errores específicos
    - Respuestas JSON consistentes
    
    Incluye autorización granular y validaciones robustas.`,
    outputPath: 'controllers/productController.js'
  },
  
  {
    name: 'Order Controller',
    description: 'Controlador de pedidos',
    prompt: `Genera el controlador de pedidos (backend/controllers/orderController.js) con:
    - createOrder: crear pedido (solo clientes), validar productos, calcular totales, reducir stock
    - getUserOrders: obtener pedidos según rol (cliente, tienda, repartidor, admin)
    - getOrderById: obtener pedido específico con autorización
    - updateOrderStatus: cambiar estado con validaciones de transición por rol
    - assignDelivery: asignar repartidor (solo tienda/admin)
    - rateOrder: calificar pedido (solo cliente, pedido entregado)
    - Funciones auxiliares: calcularCostoEnvio, calcularTiempoEstimado
    - Validaciones de stock y disponibilidad
    - Autorización granular por rol
    - Populate completo de relaciones
    - Manejo de transacciones para consistencia
    - Respuestas con paginación
    
    Incluye lógica de negocio compleja y validaciones estrictas.`,
    outputPath: 'controllers/orderController.js'
  },
  
  {
    name: 'Location Controller',
    description: 'Controlador de geolocalización',
    prompt: `Genera el controlador de ubicación (backend/controllers/locationController.js) con:
    - updateLocation: actualizar ubicación (solo repartidores/tiendas)
    - getNearbyDelivery: obtener repartidores cercanos con cálculo de distancia
    - getNearbyStores: obtener tiendas cercanas con filtros
    - Función calcularDistancia usando fórmula de Haversine
    - Validaciones de coordenadas (latitud -90 a 90, longitud -180 a 180)
    - Filtros por radio de búsqueda
    - Ordenamiento por distancia
    - Autorización por roles
    - Respuestas con metadata de distancia
    - Manejo de errores geográficos
    
    Incluye cálculos geográficos precisos y validaciones.`,
    outputPath: 'controllers/locationController.js'
  },
  
  {
    name: 'Auth Middleware',
    description: 'Middleware de autenticación y autorización',
    prompt: `Genera el middleware de autenticación (backend/middleware/authMiddleware.js) con:
    - protect: verificar JWT, validar usuario activo, adjuntar req.user
    - authorize(roles): verificar roles específicos
    - requireValidation: verificar estado de validación de cuenta
    - Manejo de tokens expirados e inválidos
    - Verificación de usuario activo
    - Logs de seguridad
    - Respuestas de error consistentes
    - Soporte para múltiples roles
    - Validación de headers Authorization
    - Extracción segura de tokens
    
    Incluye seguridad robusta y logging.`,
    outputPath: 'middleware/authMiddleware.js'
  },
  
  {
    name: 'Auth Routes',
    description: 'Rutas de autenticación',
    prompt: `Genera las rutas de autenticación (backend/routes/authRoutes.js) con:
    - POST /register - registro de usuarios
    - POST /login - inicio de sesión
    - POST /verify-otp - verificación OTP
    - POST /resend-otp - reenvío OTP
    - GET /profile - obtener perfil (protegido)
    - PUT /profile - actualizar perfil (protegido)
    - Middleware de protección donde corresponde
    - Importación de controladores
    - Exportación del router
    - Comentarios de documentación de rutas
    
    Estructura clara y bien documentada.`,
    outputPath: 'routes/authRoutes.js'
  },
  
  {
    name: 'Product Routes',
    description: 'Rutas de productos',
    prompt: `Genera las rutas de productos (backend/routes/productRoutes.js) con:
    - GET / - listar productos (público)
    - GET /categories - obtener categorías (público)
    - GET /:id - obtener producto por ID (público)
    - POST / - crear producto (tienda/admin)
    - PUT /:id - actualizar producto (tienda/admin)
    - DELETE /:id - eliminar producto (tienda/admin)
    - PATCH /:id/stock - actualizar stock (tienda/admin)
    - Middleware de autorización por roles
    - Importación de controladores y middleware
    - Comentarios de documentación
    
    Rutas RESTful con autorización apropiada.`,
    outputPath: 'routes/productRoutes.js'
  },
  
  {
    name: 'Order Routes',
    description: 'Rutas de pedidos',
    prompt: `Genera las rutas de pedidos (backend/routes/orderRoutes.js) con:
    - POST / - crear pedido (cliente)
    - GET / - obtener pedidos del usuario
    - GET /:id - obtener pedido específico
    - PUT /:id/status - actualizar estado (tienda/repartidor/admin)
    - PUT /:id/assign-delivery - asignar repartidor (tienda/admin)
    - PUT /:id/rate - calificar pedido (cliente)
    - Middleware de autorización granular
    - Importación de controladores
    - Comentarios de documentación
    
    Rutas con autorización específica por operación.`,
    outputPath: 'routes/orderRoutes.js'
  },
  
  {
    name: 'Location Routes',
    description: 'Rutas de geolocalización',
    prompt: `Genera las rutas de ubicación (backend/routes/locationRoutes.js) con:
    - PUT /update - actualizar ubicación (repartidor/tienda)
    - GET /nearby-delivery - repartidores cercanos
    - GET /nearby-stores - tiendas cercanas
    - Middleware de autorización
    - Importación de controladores
    - Comentarios de documentación
    
    Rutas específicas para funcionalidades de ubicación.`,
    outputPath: 'routes/locationRoutes.js'
  },
  
  {
    name: 'OTP Utils',
    description: 'Utilidades para OTP',
    prompt: `Genera las utilidades de OTP (backend/utils/generateOTP.js) con:
    - generateOTP(): generar código de 6 dígitos
    - generateCustomOTP(length, alphanumeric): código personalizable
    - validateOTPFormat(otp, expectedLength): validar formato
    - Funciones puras sin dependencias externas
    - Validaciones robustas
    - Comentarios JSDoc
    - Exportación de múltiples funciones
    
    Utilidades reutilizables y bien documentadas.`,
    outputPath: 'utils/generateOTP.js'
  },
  
  {
    name: 'SMS Utils',
    description: 'Utilidades para envío de SMS',
    prompt: `Genera las utilidades de SMS (backend/utils/sendSMS.js) con:
    - sendSMS(to, message): envío básico con Twilio
    - sendOTPSMS(to, otp, appName): SMS específico para OTP
    - sendOrderNotificationSMS(to, orderNumber, status): notificaciones de pedido
    - isValidPhoneNumber(phoneNumber): validación de formato
    - formatPhoneNumber(phoneNumber): formateo para Twilio
    - Configuración con variables de entorno
    - Manejo de errores de Twilio
    - Modo desarrollo con simulación
    - Logs informativos
    - Validaciones de entrada
    
    Integración completa con Twilio y manejo de errores.`,
    outputPath: 'utils/sendSMS.js'
  },
  
  {
    name: 'Package.json',
    description: 'Configuración de dependencias',
    prompt: `Genera el package.json para el backend con:
    - Información del proyecto: nombre, versión, descripción
    - Scripts: start, dev (nodemon), test
    - Dependencias principales: express, mongoose, bcryptjs, jsonwebtoken, dotenv, cors, twilio, helmet, express-rate-limit, express-validator, nodemailer
    - DevDependencies: nodemon, jest, supertest
    - Configuración de engines para Node.js 16+
    - Keywords relevantes
    - Licencia MIT
    - Autor del proyecto
    
    Configuración completa y actualizada.`,
    outputPath: 'package.json'
  },
  
  {
    name: 'Environment Example',
    description: 'Archivo de variables de entorno',
    prompt: `Genera el archivo .env.example con:
    - PORT para el servidor
    - NODE_ENV para entorno
    - MONGODB_URI para conexión a base de datos
    - JWT_SECRET y JWT_EXPIRES_IN para autenticación
    - Variables de Twilio: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
    - Variables de email: EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS
    - FRONTEND_URL para CORS
    - Configuración de archivos: UPLOAD_PATH, MAX_FILE_SIZE
    - API keys opcionales
    - Comentarios explicativos para cada variable
    
    Documentación completa de configuración.`,
    outputPath: '.env.example'
  }
];

// --- Función Principal ---

async function generateBackendWithBlackbox() {
  console.log('🤖 GENERADOR DE BACKEND CON BLACKBOX AI');
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
  ensureDirectoryExists(BACKEND_DIR);
  ensureDirectoryExists(path.join(BACKEND_DIR, 'models'));
  ensureDirectoryExists(path.join(BACKEND_DIR, 'controllers'));
  ensureDirectoryExists(path.join(BACKEND_DIR, 'routes'));
  ensureDirectoryExists(path.join(BACKEND_DIR, 'middleware'));
  ensureDirectoryExists(path.join(BACKEND_DIR, 'utils'));
  
  // Leer contexto existente
  const context = readBlackboxContext();
  
  // Generar cada archivo
  for (const task of backendTasks) {
    console.log(`\n🤖 Generando: ${task.name}`);
    console.log(`📝 Descripción: ${task.description}`);
    
    try {
      const response = await generateWithBlackbox(task.prompt, context);
      const code = extractCode(response);
      
      const outputPath = path.join(BACKEND_DIR, task.outputPath);
      writeToFile(outputPath, code);
      
      console.log(`✅ ${task.name} generado exitosamente`);
      
      // Pausa entre llamadas para evitar rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ Error generando ${task.name}:`, error.message);
      console.log(`⏭️  Continuando con el siguiente archivo...`);
    }
  }
  
  console.log('\n🎉 ¡Generación de backend completada!');
  console.log('\n📋 Próximos pasos:');
  console.log('1. cd backend && npm install');
  console.log('2. cp .env.example .env');
  console.log('3. Configurar variables en .env');
  console.log('4. npm run dev');
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  generateBackendWithBlackbox().catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
}

module.exports = { generateBackendWithBlackbox };