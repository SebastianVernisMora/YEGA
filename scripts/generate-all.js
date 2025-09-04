#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// --- Configuración ---
const PROJECT_ROOT = process.cwd();

// --- Funciones de Utilidad ---

/**
 * Ejecuta un comando y muestra el resultado
 * @param {string} command - Comando a ejecutar
 * @param {string} description - Descripción del comando
 */
function executeCommand(command, description) {
  console.log(`\n🔄 ${description}...`);
  try {
    execSync(command, { 
      stdio: 'inherit', 
      cwd: PROJECT_ROOT 
    });
    console.log(`✅ ${description} completado`);
  } catch (error) {
    console.error(`❌ Error en ${description}:`, error.message);
    throw error;
  }
}

/**
 * Verifica si Node.js está instalado
 */
function checkNodeJS() {
  try {
    const version = execSync('node --version', { encoding: 'utf8' }).trim();
    console.log(`✅ Node.js detectado: ${version}`);
    return true;
  } catch (error) {
    console.error('❌ Node.js no está instalado o no está en el PATH');
    return false;
  }
}

/**
 * Verifica si npm está instalado
 */
function checkNPM() {
  try {
    const version = execSync('npm --version', { encoding: 'utf8' }).trim();
    console.log(`✅ npm detectado: ${version}`);
    return true;
  } catch (error) {
    console.error('❌ npm no está instalado o no está en el PATH');
    return false;
  }
}

/**
 * Crea el archivo README.md del proyecto
 */
function createProjectReadme() {
  const readmeContent = `
# YEGA - Plataforma de E-commerce con Delivery

YEGA es una plataforma completa de e-commerce que conecta clientes, tiendas y repartidores, proporcionando un sistema integral de delivery con geolocalización en tiempo real.

## 🚀 Características Principales

### Roles de Usuario
- **Cliente**: Navega, ordena productos y rastrea entregas
- **Tienda**: Gestiona inventario, productos y pedidos
- **Repartidor**: Recibe asignaciones y actualiza ubicación en tiempo real
- **Administrador**: Supervisa toda la plataforma

### Funcionalidades Clave
- 🔐 **Autenticación JWT** con roles y permisos
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

\`\`\`
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
\`\`\`

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 16+ 
- MongoDB (local o Atlas)
- Cuenta de Twilio (para SMS)
- Cuenta de email (Gmail recomendado)

### Instalación Automática

1. **Clonar el repositorio**
   \`\`\`bash
   git clone <repository-url>
   cd YEGA
   \`\`\`

2. **Ejecutar generación completa**
   \`\`\`bash
   node generate-all.js
   \`\`\`

### Instalación Manual

1. **Generar estructura del backend**
   \`\`\`bash
   node generate-backend.js
   cd backend
   npm install
   \`\`\`

2. **Generar estructura del frontend**
   \`\`\`bash
   node generate-frontend-tasks.js
   cd frontend
   npm install
   \`\`\`

3. **Configurar variables de entorno**
   \`\`\`bash
   # Backend
   cd backend
   cp .env.example .env
   # Editar .env con tus configuraciones
   
   # Frontend
   cd ../frontend
   cp .env.example .env
   # Editar .env con tus configuraciones
   \`\`\`

### Variables de Entorno Requeridas

#### Backend (.env)
\`\`\`env
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
\`\`\`

#### Frontend (.env)
\`\`\`env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_MAPS_API_KEY=tu_google_maps_api_key
\`\`\`

## 🏃‍♂️ Ejecución

### Modo Desarrollo

1. **Iniciar backend**
   \`\`\`bash
   cd backend
   npm run dev
   \`\`\`

2. **Iniciar frontend** (en otra terminal)
   \`\`\`bash
   cd frontend
   npm run dev
   \`\`\`

### Modo Producción

1. **Backend**
   \`\`\`bash
   cd backend
   npm start
   \`\`\`

2. **Frontend**
   \`\`\`bash
   cd frontend
   npm run build
   npm run preview
   \`\`\`

## 🔧 Scripts de Generación

El proyecto incluye scripts automatizados para generar código:

- \`generate-backend.js\` - Genera estructura completa del backend
- \`generate-frontend-tasks.js\` - Genera estructura del frontend
- \`generate-endpoint.js\` - Crea endpoints RESTful específicos
- \`generate-otp.js\` - Integra sistema OTP completo
- \`generate-all.js\` - Ejecuta todos los generadores

### Ejemplos de Uso

\`\`\`bash
# Generar endpoint personalizado
node generate-endpoint.js categoria

# Generar con configuración de ejemplo
node generate-endpoint.js --example promocion

# Integrar sistema OTP
node generate-otp.js
\`\`\`

## 📱 API Endpoints

### Autenticación
- \`POST /api/auth/register\` - Registro de usuario
- \`POST /api/auth/login\` - Inicio de sesión
- \`POST /api/auth/verify-otp\` - Verificación OTP
- \`GET /api/auth/profile\` - Perfil del usuario

### Productos
- \`GET /api/products\` - Listar productos
- \`POST /api/products\` - Crear producto (tienda)
- \`PUT /api/products/:id\` - Actualizar producto
- \`DELETE /api/products/:id\` - Eliminar producto

### Pedidos
- \`POST /api/orders\` - Crear pedido (cliente)
- \`GET /api/orders\` - Listar pedidos
- \`PUT /api/orders/:id/status\` - Actualizar estado
- \`PUT /api/orders/:id/assign-delivery\` - Asignar repartidor

### Ubicación
- \`PUT /api/location/update\` - Actualizar ubicación
- \`GET /api/location/nearby-stores\` - Tiendas cercanas
- \`GET /api/location/nearby-delivery\` - Repartidores cercanos

### OTP
- \`POST /api/otp/send\` - Enviar código
- \`POST /api/otp/verify\` - Verificar código
- \`POST /api/otp/resend\` - Reenviar código

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

\`\`\`bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
\`\`\`

## 📚 Documentación Adicional

- [Configuración de Twilio](docs/twilio-setup.md)
- [Configuración de MongoDB](docs/mongodb-setup.md)
- [Despliegue en Producción](docs/deployment.md)
- [API Reference](docs/api-reference.md)

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (\`git checkout -b feature/AmazingFeature\`)
3. Commit tus cambios (\`git commit -m 'Add some AmazingFeature'\`)
4. Push a la rama (\`git push origin feature/AmazingFeature\`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver \`LICENSE\` para más detalles.

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
`;

  fs.writeFileSync(path.join(PROJECT_ROOT, 'README.md'), readmeContent.trim());
  console.log('📝 README.md creado');
}

