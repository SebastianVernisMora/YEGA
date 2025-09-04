// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

// Middleware para proteger rutas (verifica JWT)
exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extraer token del header
      token = req.headers.authorization.split(' ')[1];
      
      // Verificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Obtener usuario del token
      req.user = await Usuario.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({ message: 'Usuario no encontrado' });
      }

      // Verificar que el usuario esté activo
      if (!req.user.activo) {
        return res.status(401).json({ message: 'Cuenta desactivada' });
      }

      next();
    } catch (error) {
      console.error('Error en autenticación:', error);
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Token inválido' });
      } else if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expirado' });
      }
      
      return res.status(401).json({ message: 'No autorizado' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'No autorizado, no hay token' });
  }
};

// Middleware para autorizar roles específicos
exports.authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'No autorizado, usuario no autenticado' });
    }

    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({ 
        message: `Acceso denegado. Rol requerido: ${roles.join(' o ')}`,
        rol_actual: req.user.rol
      });
    }

    next();
  };
};

// Middleware para verificar estado de validación
exports.requireValidation = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'No autorizado' });
  }

  if (req.user.rol !== 'cliente' && req.user.estado_validacion !== 'aprobado') {
    return res.status(403).json({ 
      message: 'Cuenta pendiente de validación',
      estado: req.user.estado_validacion
    });
  }

  next();
};
