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
        throw new Error(`Código incorrecto. Intentos restantes: ${intentosRestantes}`);
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
        throw new Error(`Debes esperar ${tiempoRestante} segundos antes de reenviar`);
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
      mensaje: `Se eliminaron ${resultado.deletedCount} códigos expirados`
    };
  }
}

module.exports = OTPService;
