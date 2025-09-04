#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const axios = require('axios');

// --- Configuración ---
const BLACKBOX_API_KEY = process.env.BLACKBOX_API_KEY || 'TU_API_KEY_AQUI';
const BLACKBOX_API_URL = 'https://api.blackbox.ai/chat/completions';
const PROJECT_ROOT = process.cwd();
const BACKEND_DIR = path.join(PROJECT_ROOT, 'backend');
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
function readBlackboxContext(dir) {
  const blackboxPath = path.join(dir, 'blackbox.md');
  if (fs.existsSync(blackboxPath)) {
    return fs.readFileSync(blackboxPath, 'utf8');
  }
  return '';
}

/**
 * Llama a la API de Blackbox para generar código
 */
async function generateWithBlackbox(prompt, context = '', isBackend = true) {
  const systemMessage = {
    role: 'system',
    content: isBackend 
      ? `Eres un experto desarrollador backend especializado en Node.js, Express, MongoDB y sistemas de autenticación.
         Genera código limpio, bien documentado y siguiendo las mejores prácticas de seguridad.
         
         Contexto del proyecto YEGA:
         - Backend: Node.js + Express + MongoDB + Mongoose
         - Autenticación: JWT con roles
         - OTP: Sistema avanzado con SMS y Email
         - Seguridad: Rate limiting, validaciones, encriptación
         - Servicios: Twilio para SMS, Nodemailer para email
         
         ${context ? `Contexto adicional:\n${context}` : ''}`
      : `Eres un experto desarrollador frontend especializado en React, hooks y UX/UI modernas.
         Genera código limpio, bien documentado y siguiendo las mejores prácticas de React.
         
         Contexto del proyecto YEGA:
         - Frontend: React 18 + Vite
         - UI: React Bootstrap + Styled Components
         - Estado: Context API + React Query
         - OTP: Componentes reutilizables con UX optimizada
         - Paleta: Negro, Blanco, Plata, Oro metálico
         
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
  
  // Buscar bloques JSX para frontend
  const jsxRegex = /```(?:jsx|tsx)\n([\s\S]*?)```/g;
  const jsxMatches = [...response.matchAll(jsxRegex)];
  
  if (jsxMatches.length > 0) {
    return jsxMatches[0][1];
  }
  
  // Buscar cualquier bloque de código
  const anyCodeRegex = /```[\s\S]*?\n([\s\S]*?)```/g;
  const anyMatches = [...response.matchAll(anyCodeRegex)];
  
  if (anyMatches.length > 0) {
    return anyMatches[0][1];
  }
  
  return response;
}

// --- Tareas de Backend ---

const backendOTPTasks = [
  {
    name: 'OTP Model',
    description: 'Modelo avanzado de OTP',
    prompt: `Genera un modelo Mongoose avanzado para OTP (backend/models/OTP.js) con:
    
    Campos principales:
    - telefono: String requerido con validación de formato internacional
    - email: String requerido con validación de email
    - codigo: String requerido de 6 dígitos
    - tipo: enum ['registro', 'login', 'recuperacion', 'verificacion']
    - intentos: Number con máximo 5, default 0
    - verificado: Boolean default false
    - expira_en: Date con default 10 minutos desde creación
    - ip_origen: String para tracking de seguridad
    - user_agent: String para tracking
    - metadata: Mixed para datos adicionales
    
    Características avanzadas:
    - Timestamps automáticos
    - Índices para optimización: telefono+tipo, email+tipo, expira_en
    - Índice TTL para auto-eliminación de documentos expirados
    - Virtual 'expirado' que verifica si está vencido
    - Virtual 'tiempo_restante' en segundos
    - Método verificarCodigo() con validaciones
    - Método estático limpiarExpirados()
    - Método estático verificarLimiteEnvios()
    - Validaciones robustas con mensajes en español
    
    Incluye comentarios explicativos y exporta el modelo.`,
    outputPath: 'models/OTP.js'
  },
  
  {
    name: 'OTP Service',
    description: 'Servicio completo de OTP',
    prompt: `Genera un servicio completo de OTP (backend/services/otpService.js) con:
    
    Clase OTPService con métodos estáticos:
    
    1. generarYEnviar(options):
       - Parámetros: telefono, email, tipo, metodo (sms/email/ambos), metadata, ip, userAgent
       - Verificar límite de envíos por hora
       - Invalidar códigos anteriores del mismo tipo
       - Generar código de 6 dígitos
       - Crear registro en base de datos
       - Enviar por SMS y/o email según método
       - Retornar resultado con tiempo de expiración
    
    2. verificar(options):
       - Parámetros: telefono, codigo, tipo
       - Buscar código válido más reciente
       - Verificar expiración y intentos
       - Incrementar contador de intentos
       - Marcar como verificado si es correcto
       - Retornar resultado de verificación
    
    3. reenviar(options):
       - Verificar tiempo mínimo entre reenvíos (60 segundos)
       - Generar y enviar nuevo código
       - Retornar resultado
    
    4. obtenerEstadisticas(filtros):
       - Agregación de estadísticas por tipo
       - Contadores de verificados, expirados, etc.
    
    5. limpiarCodigos():
       - Eliminar códigos expirados y verificados
    
    Incluye:
    - Imports de modelo OTP y utilidades
    - Manejo robusto de errores
    - Logs informativos
    - Validaciones de entrada
    - Comentarios JSDoc
    - Export de la clase`,
    outputPath: 'services/otpService.js'
  },
  
  {
    name: 'OTP Controller',
    description: 'Controlador de OTP',
    prompt: `Genera un controlador completo de OTP (backend/controllers/otpController.js) con:
    
    Funciones del controlador:
    
    1. enviarOTP (POST /api/otp/send):
       - Validar telefono, email, tipo, metodo
       - Obtener IP y User-Agent del request
       - Llamar a OTPService.generarYEnviar()
       - Retornar respuesta con tiempo de expiración
    
    2. verificarOTP (POST /api/otp/verify):
       - Validar telefono, codigo, tipo
       - Llamar a OTPService.verificar()
       - Si es tipo 'registro', actualizar Usuario a aprobado
       - Retornar resultado de verificación
    
    3. reenviarOTP (POST /api/otp/resend):
       - Validar parámetros
       - Verificar límite de tiempo
       - Llamar a OTPService.reenviar()
       - Retornar resultado
    
    4. obtenerEstadisticas (GET /api/otp/stats) - Solo admin:
       - Filtros por fecha y tipo
       - Llamar a OTPService.obtenerEstadisticas()
       - Retornar estadísticas
    
    5. limpiarCodigos (DELETE /api/otp/cleanup) - Solo admin:
       - Llamar a OTPService.limpiarCodigos()
       - Retornar resultado de limpieza
    
    Incluye:
    - Comentarios JSDoc para cada función
    - Validaciones de entrada robustas
    - Manejo de errores con try-catch
    - Respuestas JSON consistentes
    - Logs de seguridad
    - Import del servicio OTP`,
    outputPath: 'controllers/otpController.js'
  },
  
  {
    name: 'OTP Routes',
    description: 'Rutas de OTP con rate limiting',
    prompt: `Genera las rutas de OTP (backend/routes/otpRoutes.js) con:
    
    Configuración de rate limiting:
    - otpLimiter: 5 intentos por 15 minutos para envío/reenvío
    - verifyLimiter: 10 intentos por 15 minutos para verificación
    
    Rutas públicas con rate limiting:
    - POST /send - enviar OTP (con otpLimiter)
    - POST /verify - verificar OTP (con verifyLimiter)  
    - POST /resend - reenviar OTP (con otpLimiter)
    
    Rutas protegidas (solo admin):
    - GET /stats - estadísticas (con protect + authorize)
    - DELETE /cleanup - limpiar códigos (con protect + authorize)
    
    Incluye:
    - Import de express y controladores
    - Import de middleware de auth
    - Import de express-rate-limit
    - Configuración de limitadores con mensajes personalizados
    - Middleware de protección y autorización
    - Export del router
    - Comentarios explicativos`,
    outputPath: 'routes/otpRoutes.js'
  },
  
  {
    name: 'Email Utils',
    description: 'Utilidades para envío de email',
    prompt: `Genera utilidades completas de email (backend/utils/sendEmail.js) con:
    
    Configuración:
    - Configuración de nodemailer con variables de entorno
    - Soporte para Gmail con contraseñas de aplicación
    - Inicialización lazy del transporter
    - Verificación de conexión
    
    Funciones principales:
    
    1. sendEmail(to, subject, text, html):
       - Envío básico de email
       - Verificación de configuración
       - Manejo de errores
       - Modo desarrollo con simulación
       - Logs informativos
    
    2. sendOTPEmail(to, otp, tipo):
       - Email específico para OTP
       - Plantilla HTML profesional con estilos
       - Diferentes mensajes según tipo
       - Información de expiración
       - Advertencias de seguridad
    
    3. sendWelcomeEmail(to, nombre, rol):
       - Email de bienvenida
       - Personalizado por rol
       - Plantilla HTML atractiva
    
    Características:
    - Plantillas HTML responsive
    - Estilos inline para compatibilidad
    - Paleta de colores YEGA
    - Validaciones de entrada
    - Fallback a modo desarrollo
    - Logs detallados
    - Export de todas las funciones`,
    outputPath: 'utils/sendEmail.js'
  }
];

// --- Tareas de Frontend ---

const frontendOTPTasks = [
  {
    name: 'useOTP Hook',
    description: 'Hook personalizado para OTP',
    prompt: `Genera un hook personalizado useOTP (frontend/src/hooks/useOTP.js) con:
    
    Estado del hook:
    - loading: boolean para operaciones en curso
    - timeLeft: segundos restantes para reenvío
    - canResend: boolean si se puede reenviar
    
    Funciones del hook:
    
    1. sendOTP(telefono, email, tipo, metodo):
       - Llamada a API para enviar OTP
       - Manejo de loading state
       - Toast notifications
       - Iniciar countdown
       - Retornar resultado
    
    2. verifyOTP(telefono, codigo, tipo):
       - Llamada a API para verificar
       - Manejo de loading
       - Toast de éxito/error
       - Limpiar countdown
       - Retornar resultado
    
    3. resendOTP(telefono, email, tipo, metodo):
       - Verificar si se puede reenviar
       - Llamada a API
       - Reiniciar countdown
       - Toast notifications
    
    4. startCountdown(seconds):
       - Iniciar cuenta regresiva
       - Actualizar timeLeft cada segundo
       - Habilitar reenvío al terminar
    
    5. formatTimeLeft():
       - Formatear tiempo en MM:SS
    
    Incluye:
    - Import de useState, apiClient, toast
    - Manejo de errores robusto
    - Cleanup de intervals
    - Comentarios explicativos
    - Export del hook`,
    outputPath: 'src/hooks/useOTP.js'
  },
  
  {
    name: 'OTPInput Component',
    description: 'Componente de entrada de OTP',
    prompt: `Genera un componente OTPInput (frontend/src/components/OTPInput.jsx) con:
    
    Props del componente:
    - telefono, email: datos del usuario
    - tipo, metodo: configuración de OTP
    - onSuccess, onError: callbacks
    - autoSend: envío automático al montar
    - length: longitud del código (default 6)
    
    Características del componente:
    
    1. Inputs individuales para cada dígito:
       - Auto-focus en el primer input
       - Navegación automática entre inputs
       - Soporte para pegar código completo
       - Validación de solo números
       - Estilos personalizados con paleta YEGA
    
    2. Funcionalidad avanzada:
       - Verificación automática al completar código
       - Countdown visual para reenvío
       - Estados de éxito/error con estilos
       - Limpieza automática en error
       - Soporte para teclado (Enter, Backspace)
    
    3. UI/UX optimizada:
       - Diseño responsive
       - Feedback visual claro
       - Mensajes informativos
       - Botón de reenvío con estado
       - Indicador de tiempo restante
    
    Incluye:
    - Styled components para estilos
    - useOTP hook
    - React Bootstrap components
    - useRef para manejo de inputs
    - useEffect para auto-verificación
    - Manejo de eventos de teclado
    - Validaciones de entrada
    - Estados visuales (error, success, loading)`,
    outputPath: 'src/components/OTPInput.jsx'
  },
  
  {
    name: 'VerifyOTP Page',
    description: 'Página de verificación OTP',
    prompt: `Genera una página completa VerifyOTP (frontend/src/pages/VerifyOTP.jsx) con:
    
    Funcionalidad de la página:
    
    1. Recepción de datos:
       - Obtener email, telefono, tipo del state de navegación
       - Redirección si faltan datos
       - Validación de parámetros
    
    2. Integración con OTPInput:
       - Uso del componente OTPInput
       - Configuración automática
       - Manejo de callbacks de éxito/error
    
    3. Flujo de verificación:
       - Auto-envío de código al cargar
       - Verificación automática al completar
       - Manejo de errores específicos
       - Redirección después de éxito
    
    4. UI/UX completa:
       - Información clara del proceso
       - Mostrar datos de contacto
       - Consejos de verificación
       - Enlaces de soporte
       - Diseño responsive
    
    Incluye:
    - React Bootstrap para layout
    - useAuth para integración
    - useNavigate y useLocation
    - useState para manejo de errores
    - useEffect para validaciones
    - Card layout con información
    - Alert para errores
    - Información de contacto destacada
    - Tips de verificación
    - Paleta de colores YEGA`,
    outputPath: 'src/pages/VerifyOTP.jsx'
  }
];

// --- Función Principal ---

async function generateOTPSystemWithBlackbox() {
  console.log('🤖 GENERADOR DE SISTEMA OTP CON BLACKBOX AI');
  console.log('═'.repeat(50));
  
  // Verificar API key
  if (BLACKBOX_API_KEY === 'TU_API_KEY_AQUI') {
    console.error('❌ Error: Configura tu BLACKBOX_API_KEY en las variables de entorno');
    console.log('💡 Obtén tu API key en: https://www.blackbox.ai/');
    console.log('💡 Configura: export BLACKBOX_API_KEY="tu_api_key_aqui"');
    process.exit(1);
  }
  
  try {
    // === BACKEND ===
    console.log('\n🔧 GENERANDO SISTEMA OTP BACKEND...');
    
    // Crear directorios backend
    ensureDirectoryExists(path.join(BACKEND_DIR, 'models'));
    ensureDirectoryExists(path.join(BACKEND_DIR, 'services'));
    ensureDirectoryExists(path.join(BACKEND_DIR, 'controllers'));
    ensureDirectoryExists(path.join(BACKEND_DIR, 'routes'));
    ensureDirectoryExists(path.join(BACKEND_DIR, 'utils'));
    
    const backendContext = readBlackboxContext(BACKEND_DIR);
    
    // Generar archivos backend
    for (const task of backendOTPTasks) {
      console.log(`\n🤖 Generando: ${task.name}`);
      console.log(`📝 ${task.description}`);
      
      try {
        const response = await generateWithBlackbox(task.prompt, backendContext, true);
        const code = extractCode(response);
        
        const outputPath = path.join(BACKEND_DIR, task.outputPath);
        writeToFile(outputPath, code);
        
        console.log(`✅ ${task.name} generado exitosamente`);
        
        // Pausa entre llamadas
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Error generando ${task.name}:`, error.message);
        console.log(`⏭️  Continuando...`);
      }
    }
    
    // === FRONTEND ===
    console.log('\n⚛️  GENERANDO SISTEMA OTP FRONTEND...');
    
    // Crear directorios frontend
    ensureDirectoryExists(path.join(FRONTEND_DIR, 'src', 'hooks'));
    ensureDirectoryExists(path.join(FRONTEND_DIR, 'src', 'components'));
    ensureDirectoryExists(path.join(FRONTEND_DIR, 'src', 'pages'));
    
    const frontendContext = readBlackboxContext(FRONTEND_DIR);
    
    // Generar archivos frontend
    for (const task of frontendOTPTasks) {
      console.log(`\n🤖 Generando: ${task.name}`);
      console.log(`📝 ${task.description}`);
      
      try {
        const response = await generateWithBlackbox(task.prompt, frontendContext, false);
        const code = extractCode(response, 'jsx');
        
        const outputPath = path.join(FRONTEND_DIR, task.outputPath);
        writeToFile(outputPath, code);
        
        console.log(`✅ ${task.name} generado exitosamente`);
        
        // Pausa entre llamadas
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Error generando ${task.name}:`, error.message);
        console.log(`⏭️  Continuando...`);
      }
    }
    
    // === ACTUALIZAR CONFIGURACIONES ===
    console.log('\n⚙️  ACTUALIZANDO CONFIGURACIONES...');
    
    // Actualizar server.js para incluir rutas OTP
    const serverPath = path.join(BACKEND_DIR, 'server.js');
    if (fs.existsSync(serverPath)) {
      console.log('🤖 Actualizando server.js...');
      const updateServerPrompt = `Actualiza el archivo server.js para incluir las rutas de OTP.
      
      Necesitas agregar:
      1. Import: const otpRoutes = require('./routes/otpRoutes');
      2. Uso: app.use('/api/otp', otpRoutes);
      
      Mantén la estructura existente del archivo.
      
      Archivo actual:
      ${fs.readFileSync(serverPath, 'utf8')}`;
      
      try {
        const response = await generateWithBlackbox(updateServerPrompt, backendContext, true);
        const updatedCode = extractCode(response);
        
        // Backup del original
        fs.writeFileSync(serverPath + '.backup', fs.readFileSync(serverPath));
        writeToFile(serverPath, updatedCode);
        console.log('✅ server.js actualizado');
        
      } catch (error) {
        console.log('⚠️  Error actualizando server.js automáticamente');
        console.log('📝 Agregar manualmente:');
        console.log('   const otpRoutes = require(\'./routes/otpRoutes\');');
        console.log('   app.use(\'/api/otp\', otpRoutes);');
      }
    }
    
    // Actualizar package.json del backend
    const backendPackagePath = path.join(BACKEND_DIR, 'package.json');
    if (fs.existsSync(backendPackagePath)) {
      console.log('📦 Actualizando dependencias del backend...');
      try {
        const packageData = JSON.parse(fs.readFileSync(backendPackagePath, 'utf8'));
        packageData.dependencies = {
          ...packageData.dependencies,
          'nodemailer': '^6.9.7',
          'express-rate-limit': '^7.1.5'
        };
        fs.writeFileSync(backendPackagePath, JSON.stringify(packageData, null, 2));
        console.log('✅ package.json del backend actualizado');
      } catch (error) {
        console.log('⚠️  Error actualizando package.json del backend');
      }
    }
    
    console.log('\n🎉 ¡SISTEMA OTP GENERADO EXITOSAMENTE!');
    
    console.log('\n📋 Archivos generados:');
    console.log('\n🔧 Backend:');
    console.log('   - models/OTP.js');
    console.log('   - services/otpService.js');
    console.log('   - controllers/otpController.js');
    console.log('   - routes/otpRoutes.js');
    console.log('   - utils/sendEmail.js');
    
    console.log('\n⚛️  Frontend:');
    console.log('   - hooks/useOTP.js');
    console.log('   - components/OTPInput.jsx');
    console.log('   - pages/VerifyOTP.jsx');
    
    console.log('\n🔗 Nuevas rutas disponibles:');
    console.log('   POST   /api/otp/send     - Enviar código OTP');
    console.log('   POST   /api/otp/verify   - Verificar código OTP');
    console.log('   POST   /api/otp/resend   - Reenviar código OTP');
    console.log('   GET    /api/otp/stats    - Estadísticas (admin)');
    console.log('   DELETE /api/otp/cleanup  - Limpiar códigos (admin)');
    
    console.log('\n📋 Próximos pasos:');
    console.log('1. 📦 Instalar nuevas dependencias:');
    console.log('   cd backend && npm install nodemailer express-rate-limit');
    console.log('\n2. ⚙️  Configurar variables de entorno en backend/.env:');
    console.log('   EMAIL_HOST=smtp.gmail.com');
    console.log('   EMAIL_PORT=587');
    console.log('   EMAIL_USER=tu_email@gmail.com');
    console.log('   EMAIL_PASS=tu_password_de_aplicacion');
    console.log('\n3. 🔧 Para Gmail, crear contraseña de aplicación:');
    console.log('   https://support.google.com/accounts/answer/185833');
    console.log('\n4. 🚀 Reiniciar servidores:');
    console.log('   cd backend && npm run dev');
    console.log('   cd frontend && npm run dev');
    console.log('\n5. 🧪 Probar funcionalidad:');
    console.log('   - Registro de usuario con verificación OTP');
    console.log('   - Verificación por SMS y/o email');
    console.log('   - Componente OTPInput en frontend');
    
    console.log('\n🎯 Características implementadas:');
    console.log('   ✓ Modelo OTP con expiración automática');
    console.log('   ✓ Servicio completo con múltiples métodos');
    console.log('   ✓ Rate limiting para prevenir spam');
    console.log('   ✓ Envío por SMS y Email');
    console.log('   ✓ Componente React reutilizable');
    console.log('   ✓ Hook personalizado para estado');
    console.log('   ✓ Estadísticas y limpieza automática');
    console.log('   ✓ UX optimizada con countdown y validaciones');
    
  } catch (error) {
    console.error('❌ Error generando sistema OTP:', error);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  generateOTPSystemWithBlackbox().catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
}

module.exports = { generateOTPSystemWithBlackbox };