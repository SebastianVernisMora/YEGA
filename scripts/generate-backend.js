#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// --- Configuración ---
const PROJECT_ROOT = process.cwd();
const BACKEND_DIR = path.join(PROJECT_ROOT, 'backend');
const MODELS_DIR = path.join(BACKEND_DIR, 'models');
const ROUTES_DIR = path.join(BACKEND_DIR, 'routes');
const CONTROLLERS_DIR = path.join(BACKEND_DIR, 'controllers');
const MIDDLEWARE_DIR = path.join(BACKEND_DIR, 'middleware');
const CONFIG_DIR = path.join(BACKEND_DIR, 'config');
const UTILS_DIR = path.join(BACKEND_DIR, 'utils');

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

const serverJsContent = `
// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const locationRoutes = require('./routes/locationRoutes');
const { protect } = require('./middleware/authMiddleware');

dotenv.config(); // Carga variables de entorno desde .env

const app = express();

// Middleware
app.use(cors()); // Habilita CORS para frontend
app.use(express.json()); // Habilita el parsing de JSON en las peticiones

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB conectado exitosamente'))
.catch(err => console.error('❌ Error de conexión a MongoDB:', err));

// Rutas públicas (autenticación)
app.use('/api/auth', authRoutes);

// Rutas protegidas (requieren JWT)
app.use('/api/products', protect, productRoutes);
app.use('/api/orders', protect, orderRoutes);
app.use('/api/location', protect, locationRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    message: 'API de YEGA funcionando!',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Middleware de manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Algo salió mal'
  });
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(\`🚀 Servidor corriendo en el puerto \${PORT}\`));
`;

const userModelContent = `
// backend/models/Usuario.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UbicacionSchema = new mongoose.Schema({
  latitud: { type: Number, required: true },
  longitud: { type: Number, required: true },
  direccion: { type: String },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const UsuarioSchema = new mongoose.Schema({
  nombre: { 
    type: String, 
    required: [true, 'El nombre es requerido'],
    trim: true,
    maxlength: [100, 'El nombre no puede exceder 100 caracteres']
  },
  telefono: { 
    type: String, 
    required: [true, 'El teléfono es requerido'],
    unique: true,
    match: [/^\\+?[1-9]\\d{1,14}$/, 'Formato de teléfono inválido']
  },
  email: { 
    type: String, 
    required: [true, 'El email es requerido'],
    unique: true,
    lowercase: true,
    match: [/^\\S+@\\S+\\.\\S+$/, 'Formato de email inválido']
  },
  password: { 
    type: String, 
    required: [true, 'La contraseña es requerida'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
  },
  rol: { 
    type: String, 
    enum: ['cliente', 'tienda', 'repartidor', 'administrador'], 
    default: 'cliente' 
  },
  estado_validacion: { 
    type: String, 
    enum: ['pendiente', 'aprobado', 'rechazado'], 
    default: 'pendiente' 
  },
  ubicacion: UbicacionSchema, // Para tiendas y repartidores
  otp: { type: String }, // Para verificación OTP
  otp_expires: { type: Date },
  activo: { type: Boolean, default: true },
  ultimo_acceso: { type: Date }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para optimizar consultas
UsuarioSchema.index({ email: 1 });
UsuarioSchema.index({ telefono: 1 });
UsuarioSchema.index({ rol: 1, estado_validacion: 1 });

// Hash de la contraseña antes de guardar
UsuarioSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Método para comparar contraseñas
UsuarioSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Método para actualizar ubicación (para repartidores y tiendas)
UsuarioSchema.methods.actualizarUbicacion = function(latitud, longitud, direccion = '') {
  this.ubicacion = {
    latitud,
    longitud,
    direccion,
    timestamp: new Date()
  };
  return this.save();
};

// Virtual para obtener nombre completo del rol
UsuarioSchema.virtual('rolNombre').get(function() {
  const roles = {
    cliente: 'Cliente',
    tienda: 'Tienda',
    repartidor: 'Repartidor',
    administrador: 'Administrador'
  };
  return roles[this.rol] || this.rol;
});

const Usuario = mongoose.model('Usuario', UsuarioSchema);
module.exports = Usuario;
`;

const productModelContent = `
// backend/models/Producto.js
const mongoose = require('mongoose');

const ProductoSchema = new mongoose.Schema({
  nombre: { 
    type: String, 
    required: [true, 'El nombre del producto es requerido'],
    trim: true,
    maxlength: [200, 'El nombre no puede exceder 200 caracteres']
  },
  descripcion: { 
    type: String, 
    required: [true, 'La descripción es requerida'],
    maxlength: [1000, 'La descripción no puede exceder 1000 caracteres']
  },
  precio: { 
    type: Number, 
    required: [true, 'El precio es requerido'],
    min: [0, 'El precio no puede ser negativo']
  },
  stock: { 
    type: Number, 
    required: [true, 'El stock es requerido'],
    min: [0, 'El stock no puede ser negativo'],
    default: 0
  },
  tiendaId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Usuario', 
    required: [true, 'La tienda es requerida']
  },
  categoria: {
    type: String,
    enum: ['comida', 'bebida', 'postre', 'snack', 'otro'],
    default: 'otro'
  },
  imagen: { 
    type: String,
    default: 'https://via.placeholder.com/300x200?text=Producto'
  },
  disponible: { 
    type: Boolean, 
    default: true 
  },
  peso: { 
    type: Number, 
    min: [0, 'El peso no puede ser negativo']
  }, // en gramos
  tiempo_preparacion: { 
    type: Number, 
    min: [0, 'El tiempo de preparación no puede ser negativo'],
    default: 15
  }, // en minutos
  tags: [{ 
    type: String, 
    trim: true 
  }]
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para optimizar consultas
ProductoSchema.index({ tiendaId: 1, disponible: 1 });
ProductoSchema.index({ categoria: 1 });
ProductoSchema.index({ nombre: 'text', descripcion: 'text' });

// Virtual para verificar si está en stock
ProductoSchema.virtual('enStock').get(function() {
  return this.stock > 0 && this.disponible;
});

// Método para reducir stock
ProductoSchema.methods.reducirStock = function(cantidad) {
  if (this.stock >= cantidad) {
    this.stock -= cantidad;
    return this.save();
  } else {
    throw new Error('Stock insuficiente');
  }
};

// Método para aumentar stock
ProductoSchema.methods.aumentarStock = function(cantidad) {
  this.stock += cantidad;
  return this.save();
};

// Middleware para validar que la tienda existe
ProductoSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('tiendaId')) {
    const Usuario = mongoose.model('Usuario');
    const tienda = await Usuario.findById(this.tiendaId);
    if (!tienda || tienda.rol !== 'tienda') {
      next(new Error('ID de tienda inválido'));
    }
  }
  next();
});

const Producto = mongoose.model('Producto', ProductoSchema);
module.exports = Producto;
`;

