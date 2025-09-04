// backend/utils/sendSMS.js
const twilio = require('twilio');
const dotenv = require('dotenv');

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Inicializar cliente de Twilio solo si las credenciales están disponibles
let client = null;
if (accountSid && authToken) {
  client = twilio(accountSid, authToken);
}

/**
 * Envía un SMS usando Twilio
 * @param {string} to - Número de teléfono destino (formato internacional)
 * @param {string} message - Mensaje a enviar
 * @returns {Promise<Object>} Resultado del envío
 */
const sendSMS = async (to, message) => {
  try {
    // Verificar configuración
    if (!client) {
      throw new Error('Twilio no está configurado correctamente');
    }

    if (!twilioPhoneNumber) {
      throw new Error('Número de Twilio no configurado');
    }

    // Validar número de teléfono
    if (!isValidPhoneNumber(to)) {
      throw new Error('Formato de número de teléfono inválido');
    }

    // Enviar SMS
    const result = await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: to,
    });

    console.log(`✅ SMS enviado exitosamente a ${to}. SID: ${result.sid}`);
    
    return {
      success: true,
      sid: result.sid,
      status: result.status,
      to: to
    };

  } catch (error) {
    console.error(`❌ Error enviando SMS a ${to}:`, error.message);
    
    // En desarrollo, simular envío exitoso
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔧 Modo desarrollo: Simulando envío de SMS a ${to}`);
      console.log(`📱 Mensaje: ${message}`);
      
      return {
        success: true,
        sid: 'dev_' + Date.now(),
        status: 'sent',
        to: to,
        simulated: true
      };
    }

    throw error;
  }
};

/**
 * Envía SMS de verificación OTP
 * @param {string} to - Número de teléfono
 * @param {string} otp - Código OTP
 * @param {string} appName - Nombre de la aplicación
 * @returns {Promise<Object>} Resultado del envío
 */
const sendOTPSMS = async (to, otp, appName = 'YEGA') => {
  const message = `Tu código de verificación de ${appName} es: ${otp}. Este código expira en 10 minutos.`;
  return await sendSMS(to, message);
};

/**
 * Envía SMS de notificación de pedido
 * @param {string} to - Número de teléfono
 * @param {string} orderNumber - Número de pedido
 * @param {string} status - Estado del pedido
 * @returns {Promise<Object>} Resultado del envío
 */
const sendOrderNotificationSMS = async (to, orderNumber, status) => {
  const statusMessages = {
    confirmado: 'Tu pedido ha sido confirmado y está siendo preparado',
    listo: 'Tu pedido está listo para ser enviado',
    en_camino: 'Tu pedido está en camino',
    entregado: 'Tu pedido ha sido entregado exitosamente'
  };

  const message = `YEGA - Pedido ${orderNumber}: ${statusMessages[status] || 'Estado actualizado'}.`;
  return await sendSMS(to, message);
};

/**
 * Valida formato de número de teléfono
 * @param {string} phoneNumber - Número a validar
 * @returns {boolean} True si es válido
 */
const isValidPhoneNumber = (phoneNumber) => {
  if (!phoneNumber || typeof phoneNumber !== 'string') return false;
  
  // Formato internacional básico: +[código país][número]
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phoneNumber.replace(/\s+/g, ''));
};

/**
 * Formatea número de teléfono para Twilio
 * @param {string} phoneNumber - Número a formatear
 * @returns {string} Número formateado
 */
const formatPhoneNumber = (phoneNumber) => {
  // Remover espacios y caracteres especiales
  let formatted = phoneNumber.replace(/[^\d+]/g, '');
  
  // Agregar + si no lo tiene
  if (!formatted.startsWith('+')) {
    formatted = '+' + formatted;
  }
  
  return formatted;
};

module.exports = {
  sendSMS,
  sendOTPSMS,
  sendOrderNotificationSMS,
  isValidPhoneNumber,
  formatPhoneNumber
};
