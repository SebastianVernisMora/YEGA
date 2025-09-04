#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// --- Configuración ---
const PROJECT_ROOT = process.cwd();
const BACKEND_DIR = path.join(PROJECT_ROOT, 'backend');
const FRONTEND_DIR = path.join(PROJECT_ROOT, 'frontend');

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

/**
 * Actualiza un archivo existente agregando contenido
 * @param {string} filePath - Ruta del archivo
 * @param {string} content - Contenido a agregar
 * @param {string} marker - Marcador donde insertar
 */
function updateFile(filePath, content, marker) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Archivo ${filePath} no encontrado. Saltando actualización.`);
    return;
  }

  try {
    let fileContent = fs.readFileSync(filePath, 'utf8');
    
    if (!fileContent.includes(content.trim())) {
      if (marker && fileContent.includes(marker)) {
        fileContent = fileContent.replace(marker, marker + '\n' + content);
      } else {
        fileContent += '\n' + content;
      }
      
      fs.writeFileSync(filePath, fileContent);
      console.log(`✅ Archivo ${filePath} actualizado`);
    } else {
      console.log(`ℹ️  Contenido ya existe en ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error actualizando ${filePath}:`, error.message);
  }
}

// --- Contenido de Archivos Backend ---

const otpModelContent = `
// backend/models/OTP.js
const mongoose = require('mongoose');

const OTPSchema = new mongoose.Schema({
  telefono: {
    type: String,
    required: [true, 'El teléfono es requerido'],
    match: [/^\\+?[1-9]\\d{1,14}$/, 'Formato de teléfono inválido']
  },
  email: {
    type: String,
    required: [true, 'El email es requerido'],
    lowercase: true,
    match: [/^\\S+@\\S+\\.\\S+$/, 'Formato de email inválido']
  },
  codigo: {
    type: String,
    required: [true, 'El código OTP es requerido'],
    length: [6, 'El código debe tener 6 dígitos']
  },
  tipo: {
    type: String,
    enum: ['registro', 'login', 'recuperacion', 'verificacion'],
    required: [true, 'El tipo de OTP es requerido']
  },
  intentos: {
    type: Number,
    default: 0,
    max: [5, 'Máximo 5 intentos permitidos']
  },
  verificado: {
    type: Boolean,
    default: false
  },
  expira_en: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 10 * 60 * 1000) // 10 minutos
  },
  ip_origen: {
    type: String
  },
  user_agent: {
    type: String
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para optimizar consultas
OTPSchema.index({ telefono: 1, tipo: 1 });
OTPSchema.index({ email: 1, tipo: 1 });
OTPSchema.index({ expira_en: 1 }, { expireAfterSeconds: 0 }); // Auto-eliminar documentos expirados
OTPSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600 }); // Eliminar después de 1 hora

// Virtual para verificar si está expirado
OTPSchema.virtual('expirado').get(function() {
  return new Date() > this.expira_en;
});

// Virtual para tiempo restante en segundos
OTPSchema.virtual('tiempo_restante').get(function() {
  const ahora = new Date();
  const diferencia = this.expira_en - ahora;
  return Math.max(0, Math.floor(diferencia / 1000));
});

// Método para verificar código
OTPSchema.methods.verificarCodigo = function(codigoIngresado) {
  if (this.expirado) {
    throw new Error('El código OTP ha expirado');
  }
  
  if (this.verificado) {
    throw new Error('El código OTP ya ha sido utilizado');
  }
  
  if (this.intentos >= 5) {
    throw new Error('Máximo número de intentos alcanzado');
  }
  
  this.intentos += 1;
  
  if (this.codigo === codigoIngresado) {
    this.verificado = true;
    return true;
  }
  
  return false;
};

// Método estático para limpiar códigos expirados
OTPSchema.statics.limpiarExpirados = function() {
  return this.deleteMany({
    $or: [
      { expira_en: { $lt: new Date() } },
      { verificado: true },
      { intentos: { $gte: 5 } }
    ]
  });
};

// Método estático para verificar límite de envíos
OTPSchema.statics.verificarLimiteEnvios = async function(telefono, tipo, limitePorHora = 5) {
  const unaHoraAtras = new Date(Date.now() - 60 * 60 * 1000);
  const count = await this.countDocuments({
    telefono,
    tipo,
    createdAt: { $gte: unaHoraAtras }
  });
  
  return count < limitePorHora;
};

const OTP = mongoose.model('OTP', OTPSchema);
module.exports = OTP;
`;

const otpServiceContent = `
// backend/services/otpService.js
const OTP = require('../models/OTP');
const { generateOTP } = require('../utils/generateOTP');
const { sendOTPSMS } = require('../utils/sendSMS');
const { sendOTPEmail } = require('../utils/sendEmail');