const orderModelContent = `
// backend/models/Pedido.js
const mongoose = require('mongoose');

const DireccionSchema = new mongoose.Schema({
  calle: { type: String, required: true },
  numero: { type: String, required: true },
  ciudad: { type: String, required: true },
  codigo_postal: { type: String },
  referencias: { type: String },
  latitud: { type: Number },
  longitud: { type: Number }
}, { _id: false });

const ProductoPedidoSchema = new mongoose.Schema({
  producto: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Producto', 
    required: true 
  },
  cantidad: { 
    type: Number, 
    required: true, 
    min: [1, 'La cantidad debe ser al menos 1']
  },
  precio_unitario: { 
    type: Number, 
    required: true,
    min: [0, 'El precio unitario no puede ser negativo']
  },
  subtotal: { 
    type: Number, 
    required: true,
    min: [0, 'El subtotal no puede ser negativo']
  }
}, { _id: false });

const PedidoSchema = new mongoose.Schema({
  numero_pedido: {
    type: String,
    unique: true,
    required: true
  },
  clienteId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Usuario', 
    required: [true, 'El cliente es requerido']
  },
  tiendaId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Usuario', 
    required: [true, 'La tienda es requerida']
  },
  repartidorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Usuario' 
  },
  productos: [ProductoPedidoSchema],
  subtotal: { 
    type: Number, 
    required: true, 
    min: [0, 'El subtotal no puede ser negativo']
  },
  costo_envio: { 
    type: Number, 
    default: 0,
    min: [0, 'El costo de envío no puede ser negativo']
  },
  total: { 
    type: Number, 
    required: true, 
    min: [0, 'El total no puede ser negativo']
  },
  estado: { 
    type: String, 
    enum: ['pendiente', 'confirmado', 'preparando', 'listo', 'en_camino', 'entregado', 'cancelado'], 
    default: 'pendiente' 
  },
  direccion_envio: DireccionSchema,
  metodo_pago: { 
    type: String, 
    enum: ['efectivo', 'tarjeta', 'transferencia'],
    required: [true, 'El método de pago es requerido']
  },
  notas: { type: String, maxlength: [500, 'Las notas no pueden exceder 500 caracteres'] },
  tiempo_estimado: { type: Number }, // en minutos
  fecha_entrega_estimada: { type: Date },
  fecha_entrega_real: { type: Date },
  calificacion: {
    puntuacion: { type: Number, min: 1, max: 5 },
    comentario: { type: String, maxlength: [500, 'El comentario no puede exceder 500 caracteres'] }
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para optimizar consultas
PedidoSchema.index({ clienteId: 1, createdAt: -1 });
PedidoSchema.index({ tiendaId: 1, estado: 1 });
PedidoSchema.index({ repartidorId: 1, estado: 1 });
PedidoSchema.index({ numero_pedido: 1 });

// Generar número de pedido antes de guardar
PedidoSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await mongoose.model('Pedido').countDocuments();
    this.numero_pedido = \`YEGA-\${String(count + 1).padStart(6, '0')}\`;
  }
  next();
});

// Virtual para obtener el estado en español
PedidoSchema.virtual('estadoTexto').get(function() {
  const estados = {
    pendiente: 'Pendiente',
    confirmado: 'Confirmado',
    preparando: 'Preparando',
    listo: 'Listo para envío',
    en_camino: 'En camino',
    entregado: 'Entregado',
    cancelado: 'Cancelado'
  };
  return estados[this.estado] || this.estado;
});

// Método para calcular totales
PedidoSchema.methods.calcularTotales = function() {
  this.subtotal = this.productos.reduce((sum, item) => sum + item.subtotal, 0);
  this.total = this.subtotal + this.costo_envio;
  return this;
};

// Método para cambiar estado con validaciones
PedidoSchema.methods.cambiarEstado = function(nuevoEstado) {
  const transicionesValidas = {
    pendiente: ['confirmado', 'cancelado'],
    confirmado: ['preparando', 'cancelado'],
    preparando: ['listo', 'cancelado'],
    listo: ['en_camino', 'cancelado'],
    en_camino: ['entregado', 'cancelado'],
    entregado: [],
    cancelado: []
  };

  if (transicionesValidas[this.estado].includes(nuevoEstado)) {
    this.estado = nuevoEstado;
    if (nuevoEstado === 'entregado') {
      this.fecha_entrega_real = new Date();
    }
    return this.save();
  } else {
    throw new Error(\`Transición de estado inválida: \${this.estado} -> \${nuevoEstado}\`);
  }
};

const Pedido = mongoose.model('Pedido', PedidoSchema);
module.exports = Pedido;
`;

