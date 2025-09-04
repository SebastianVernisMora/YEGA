#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = process.cwd();
const BACKEND_DIR = path.join(PROJECT_ROOT, 'backend');
const FRONTEND_DIR = path.join(PROJECT_ROOT, 'frontend');

/**
 * Verifica si un directorio existe
 */
function directoryExists(dirPath) {
  return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
}

/**
 * Verifica si un archivo existe
 */
function fileExists(filePath) {
  return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
}

/**
 * Ejecuta un comando y retorna el resultado
 */
function executeCommand(command, cwd) {
  try {
    const result = execSync(command, { 
      cwd: cwd,
      encoding: 'utf8',
      timeout: 10000
    });
    return { success: true, output: result.trim() };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Verifica la estructura del proyecto
 */
function verifyProjectStructure() {
  console.log('🔍 VERIFICANDO ESTRUCTURA DEL PROYECTO');
  console.log('═'.repeat(50));

  const requiredDirs = [
    'backend',
    'frontend',
    'backend/models',
    'backend/controllers',
    'backend/routes',
    'backend/middleware',
    'backend/utils',
    'frontend/src',
    'frontend/src/components',
    'frontend/src/pages',
    'frontend/src/services',
    'frontend/src/context',
    'frontend/src/hooks',
    'frontend/src/styles'
  ];

  const requiredFiles = [
    'backend/server.js',
    'backend/package.json',
    'backend/.env.example',
    'frontend/package.json',
    'frontend/vite.config.js',
    'frontend/index.html',
    'frontend/src/main.jsx',
    'frontend/src/App.jsx',
    'README.md',
    'LICENSE',
    '.gitignore'
  ];

  let allDirsExist = true;
  let allFilesExist = true;

  console.log('\n📁 Verificando directorios:');
  requiredDirs.forEach(dir => {
    const fullPath = path.join(PROJECT_ROOT, dir);
    const exists = directoryExists(fullPath);
    console.log(`   ${exists ? '✅' : '❌'} ${dir}`);
    if (!exists) allDirsExist = false;
  });

  console.log('\n📄 Verificando archivos principales:');
  requiredFiles.forEach(file => {
    const fullPath = path.join(PROJECT_ROOT, file);
    const exists = fileExists(fullPath);
    console.log(`   ${exists ? '✅' : '❌'} ${file}`);
    if (!exists) allFilesExist = false;
  });

  return { allDirsExist, allFilesExist };
}

/**
 * Verifica las dependencias instaladas
 */
function verifyDependencies() {
  console.log('\n📦 VERIFICANDO DEPENDENCIAS');
  console.log('═'.repeat(50));

  let backendDepsOk = false;
  let frontendDepsOk = false;

  // Verificar backend
  if (directoryExists(path.join(BACKEND_DIR, 'node_modules'))) {
    console.log('✅ Dependencias del backend instaladas');
    backendDepsOk = true;

    // Verificar dependencias clave
    const backendKeyDeps = ['express', 'mongoose', 'jsonwebtoken', 'bcryptjs', 'cors'];
    console.log('   📋 Dependencias clave del backend:');
    backendKeyDeps.forEach(dep => {
      const exists = directoryExists(path.join(BACKEND_DIR, 'node_modules', dep));
      console.log(`      ${exists ? '✅' : '❌'} ${dep}`);
    });
  } else {
    console.log('❌ Dependencias del backend NO instaladas');
  }

  // Verificar frontend
  if (directoryExists(path.join(FRONTEND_DIR, 'node_modules'))) {
    console.log('✅ Dependencias del frontend instaladas');
    frontendDepsOk = true;

    // Verificar dependencias clave
    const frontendKeyDeps = ['react', 'react-dom', 'react-router-dom', 'react-bootstrap', 'axios'];
    console.log('   📋 Dependencias clave del frontend:');
    frontendKeyDeps.forEach(dep => {
      const exists = directoryExists(path.join(FRONTEND_DIR, 'node_modules', dep));
      console.log(`      ${exists ? '✅' : '❌'} ${dep}`);
    });
  } else {
    console.log('❌ Dependencias del frontend NO instaladas');
  }

  return { backendDepsOk, frontendDepsOk };
}

/**
 * Verifica la configuración de Node.js y npm
 */
function verifyEnvironment() {
  console.log('\n🔧 VERIFICANDO ENTORNO');
  console.log('═'.repeat(50));

  // Verificar Node.js
  const nodeResult = executeCommand('node --version');
  if (nodeResult.success) {
    console.log(`✅ Node.js: ${nodeResult.output}`);
  } else {
    console.log('❌ Node.js no encontrado');
    return false;
  }

  // Verificar npm
  const npmResult = executeCommand('npm --version');
  if (npmResult.success) {
    console.log(`✅ npm: ${npmResult.output}`);
  } else {
    console.log('❌ npm no encontrado');
    return false;
  }

  return true;
}

/**
 * Verifica que los scripts funcionen
 */
function verifyScripts() {
  console.log('\n⚙️  VERIFICANDO SCRIPTS');
  console.log('═'.repeat(50));

  const scripts = [
    'generate-backend.js',
    'generate-frontend-tasks.js',
    'generate-endpoint.js',
    'generate-otp.js',
    'generate-all.js',
    'install-dependencies.js'
  ];

  let allScriptsExist = true;

  scripts.forEach(script => {
    const exists = fileExists(path.join(PROJECT_ROOT, script));
    console.log(`   ${exists ? '✅' : '❌'} ${script}`);
    if (!exists) allScriptsExist = false;
  });

  return allScriptsExist;
}

/**
 * Muestra las próximas instrucciones
 */
function showNextSteps() {
  console.log('\n🚀 PRÓXIMOS PASOS');
  console.log('═'.repeat(50));

  console.log('\n1. 📝 Configurar variables de entorno:');
  console.log('   cd backend');
  console.log('   cp .env.example .env');
  console.log('   # Editar .env con tus configuraciones');
  console.log('   cd ../frontend');
  console.log('   cp .env.example .env');
  console.log('   # Editar .env con tus configuraciones');

  console.log('\n2. 🗄️  Configurar MongoDB:');
  console.log('   # Opción A: MongoDB local');
  console.log('   sudo systemctl start mongod  # Linux');
  console.log('   brew services start mongodb-community  # macOS');
  console.log('   # Opción B: MongoDB Atlas (recomendado)');
  console.log('   # Crear cuenta en https://cloud.mongodb.com');
  console.log('   # Obtener URI de conexión');

  console.log('\n3. 📱 Configurar Twilio (para SMS):');
  console.log('   # Crear cuenta en https://www.twilio.com');
  console.log('   # Obtener Account SID, Auth Token y Phone Number');
  console.log('   # Actualizar en backend/.env');

  console.log('\n4. 📧 Configurar Email (para OTP):');
  console.log('   # Para Gmail:');
  console.log('   # 1. Habilitar autenticación de 2 factores');
  console.log('   # 2. Generar contraseña de aplicación');
  console.log('   # 3. Actualizar EMAIL_* en backend/.env');

  console.log('\n5. 🚀 Iniciar servidores:');
  console.log('   # Terminal 1 - Backend');
  console.log('   cd backend && npm run dev');
  console.log('   # Terminal 2 - Frontend');
  console.log('   cd frontend && npm run dev');

  console.log('\n🌐 URLs de desarrollo:');
  console.log('   Frontend: http://localhost:3000');
  console.log('   Backend:  http://localhost:5000');
}

/**
 * Muestra información de solución de problemas
 */
function showTroubleshooting() {
  console.log('\n🔧 SOLUCIÓN DE PROBLEMAS');
  console.log('═'.repeat(50));

  console.log('\n❌ Si hay errores de dependencias:');
  console.log('   node install-dependencies.js');
  console.log('   # O manualmente:');
  console.log('   cd backend && rm -rf node_modules package-lock.json && npm install --legacy-peer-deps');
  console.log('   cd frontend && rm -rf node_modules package-lock.json && npm install --legacy-peer-deps');

  console.log('\n❌ Si hay errores de permisos:');
  console.log('   chmod +x *.js');
  console.log('   # O ejecutar con node explícitamente:');
  console.log('   node generate-all.js');

  console.log('\n❌ Si MongoDB no conecta:');
  console.log('   # Verificar que MongoDB esté corriendo');
  console.log('   # Verificar MONGODB_URI en .env');
  console.log('   # Usar MongoDB Atlas si hay problemas locales');

  console.log('\n❌ Si hay errores de puerto:');
  console.log('   # Cambiar PORT en backend/.env');
  console.log('   # Matar procesos existentes:');
  console.log('   lsof -ti:5000 | xargs kill -9');
  console.log('   lsof -ti:3000 | xargs kill -9');
}

/**
 * Función principal
 */
function main() {
  console.log('🔍 VERIFICADOR DE INSTALACIÓN YEGA');
  console.log('═'.repeat(50));
  console.log('Este script verifica que todo esté correctamente instalado y configurado.\n');

  // Verificar entorno
  const envOk = verifyEnvironment();
  
  // Verificar estructura
  const { allDirsExist, allFilesExist } = verifyProjectStructure();
  
  // Verificar dependencias
  const { backendDepsOk, frontendDepsOk } = verifyDependencies();
  
  // Verificar scripts
  const scriptsOk = verifyScripts();

  // Resumen final
  console.log('\n📊 RESUMEN DE VERIFICACIÓN');
  console.log('═'.repeat(50));

  const checks = [
    { name: 'Entorno (Node.js/npm)', status: envOk },
    { name: 'Estructura de directorios', status: allDirsExist },
    { name: 'Archivos principales', status: allFilesExist },
    { name: 'Dependencias backend', status: backendDepsOk },
    { name: 'Dependencias frontend', status: frontendDepsOk },
    { name: 'Scripts de generación', status: scriptsOk }
  ];

  checks.forEach(check => {
    console.log(`   ${check.status ? '✅' : '❌'} ${check.name}`);
  });

  const allOk = checks.every(check => check.status);

  if (allOk) {
    console.log('\n🎉 ¡INSTALACIÓN COMPLETADA EXITOSAMENTE!');
    console.log('El proyecto YEGA está listo para el desarrollo.');
    showNextSteps();
  } else {
    console.log('\n⚠️  INSTALACIÓN INCOMPLETA');
    console.log('Algunos componentes necesitan atención.');
    showTroubleshooting();
  }

  console.log('\n📚 RECURSOS ADICIONALES');
  console.log('═'.repeat(50));
  console.log('   📖 Documentación: README.md');
  console.log('   🛠️  Guía de scripts: SCRIPTS_GUIDE.md');
  console.log('   🐛 Reportar problemas: GitHub Issues');
  console.log('   💬 Soporte: contacto@yega.com');

  console.log('\n✨ ¡Gracias por usar YEGA!');
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = { main };