/**
 * Crea archivo de licencia MIT
 */
function createLicense() {
  const licenseContent = `
MIT License

Copyright (c) 2024 YEGA

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`;

  fs.writeFileSync(path.join(PROJECT_ROOT, 'LICENSE'), licenseContent.trim());
  console.log('📄 LICENSE creado');
}

/**
 * Crea .gitignore global
 */
function createGitignore() {
  const gitignoreContent = `
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Production builds
/backend/dist
/frontend/dist
/frontend/build

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# nyc test coverage
.nyc_output

# Dependency directories
node_modules/
jspm_packages/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Microbundle cache
.rpt2_cache/
.rts2_cache_cjs/
.rts2_cache_es/
.rts2_cache_umd/

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# Next.js build output
.next

# Nuxt.js build / generate output
.nuxt
dist

# Gatsby files
.cache/
public

# Storybook build outputs
.out
.storybook-out

# Temporary folders
tmp/
temp/

# Editor directories and files
.vscode/
.idea/
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# OS generated files
Thumbs.db
ehthumbs.db
Desktop.ini

# Logs
logs
*.log

# Database
*.sqlite
*.db

# Uploads
uploads/
public/uploads/

# Documentation
docs/_build/

# Test files
test-results/
coverage/
`;

  fs.writeFileSync(path.join(PROJECT_ROOT, '.gitignore'), gitignoreContent.trim());
  console.log('📁 .gitignore creado');
}

/**
 * Función principal
 */
