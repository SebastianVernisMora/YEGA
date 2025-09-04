#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// --- Configuración ---
const BLACKBOX_API_KEY = process.env.BLACKBOX_API_KEY || 'TU_API_KEY_AQUI';
const PROJECT_ROOT = process.cwd();

// --- Funciones de Utilidad ---

/**
 * Ejecuta un comando y muestra el resultado
 */
function executeCommand(command, description) {
  console.log(`\n🔄 ${description}...`);
  try {
    execSync(command, { 
      stdio: 'inherit', 
      cwd: PROJECT_ROOT 
    });
    console.log(`✅ ${description} completado`);
    return true;
  } catch (error) {
    console.error(`❌ Error en ${description}:`, error.message);
    return false;
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
 * Verifica la API key de Blackbox
 */
function checkBlackboxAPI() {
  if (BLACKBOX_API_KEY === 'TU_API_KEY_AQUI' || !BLACKBOX_API_KEY) {
    console.error('❌ BLACKBOX_API_KEY no configurada');
    console.log('💡 Obtén tu API key en: https://www.blackbox.ai/');
    console.log('💡 Configura: export BLACKBOX_API_KEY="tu_api_key_aqui"');
    return false;
  }
  console.log('✅ BLACKBOX_API_KEY configurada');
  return true;
}

/**
 * Crea el archivo README.md del proyecto
 */
function createProjectReadme() {
  const readmeContent = `
# YEGA - Plataforma de E-commerce con Delivery

YEGA es una plataforma completa de e-commerce que conecta clientes, tiendas y repartidores, proporcionando un sistema integral de delivery con geolocalización en tiempo real.

## 🤖 Generado con Blackbox AI

Este proyecto ha sido generado automáticamente usando **Blackbox AI** para crear una estructura completa y funcional de e-commerce con delivery.

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

### Backend (Generado con Blackbox AI)
- **Node.js** con Express.js
- **MongoDB** con Mongoose
- **JWT** para autenticación
- **Twilio** para SMS
- **Nodemailer** para emails
- **Bcrypt** para encriptación

### Frontend (Generado con Blackbox AI)
- **React 18** con Hooks
- **React Router** para navegación
- **React Bootstrap** para UI
- **Styled Components** para estilos
- **React Leaflet** para mapas
- **Axios** para API calls
- **React Query** para cache

## 🤖 Scripts de Generación con Blackbox AI

Este proyecto incluye scripts que utilizan la API de Blackbox AI para generar código automáticamente:

### Scripts Principales
- `blackbox-generate-backend.js` - Genera estructura completa del backend
- `blackbox-generate-frontend.js` - Genera aplicación React completa
- `blackbox-generate-endpoint.js` - Crea endpoints RESTful específicos
- `blackbox-generate-otp.js` - Integra sistema OTP avanzado
- `blackbox-generate-all.js` - Ejecuta todos los generadores

### Configuración Requerida

1. **Obtener API Key de Blackbox**:
   - Visita [Blackbox AI](https://www.blackbox.ai/)
   - Crea una cuenta y obtén tu API key
   - Configura la variable de entorno:
   \`\`\`bash
   export BLACKBOX_API_KEY="tu_api_key_aqui"
   \`\`\`

2. **Ejecutar Generación Completa**:
   \`\`\`bash
   node blackbox-generate-all.js
   \`\`\`

### Generación Modular

También puedes generar componentes específicos:

\`\`\`bash
# Solo backend
node blackbox-generate-backend.js

# Solo frontend
node blackbox-generate-frontend.js

# Endpoint personalizado
node blackbox-generate-endpoint.js miEntidad

# Usar ejemplos predefinidos
node blackbox-generate-endpoint.js --example categoria
node blackbox-generate-endpoint.js --example promocion

# Sistema OTP avanzado
node blackbox-generate-otp.js
\`\`\`

## 📁 Estructura del Proyecto

\`\`\`
YEGA/
├── backend/                 # API del servidor (generado con Blackbox)
│   ├── models/             # Modelos de MongoDB
│   ├── controllers/        # Lógica de negocio
│   ├── routes/            # Rutas de la API
│   ├── middleware/        # Middleware personalizado
│   ├── services/          # Servicios (OTP, email, etc.)
│   ├── utils/             # Utilidades
│   └── server.js          # Punto de entrada
├── frontend/               # Aplicación React (generado con Blackbox)
│   ├── src/
│   │   ├── components/    # Componentes reutilizables
│   │   ├── pages/         # Páginas por rol
│   │   ├── services/      # Servicios de API
│   │   ├── hooks/         # Hooks personalizados
│   │   ├── context/       # Context providers
│   │   └── styles/        # Estilos globales
│   └── public/            # Archivos estáticos
└── blackbox-*.js          # Scripts de generación con Blackbox AI
\`\`\`

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 16+ 
- MongoDB (local o Atlas)
- Cuenta de Blackbox AI con API key
- Cuenta de Twilio (para SMS)
- Cuenta de email (Gmail recomendado)

### Instalación Automática con Blackbox AI

1. **Configurar API Key de Blackbox**
   \`\`\`bash
   export BLACKBOX_API_KEY="tu_api_key_aqui"
   \`\`\`

2. **Generar proyecto completo**
   \`\`\`bash
   node blackbox-generate-all.js
   \`\`\`

3. **Instalar dependencias**
   \`\`\`bash
   # Backend
   cd backend && npm install
   
   # Frontend
   cd ../frontend && npm install
   \`\`\`

4. **Configurar variables de entorno**
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

### URLs de Desarrollo
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 🤖 Ventajas de Usar Blackbox AI

### Generación Automática
- **Código consistente**: Todos los archivos siguen las mismas convenciones
- **Mejores prácticas**: Implementa patrones de diseño estándar
- **Documentación incluida**: Comentarios y JSDoc automáticos
- **Validaciones robustas**: Manejo de errores y validaciones completas

### Personalización
- **Configuraciones flexibles**: Adapta la generación a tus necesidades
- **Ejemplos predefinidos**: Usa configuraciones probadas
- **Extensibilidad**: Fácil agregar nuevas funcionalidades

### Productividad
- **Desarrollo rápido**: Genera estructura completa en minutos
- **Menos errores**: Código generado y probado
- **Mantenibilidad**: Estructura clara y documentada

## 📱 API Endpoints Generados

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

### OTP (Sistema Avanzado)
- \`POST /api/otp/send\` - Enviar código
- \`POST /api/otp/verify\` - Verificar código
- \`POST /api/otp/resend\` - Reenviar código
- \`GET /api/otp/stats\` - Estadísticas (admin)

## 🎨 Diseño y UI

### Paleta de Colores YEGA
- **Principal**: Negro (#000000)
- **Secundario**: Blanco (#FFFFFF)
- **Acento Plata**: #C0C0C0
- **Acento Oro**: #D4AF37

### Componentes UI Generados
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

- [Configuración de Blackbox AI](docs/blackbox-setup.md)
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

## 🤖 Créditos

- **Generado con**: [Blackbox AI](https://www.blackbox.ai/)
- **Arquitectura**: Node.js + React
- **Base de datos**: MongoDB
- **UI Framework**: React Bootstrap

## 📞 Soporte

- **Email**: soporte@yega.com
- **Documentación**: [docs.yega.com](https://docs.yega.com)
- **Issues**: [GitHub Issues](https://github.com/yega/issues)

---

**YEGA** - Conectando el futuro del delivery con IA 🤖🚀

*Generado automáticamente con Blackbox AI*
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

# Coverage directory
coverage/
*.lcov

# Dependency directories
node_modules/
jspm_packages/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# parcel-bundler cache
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

# Backup files
*.backup

# API Keys (security)
.env
.env.*
!.env.example
`;

  fs.writeFileSync(path.join(PROJECT_ROOT, '.gitignore'), gitignoreContent.trim());
  console.log('📁 .gitignore creado');
}

/**
 * Crea guía de uso de Blackbox
 */
function createBlackboxGuide() {
  const guideContent = `
# Guía de Uso - Scripts de Blackbox AI para YEGA

Esta guía explica cómo usar los scripts que integran Blackbox AI para generar automáticamente el código del proyecto YEGA.

## 🤖 ¿Qué es Blackbox AI?

Blackbox AI es una plataforma de inteligencia artificial especializada en generación de código. Permite crear aplicaciones completas mediante prompts específicos y contexto del proyecto.

## 🔑 Configuración Inicial

### 1. Obtener API Key

1. Visita [Blackbox AI](https://www.blackbox.ai/)
2. Crea una cuenta gratuita
3. Ve a tu perfil y genera una API key
4. Configura la variable de entorno:

\`\`\`bash
# Linux/macOS
export BLACKBOX_API_KEY="tu_api_key_aqui"

# Windows
set BLACKBOX_API_KEY=tu_api_key_aqui
\`\`\`

### 2. Verificar Configuración

\`\`\`bash
echo $BLACKBOX_API_KEY
\`\`\`

## 🚀 Scripts Disponibles

### 1. blackbox-generate-all.js
**Descripción**: Ejecuta todos los generadores en secuencia para crear el proyecto completo.

\`\`\`bash
node blackbox-generate-all.js
\`\`\`

**Qué hace**:
- ✅ Verifica prerrequisitos (Node.js, npm, API key)
- ✅ Genera backend completo
- ✅ Genera frontend completo
- ✅ Integra sistema OTP
- ✅ Crea documentación
- ✅ Instala dependencias automáticamente

### 2. blackbox-generate-backend.js
**Descripción**: Genera la estructura completa del backend con API RESTful.

\`\`\`bash
node blackbox-generate-backend.js
\`\`\`

**Archivos generados**:
- \`server.js\` - Servidor principal
- \`models/\` - Modelos de MongoDB (Usuario, Producto, Pedido)
- \`controllers/\` - Lógica de negocio
- \`routes/\` - Rutas de la API
- \`middleware/\` - Middleware de autenticación
- \`utils/\` - Utilidades (OTP, SMS)
- \`package.json\` - Dependencias
- \`.env.example\` - Variables de entorno

### 3. blackbox-generate-frontend.js
**Descripción**: Genera la aplicación React completa con componentes y páginas.

\`\`\`bash
node blackbox-generate-frontend.js
\`\`\`

**Archivos generados**:
- \`package.json\` - Configuración React + Vite
- \`vite.config.js\` - Configuración de Vite
- \`index.html\` - HTML principal
- \`src/main.jsx\` - Punto de entrada
- \`src/App.jsx\` - Componente principal
- \`src/context/\` - Context de autenticación
- \`src/services/\` - Cliente API
- \`src/components/\` - Componentes reutilizables
- \`src/pages/\` - Páginas por rol
- \`src/hooks/\` - Hooks personalizados
- \`src/styles/\` - Estilos globales

### 4. blackbox-generate-endpoint.js
**Descripción**: Genera endpoints RESTful específicos con modelo, controlador y rutas.

\`\`\`bash
# Endpoint básico
node blackbox-generate-endpoint.js miEntidad

# Usar ejemplos predefinidos
node blackbox-generate-endpoint.js --example categoria
node blackbox-generate-endpoint.js --example comentario
node blackbox-generate-endpoint.js --example promocion

# Ver ayuda
node blackbox-generate-endpoint.js --help
\`\`\`

**Ejemplos disponibles**:
- **categoria**: Sistema de categorías de productos
- **comentario**: Sistema de comentarios y calificaciones
- **promocion**: Sistema de promociones y descuentos

### 5. blackbox-generate-otp.js
**Descripción**: Integra sistema OTP avanzado para verificación de usuarios.

\`\`\`bash
node blackbox-generate-otp.js
\`\`\`

**Funcionalidades generadas**:
- Modelo OTP con expiración automática
- Servicio completo con múltiples métodos
- Rate limiting para prevenir spam
- Envío por SMS y Email
- Componente React reutilizable
- Hook personalizado para estado

## 🔧 Personalización

### Modificar Prompts

Puedes personalizar los prompts en cada script para adaptar la generación a tus necesidades:

\`\`\`javascript
// Ejemplo en blackbox-generate-backend.js
const modelPrompt = \`Genera un modelo Mongoose para \${name} con:
- Campos específicos que necesites
- Validaciones personalizadas
- Métodos específicos de tu negocio
\`;
\`\`\`

### Agregar Nuevas Configuraciones

Para agregar nuevos ejemplos en \`blackbox-generate-endpoint.js\`:

\`\`\`javascript
const exampleConfigs = {
  // ... configuraciones existentes
  
  miNuevaEntidad: {
    name: 'miNuevaEntidad',
    description: 'Descripción de mi entidad',
    fields: [
      { name: 'campo1', type: 'String', required: true },
      { name: 'campo2', type: 'Number', min: 0 }
    ],
    operations: ['getAll', 'getById', 'create', 'update', 'delete'],
    roles: ['administrador']
  }
};
\`\`\`

## 🐛 Solución de Problemas

### Error: API Key no configurada
\`\`\`
❌ Error: Configura tu BLACKBOX_API_KEY en las variables de entorno
\`\`\`

**Solución**:
\`\`\`bash
export BLACKBOX_API_KEY="tu_api_key_real"
\`\`\`

### Error: Rate limiting
\`\`\`
❌ Error llamando a Blackbox API: Rate limit exceeded
\`\`\`

**Solución**: Espera unos minutos y vuelve a intentar. Los scripts incluyen pausas automáticas entre llamadas.

### Error: Código no extraído correctamente
Si el código generado no se extrae correctamente, revisa la función \`extractCode()\` en el script correspondiente.

### Error: Archivo no generado
Si un archivo específico no se genera:
1. Verifica que el directorio de destino exista
2. Revisa los permisos de escritura
3. Ejecuta el script individual para ese componente

## 📊 Monitoreo de Uso

### Logs de Generación
Cada script muestra logs detallados:
\`\`\`
🤖 Generando: Usuario Model
📝 Descripción: Modelo de Usuario con roles y ubicación
✅ Usuario Model generado exitosamente
\`\`\`

### Verificación de Archivos
Después de la generación, verifica que todos los archivos se hayan creado:
\`\`\`bash
# Backend
ls -la backend/models/
ls -la backend/controllers/
ls -la backend/routes/

# Frontend
ls -la frontend/src/components/
ls -la frontend/src/pages/
\`\`\`

## 🚀 Mejores Prácticas

### 1. Backup antes de regenerar
\`\`\`bash
# Hacer backup del proyecto
cp -r backend backend_backup
cp -r frontend frontend_backup
\`\`\`

### 2. Revisar código generado
Siempre revisa el código generado antes de usarlo en producción:
- Validaciones de seguridad
- Lógica de negocio específica
- Configuraciones de entorno

### 3. Personalizar después de generar
Usa la generación como base y personaliza según tus necesidades específicas.

### 4. Mantener contexto actualizado
Actualiza los archivos \`blackbox.md\` en backend y frontend para mejorar la generación.

## 🔄 Flujo de Trabajo Recomendado

1. **Configurar API Key**
2. **Generar proyecto base**: \`node blackbox-generate-all.js\`
3. **Revisar y personalizar** código generado
4. **Agregar endpoints específicos**: \`node blackbox-generate-endpoint.js --example categoria\`
5. **Integrar OTP**: \`node blackbox-generate-otp.js\`
6. **Configurar variables de entorno**
7. **Probar funcionalidad**
8. **Personalizar según necesidades**

## 📚 Recursos Adicionales

- [Documentación de Blackbox AI](https://www.blackbox.ai/docs)
- [API Reference de Blackbox](https://api.blackbox.ai/docs)
- [Ejemplos de prompts](https://github.com/blackbox-ai/examples)

---

**¡Disfruta generando código con Blackbox AI! 🤖✨**
`;

  fs.writeFileSync(path.join(PROJECT_ROOT, 'BLACKBOX_GUIDE.md'), guideContent.trim());
  console.log('📚 BLACKBOX_GUIDE.md creado');
}

/**
 * Función principal
 */
async function main() {
  console.log('🤖 GENERADOR COMPLETO DE PROYECTO YEGA CON BLACKBOX AI');
  console.log('═'.repeat(60));
  console.log('Este script utiliza Blackbox AI para generar automáticamente');
  console.log('la estructura completa del proyecto YEGA.\n');

  try {
    // Verificar prerrequisitos
    console.log('🔍 Verificando prerrequisitos...');
    if (!checkNodeJS() || !checkNPM()) {
      console.error('❌ Prerrequisitos no cumplidos. Instala Node.js y npm.');
      process.exit(1);
    }

    if (!checkBlackboxAPI()) {
      console.error('❌ API Key de Blackbox no configurada.');
      process.exit(1);
    }

    // Crear archivos del proyecto
    console.log('\n📝 Creando archivos del proyecto...');
    createProjectReadme();
    createLicense();
    createGitignore();
    createBlackboxGuide();

    // Generar backend con Blackbox AI
    const backendSuccess = executeCommand(
      'node blackbox-generate-backend.js', 
      'Generando backend con Blackbox AI'
    );

    // Generar frontend con Blackbox AI
    const frontendSuccess = executeCommand(
      'node blackbox-generate-frontend.js', 
      'Generando frontend con Blackbox AI'
    );

    // Generar sistema OTP con Blackbox AI
    const otpSuccess = executeCommand(
      'node blackbox-generate-otp.js', 
      'Integrando sistema OTP con Blackbox AI'
    );

    // Instalar dependencias del backend
    if (backendSuccess && fs.existsSync(path.join(PROJECT_ROOT, 'backend'))) {
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
    if (frontendSuccess && fs.existsSync(path.join(PROJECT_ROOT, 'frontend'))) {
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
    console.log('\n🎉 ¡PROYECTO YEGA GENERADO CON BLACKBOX AI!');
    console.log('═'.repeat(60));
    
    console.log('\n📁 Estructura creada:');
    console.log('   ├── backend/          # API Node.js generada con Blackbox AI');
    console.log('   ├── frontend/         # React App generada con Blackbox AI');
    console.log('   ├── README.md         # Documentación completa');
    console.log('   ├── BLACKBOX_GUIDE.md # Guía de uso de Blackbox AI');
    console.log('   ├── LICENSE           # Licencia MIT');
    console.log('   └── .gitignore        # Configuración Git');

    console.log('\n🤖 Funcionalidades generadas con Blackbox AI:');
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

    console.log('\n🤖 Scripts adicionales de Blackbox AI:');
    console.log('   node blackbox-generate-endpoint.js categoria     # Crear endpoint personalizado');
    console.log('   node blackbox-generate-endpoint.js --example promocion  # Usar ejemplo');

    console.log('\n📚 Documentación:');
    console.log('   - README.md: Información completa del proyecto');
    console.log('   - BLACKBOX_GUIDE.md: Guía de uso de Blackbox AI');
    console.log('   - backend/blackbox.md: Contexto del backend');
    console.log('   - frontend/blackbox.md: Contexto del frontend');

    console.log('\n✨ ¡YEGA está listo para el desarrollo con Blackbox AI!');

  } catch (error) {
    console.error('\n❌ Error durante la generación:', error.message);
    console.log('\n🔧 Solución de problemas:');
    console.log('1. Verificar que BLACKBOX_API_KEY esté configurada');
    console.log('2. Verificar conexión a internet');
    console.log('3. Ejecutar scripts individuales si hay errores específicos');
    console.log('4. Revisar logs de Blackbox AI para errores específicos');
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = { main };