class OTPService {
  /**
   * Genera y envía un código OTP
   * @param {Object} options - Opciones para generar OTP
   * @param {string} options.telefono - Número de teléfono
   * @param {string} options.email - Email del usuario
   * @param {string} options.tipo - Tipo de OTP (registro, login, etc.)
   * @param {string} options.metodo - Método de envío (sms, email, ambos)
   * @param {Object} options.metadata - Metadata adicional
   * @param {string} options.ip - IP del cliente
   * @param {string} options.userAgent - User agent del cliente
   * @returns {Promise<Object>} Resultado del envío
   */
  static async generarYEnviar({
    telefono,
    email,
    tipo = 'verificacion',
    metodo = 'sms',
    metadata = {},
    ip = null,
    userAgent = null
  }) {
    try {
      // Verificar límite de envíos
      const puedeEnviar = await OTP.verificarLimiteEnvios(telefono, tipo);
      if (!puedeEnviar) {
        throw new Error('Límite de envíos por hora alcanzado. Intenta más tarde.');
      }

      // Invalidar códigos anteriores del mismo tipo
      await OTP.updateMany(
        { telefono, tipo, verificado: false },
        { verificado: true } // Marcar como verificados para invalidarlos
      );

      // Generar nuevo código
      const codigo = generateOTP();
      
      // Crear registro en base de datos
      const otpRecord = new OTP({
        telefono,
        email,
        codigo,
        tipo,
        ip_origen: ip,
        user_agent: userAgent,
        metadata
      });

      await otpRecord.save();

      // Enviar según el método especificado
      const resultados = {};

      if (metodo === 'sms' || metodo === 'ambos') {
        try {
          const resultadoSMS = await sendOTPSMS(telefono, codigo);
          resultados.sms = resultadoSMS;
        } catch (error) {
          console.error('Error enviando SMS:', error);
          resultados.sms = { success: false, error: error.message };
        }
      }

      if (metodo === 'email' || metodo === 'ambos') {
        try {
          const resultadoEmail = await sendOTPEmail(email, codigo, tipo);
          resultados.email = resultadoEmail;
        } catch (error) {
          console.error('Error enviando email:', error);
          resultados.email = { success: false, error: error.message };
        }
      }

      // Verificar que al menos un método fue exitoso
      const algunExitoso = Object.values(resultados).some(r => r.success);
      
      if (!algunExitoso) {
        // Si ningún método fue exitoso, eliminar el registro OTP
        await otpRecord.deleteOne();
        throw new Error('No se pudo enviar el código por ningún método');
      }

      return {
        success: true,
        mensaje: 'Código OTP enviado exitosamente',
        id: otpRecord._id,
        expira_en: otpRecord.expira_en,
        tiempo_restante: otpRecord.tiempo_restante,
        metodos_enviados: Object.keys(resultados).filter(k => resultados[k].success),
        resultados
      };

    } catch (error) {
      console.error('Error en generarYEnviar:', error);
      throw error;
    }
  }