const authControllerContent = `
// backend/controllers/authController.js
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const generateOTP = require('../utils/generateOTP');
const sendSMS = require('../utils/sendSMS');

// Generar JWT
const generateToken = (id, rol) => {
  return jwt.sign({ id, rol }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  });
};

// @desc    Registrar un nuevo usuario
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
  try {
    const { nombre, telefono, email, password, rol, ubicacion } = req.body;

    // Validaciones básicas
    if (!nombre || !telefono || !email || !password) {
      return res.status(400).json({ 
        message: 'Todos los campos son requeridos',
        campos_requeridos: ['nombre', 'telefono', 'email', 'password']
      });
    }

    // Verificar si el usuario ya existe
    const usuarioExistente = await Usuario.findOne({
      $or: [{ email }, { telefono }]
    });

    if (usuarioExistente) {
      return res.status(400).json({ 
        message: 'Ya existe un usuario con este email o teléfono' 
      });
    }

    // Determinar estado de validación inicial
    let estado_validacion = 'pendiente';
    if (rol === 'cliente') {
      estado_validacion = 'aprobado'; // Clientes se aprueban automáticamente
    }

    // Crear usuario
    const datosUsuario = {
      nombre,
      telefono,
      email,
      password,
      rol: rol || 'cliente',
      estado_validacion
    };

    // Agregar ubicación si es tienda o repartidor
    if ((rol === 'tienda' || rol === 'repartidor') && ubicacion) {
      datosUsuario.ubicacion = ubicacion;
    }

    const usuario = new Usuario(datosUsuario);

    // Generar y enviar OTP si no es cliente
    if (rol !== 'cliente') {
      const otp = generateOTP();
      usuario.otp = otp;
      usuario.otp_expires = Date.now() + 10 * 60 * 1000; // OTP válido por 10 minutos
      
      try {
        await sendSMS(telefono, \`Tu código de verificación YEGA es: \${otp}\`);
      } catch (smsError) {
        console.error('Error enviando SMS:', smsError);
        // Continuar sin SMS en desarrollo
        if (process.env.NODE_ENV === 'production') {
          return res.status(500).json({ 
            message: 'Error enviando código de verificación' 
          });
        }
      }
    }

    await usuario.save();

    const token = generateToken(usuario._id, usuario.rol);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      token,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        telefono: usuario.telefono,
        rol: usuario.rol,
        estado_validacion: usuario.estado_validacion,
        ubicacion: usuario.ubicacion
      },
      requiere_otp: rol !== 'cliente'
    });

  } catch (error) {
    console.error('Error en registro:', error);
    
    // Manejar errores de validación de Mongoose
    if (error.name === 'ValidationError') {
      const errores = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Errores de validación',
        errores 
      });
    }

    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Autenticar usuario y obtener token
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validaciones básicas
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email y contraseña son requeridos' 
      });
    }

    // Buscar usuario y incluir password para comparación
    const usuario = await Usuario.findOne({ email }).select('+password');

    if (!usuario) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Verificar contraseña
    const isMatch = await usuario.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Verificar si el usuario está activo
    if (!usuario.activo) {
      return res.status(403).json({ 
        message: 'Cuenta desactivada. Contacta al administrador.' 
      });
    }

    // Verificar estado de validación
    if (usuario.rol !== 'cliente' && usuario.estado_validacion !== 'aprobado') {
      let mensaje = 'Tu cuenta está pendiente de aprobación.';
      if (usuario.estado_validacion === 'rechazado') {
        mensaje = 'Tu cuenta ha sido rechazada. Contacta al administrador.';
      }
      return res.status(403).json({ message: mensaje });
    }

    // Actualizar último acceso
    usuario.ultimo_acceso = new Date();
    await usuario.save();

    const token = generateToken(usuario._id, usuario.rol);

    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      token,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        telefono: usuario.telefono,
        rol: usuario.rol,
        estado_validacion: usuario.estado_validacion,
        ubicacion: usuario.ubicacion,
        ultimo_acceso: usuario.ultimo_acceso
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Verificar OTP
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ 
        message: 'Email y código OTP son requeridos' 
      });
    }

    const usuario = await Usuario.findOne({ email });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (!usuario.otp || usuario.otp !== otp) {
      return res.status(400).json({ message: 'Código OTP inválido' });
    }

    if (usuario.otp_expires < Date.now()) {
      return res.status(400).json({ message: 'Código OTP expirado' });
    }

    // Aprobar usuario y limpiar OTP
    usuario.estado_validacion = 'aprobado';
    usuario.otp = undefined;
    usuario.otp_expires = undefined;
    await usuario.save();

    res.json({ 
      success: true,
      message: 'Código OTP verificado y cuenta aprobada exitosamente' 
    });

  } catch (error) {
    console.error('Error verificando OTP:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Reenviar OTP
// @route   POST /api/auth/resend-otp
// @access  Public
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email es requerido' });
    }

    const usuario = await Usuario.findOne({ email });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (usuario.estado_validacion === 'aprobado') {
      return res.status(400).json({ message: 'Usuario ya está verificado' });
    }

    // Generar nuevo OTP
    const otp = generateOTP();
    usuario.otp = otp;
    usuario.otp_expires = Date.now() + 10 * 60 * 1000;

    try {
      await sendSMS(usuario.telefono, \`Tu nuevo código de verificación YEGA es: \${otp}\`);
    } catch (smsError) {
      console.error('Error enviando SMS:', smsError);
      if (process.env.NODE_ENV === 'production') {
        return res.status(500).json({ 
          message: 'Error enviando código de verificación' 
        });
      }
    }

    await usuario.save();

    res.json({ 
      success: true,
      message: 'Nuevo código OTP enviado exitosamente' 
    });

  } catch (error) {
    console.error('Error reenviando OTP:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Obtener perfil del usuario autenticado
// @route   GET /api/auth/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.user.id).select('-password');
    
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({
      success: true,
      usuario
    });

  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Actualizar perfil del usuario
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { nombre, telefono, ubicacion } = req.body;
    
    const usuario = await Usuario.findById(req.user.id);
    
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Actualizar campos permitidos
    if (nombre) usuario.nombre = nombre;
    if (telefono) usuario.telefono = telefono;
    if (ubicacion && (usuario.rol === 'tienda' || usuario.rol === 'repartidor')) {
      usuario.ubicacion = ubicacion;
    }

    await usuario.save();

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        telefono: usuario.telefono,
        rol: usuario.rol,
        ubicacion: usuario.ubicacion
      }
    });

  } catch (error) {
    console.error('Error actualizando perfil:', error);
    
    if (error.name === 'ValidationError') {
      const errores = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Errores de validación',
        errores 
      });
    }

    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
`;

