# Guía de Scripts de Automatización YEGA

Esta guía explica cómo usar los scripts de automatización para generar la estructura y funcionalidad del proyecto YEGA.

## 📋 Scripts Disponibles

### 1. `generate-all.js` - Generador Completo
**Descripción**: Ejecuta todos los generadores y crea la estructura completa del proyecto.

```bash
node generate-all.js
```

**Qué hace**:
- ✅ Genera estructura completa del backend
- ✅ Genera estructura completa del frontend  
- ✅ Integra sistema OTP
- ✅ Instala dependencias automáticamente
- ✅ Crea documentación (README, LICENSE, .gitignore)

**Cuándo usar**: Primera vez configurando el proyecto o para regenerar todo desde cero.

---

### 2. `generate-backend.js` - Backend Completo
**Descripción**: Crea la estructura completa del backend con API RESTful.

```bash
node generate-backend.js
```

**Estructura generada**:
```
backend/
├── models/           # Modelos Mongoose (Usuario, Producto, Pedido)
├── controllers/      # Lógica de negocio
├── routes/          # Rutas de la API
├── middleware/      # Middleware de autenticación
├── utils/           # Utilidades (OTP, SMS)
├── server.js        # Servidor principal
├── package.json     # Dependencias
└── .env.example     # Variables de entorno
```

**Funcionalidades incluidas**:
- 🔐 Autenticación JWT con roles
- 📱 Sistema OTP básico
- 🗺️ Geolocalización para repartidores/tiendas
- 📦 CRUD completo para productos y pedidos
- 🛡️ Middleware de seguridad y validación

---

### 3. `generate-frontend-tasks.js` - Frontend Completo
**Descripción**: Crea la aplicación React con componentes y páginas por rol.

```bash
node generate-frontend-tasks.js
```

**Estructura generada**:
```
frontend/
├── src/
│   ├── components/   # Componentes reutilizables
│   ├── pages/        # Páginas por rol (Cliente, Tienda, etc.)
│   ├── services/     # Cliente API con Axios
│   ├── context/      # Context de autenticación
│   ├── hooks/        # Hooks personalizados
│   └── styles/       # Estilos globales
├── package.json      # Dependencias React
└── vite.config.js    # Configuración Vite
```

**Funcionalidades incluidas**:
- ⚛️ React 18 con Hooks
- 🎨 UI con React Bootstrap y Styled Components
- 🗺️ Integración con React Leaflet para mapas
- 🔐 Context de autenticación
- 📱 Diseño responsive mobile-first

---

### 4. `generate-endpoint.js` - Endpoints Personalizados
**Descripción**: Genera endpoints RESTful específicos con modelo, controlador y rutas.

#### Uso Básico
```bash
# Generar endpoint básico
node generate-endpoint.js categoria

# Usar configuración de ejemplo
node generate-endpoint.js --example categoria
node generate-endpoint.js --example comentario
node generate-endpoint.js --example promocion
```

#### Configuraciones de Ejemplo Disponibles

**Categoría** - Sistema de categorías de productos
```bash
node generate-endpoint.js --example categoria
```
- Campos: nombre, descripción, icono, activo, orden
- Operaciones: CRUD completo
- Roles: administrador, tienda

**Comentario** - Sistema de comentarios y calificaciones
```bash
node generate-endpoint.js --example comentario
```
- Campos: usuarioId, productoId, pedidoId, puntuación, comentario
- Operaciones: CRUD completo
- Roles: cliente, administrador

**Promoción** - Sistema de promociones y descuentos
```bash
node generate-endpoint.js --example promocion
```
- Campos: título, descripción, tipo, valor, fechas, productos
- Operaciones: CRUD + aplicarPromocion
- Roles: tienda, administrador

#### Personalización Avanzada
Para crear endpoints personalizados, edita el archivo y define tu configuración:

```javascript
const miConfig = {
  name: 'miEntidad',
  fields: [
    { name: 'nombre', type: 'String', required: true, maxlength: 100 },
    { name: 'precio', type: 'Number', min: 0 },
    { name: 'categoria', type: 'String', enum: ['tipo1', 'tipo2'] }
  ],
  operations: ['getAll', 'getById', 'create', 'update', 'delete'],
  auth: true,
  roles: ['administrador'],
  indexes: [{ nombre: 1 }]
};
```

---

### 5. `generate-otp.js` - Sistema OTP Completo
**Descripción**: Integra funcionalidad OTP avanzada para verificación de usuarios.

```bash
node generate-otp.js
```

**Backend generado**:
- 📊 Modelo OTP con expiración automática
- 🔧 Servicio OTP con múltiples métodos de envío
- 🎮 Controlador con rate limiting
- 🛣️ Rutas para envío, verificación y reenvío
- 📧 Utilidad de email con plantillas HTML

**Frontend generado**:
- 🪝 Hook useOTP para manejo de estado
- 🧩 Componente OTPInput reutilizable
- 📄 Página VerifyOTP completa