  /**
   * Verifica un código OTP
   * @param {Object} options - Opciones para verificar
   * @param {string} options.telefono - Número de teléfono
   * @param {string} options.codigo - Código a verificar
   * @param {string} options.tipo - Tipo de OTP
   * @returns {Promise<Object>} Resultado de la verificación
   */
  static async verificar({ telefono, codigo, tipo = 'verificacion' }) {
    try {
      // Buscar código OTP válido
      const otpRecord = await OTP.findOne({
        telefono,
        tipo,
        verificado: false,
        expira_en: { $gt: new Date() }
      }).sort({ createdAt: -1 }); // Obtener el más reciente

      if (!otpRecord) {
        throw new Error('Código OTP no encontrado o expirado');
      }

      // Verificar código
      const esValido = otpRecord.verificarCodigo(codigo);
      await otpRecord.save(); // Guardar cambios (intentos, verificado)

      if (!esValido) {
        const intentosRestantes = 5 - otpRecord.intentos;
        throw new Error(\`Código incorrecto. Intentos restantes: \${intentosRestantes}\`);
      }

      return {
        success: true,
        mensaje: 'Código verificado exitosamente',
        id: otpRecord._id,
        metadata: otpRecord.metadata
      };

    } catch (error) {
      console.error('Error en verificar:', error);
      throw error;
    }
  }

  /**
   * Reenvía un código OTP
   * @param {Object} options - Opciones para reenvío
   * @returns {Promise<Object>} Resultado del reenvío
   */
  static async reenviar(options) {
    // Verificar que no se haya reenviado muy recientemente
    const ultimoEnvio = await OTP.findOne({
      telefono: options.telefono,
      tipo: options.tipo
    }).sort({ createdAt: -1 });

    if (ultimoEnvio) {
      const tiempoEspera = 60; // 60 segundos entre reenvíos
      const tiempoTranscurrido = (Date.now() - ultimoEnvio.createdAt) / 1000;
      
      if (tiempoTranscurrido < tiempoEspera) {
        const tiempoRestante = Math.ceil(tiempoEspera - tiempoTranscurrido);
        throw new Error(\`Debes esperar \${tiempoRestante} segundos antes de reenviar\`);
      }
    }

    // Generar y enviar nuevo código
    return await this.generarYEnviar(options);
  }

  /**
   * Obtiene estadísticas de OTP
   * @param {Object} filtros - Filtros para las estadísticas
   * @returns {Promise<Object>} Estadísticas
   */
  static async obtenerEstadisticas(filtros = {}) {
    const pipeline = [
      { $match: filtros },
      {
        $group: {
          _id: '$tipo',
          total: { $sum: 1 },
          verificados: { $sum: { $cond: ['$verificado', 1, 0] } },
          expirados: { 
            $sum: { 
              $cond: [{ $lt: ['$expira_en', new Date()] }, 1, 0] 
            } 
          },
          promedio_intentos: { $avg: '$intentos' }
        }
      }
    ];

    const estadisticas = await OTP.aggregate(pipeline);
    
    return {
      por_tipo: estadisticas,
      total_general: estadisticas.reduce((acc, curr) => acc + curr.total, 0)
    };
  }

  /**
   * Limpia códigos expirados y antiguos
   * @returns {Promise<Object>} Resultado de la limpieza
   */
  static async limpiarCodigos() {
    const resultado = await OTP.limpiarExpirados();
    return {
      eliminados: resultado.deletedCount,
      mensaje: \`Se eliminaron \${resultado.deletedCount} códigos expirados\`
    };
  }
}

module.exports = OTPService;
`;

const otpControllerContent = `
// backend/controllers/otpController.js
const OTPService = require('../services/otpService');
const Usuario = require('../models/Usuario');

// @desc    Enviar código OTP
// @route   POST /api/otp/send
// @access  Public
exports.enviarOTP = async (req, res) => {
  try {
    const { 
      telefono, 
      email, 
      tipo = 'verificacion', 
      metodo = 'sms' 
    } = req.body;

    // Validaciones básicas
    if (!telefono || !email) {
      return res.status(400).json({
        message: 'Teléfono y email son requeridos'
      });
    }

    // Obtener IP y User Agent
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    // Generar y enviar OTP
    const resultado = await OTPService.generarYEnviar({
      telefono,
      email,
      tipo,
      metodo,
      ip,
      userAgent
    });

    res.json({
      success: true,
      ...resultado
    });

  } catch (error) {
    console.error('Error enviando OTP:', error);
    res.status(400).json({
      message: error.message || 'Error enviando código OTP'
    });
  }
};

// @desc    Verificar código OTP
// @route   POST /api/otp/verify
// @access  Public
exports.verificarOTP = async (req, res) => {
  try {
    const { telefono, codigo, tipo = 'verificacion' } = req.body;

    // Validaciones básicas
    if (!telefono || !codigo) {
      return res.status(400).json({
        message: 'Teléfono y código son requeridos'
      });
    }

    // Verificar código
    const resultado = await OTPService.verificar({
      telefono,
      codigo,
      tipo
    });

    // Si es verificación de registro, actualizar usuario
    if (tipo === 'registro' && resultado.success) {
      await Usuario.updateOne(
        { telefono },
        { 
          estado_validacion: 'aprobado',
          $unset: { otp: 1, otp_expires: 1 }
        }
      );
    }

    res.json({
      success: true,
      ...resultado
    });

  } catch (error) {
    console.error('Error verificando OTP:', error);
    res.status(400).json({
      message: error.message || 'Error verificando código OTP'
    });
  }
};

// @desc    Reenviar código OTP
// @route   POST /api/otp/resend
// @access  Public
exports.reenviarOTP = async (req, res) => {
  try {
    const { 
      telefono, 
      email, 
      tipo = 'verificacion', 
      metodo = 'sms' 
    } = req.body;

    // Validaciones básicas
    if (!telefono || !email) {
      return res.status(400).json({
        message: 'Teléfono y email son requeridos'
      });
    }

    // Obtener IP y User Agent
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    // Reenviar OTP
    const resultado = await OTPService.reenviar({
      telefono,
      email,
      tipo,
      metodo,
      ip,
      userAgent
    });

    res.json({
      success: true,
      ...resultado
    });

  } catch (error) {
    console.error('Error reenviando OTP:', error);
    res.status(400).json({
      message: error.message || 'Error reenviando código OTP'
    });
  }
};

// @desc    Obtener estadísticas de OTP (solo admin)
// @route   GET /api/otp/stats
// @access  Private (admin)
exports.obtenerEstadisticas = async (req, res) => {
  try {
    const { desde, hasta, tipo } = req.query;
    
    // Construir filtros
    const filtros = {};
    
    if (desde || hasta) {
      filtros.createdAt = {};
      if (desde) filtros.createdAt.$gte = new Date(desde);
      if (hasta) filtros.createdAt.$lte = new Date(hasta);
    }
    
    if (tipo) {
      filtros.tipo = tipo;
    }

    const estadisticas = await OTPService.obtenerEstadisticas(filtros);

    res.json({
      success: true,
      estadisticas
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
};

// @desc    Limpiar códigos expirados (solo admin)
// @route   DELETE /api/otp/cleanup
// @access  Private (admin)
exports.limpiarCodigos = async (req, res) => {
  try {
    const resultado = await OTPService.limpiarCodigos();

    res.json({
      success: true,
      ...resultado
    });

  } catch (error) {
    console.error('Error limpiando códigos:', error);
    res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
};
`;

const otpRoutesContent = `
// backend/routes/otpRoutes.js
const express = require('express');
const {
  enviarOTP,
  verificarOTP,
  reenviarOTP,
  obtenerEstadisticas,
  limpiarCodigos
} = require('../controllers/otpController');
const { protect, authorize } = require('../middleware/authMiddleware');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting para OTP
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos por IP
  message: {
    message: 'Demasiados intentos de OTP. Intenta de nuevo en 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const verifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // máximo 10 verificaciones por IP
  message: {
    message: 'Demasiados intentos de verificación. Intenta de nuevo en 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rutas públicas con rate limiting
router.post('/send', otpLimiter, enviarOTP);
router.post('/verify', verifyLimiter, verificarOTP);
router.post('/resend', otpLimiter, reenviarOTP);

// Rutas protegidas (solo admin)
router.get('/stats', protect, authorize(['administrador']), obtenerEstadisticas);
router.delete('/cleanup', protect, authorize(['administrador']), limpiarCodigos);

module.exports = router;
`;

const sendEmailUtilContent = `
// backend/utils/sendEmail.js
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

// Configurar transporter de nodemailer
let transporter = null;

const initializeTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false, // true para 465, false para otros puertos
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Usar contraseña de aplicación para Gmail
      },
    });
  }
  return transporter;
};

/**
 * Envía un email usando nodemailer
 * @param {string} to - Email destino
 * @param {string} subject - Asunto del email
 * @param {string} text - Contenido en texto plano
 * @param {string} html - Contenido en HTML
 * @returns {Promise<Object>} Resultado del envío
 */
const sendEmail = async (to, subject, text, html = null) => {
  try {
    // Verificar configuración
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error('Configuración de email no encontrada');
    }

    const transporter = initializeTransporter();

    // Verificar conexión
    await transporter.verify();

    // Configurar email
    const mailOptions = {
      from: \`"YEGA" <\${process.env.EMAIL_USER}>\`,
      to,
      subject,
      text,
      html: html || text
    };

    // Enviar email
    const info = await transporter.sendMail(mailOptions);

    console.log(\`✅ Email enviado exitosamente a \${to}. ID: \${info.messageId}\`);

    return {
      success: true,
      messageId: info.messageId,
      to
    };

  } catch (error) {
    console.error(\`❌ Error enviando email a \${to}:\`, error.message);

    // En desarrollo, simular envío exitoso
    if (process.env.NODE_ENV === 'development') {
      console.log(\`🔧 Modo desarrollo: Simulando envío de email a \${to}\`);
      console.log(\`📧 Asunto: \${subject}\`);
      console.log(\`📝 Contenido: \${text}\`);

      return {
        success: true,
        messageId: 'dev_' + Date.now(),
        to,
        simulated: true
      };
    }

    throw error;
  }
};

/**
 * Envía email de verificación OTP
 * @param {string} to - Email destino
 * @param {string} otp - Código OTP
 * @param {string} tipo - Tipo de verificación
 * @returns {Promise<Object>} Resultado del envío
 */
const sendOTPEmail = async (to, otp, tipo = 'verificacion') => {
  const tipoTextos = {
    registro: 'registro de cuenta',
    login: 'inicio de sesión',
    recuperacion: 'recuperación de contraseña',
    verificacion: 'verificación de cuenta'
  };

  const tipoTexto = tipoTextos[tipo] || 'verificación';

  const subject = \`YEGA - Código de \${tipoTexto}\`;
  
  const text = \`
Tu código de \${tipoTexto} de YEGA es: \${otp}

Este código expira en 10 minutos.

Si no solicitaste este código, puedes ignorar este mensaje.

Equipo YEGA
\`;

  const html = \`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Código de Verificación YEGA</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #000;
      color: #D4AF37;
      padding: 20px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .content {
      background-color: #f9f9f9;
      padding: 30px;
      border-radius: 0 0 8px 8px;
      border: 1px solid #ddd;
    }
    .otp-code {
      background-color: #D4AF37;
      color: #000;
      font-size: 32px;
      font-weight: bold;
      text-align: center;
      padding: 20px;
      margin: 20px 0;
      border-radius: 8px;
      letter-spacing: 8px;
    }
    .footer {
      text-align: center;
      margin-top: 20px;
      color: #666;
      font-size: 14px;
    }
    .warning {
      background-color: #fff3cd;
      border: 1px solid #ffeaa7;
      color: #856404;
      padding: 15px;
      border-radius: 4px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>YEGA</h1>
    <p>Tu plataforma de delivery</p>
  </div>
  
  <div class="content">
    <h2>Código de \${tipoTexto}</h2>
    
    <p>Hola,</p>
    
    <p>Has solicitado un código de \${tipoTexto} para tu cuenta de YEGA. Usa el siguiente código:</p>
    
    <div class="otp-code">\${otp}</div>
    
    <div class="warning">
      <strong>⚠️ Importante:</strong>
      <ul>
        <li>Este código expira en <strong>10 minutos</strong></li>
        <li>No compartas este código con nadie</li>
        <li>Si no solicitaste este código, ignora este mensaje</li>
      </ul>
    </div>
    
    <p>Si tienes problemas, contacta nuestro soporte.</p>
    
    <p>Saludos,<br>Equipo YEGA</p>
  </div>
  
  <div class="footer">
    <p>Este es un mensaje automático, por favor no respondas a este email.</p>
    <p>&copy; 2024 YEGA. Todos los derechos reservados.</p>
  </div>
</body>
</html>
\`;

  return await sendEmail(to, subject, text, html);
};

/**
 * Envía email de bienvenida
 * @param {string} to - Email destino
 * @param {string} nombre - Nombre del usuario
 * @param {string} rol - Rol del usuario
 * @returns {Promise<Object>} Resultado del envío
 */
const sendWelcomeEmail = async (to, nombre, rol) => {
  const subject = 'Bienvenido a YEGA';
  
  const text = \`
Hola \${nombre},

¡Bienvenido a YEGA!

Tu cuenta como \${rol} ha sido creada exitosamente. Ya puedes comenzar a usar nuestra plataforma.

Si tienes alguna pregunta, no dudes en contactarnos.

Saludos,
Equipo YEGA
\`;

  const html = \`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Bienvenido a YEGA</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #000; color: #D4AF37; padding: 20px; text-align: center; }
    .content { padding: 30px; background-color: #f9f9f9; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>¡Bienvenido a YEGA!</h1>
    </div>
    <div class="content">
      <h2>Hola \${nombre},</h2>
      <p>Tu cuenta como <strong>\${rol}</strong> ha sido creada exitosamente.</p>
      <p>Ya puedes comenzar a usar nuestra plataforma de delivery.</p>
      <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
      <p>Saludos,<br>Equipo YEGA</p>
    </div>
  </div>
</body>
</html>
\`;

  return await sendEmail(to, subject, text, html);
};

module.exports = {
  sendEmail,
  sendOTPEmail,
  sendWelcomeEmail
};
`;

// --- Contenido de Archivos Frontend ---

const otpHookContent = `
// frontend/src/hooks/useOTP.js
import { useState } from 'react';
import { apiClient } from '../services/apiClient';
import { toast } from 'react-toastify';

export const useOTP = () => {
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [canResend, setCanResend] = useState(true);

  // Enviar código OTP
  const sendOTP = async (telefono, email, tipo = 'verificacion', metodo = 'sms') => {
    try {
      setLoading(true);
      const response = await apiClient.post('/otp/send', {
        telefono,
        email,
        tipo,
        metodo
      });

      if (response.data.success) {
        toast.success('Código enviado exitosamente');
        startCountdown(response.data.tiempo_restante || 600); // 10 minutos por defecto
        return { success: true, data: response.data };
      }

      return { success: false, error: 'Error enviando código' };

    } catch (error) {
      const message = error.response?.data?.message || 'Error enviando código OTP';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Verificar código OTP
  const verifyOTP = async (telefono, codigo, tipo = 'verificacion') => {
    try {
      setLoading(true);
      const response = await apiClient.post('/otp/verify', {
        telefono,
        codigo,
        tipo
      });

      if (response.data.success) {
        toast.success('Código verificado exitosamente');
        setTimeLeft(0);
        return { success: true, data: response.data };
      }

      return { success: false, error: 'Código inválido' };

    } catch (error) {
      const message = error.response?.data?.message || 'Error verificando código';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Reenviar código OTP
  const resendOTP = async (telefono, email, tipo = 'verificacion', metodo = 'sms') => {
    try {
      setLoading(true);
      const response = await apiClient.post('/otp/resend', {
        telefono,
        email,
        tipo,
        metodo
      });

      if (response.data.success) {
        toast.success('Código reenviado exitosamente');
        startCountdown(response.data.tiempo_restante || 600);
        return { success: true, data: response.data };
      }

      return { success: false, error: 'Error reenviando código' };

    } catch (error) {
      const message = error.response?.data?.message || 'Error reenviando código';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Iniciar cuenta regresiva
  const startCountdown = (seconds) => {
    setTimeLeft(seconds);
    setCanResend(false);

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Formatear tiempo restante
  const formatTimeLeft = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return \`\${minutes.toString().padStart(2, '0')}:\${seconds.toString().padStart(2, '0')}\`;
  };

  return {
    loading,
    timeLeft,
    canResend,
    sendOTP,
    verifyOTP,
    resendOTP,
    formatTimeLeft
  };
};
`;

const otpComponentContent = `
// frontend/src/components/OTPInput.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useOTP } from '../hooks/useOTP';
import styled from 'styled-components';

const OTPContainer = styled.div\`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
\`;

const OTPInputsContainer = styled.div\`
  display: flex;
  gap: 0.5rem;
  justify-content: center;
\`;

const OTPInputField = styled.input\`
  width: 50px;
  height: 50px;
  text-align: center;
  font-size: 1.5rem;
  font-weight: bold;
  border: 2px solid var(--color-gray-600);
  border-radius: 8px;
  background-color: var(--color-gray-800);
  color: var(--color-secondary);
  
  &:focus {
    outline: none;
    border-color: var(--color-accent-gold);
    box-shadow: 0 0 0 0.2rem rgba(212, 175, 55, 0.25);
  }
  
  &.error {
    border-color: var(--color-danger);
  }
  
  &.success {
    border-color: var(--color-success);
  }
\`;

const CountdownText = styled.div\`
  color: var(--color-accent-silver);
  font-size: 0.9rem;
\`;

const ResendButton = styled(Button)\`
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
\`;

const OTPInput = ({
  telefono,
  email,
  tipo = 'verificacion',
  metodo = 'sms',
  onSuccess,
  onError,
  autoSend = false,
  length = 6
}) => {
  const [otp, setOtp] = useState(new Array(length).fill(''));
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const inputRefs = useRef([]);
  
  const {
    loading,
    timeLeft,
    canResend,
    sendOTP,
    verifyOTP,
    resendOTP,
    formatTimeLeft
  } = useOTP();

  // Auto-enviar OTP al montar el componente
  useEffect(() => {
    if (autoSend && telefono && email) {
      handleSendOTP();
    }
  }, [autoSend, telefono, email]);

  // Enfocar primer input al montar
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Verificar automáticamente cuando se complete el código
  useEffect(() => {
    const otpValue = otp.join('');
    if (otpValue.length === length && !loading) {
      handleVerifyOTP(otpValue);
    }
  }, [otp, length, loading]);

  const handleSendOTP = async () => {
    setError('');
    const result = await sendOTP(telefono, email, tipo, metodo);
    
    if (!result.success) {
      setError(result.error);
      if (onError) onError(result.error);
    }
  };

  const handleVerifyOTP = async (otpValue = otp.join('')) => {
    setError('');
    const result = await verifyOTP(telefono, otpValue, tipo);
    
    if (result.success) {
      setSuccess(true);
      if (onSuccess) onSuccess(result.data);
    } else {
      setError(result.error);
      setOtp(new Array(length).fill('')); // Limpiar campos
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
      if (onError) onError(result.error);
    }
  };

  const handleResendOTP = async () => {
    setError('');
    setOtp(new Array(length).fill(''));
    const result = await resendOTP(telefono, email, tipo, metodo);
    
    if (!result.success) {
      setError(result.error);
      if (onError) onError(result.error);
    }
  };

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Enfocar siguiente input
    if (element.value && index < length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    // Backspace: ir al input anterior
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
    
    // Enter: verificar código
    if (e.key === 'Enter') {
      handleVerifyOTP();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const pastedNumbers = pastedData.replace(/\\D/g, '').slice(0, length);
    
    if (pastedNumbers.length === length) {
      const newOtp = pastedNumbers.split('');
      setOtp(newOtp);
      inputRefs.current[length - 1].focus();
    }
  };

  const getInputClassName = () => {
    if (success) return 'success';
    if (error) return 'error';
    return '';
  };

  return (
    <OTPContainer>
      <div className="text-center mb-3">
        <h5 className="text-yega-gold">Verificación de Código</h5>
        <p className="text-muted">
          Ingresa el código de {length} dígitos enviado a tu {metodo === 'email' ? 'email' : 'teléfono'}
        </p>
      </div>

      {error && (
        <Alert variant="danger" className="w-100 text-center">
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" className="w-100 text-center">
          ✅ Código verificado exitosamente
        </Alert>
      )}

      <OTPInputsContainer>
        {otp.map((digit, index) => (
          <OTPInputField
            key={index}
            type="text"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(e.target, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            ref={(ref) => (inputRefs.current[index] = ref)}
            className={getInputClassName()}
            disabled={loading || success}
          />
        ))}
      </OTPInputsContainer>

      {timeLeft > 0 && (
        <CountdownText>
          Código expira en: <strong>{formatTimeLeft()}</strong>
        </CountdownText>
      )}

      <div className="d-flex gap-2 align-items-center">
        <ResendButton
          variant="outline-secondary"
          size="sm"
          onClick={handleResendOTP}
          disabled={!canResend || loading}
        >
          {loading ? (
            <>
              <Spinner size="sm" className="me-1" />
              Enviando...
            </>
          ) : (
            'Reenviar Código'
          )}
        </ResendButton>

        {!autoSend && (
          <Button
            variant="outline-primary"
            size="sm"
            onClick={handleSendOTP}
            disabled={loading}
          >
            Enviar Código
          </Button>
        )}
      </div>

      <div className="text-center">
        <small className="text-muted">
          ¿No recibiste el código? Verifica tu {metodo === 'email' ? 'bandeja de entrada y spam' : 'mensajes de texto'}
        </small>
      </div>
    </OTPContainer>
  );
};

export default OTPInput;
`;

const verifyOTPPageContent = `
// frontend/src/pages/VerifyOTP.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import OTPInput from '../components/OTPInput';

const VerifyOTP = () => {
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOTP } = useAuth();

  // Obtener datos del estado de navegación
  const { email, telefono, tipo = 'registro' } = location.state || {};

  useEffect(() => {
    // Redireccionar si no hay datos necesarios
    if (!email || !telefono) {
      navigate('/register', { replace: true });
    }
  }, [email, telefono, navigate]);

  const handleSuccess = async (data) => {
    try {
      // Verificar con el contexto de autenticación
      const result = await verifyOTP(email, data.codigo);
      
      if (result.success) {
        // Redireccionar al login después de verificación exitosa
        navigate('/login', {
          state: { 
            message: 'Cuenta verificada exitosamente. Puedes iniciar sesión.' 
          }
        });
      } else {
        setError(result.error || 'Error verificando cuenta');
      }
    } catch (err) {
      setError('Error inesperado verificando cuenta');
    }
  };

  const handleError = (errorMessage) => {
    setError(errorMessage);
  };

  if (!email || !telefono) {
    return null; // El useEffect se encargará de redireccionar
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card className="card-yega">
            <Card.Header className="text-center">
              <h3 className="mb-0">Verificar Cuenta</h3>
            </Card.Header>
            
            <Card.Body className="p-4">
              {error && (
                <Alert variant="danger" className="alert-yega-danger">
                  {error}
                </Alert>
              )}

              <div className="text-center mb-4">
                <p className="text-muted">
                  Hemos enviado un código de verificación a:
                </p>
                <div className="mb-2">
                  <strong className="text-yega-gold">📱 {telefono}</strong>
                </div>
                <div>
                  <strong className="text-yega-silver">📧 {email}</strong>
                </div>
              </div>

              <OTPInput
                telefono={telefono}
                email={email}
                tipo={tipo}
                metodo="sms" // Cambiar según preferencia
                onSuccess={handleSuccess}
                onError={handleError}
                autoSend={true}
                length={6}
              />

              <hr className="my-4" />

              <div className="text-center">
                <p className="mb-0 text-muted">
                  ¿Problemas con la verificación?{' '}
                  <a href="/contact" className="text-decoration-none">
                    Contacta soporte
                  </a>
                </p>
              </div>
            </Card.Body>
          </Card>

          {/* Información adicional */}
          <Card className="card-yega mt-4">
            <Card.Body className="text-center">
              <h6 className="text-yega-gold mb-3">Consejos de Verificación</h6>
              <div className="text-sm text-muted">
                <div className="mb-2">
                  ✓ El código expira en 10 minutos
                </div>
                <div className="mb-2">
                  ✓ Verifica tu bandeja de spam si elegiste email
                </div>
                <div className="mb-2">
                  ✓ Asegúrate de tener señal si elegiste SMS
                </div>
                <div>
                  ✓ Puedes reenviar el código si no lo recibes
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default VerifyOTP;
`;

// --- Función principal ---

async function generateOTPSystem() {
  console.log('🚀 Generando sistema OTP completo para YEGA...\n');

  try {
    // === BACKEND ===
    console.log('🔧 Generando archivos del backend...');
    
    // Crear directorios
    ensureDirectoryExists(path.join(BACKEND_DIR, 'models'));
    ensureDirectoryExists(path.join(BACKEND_DIR, 'services'));
    ensureDirectoryExists(path.join(BACKEND_DIR, 'controllers'));
    ensureDirectoryExists(path.join(BACKEND_DIR, 'routes'));
    ensureDirectoryExists(path.join(BACKEND_DIR, 'utils'));

    // Generar archivos backend
    writeToFile(path.join(BACKEND_DIR, 'models', 'OTP.js'), otpModelContent);
    writeToFile(path.join(BACKEND_DIR, 'services', 'otpService.js'), otpServiceContent);
    writeToFile(path.join(BACKEND_DIR, 'controllers', 'otpController.js'), otpControllerContent);
    writeToFile(path.join(BACKEND_DIR, 'routes', 'otpRoutes.js'), otpRoutesContent);
    writeToFile(path.join(BACKEND_DIR, 'utils', 'sendEmail.js'), sendEmailUtilContent);

    // Actualizar server.js
    const serverPath = path.join(BACKEND_DIR, 'server.js');
    updateFile(
      serverPath,
      "const otpRoutes = require('./routes/otpRoutes');",
      "const orderRoutes = require('./routes/orderRoutes');"
    );
    updateFile(
      serverPath,
      "app.use('/api/otp', otpRoutes);",
      "app.use('/api/orders', protect, orderRoutes);"
    );

    // === FRONTEND ===
    console.log('\n⚛️  Generando archivos del frontend...');
    
    // Crear directorios
    ensureDirectoryExists(path.join(FRONTEND_DIR, 'src', 'hooks'));
    ensureDirectoryExists(path.join(FRONTEND_DIR, 'src', 'components'));
    ensureDirectoryExists(path.join(FRONTEND_DIR, 'src', 'pages'));

    // Generar archivos frontend
    writeToFile(path.join(FRONTEND_DIR, 'src', 'hooks', 'useOTP.js'), otpHookContent);
    writeToFile(path.join(FRONTEND_DIR, 'src', 'components', 'OTPInput.jsx'), otpComponentContent);
    writeToFile(path.join(FRONTEND_DIR, 'src', 'pages', 'VerifyOTP.jsx'), verifyOTPPageContent);

    // === DEPENDENCIAS ===
    console.log('\n📦 Actualizando dependencias...');
    
    // Actualizar package.json del backend
    const backendPackagePath = path.join(BACKEND_DIR, 'package.json');
    if (fs.existsSync(backendPackagePath)) {
      try {
        const packageData = JSON.parse(fs.readFileSync(backendPackagePath, 'utf8'));
        packageData.dependencies = {
          ...packageData.dependencies,
          'nodemailer': '^6.9.4',
          'express-rate-limit': '^6.10.0'
        };
        fs.writeFileSync(backendPackagePath, JSON.stringify(packageData, null, 2));
        console.log('✅ package.json del backend actualizado');
      } catch (error) {
        console.log('⚠️  Error actualizando package.json del backend:', error.message);
      }
    }

    // === VARIABLES DE ENTORNO ===
    console.log('\n⚙️  Actualizando variables de entorno...');
    
    const envExamplePath = path.join(BACKEND_DIR, '.env.example');
    const emailEnvVars = `
# Configuración de Email para OTP
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_password_de_aplicacion_gmail

# Configuración de Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
`;
    
    updateFile(envExamplePath, emailEnvVars, '# API Keys externas (opcional)');

    console.log('\n✅ Sistema OTP generado exitosamente!');
    console.log('\n📋 Archivos creados/actualizados:');
    console.log('\n🔧 Backend:');
    console.log('   - models/OTP.js');
    console.log('   - services/otpService.js');
    console.log('   - controllers/otpController.js');
    console.log('   - routes/otpRoutes.js');
    console.log('   - utils/sendEmail.js');
    console.log('   - server.js (actualizado)');
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

    console.log('\n📋 Pasos siguientes:');
    console.log('1. 📦 Instalar nuevas dependencias del backend:');
    console.log('   cd backend && npm install nodemailer express-rate-limit');
    console.log('\n2. ⚙️  Configurar variables de entorno en .env:');
    console.log('   EMAIL_HOST, EMAIL_USER, EMAIL_PASS');
    console.log('\n3. 🔧 Para Gmail, crear contraseña de aplicación:');
    console.log('   https://support.google.com/accounts/answer/185833');
    console.log('\n4. 🧪 Probar funcionalidad OTP:');
    console.log('   - Registro de usuario con verificación');
    console.log('   - Recuperación de contraseña');
    console.log('   - Verificación de cambios importantes');

    console.log('\n🎯 Características implementadas:');
    console.log('   ✓ Envío por SMS y Email');
    console.log('   ✓ Rate limiting para prevenir spam');
    console.log('   ✓ Códigos con expiración automática');
    console.log('   ✓ Límite de intentos de verificación');
    console.log('   ✓ Componente React reutilizable');
    console.log('   ✓ Hook personalizado para manejo de estado');
    console.log('   ✓ Estadísticas y limpieza automática');
    console.log('   ✓ Soporte para múltiples tipos de verificación');

  } catch (error) {
    console.error('❌ Error generando sistema OTP:', error);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  generateOTPSystem();
}

module.exports = { generateOTPSystem };