const locationControllerContent = `
// backend/controllers/locationController.js
const Usuario = require('../models/Usuario');

// @desc    Actualizar ubicación del usuario (repartidor/tienda)
// @route   PUT /api/location/update
// @access  Private
exports.updateLocation = async (req, res) => {
  try {
    const { latitud, longitud, direccion } = req.body;
    const userId = req.user.id;
    const userRol = req.user.rol;

    // Validar que solo repartidores y tiendas puedan actualizar ubicación
    if (userRol !== 'repartidor' && userRol !== 'tienda') {
      return res.status(403).json({ 
        message: 'Solo repartidores y tiendas pueden actualizar su ubicación' 
      });
    }

    // Validar coordenadas
    if (!latitud || !longitud) {
      return res.status(400).json({ 
        message: 'Latitud y longitud son requeridas' 
      });
    }

    if (latitud < -90 || latitud > 90 || longitud < -180 || longitud > 180) {
      return res.status(400).json({ 
        message: 'Coordenadas inválidas' 
      });
    }

    const usuario = await Usuario.findById(userId);
    
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Actualizar ubicación
    await usuario.actualizarUbicacion(latitud, longitud, direccion || '');

    res.json({
      success: true,
      message: 'Ubicación actualizada exitosamente',
      ubicacion: usuario.ubicacion
    });

  } catch (error) {
    console.error('Error actualizando ubicación:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Obtener repartidores cercanos
// @route   GET /api/location/nearby-delivery
// @access  Private
exports.getNearbyDelivery = async (req, res) => {
  try {
    const { latitud, longitud, radio = 5 } = req.query; // radio en km

    if (!latitud || !longitud) {
      return res.status(400).json({ 
        message: 'Latitud y longitud son requeridas' 
      });
    }

    // Convertir a números
    const lat = parseFloat(latitud);
    const lng = parseFloat(longitud);
    const radiusKm = parseFloat(radio);

    // Buscar repartidores activos con ubicación
    const repartidores = await Usuario.find({
      rol: 'repartidor',
      estado_validacion: 'aprobado',
      activo: true,
      'ubicacion.latitud': { $exists: true },
      'ubicacion.longitud': { $exists: true }
    }).select('nombre telefono ubicacion');

    // Filtrar por distancia (cálculo simple)
    const repartidoresCercanos = repartidores.filter(repartidor => {
      const distancia = calcularDistancia(
        lat, lng,
        repartidor.ubicacion.latitud,
        repartidor.ubicacion.longitud
      );
      return distancia <= radiusKm;
    }).map(repartidor => ({
      id: repartidor._id,
      nombre: repartidor.nombre,
      telefono: repartidor.telefono,
      ubicacion: repartidor.ubicacion,
      distancia: calcularDistancia(
        lat, lng,
        repartidor.ubicacion.latitud,
        repartidor.ubicacion.longitud
      )
    })).sort((a, b) => a.distancia - b.distancia);

    res.json({
      success: true,
      repartidores: repartidoresCercanos,
      total: repartidoresCercanos.length
    });

  } catch (error) {
    console.error('Error obteniendo repartidores cercanos:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Obtener tiendas cercanas
// @route   GET /api/location/nearby-stores
// @access  Private
exports.getNearbyStores = async (req, res) => {
  try {
    const { latitud, longitud, radio = 10 } = req.query; // radio en km

    if (!latitud || !longitud) {
      return res.status(400).json({ 
        message: 'Latitud y longitud son requeridas' 
      });
    }

    const lat = parseFloat(latitud);
    const lng = parseFloat(longitud);
    const radiusKm = parseFloat(radio);

    // Buscar tiendas activas con ubicación
    const tiendas = await Usuario.find({
      rol: 'tienda',
      estado_validacion: 'aprobado',
      activo: true,
      'ubicacion.latitud': { $exists: true },
      'ubicacion.longitud': { $exists: true }
    }).select('nombre telefono email ubicacion');

    // Filtrar por distancia
    const tiendasCercanas = tiendas.filter(tienda => {
      const distancia = calcularDistancia(
        lat, lng,
        tienda.ubicacion.latitud,
        tienda.ubicacion.longitud
      );
      return distancia <= radiusKm;
    }).map(tienda => ({
      id: tienda._id,
      nombre: tienda.nombre,
      telefono: tienda.telefono,
      email: tienda.email,
      ubicacion: tienda.ubicacion,
      distancia: calcularDistancia(
        lat, lng,
        tienda.ubicacion.latitud,
        tienda.ubicacion.longitud
      )
    })).sort((a, b) => a.distancia - b.distancia);

    res.json({
      success: true,
      tiendas: tiendasCercanas,
      total: tiendasCercanas.length
    });

  } catch (error) {
    console.error('Error obteniendo tiendas cercanas:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Función auxiliar para calcular distancia entre dos puntos (fórmula de Haversine)
function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distancia = R * c;
  return distancia;
}
`;