**Características**:
- 📱 Envío por SMS y Email
- ⏰ Códigos con expiración automática
- 🔒 Rate limiting para prevenir spam
- 📊 Estadísticas y limpieza automática
- 🎨 UI moderna con cuenta regresiva

---

## 🔧 Configuración Post-Generación

### Variables de Entorno

#### Backend (.env)
```env
# Servidor
PORT=5000
NODE_ENV=development

# Base de datos
MONGODB_URI=mongodb://localhost:27017/yega_db

# JWT
JWT_SECRET=tu_jwt_secret_muy_seguro
JWT_EXPIRES_IN=24h

# Twilio (SMS)
TWILIO_ACCOUNT_SID=tu_account_sid
TWILIO_AUTH_TOKEN=tu_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_password_de_aplicacion
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_MAPS_API_KEY=tu_google_maps_api_key
```

### Instalación de Dependencias

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### Ejecución en Desarrollo

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

---

## 🎯 Casos de Uso Comunes

### Caso 1: Proyecto Nuevo
```bash
# Generar todo desde cero
node generate-all.js

# Configurar variables de entorno
cd backend && cp .env.example .env
cd ../frontend && cp .env.example .env

# Editar archivos .env con tus configuraciones
# Iniciar servidores
```

### Caso 2: Agregar Nueva Funcionalidad
```bash
# Agregar sistema de categorías
node generate-endpoint.js --example categoria

# Agregar sistema de comentarios
node generate-endpoint.js --example comentario

# Reiniciar backend para cargar nuevas rutas
cd backend && npm run dev
```

### Caso 3: Integrar OTP Avanzado
```bash
# Si ya tienes el proyecto base
node generate-otp.js

# Instalar nuevas dependencias
cd backend && npm install nodemailer express-rate-limit

# Configurar EMAIL_* en .env
# Reiniciar servidores
```

### Caso 4: Solo Backend o Frontend
```bash
# Solo backend
node generate-backend.js
cd backend && npm install && npm run dev

# Solo frontend
node generate-frontend-tasks.js
cd frontend && npm install && npm run dev
```

---

## 🛠️ Personalización y Extensión

### Modificar Plantillas
Los scripts usan plantillas de código que puedes personalizar:

1. **Estilos**: Edita `frontend/src/styles/global.css`
2. **Componentes**: Modifica plantillas en los scripts
3. **Modelos**: Ajusta esquemas en `generate-endpoint.js`
4. **Rutas**: Personaliza middleware y validaciones

### Agregar Nuevos Scripts
Crea scripts siguiendo el patrón:

```javascript
#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Tu lógica de generación aquí

if (require.main === module) {
  // Ejecutar si es llamado directamente
}

module.exports = { tuFuncion };
```

### Integrar con CI/CD
Los scripts pueden integrarse en pipelines:

```yaml
# .github/workflows/setup.yml
- name: Generate Project Structure
  run: node generate-all.js

- name: Install Dependencies
  run: |
    cd backend && npm ci
    cd frontend && npm ci
```

---

## 🐛 Solución de Problemas

### Error: "Cannot find module"
```bash
# Verificar Node.js
node --version
npm --version

# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### Error: "Permission denied"
```bash
# En Unix/Linux/Mac
chmod +x generate-*.js

# O ejecutar con node explícitamente
node generate-all.js
```

### Error: "Port already in use"
```bash
# Cambiar puerto en .env
PORT=5001

# O matar proceso existente
lsof -ti:5000 | xargs kill -9
```

### Error: "MongoDB connection failed"
```bash
# Verificar MongoDB
mongosh # o mongo

# Usar MongoDB Atlas si no tienes local
# Actualizar MONGODB_URI en .env
```

---

## 📚 Recursos Adicionales

### Documentación
- [Node.js](https://nodejs.org/docs/)
- [React](https://react.dev/)
- [MongoDB](https://docs.mongodb.com/)
- [Express](https://expressjs.com/)

### Servicios Externos
- [Twilio SMS](https://www.twilio.com/docs/sms)
- [MongoDB Atlas](https://www.mongodb.com/atlas)
- [Google Maps API](https://developers.google.com/maps)

### Herramientas Recomendadas
- **IDE**: VS Code con extensiones React/Node.js
- **API Testing**: Postman o Insomnia
- **Database**: MongoDB Compass
- **Git**: GitHub Desktop o línea de comandos

---

## 🤝 Contribución

Para contribuir con mejoras a los scripts:

1. Fork el repositorio
2. Crea una rama: `git checkout -b feature/mejora-scripts`
3. Realiza cambios y pruebas
4. Commit: `git commit -m 'Mejora en generate-endpoint.js'`
5. Push: `git push origin feature/mejora-scripts`
6. Crea Pull Request

---

**¡Los scripts de YEGA te ayudan a construir más rápido! 🚀**