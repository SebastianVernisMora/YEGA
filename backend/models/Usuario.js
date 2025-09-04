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
    match: [/^\+?[1-9]\d{1,14}$/, 'Formato de teléfono inválido']
  },
  email: { 
    type: String, 
    required: [true, 'El email es requerido'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Formato de email inválido']
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

// Subdocumento para verificación de documentos
const DocSchema = new mongoose.Schema({
  file: { type: String }, // URL relativa a /uploads
  status: { type: String, enum: ['pendiente', 'aprobado', 'rechazado'], default: 'pendiente' },
  uploadedAt: { type: Date },
  notes: { type: String }
}, { _id: false });

UsuarioSchema.add({
  verificaciones: {
    id_doc: DocSchema,
    comprobante_domicilio: DocSchema,
    licencia: DocSchema,
    tarjeta_circulacion: DocSchema,
    poliza_seguro: DocSchema,
  }
});

// Información de vehículo para repartidores
const VehiculoSchema = new mongoose.Schema({
  tipo: { type: String }, // moto, auto, bici
  marca: { type: String },
  modelo: { type: String },
  placa: { type: String },
  color: { type: String },
  anio: { type: String },
}, { _id: false })

UsuarioSchema.add({
  vehiculo: VehiculoSchema,
})

// Índices para optimizar consultas
UsuarioSchema.index({ email: 1 });
UsuarioSchema.index({ telefono: 1 });
UsuarioSchema.index({ rol: 1, estado_validacion: 1 });

// Hash de la contraseña antes de guardar
UsuarioSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
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