const productControllerContent = `
// backend/controllers/productController.js
const Producto = require('../models/Producto');
const Usuario = require('../models/Usuario');

// @desc    Obtener todos los productos con filtros y paginación
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      tiendaId, 
      categoria, 
      buscar,
      disponible = true,
      precio_min,
      precio_max
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Construir query de filtros
    let query = {};
    
    if (tiendaId) {
      query.tiendaId = tiendaId;
    }
    
    if (categoria && categoria !== 'todos') {
      query.categoria = categoria;
    }
    
    if (disponible !== 'false') {
      query.disponible = true;
      query.stock = { $gt: 0 };
    }
    
    if (precio_min || precio_max) {
      query.precio = {};
      if (precio_min) query.precio.$gte = parseFloat(precio_min);
      if (precio_max) query.precio.$lte = parseFloat(precio_max);
    }
    
    // Búsqueda por texto
    if (buscar) {
      query.$text = { $search: buscar };
    }

    const productos = await Producto.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('tiendaId', 'nombre email telefono ubicacion')
      .sort(buscar ? { score: { $meta: 'textScore' } } : { createdAt: -1 });

    const totalProductos = await Producto.countDocuments(query);

    res.json({
      success: true,
      productos,
      paginacion: {
        pagina_actual: parseInt(page),
        total_paginas: Math.ceil(totalProductos / parseInt(limit)),
        total_productos: totalProductos,
        productos_por_pagina: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error obteniendo productos:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Obtener un producto por ID
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id)
      .populate('tiendaId', 'nombre email telefono ubicacion');

    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json({
      success: true,
      producto
    });

  } catch (error) {
    console.error('Error obteniendo producto:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Crear un nuevo producto
// @route   POST /api/products
// @access  Private (solo tiendas)
exports.createProduct = async (req, res) => {
  try {
    const { 
      nombre, 
      descripcion, 
      precio, 
      stock, 
      categoria,
      imagen, 
      peso,
      tiempo_preparacion,
      tags
    } = req.body;
    
    const tiendaId = req.user.id;

    // Validar que el usuario es una tienda
    if (req.user.rol !== 'tienda' && req.user.rol !== 'administrador') {
      return res.status(403).json({ 
        message: 'Solo las tiendas pueden crear productos' 
      });
    }

    // Validaciones básicas
    if (!nombre || !descripcion || precio === undefined || stock === undefined) {
      return res.status(400).json({ 
        message: 'Nombre, descripción, precio y stock son requeridos' 
      });
    }

    const nuevoProducto = new Producto({
      nombre,
      descripcion,
      precio,
      stock,
      categoria: categoria || 'otro',
      tiendaId,
      imagen,
      peso,
      tiempo_preparacion: tiempo_preparacion || 15,
      tags: tags || []
    });

    const productoCreado = await nuevoProducto.save();
    await productoCreado.populate('tiendaId', 'nombre email telefono');

    res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente',
      producto: productoCreado
    });

  } catch (error) {
    console.error('Error creando producto:', error);
    
    if (error.name === 'ValidationError') {
      const errores = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Errores de validación',
        errores 
      });
    }

    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Actualizar un producto
// @route   PUT /api/products/:id
// @access  Private (solo tiendas propietarias)
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      nombre, 
      descripcion, 
      precio, 
      stock, 
      categoria,
      imagen, 
      disponible,
      peso,
      tiempo_preparacion,
      tags
    } = req.body;

    const producto = await Producto.findById(id);

    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // Verificar autorización
    if (req.user.rol !== 'administrador' && 
        producto.tiendaId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ 
        message: 'No autorizado para actualizar este producto' 
      });
    }

    // Actualizar campos
    if (nombre !== undefined) producto.nombre = nombre;
    if (descripcion !== undefined) producto.descripcion = descripcion;
    if (precio !== undefined) producto.precio = precio;
    if (stock !== undefined) producto.stock = stock;
    if (categoria !== undefined) producto.categoria = categoria;
    if (imagen !== undefined) producto.imagen = imagen;
    if (disponible !== undefined) producto.disponible = disponible;
    if (peso !== undefined) producto.peso = peso;
    if (tiempo_preparacion !== undefined) producto.tiempo_preparacion = tiempo_preparacion;
    if (tags !== undefined) producto.tags = tags;

    const productoActualizado = await producto.save();
    await productoActualizado.populate('tiendaId', 'nombre email telefono');

    res.json({
      success: true,
      message: 'Producto actualizado exitosamente',
      producto: productoActualizado
    });

  } catch (error) {
    console.error('Error actualizando producto:', error);
    
    if (error.name === 'ValidationError') {
      const errores = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Errores de validación',
        errores 
      });
    }

    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Eliminar un producto
// @route   DELETE /api/products/:id
// @access  Private (solo tiendas propietarias)
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const producto = await Producto.findById(id);

    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // Verificar autorización
    if (req.user.rol !== 'administrador' && 
        producto.tiendaId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ 
        message: 'No autorizado para eliminar este producto' 
      });
    }

    await producto.deleteOne();

    res.json({
      success: true,
      message: 'Producto eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando producto:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Obtener categorías disponibles
// @route   GET /api/products/categories
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    const categorias = await Producto.distinct('categoria');
    
    res.json({
      success: true,
      categorias: categorias.filter(cat => cat) // Filtrar valores null/undefined
    });

  } catch (error) {
    console.error('Error obteniendo categorías:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Actualizar stock de un producto
// @route   PATCH /api/products/:id/stock
// @access  Private (solo tiendas propietarias)
exports.updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock, operacion = 'set' } = req.body; // operacion: 'set', 'add', 'subtract'

    if (stock === undefined) {
      return res.status(400).json({ message: 'Stock es requerido' });
    }

    const producto = await Producto.findById(id);

    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // Verificar autorización
    if (req.user.rol !== 'administrador' && 
        producto.tiendaId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ 
        message: 'No autorizado para actualizar este producto' 
      });
    }

    // Actualizar stock según operación
    switch (operacion) {
      case 'add':
        producto.stock += parseInt(stock);
        break;
      case 'subtract':
        producto.stock = Math.max(0, producto.stock - parseInt(stock));
        break;
      default:
        producto.stock = parseInt(stock);
    }

    await producto.save();

    res.json({
      success: true,
      message: 'Stock actualizado exitosamente',
      stock_actual: producto.stock
    });

  } catch (error) {
    console.error('Error actualizando stock:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
`;

