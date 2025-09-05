// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const otpRoutes = require('./routes/otpRoutes');
const locationRoutes = require('./routes/locationRoutes');
const { protect, authorize } = require('./middleware/authMiddleware');
const path = require('path');
const adminRoutes = require('./routes/adminRoutes');

// Carga variables de entorno desde backend/.env de forma robusta, independientemente del cwd
dotenv.config({ path: require('path').join(__dirname, '.env') });

const app = express();
app.set('trust proxy', 1); // Confiar en el primer proxy (ej. ngrok, Vercel)

// Middleware
// Seguridad básica
app.use(helmet());

// CORS restringido por FRONTEND_URL (o relajado en desarrollo)
const frontendUrl = process.env.FRONTEND_URL || '*';
const allowedOrigins = frontendUrl === '*' ? '*' : frontendUrl.split(',').map(origin => origin.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins === '*') {
      return callback(null, true);
    }

    if (Array.isArray(allowedOrigins)) {
      for (const allowedOrigin of allowedOrigins) {
        // Exact match
        if (allowedOrigin === origin) {
          return callback(null, true);
        }
        // Wildcard match
        if (allowedOrigin.includes('*')) {
          const regex = new RegExp('^' + allowedOrigin.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$');
          if (regex.test(origin)) {
            return callback(null, true);
          }
        }
      }
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// Rate limit global (además de los específicos en rutas OTP)
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || 100),
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

app.use(express.json()); // Habilita el parsing de JSON en las peticiones

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('✅ MongoDB conectado exitosamente'))
.catch(err => console.error('❌ Error de conexión a MongoDB:', err));

// Rutas públicas (autenticación)
app.use('/api/auth', authRoutes);

// Rutas protegidas (requieren JWT)
app.use('/api/products', protect, productRoutes);
app.use('/api/orders', protect, orderRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/location', protect, locationRoutes);
app.use('/api/admin', protect, authorize(['administrador']), adminRoutes);
// Documentos del usuario (subida)
const documentRoutes = require('./routes/documentRoutes');
app.use('/api/documents', protect, documentRoutes);

// Servir archivos subidos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// En producción, servir el frontend compilado (Vite dist)
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '..', 'frontend', 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    return res.sendFile(path.join(distPath, 'index.html'));
  });
}

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

// Manejo de rutas API no encontradas
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// Iniciar el servidor solo cuando se ejecuta directamente (no al ser requerido por tests)
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Servidor corriendo en el puerto ${PORT}`));
}

module.exports = app;