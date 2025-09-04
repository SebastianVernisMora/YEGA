# 🚀 Guía Rápida - YEGA con Blackbox AI

## ⚡ Inicio Rápido (5 minutos)

### 1. 🔑 Configurar Blackbox AI
```bash
# Obtén tu API key en: https://www.blackbox.ai/
export BLACKBOX_API_KEY="tu_api_key_aqui"
```

### 2. 🤖 Generar Proyecto Completo
```bash
node blackbox-generate-all.js
```

### 3. ⚙️ Configurar Variables de Entorno
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

### 4. 🚀 Iniciar Servidores
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

### 5. 🌐 Acceder a la Aplicación
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000

---

## 🤖 Scripts Disponibles

| Script | Descripción | Comando |
|--------|-------------|---------|
| **Completo** | Genera todo el proyecto | `node blackbox-generate-all.js` |
| **Backend** | Solo API Node.js | `node blackbox-generate-backend.js` |
| **Frontend** | Solo React App | `node blackbox-generate-frontend.js` |
| **Endpoint** | Crear endpoint específico | `node blackbox-generate-endpoint.js categoria` |
| **OTP** | Sistema de verificación | `node blackbox-generate-otp.js` |

---

## 📋 Variables de Entorno Mínimas

### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017/yega_db
JWT_SECRET=tu_jwt_secret_muy_seguro
BLACKBOX_API_KEY=tu_blackbox_api_key
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🎯 Ejemplos de Uso

### Crear Endpoint de Categorías
```bash
node blackbox-generate-endpoint.js --example categoria
```

### Crear Endpoint Personalizado
```bash
node blackbox-generate-endpoint.js miEntidad
```

### Integrar Sistema OTP
```bash
node blackbox-generate-otp.js
```

---

## 🔧 Configuraciones Opcionales

### MongoDB Atlas (Recomendado)
1. Crear cuenta en [MongoDB Atlas](https://cloud.mongodb.com)
2. Crear cluster gratuito
3. Obtener URI de conexión
4. Actualizar `MONGODB_URI` en .env

### Twilio para SMS
1. Crear cuenta en [Twilio](https://www.twilio.com)
2. Obtener credenciales
3. Actualizar en backend/.env:
```env
TWILIO_ACCOUNT_SID=tu_account_sid
TWILIO_AUTH_TOKEN=tu_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

### Gmail para OTP
1. Habilitar autenticación de 2 factores
2. Generar contraseña de aplicación
3. Actualizar en backend/.env:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_password_de_aplicacion
```

---

## 🐛 Solución Rápida de Problemas

### Error: API Key no configurada
```bash
export BLACKBOX_API_KEY="tu_api_key_real"
```

### Error: MongoDB no conecta
```bash
# Usar MongoDB Atlas o instalar local
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # macOS
```

### Error: Puerto en uso
```bash
# Cambiar puerto en .env o matar proceso
lsof -ti:5000 | xargs kill -9
```

### Error: Dependencias
```bash
# Reinstalar dependencias
cd backend && rm -rf node_modules && npm install
cd frontend && rm -rf node_modules && npm install
```

---

## 📚 Documentación Completa

- **README.md**: Documentación completa del proyecto
- **BLACKBOX_GUIDE.md**: Guía detallada de Blackbox AI
- **backend/blackbox.md**: Contexto del backend
- **frontend/blackbox.md**: Contexto del frontend

---

## 🎉 ¡Listo!

Tu plataforma YEGA está generada y lista para desarrollo. 

**Próximos pasos**:
1. Personalizar la UI según tu marca
2. Agregar funcionalidades específicas
3. Configurar servicios de producción
4. Desplegar en la nube

---

**YEGA** - Generado con Blackbox AI 🤖✨