const orderControllerContent = `
// backend/controllers/orderController.js
const Pedido = require('../models/Pedido');
const Producto = require('../models/Producto');
const Usuario = require('../models/Usuario');

// @desc    Crear un nuevo pedido
// @route   POST /api/orders
// @access  Private (solo clientes)
exports.createOrder = async (req, res) => {
  try {
    const { productos, direccion_envio, metodo_pago, notas } = req.body;
    const clienteId = req.user.id;

    // Validar que es un cliente
    if (req.user.rol !== 'cliente') {
      return res.status(403).json({ 
        message: 'Solo los clientes pueden crear pedidos' 
      });
    }

    // Validaciones básicas
    if (!productos || !Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({ 
        message: 'Debe incluir al menos un producto' 
      });
    }

    if (!direccion_envio || !metodo_pago) {
      return res.status(400).json({ 
        message: 'Dirección de envío y método de pago son requeridos' 
      });
    }

    // Verificar que todos los productos pertenecen a la misma tienda
    const primerProducto = await Producto.findById(productos[0].producto);
    if (!primerProducto) {
      return res.status(404).json({ 
        message: \`Producto \${productos[0].producto} no encontrado\` 
      });
    }

    const tiendaId = primerProducto.tiendaId;
    let subtotal = 0;
    const productosPedido = [];

    // Procesar cada producto
    for (const item of productos) {
      const productoDB = await Producto.findById(item.producto);
      
      if (!productoDB) {
        return res.status(404).json({ 
          message: \`Producto \${item.producto} no encontrado\` 
        });
      }

      // Verificar que todos los productos son de la misma tienda
      if (productoDB.tiendaId.toString() !== tiendaId.toString()) {
        return res.status(400).json({ 
          message: 'Todos los productos deben ser de la misma tienda' 
        });
      }

      // Verificar disponibilidad y stock
      if (!productoDB.disponible) {
        return res.status(400).json({ 
          message: \`El producto \${productoDB.nombre} no está disponible\` 
        });
      }

      if (productoDB.stock < item.cantidad) {
        return res.status(400).json({ 
          message: \`Stock insuficiente para \${productoDB.nombre}. Stock disponible: \${productoDB.stock}\` 
        });
      }

      const precio_unitario = productoDB.precio;
      const subtotal_item = precio_unitario * item.cantidad;
      subtotal += subtotal_item;

      productosPedido.push({
        producto: productoDB._id,
        cantidad: item.cantidad,
        precio_unitario,
        subtotal: subtotal_item
      });

      // Reducir stock
      await productoDB.reducirStock(item.cantidad);
    }

    // Calcular costo de envío (lógica simple)
    const costo_envio = calcularCostoEnvio(subtotal, direccion_envio);
    const total = subtotal + costo_envio;

    // Crear pedido
    const nuevoPedido = new Pedido({
      clienteId,
      tiendaId,
      productos: productosPedido,
      subtotal,
      costo_envio,
      total,
      direccion_envio,
      metodo_pago,
      notas: notas || '',
      tiempo_estimado: calcularTiempoEstimado(productosPedido),
      fecha_entrega_estimada: new Date(Date.now() + calcularTiempoEstimado(productosPedido) * 60000)
    });

    const pedidoCreado = await nuevoPedido.save();
    await pedidoCreado.populate([
      { path: 'clienteId', select: 'nombre telefono email' },
      { path: 'tiendaId', select: 'nombre telefono email ubicacion' },
      { path: 'productos.producto', select: 'nombre precio imagen' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Pedido creado exitosamente',
      pedido: pedidoCreado
    });

  } catch (error) {
    console.error('Error creando pedido:', error);
    
    if (error.name === 'ValidationError') {
      const errores = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Errores de validación',
        errores 
      });
    }

    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Obtener pedidos del usuario
// @route   GET /api/orders
// @access  Private
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRol = req.user.rol;
    const { 
      page = 1, 
      limit = 10, 
      estado, 
      fecha_inicio, 
      fecha_fin 
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Construir query según el rol
    let query = {};
    
    switch (userRol) {
      case 'cliente':
        query.clienteId = userId;
        break;
      case 'tienda':
        query.tiendaId = userId;
        break;
      case 'repartidor':
        query.repartidorId = userId;
        break;
      case 'administrador':
        // Administrador puede ver todos los pedidos
        break;
      default:
        return res.status(403).json({ message: 'Rol no autorizado' });
    }

    // Filtros adicionales
    if (estado) {
      query.estado = estado;
    }

    if (fecha_inicio || fecha_fin) {
      query.createdAt = {};
      if (fecha_inicio) query.createdAt.$gte = new Date(fecha_inicio);
      if (fecha_fin) query.createdAt.$lte = new Date(fecha_fin);
    }

    const pedidos = await Pedido.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('clienteId', 'nombre telefono email')
      .populate('tiendaId', 'nombre telefono email ubicacion')
      .populate('repartidorId', 'nombre telefono email')
      .populate('productos.producto', 'nombre precio imagen')
      .sort({ createdAt: -1 });

    const totalPedidos = await Pedido.countDocuments(query);

    res.json({
      success: true,
      pedidos,
      paginacion: {
        pagina_actual: parseInt(page),
        total_paginas: Math.ceil(totalPedidos / parseInt(limit)),
        total_pedidos: totalPedidos,
        pedidos_por_pagina: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error obteniendo pedidos:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Obtener un pedido por ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRol = req.user.rol;

    const pedido = await Pedido.findById(id)
      .populate('clienteId', 'nombre telefono email')
      .populate('tiendaId', 'nombre telefono email ubicacion')
      .populate('repartidorId', 'nombre telefono email ubicacion')
      .populate('productos.producto', 'nombre precio imagen descripcion');

    if (!pedido) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    // Verificar autorización
    const autorizado = userRol === 'administrador' ||
                      (userRol === 'cliente' && pedido.clienteId._id.toString() === userId) ||
                      (userRol === 'tienda' && pedido.tiendaId._id.toString() === userId) ||
                      (userRol === 'repartidor' && pedido.repartidorId && pedido.repartidorId._id.toString() === userId);

    if (!autorizado) {
      return res.status(403).json({ 
        message: 'No autorizado para ver este pedido' 
      });
    }

    res.json({
      success: true,
      pedido
    });

  } catch (error) {
    console.error('Error obteniendo pedido:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Actualizar estado de un pedido
// @route   PUT /api/orders/:id/status
// @access  Private
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    const userId = req.user.id;
    const userRol = req.user.rol;

    if (!estado) {
      return res.status(400).json({ message: 'Estado es requerido' });
    }

    const pedido = await Pedido.findById(id);

    if (!pedido) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    // Verificar autorización según el rol y estado
    let autorizado = false;
    
    if (userRol === 'administrador') {
      autorizado = true;
    } else if (userRol === 'tienda' && pedido.tiendaId.toString() === userId) {
      // Tiendas pueden cambiar: pendiente -> confirmado/cancelado, confirmado -> preparando, preparando -> listo
      autorizado = ['confirmado', 'preparando', 'listo', 'cancelado'].includes(estado);
    } else if (userRol === 'repartidor' && pedido.repartidorId && pedido.repartidorId.toString() === userId) {
      // Repartidores pueden cambiar: listo -> en_camino, en_camino -> entregado
      autorizado = ['en_camino', 'entregado'].includes(estado);
    }

    if (!autorizado) {
      return res.status(403).json({ 
        message: 'No autorizado para cambiar el estado de este pedido' 
      });
    }

    // Cambiar estado usando el método del modelo
    await pedido.cambiarEstado(estado);

    await pedido.populate([
      { path: 'clienteId', select: 'nombre telefono email' },
      { path: 'tiendaId', select: 'nombre telefono email' },
      { path: 'repartidorId', select: 'nombre telefono email' }
    ]);

    res.json({
      success: true,
      message: 'Estado del pedido actualizado exitosamente',
      pedido
    });

  } catch (error) {
    console.error('Error actualizando estado del pedido:', error);
    
    if (error.message.includes('Transición de estado inválida')) {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Asignar repartidor a un pedido
// @route   PUT /api/orders/:id/assign-delivery
// @access  Private (tienda, admin)
exports.assignDelivery = async (req, res) => {
  try {
    const { id } = req.params;
    const { repartidorId } = req.body;
    const userRol = req.user.rol;
    const userId = req.user.id;

    if (!repartidorId) {
      return res.status(400).json({ message: 'ID del repartidor es requerido' });
    }

    const pedido = await Pedido.findById(id);

    if (!pedido) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    // Verificar autorización
    if (userRol !== 'administrador' && 
        (userRol !== 'tienda' || pedido.tiendaId.toString() !== userId)) {
      return res.status(403).json({ 
        message: 'No autorizado para asignar repartidor' 
      });
    }

    // Verificar que el repartidor existe y está activo
    const repartidor = await Usuario.findById(repartidorId);
    if (!repartidor || repartidor.rol !== 'repartidor' || 
        repartidor.estado_validacion !== 'aprobado' || !repartidor.activo) {
      return res.status(400).json({ 
        message: 'Repartidor inválido o no disponible' 
      });
    }

    // Asignar repartidor y cambiar estado
    pedido.repartidorId = repartidorId;
    if (pedido.estado === 'listo') {
      pedido.estado = 'en_camino';
    }

    await pedido.save();
    await pedido.populate([
      { path: 'clienteId', select: 'nombre telefono email' },
      { path: 'tiendaId', select: 'nombre telefono email' },
      { path: 'repartidorId', select: 'nombre telefono email ubicacion' }
    ]);

    res.json({
      success: true,
      message: 'Repartidor asignado exitosamente',
      pedido
    });

  } catch (error) {
    console.error('Error asignando repartidor:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Calificar un pedido
// @route   PUT /api/orders/:id/rate
// @access  Private (solo cliente del pedido)
exports.rateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { puntuacion, comentario } = req.body;
    const userId = req.user.id;

    if (!puntuacion || puntuacion < 1 || puntuacion > 5) {
      return res.status(400).json({ 
        message: 'La puntuación debe ser entre 1 y 5' 
      });
    }

    const pedido = await Pedido.findById(id);

    if (!pedido) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    // Verificar que es el cliente del pedido
    if (pedido.clienteId.toString() !== userId) {
      return res.status(403).json({ 
        message: 'Solo el cliente puede calificar el pedido' 
      });
    }

    // Verificar que el pedido está entregado
    if (pedido.estado !== 'entregado') {
      return res.status(400).json({ 
        message: 'Solo se pueden calificar pedidos entregados' 
      });
    }

    // Agregar calificación
    pedido.calificacion = {
      puntuacion,
      comentario: comentario || ''
    };

    await pedido.save();

    res.json({
      success: true,
      message: 'Pedido calificado exitosamente',
      calificacion: pedido.calificacion
    });

  } catch (error) {
    console.error('Error calificando pedido:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Funciones auxiliares
function calcularCostoEnvio(subtotal, direccion) {
  // Lógica simple de costo de envío
  if (subtotal >= 50) return 0; // Envío gratis por compras mayores a $50
  return 5; // Costo fijo de envío
}

function calcularTiempoEstimado(productos) {
  // Calcular tiempo basado en tiempo de preparación de productos
  const tiempoTotal = productos.reduce((total, item) => {
    return total + (item.tiempo_preparacion || 15);
  }, 0);
  
  return Math.max(30, tiempoTotal + 15); // Mínimo 30 minutos, más 15 min de envío
}
`;