async function generateAll() {
  console.log('🚀 YEGA - Generador Completo de Proyecto\n');
  console.log('Este script generará la estructura completa del proyecto YEGA');
  console.log('incluyendo backend, frontend, sistema OTP y documentación.\n');

  try {
    // Verificar prerrequisitos
    console.log('🔍 Verificando prerrequisitos...');
    if (!checkNodeJS() || !checkNPM()) {
      console.error('❌ Prerrequisitos no cumplidos. Instala Node.js y npm.');
      process.exit(1);
    }

    // Crear archivos del proyecto
    console.log('\n📝 Creando archivos del proyecto...');
    createProjectReadme();
    createLicense();
    createGitignore();

    // Generar backend
    executeCommand('node generate-backend.js', 'Generando estructura del backend');

    // Generar frontend
    executeCommand('node generate-frontend-tasks.js', 'Generando estructura del frontend');

    // Generar sistema OTP
    executeCommand('node generate-otp.js', 'Integrando sistema OTP');

    // Instalar dependencias del backend
    if (fs.existsSync(path.join(PROJECT_ROOT, 'backend'))) {
      console.log('\n📦 Instalando dependencias del backend...');
      try {
        execSync('npm install', { 
          stdio: 'inherit', 
          cwd: path.join(PROJECT_ROOT, 'backend')
        });
        console.log('✅ Dependencias del backend instaladas');
      } catch (error) {
        console.log('⚠️  Error instalando dependencias del backend. Instalar manualmente.');
      }
    }

    // Instalar dependencias del frontend
    if (fs.existsSync(path.join(PROJECT_ROOT, 'frontend'))) {
      console.log('\n📦 Instalando dependencias del frontend...');
      try {
        execSync('npm install', { 
          stdio: 'inherit', 
          cwd: path.join(PROJECT_ROOT, 'frontend')
        });
        console.log('✅ Dependencias del frontend instaladas');
      } catch (error) {
        console.log('⚠️  Error instalando dependencias del frontend. Instalar manualmente.');
      }
    }

    // Resumen final
    console.log('\n🎉 ¡Proyecto YEGA generado exitosamente!\n');
    
    console.log('📁 Estructura creada:');
    console.log('   ├── backend/          # API Node.js + Express + MongoDB');
    console.log('   ├── frontend/         # React App con Bootstrap');
    console.log('   ├── README.md         # Documentación completa');
    console.log('   ├── LICENSE           # Licencia MIT');
    console.log('   └── .gitignore        # Configuración Git');

    console.log('\n🔧 Funcionalidades incluidas:');
    console.log('   ✓ Autenticación JWT con roles');
    console.log('   ✓ Sistema OTP por SMS y email');
    console.log('   ✓ Geolocalización con mapas');
    console.log('   ✓ Gestión de productos y pedidos');
    console.log('   ✓ Dashboard por roles');
    console.log('   ✓ API RESTful completa');
    console.log('   ✓ UI responsive con React');

    console.log('\n📋 Próximos pasos:');
    console.log('1. 📝 Configurar variables de entorno:');
    console.log('   cd backend && cp .env.example .env');
    console.log('   cd frontend && cp .env.example .env');
    console.log('\n2. 🗄️  Configurar MongoDB:');
    console.log('   - Instalar MongoDB localmente o usar MongoDB Atlas');
    console.log('   - Actualizar MONGODB_URI en backend/.env');
    console.log('\n3. 📱 Configurar Twilio (para SMS):');
    console.log('   - Crear cuenta en Twilio.com');
    console.log('   - Obtener Account SID, Auth Token y Phone Number');
    console.log('   - Actualizar credenciales en backend/.env');
    console.log('\n4. 📧 Configurar Email (para OTP):');
    console.log('   - Usar Gmail con contraseña de aplicación');
    console.log('   - Actualizar EMAIL_* en backend/.env');
    console.log('\n5. 🚀 Iniciar servidores:');
    console.log('   # Terminal 1 - Backend');
    console.log('   cd backend && npm run dev');
    console.log('   # Terminal 2 - Frontend');
    console.log('   cd frontend && npm run dev');

    console.log('\n🌐 URLs de desarrollo:');
    console.log('   Frontend: http://localhost:3000');
    console.log('   Backend:  http://localhost:5000');
    console.log('   API Docs: http://localhost:5000/api');

    console.log('\n📚 Documentación:');
    console.log('   - README.md contiene información detallada');
    console.log('   - Cada script tiene comentarios explicativos');
    console.log('   - Archivos blackbox.md describen la arquitectura');

    console.log('\n🛠️  Scripts adicionales disponibles:');
    console.log('   node generate-endpoint.js <nombre>     # Crear endpoint personalizado');
    console.log('   node generate-endpoint.js --example categoria  # Usar ejemplo');

    console.log('\n✨ ¡YEGA está listo para el desarrollo!');

  } catch (error) {
    console.error('\n❌ Error durante la generación:', error.message);
    console.log('\n🔧 Solución de problemas:');
    console.log('1. Verificar que Node.js y npm estén instalados');
    console.log('2. Ejecutar scripts individuales si hay errores específicos');
    console.log('3. Revisar permisos de escritura en el directorio');
    console.log('4. Instalar dependencias manualmente si es necesario');
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  generateAll();
}

module.exports = { generateAll };