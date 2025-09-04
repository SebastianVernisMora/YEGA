# YEGA - Plataforma de E-commerce con Delivery

YEGA es una plataforma completa de e-commerce que conecta clientes, tiendas y repartidores, proporcionando un sistema integral de delivery con geolocalización en tiempo real.

## 🚀 Características Principales

### Roles de Usuario
- **Cliente**: Navega, ordena productos y rastrea entregas
- **Tienda**: Gestiona inventario, productos y pedidos
- **Repartidor**: Recibe asignaciones y actualiza ubicación en tiempo real
- **Administrador**: Supervisa toda la plataforma

### Funcionalidades Clave
- 🔐 **Autenticación JWT** con roles y permisos (clientes sin OTP; tiendas y repartidores con verificación OTP)
- 📱 **Verificación OTP** por SMS y email
- 🗺️ **Geolocalización** con mapas interactivos
- 📦 **Gestión de pedidos** con estados en tiempo real
- 💳 **Múltiples métodos de pago**
- 📊 **Dashboard administrativo** con estadísticas
- 🔔 **Notificaciones** automáticas por SMS/email

## 🛠️ Stack Tecnológico

### Backend
- **Node.js** con Express.js
- **MongoDB** con Mongoose
- **JWT** para autenticación
- **Twilio** para SMS
- **Nodemailer** para emails
- **Bcrypt** para encriptación

### Frontend
- **React 18** con Hooks
- **React Router** para navegación
- **React Bootstrap** para UI
- **Styled Components** para estilos
- **React Leaflet** para mapas
- **Axios** para API calls
- **React Query** para cache

## 📁 Estructura del Proyecto

```
YEGA/
├── backend/                 # API del servidor
│   ├── models/             # Modelos de MongoDB
│   ├── controllers/        # Lógica de negocio
│   ├── routes/            # Rutas de la API
│   ├── middleware/        # Middleware personalizado
│   ├── services/          # Servicios (OTP, email, etc.)
│   ├── utils/             # Utilidades
│   └── server.js          # Punto de entrada
├── frontend/               # Aplicación React
│   ├── src/
│   │   ├── components/    # Componentes reutilizables
│   │   ├── pages/         # Páginas por rol
│   │   ├── services/      # Servicios de API
│   │   ├── hooks/         # Hooks personalizados
│   │   ├── context/       # Context providers
│   │   └── styles/        # Estilos globales
│   └── public/            # Archivos estáticos
└── scripts/               # Scripts de generación
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 16+ 
- MongoDB (local o Atlas)
- Cuenta de Twilio (para SMS)
- Cuenta de email (Gmail recomendado)

### Instalación Automática

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd YEGA
   ```

2. **Ejecutar generación completa**
   ```bash
   node generate-all.js
   ```

### Instalación Manual

1. **Generar estructura del backend**
   ```bash
   node generate-backend.js
   cd backend
   npm install
   ```

2. **Generar estructura del frontend**
   ```bash
   node generate-frontend-tasks.js
   cd frontend
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   # Backend
   cd backend
   cp .env.example .env
   # Editar .env con tus configuraciones
   
   # Frontend
   cd ../frontend
   cp .env.example .env
   # Editar .env con tus configuraciones
   ```

### Variables de Entorno Requeridas

#### Backend (.env)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/yega_db
JWT_SECRET=tu_jwt_secret_muy_seguro
JWT_EXPIRES_IN=24h

# Twilio para SMS
TWILIO_ACCOUNT_SID=tu_twilio_account_sid
TWILIO_AUTH_TOKEN=tu_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Email para OTP
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

## 🏃‍♂️ Ejecución

### Modo Desarrollo

1. **Iniciar backend**
   ```bash
   cd backend
   npm run dev
   ```

2. **Iniciar frontend** (en otra terminal)
   ```bash
   cd frontend
   npm run dev
   ```

### Modo Producción

1. **Backend**
   ```bash
   cd backend
   npm start
   ```

2. **Frontend**
   ```bash
   cd frontend
   npm run build
   npm run preview
   ```

## 🔧 Scripts de Generación

El proyecto incluye scripts automatizados para generar código:

- `generate-backend.js` - Genera estructura completa del backend
- `generate-frontend-tasks.js` - Genera estructura del frontend
- `generate-endpoint.js` - Crea endpoints RESTful específicos
- `generate-otp.js` - Integra sistema OTP completo
- `generate-all.js` - Ejecuta todos los generadores

### Ejemplos de Uso

```bash
# Generar endpoint personalizado
node generate-endpoint.js categoria

# Generar con configuración de ejemplo
node generate-endpoint.js --example promocion

# Integrar sistema OTP
node generate-otp.js
```

## 📱 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `POST /api/auth/verify-otp` - Verificación OTP
- `GET /api/auth/profile` - Perfil del usuario

### Productos
- `GET /api/products` - Listar productos
- `POST /api/products` - Crear producto (tienda)
- `PUT /api/products/:id` - Actualizar producto
- `DELETE /api/products/:id` - Eliminar producto

### Pedidos
- `POST /api/orders` - Crear pedido (cliente)
- `GET /api/orders` - Listar pedidos
- `PUT /api/orders/:id/status` - Actualizar estado
- `PUT /api/orders/:id/assign-delivery` - Asignar repartidor

### Ubicación
- `PUT /api/location/update` - Actualizar ubicación
- `GET /api/location/nearby-stores` - Tiendas cercanas
- `GET /api/location/nearby-delivery` - Repartidores cercanos

### OTP
- `POST /api/otp/send` - Enviar código
- `POST /api/otp/verify` - Verificar código
- `POST /api/otp/resend` - Reenviar código

## 🎨 Diseño y UI

### Paleta de Colores
- **Principal**: Negro (#000000)
- **Secundario**: Blanco (#FFFFFF)
- **Acento Plata**: #C0C0C0
- **Acento Oro**: #D4AF37

### Componentes UI
- Diseño responsive mobile-first
- Componentes reutilizables con React Bootstrap
- Estilos personalizados con Styled Components
- Iconos con React Icons
- Mapas interactivos con React Leaflet

## 🧪 Testing

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

## 📚 Documentación Adicional

- [Configuración de Twilio](docs/twilio-setup.md)
- [Configuración de MongoDB](docs/mongodb-setup.md)
- [Despliegue en Producción](docs/deployment.md)
- [API Reference](docs/api-reference.md)

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 👥 Equipo

- **Desarrollo Backend**: Sistema de API RESTful con Node.js
- **Desarrollo Frontend**: Interfaz React moderna y responsive
- **DevOps**: Scripts de automatización y despliegue
- **QA**: Testing y aseguramiento de calidad

## 📞 Soporte

- **Email**: soporte@yega.com
- **Documentación**: [docs.yega.com](https://docs.yega.com)
- **Issues**: [GitHub Issues](https://github.com/yega/issues)

---

**YEGA** - Conectando el futuro del delivery 🚀