const authRoutesContent = `
// backend/routes/authRoutes.js
const express = require('express');
const { 
  registerUser, 
  loginUser, 
  verifyOTP, 
  resendOTP,
  getProfile,
  updateProfile
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Rutas públicas
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);

// Rutas protegidas
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

module.exports = router;
`;

const productRoutesContent = `
// backend/routes/productRoutes.js
const express = require('express');
const { 
  getProducts, 
  getProductById,
  createProduct, 
  updateProduct, 
  deleteProduct,
  getCategories,
  updateStock
} = require('../controllers/productController');
const { authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Rutas públicas
router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/:id', getProductById);

// Rutas protegidas
router.post('/', authorize(['tienda', 'administrador']), createProduct);
router.put('/:id', authorize(['tienda', 'administrador']), updateProduct);
router.delete('/:id', authorize(['tienda', 'administrador']), deleteProduct);
router.patch('/:id/stock', authorize(['tienda', 'administrador']), updateStock);

module.exports = router;
`;

const orderRoutesContent = `
// backend/routes/orderRoutes.js
const express = require('express');
const { 
  createOrder, 
  getUserOrders, 
  getOrderById,
  updateOrderStatus, 
  assignDelivery,
  rateOrder
} = require('../controllers/orderController');
const { authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Rutas para pedidos
router.post('/', authorize(['cliente']), createOrder);
router.get('/', getUserOrders);
router.get('/:id', getOrderById);

// Actualización de estado
router.put('/:id/status', authorize(['tienda', 'repartidor', 'administrador']), updateOrderStatus);

// Asignación de repartidor
router.put('/:id/assign-delivery', authorize(['tienda', 'administrador']), assignDelivery);

// Calificación
router.put('/:id/rate', authorize(['cliente']), rateOrder);

module.exports = router;
`;

const locationRoutesContent = `
// backend/routes/locationRoutes.js
const express = require('express');
const { 
  updateLocation, 
  getNearbyDelivery, 
  getNearbyStores 
} = require('../controllers/locationController');
const { authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Actualizar ubicación (solo repartidores y tiendas)
router.put('/update', authorize(['repartidor', 'tienda']), updateLocation);

// Obtener repartidores cercanos
router.get('/nearby-delivery', getNearbyDelivery);

// Obtener tiendas cercanas
router.get('/nearby-stores', getNearbyStores);

module.exports = router;
`;

const authMiddlewareContent = `
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
        message: \`Acceso denegado. Rol requerido: \${roles.join(' o ')}\`,
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
`;

const envExampleContent = `
# Variables de Entorno para el Backend de YEGA

# Puerto en el que correrá el servidor
PORT=5000

# Entorno de desarrollo/producción
NODE_ENV=development

# URI de conexión a MongoDB
# Desarrollo local: mongodb://localhost:27017/yega_db
# MongoDB Atlas: mongodb+srv://<user>:<password>@cluster0.abcde.mongodb.net/yega_db?retryWrites=true&w=majority
MONGODB_URI=mongodb://localhost:27017/yega_db

# Configuración JWT
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui
JWT_EXPIRES_IN=24h

# Configuración de Twilio para SMS/OTP
TWILIO_ACCOUNT_SID=tu_twilio_account_sid
TWILIO_AUTH_TOKEN=tu_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# URL del frontend (para CORS)
FRONTEND_URL=http://localhost:3000

# Configuración de archivos/imágenes
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

# Configuración de email (opcional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_password_de_aplicacion

# API Keys externas (opcional)
GOOGLE_MAPS_API_KEY=tu_google_maps_api_key
BLACKBOX_API_KEY=tu_blackbox_api_key
`;

const generateOTPUtilContent = `
// backend/utils/generateOTP.js

/**
 * Genera un código OTP de 6 dígitos
 * @returns {string} Código OTP de 6 dígitos
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Genera un código OTP personalizable
 * @param {number} length - Longitud del código (por defecto 6)
 * @param {boolean} alphanumeric - Si incluir letras (por defecto false)
 * @returns {string} Código OTP generado
 */
const generateCustomOTP = (length = 6, alphanumeric = false) => {
  const numbers = '0123456789';
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const chars = alphanumeric ? numbers + letters : numbers;
  
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
};

/**
 * Valida formato de OTP
 * @param {string} otp - Código OTP a validar
 * @param {number} expectedLength - Longitud esperada
 * @returns {boolean} True si es válido
 */
const validateOTPFormat = (otp, expectedLength = 6) => {
  if (!otp || typeof otp !== 'string') return false;
  if (otp.length !== expectedLength) return false;
  return /^\\d+$/.test(otp); // Solo números
};

module.exports = {
  generateOTP,
  generateCustomOTP,
  validateOTPFormat
};
`;

const sendSMSUtilContent = `
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

    console.log(\`✅ SMS enviado exitosamente a \${to}. SID: \${result.sid}\`);
    
    return {
      success: true,
      sid: result.sid,
      status: result.status,
      to: to
    };

  } catch (error) {
    console.error(\`❌ Error enviando SMS a \${to}:\`, error.message);
    
    // En desarrollo, simular envío exitoso
    if (process.env.NODE_ENV === 'development') {
      console.log(\`🔧 Modo desarrollo: Simulando envío de SMS a \${to}\`);
      console.log(\`📱 Mensaje: \${message}\`);
      
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
  const message = \`Tu código de verificación de \${appName} es: \${otp}. Este código expira en 10 minutos.\`;
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

  const message = \`YEGA - Pedido \${orderNumber}: \${statusMessages[status] || 'Estado actualizado'}.\`;
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
  const phoneRegex = /^\\+?[1-9]\\d{1,14}$/;
  return phoneRegex.test(phoneNumber.replace(/\\s+/g, ''));
};

/**
 * Formatea número de teléfono para Twilio
 * @param {string} phoneNumber - Número a formatear
 * @returns {string} Número formateado
 */
const formatPhoneNumber = (phoneNumber) => {
  // Remover espacios y caracteres especiales
  let formatted = phoneNumber.replace(/[^\\d+]/g, '');
  
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
`;

const packageJsonContent = `
{
  "name": "yega-backend",
  "version": "1.0.0",
  "description": "Backend API para YEGA - Plataforma de e-commerce con múltiples roles",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "seed": "node scripts/seedDatabase.js"
  },
  "keywords": [
    "nodejs",
    "express",
    "mongodb",
    "ecommerce",
    "api",
    "jwt",
    "twilio"
  ],
  "author": "Equipo YEGA",
  "license": "MIT",
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.5.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "dotenv": "^16.3.1",
    "cors": "^2.8.5",
    "twilio": "^4.15.0",
    "multer": "^1.4.5",
    "helmet": "^7.0.0",
    "express-rate-limit": "^6.10.0",
    "express-validator": "^7.0.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.6.4",
    "supertest": "^6.3.3"
  },
  "engines": {
    "node": ">=16.0.0"
  }
}
`;

// --- Lógica Principal ---

async function generateBackend() {
  console.log('🚀 Iniciando generación de la estructura del backend YEGA...\n');

  try {
    // 1. Crear directorios principales
    console.log('📁 Creando estructura de directorios...');
    ensureDirectoryExists(BACKEND_DIR);
    ensureDirectoryExists(MODELS_DIR);
    ensureDirectoryExists(ROUTES_DIR);
    ensureDirectoryExists(CONTROLLERS_DIR);
    ensureDirectoryExists(MIDDLEWARE_DIR);
    ensureDirectoryExists(CONFIG_DIR);
    ensureDirectoryExists(UTILS_DIR);

    // 2. Crear archivo principal del servidor
    console.log('\n🖥️  Generando servidor principal...');
    writeToFile(path.join(BACKEND_DIR, 'server.js'), serverJsContent);

    // 3. Crear modelos
    console.log('\n📊 Generando modelos de datos...');
    writeToFile(path.join(MODELS_DIR, 'Usuario.js'), userModelContent);
    writeToFile(path.join(MODELS_DIR, 'Producto.js'), productModelContent);
    writeToFile(path.join(MODELS_DIR, 'Pedido.js'), orderModelContent);

    // 4. Crear controladores
    console.log('\n🎮 Generando controladores...');
    writeToFile(path.join(CONTROLLERS_DIR, 'authController.js'), authControllerContent);
    writeToFile(path.join(CONTROLLERS_DIR, 'productController.js'), productControllerContent);
    writeToFile(path.join(CONTROLLERS_DIR, 'orderController.js'), orderControllerContent);
    writeToFile(path.join(CONTROLLERS_DIR, 'locationController.js'), locationControllerContent);

    // 5. Crear rutas
    console.log('\n🛣️  Generando rutas...');
    writeToFile(path.join(ROUTES_DIR, 'authRoutes.js'), authRoutesContent);
    writeToFile(path.join(ROUTES_DIR, 'productRoutes.js'), productRoutesContent);
    writeToFile(path.join(ROUTES_DIR, 'orderRoutes.js'), orderRoutesContent);
    writeToFile(path.join(ROUTES_DIR, 'locationRoutes.js'), locationRoutesContent);

    // 6. Crear middleware
    console.log('\n🔒 Generando middleware de autenticación...');
    writeToFile(path.join(MIDDLEWARE_DIR, 'authMiddleware.js'), authMiddlewareContent);

    // 7. Crear utilidades
    console.log('\n🛠️  Generando utilidades...');
    writeToFile(path.join(UTILS_DIR, 'generateOTP.js'), generateOTPUtilContent);
    writeToFile(path.join(UTILS_DIR, 'sendSMS.js'), sendSMSUtilContent);

    // 8. Crear archivos de configuración
    console.log('\n⚙️  Generando archivos de configuración...');
    writeToFile(path.join(BACKEND_DIR, '.env.example'), envExampleContent);
    writeToFile(path.join(BACKEND_DIR, 'package.json'), packageJsonContent);

    // 9. Crear archivo .gitignore
    const gitignoreContent = `
node_modules/
.env
.env.local
.env.production
uploads/
logs/
*.log
.DS_Store
.vscode/
.idea/
coverage/
dist/
build/
`;
    writeToFile(path.join(BACKEND_DIR, '.gitignore'), gitignoreContent);

    console.log('\n✅ Backend generado exitosamente!');
    console.log('\n📋 Pasos siguientes:');
    console.log('1. 📦 Instalar dependencias:');
    console.log('   cd backend && npm install');
    console.log('\n2. ⚙️  Configurar variables de entorno:');
    console.log('   cp .env.example .env');
    console.log('   # Editar .env con tus configuraciones');
    console.log('\n3. 🗄️  Configurar MongoDB:');
    console.log('   # Crear base de datos local o usar MongoDB Atlas');
    console.log('\n4. 📱 Configurar Twilio (opcional para SMS):');
    console.log('   # Obtener credenciales de Twilio para OTP');
    console.log('\n5. 🚀 Iniciar servidor:');
    console.log('   npm run dev  # Modo desarrollo');
    console.log('   npm start    # Modo producción');
    console.log('\n🌐 El servidor estará disponible en: http://localhost:5000');

  } catch (error) {
    console.error('❌ Error generando backend:', error);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  generateBackend();
}

module.exports = { generateBackend };