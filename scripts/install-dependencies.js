#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = process.cwd();
const BACKEND_DIR = path.join(PROJECT_ROOT, 'backend');
const FRONTEND_DIR = path.join(PROJECT_ROOT, 'frontend');

/**
 * Ejecuta un comando con manejo de errores mejorado
 */
function executeCommand(command, cwd, description) {
  console.log(`\n🔄 ${description}...`);
  console.log(`📁 Directorio: ${cwd}`);
  console.log(`⚡ Comando: ${command}`);
  
  try {
    execSync(command, { 
      stdio: 'inherit', 
      cwd: cwd,
      timeout: 300000 // 5 minutos timeout
    });
    console.log(`✅ ${description} completado exitosamente`);
    return true;
  } catch (error) {
    console.error(`❌ Error en ${description}:`);
    console.error(`   Código de salida: ${error.status}`);
    console.error(`   Señal: ${error.signal}`);
    console.error(`   Comando: ${error.cmd}`);
    return false;
  }
}

/**
 * Verifica si un directorio existe
 */
function directoryExists(dirPath) {
  return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
}

/**
 * Limpia cache de npm
 */
function cleanNpmCache() {
  console.log('\n🧹 Limpiando cache de npm...');
  try {
    execSync('npm cache clean --force', { stdio: 'inherit' });
    console.log('✅ Cache de npm limpiado');
  } catch (error) {
    console.log('⚠️  No se pudo limpiar el cache de npm');
  }
}

/**
 * Instala dependencias del backend
 */
function installBackendDependencies() {
  if (!directoryExists(BACKEND_DIR)) {
    console.log('⚠️  Directorio backend no encontrado. Saltando instalación del backend.');
    return false;
  }

  console.log('\n📦 INSTALANDO DEPENDENCIAS DEL BACKEND');
  console.log('═'.repeat(50));

  // Verificar package.json
  const packageJsonPath = path.join(BACKEND_DIR, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.log('❌ package.json no encontrado en backend/');
    return false;
  }

  // Limpiar node_modules si existe
  const nodeModulesPath = path.join(BACKEND_DIR, 'node_modules');
  if (fs.existsSync(nodeModulesPath)) {
    console.log('🗑️  Eliminando node_modules existente...');
    try {
      execSync('rm -rf node_modules package-lock.json', { cwd: BACKEND_DIR });
      console.log('✅ node_modules eliminado');
    } catch (error) {
      console.log('⚠️  No se pudo eliminar node_modules');
    }
  }

  // Intentar instalación con diferentes métodos
  const installCommands = [
    'npm install --legacy-peer-deps',
    'npm install --force',
    'npm install'
  ];

  for (const command of installCommands) {
    console.log(`\n🔄 Intentando: ${command}`);
    if (executeCommand(command, BACKEND_DIR, 'Instalación de dependencias del backend')) {
      return true;
    }
    console.log('⚠️  Comando falló, intentando siguiente método...');
  }

  console.log('❌ No se pudieron instalar las dependencias del backend con ningún método');
  return false;
}

/**
 * Instala dependencias del frontend
 */
function installFrontendDependencies() {
  if (!directoryExists(FRONTEND_DIR)) {
    console.log('⚠️  Directorio frontend no encontrado. Saltando instalación del frontend.');
    return false;
  }

  console.log('\n📦 INSTALANDO DEPENDENCIAS DEL FRONTEND');
  console.log('═'.repeat(50));

  // Verificar package.json
  const packageJsonPath = path.join(FRONTEND_DIR, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.log('❌ package.json no encontrado en frontend/');
    return false;
  }

  // Limpiar node_modules si existe
  const nodeModulesPath = path.join(FRONTEND_DIR, 'node_modules');
  if (fs.existsSync(nodeModulesPath)) {
    console.log('🗑️  Eliminando node_modules existente...');
    try {
      execSync('rm -rf node_modules package-lock.json', { cwd: FRONTEND_DIR });
      console.log('✅ node_modules eliminado');
    } catch (error) {
      console.log('⚠️  No se pudo eliminar node_modules');
    }
  }

  // Intentar instalación con diferentes métodos
  const installCommands = [
    'npm install --legacy-peer-deps',
    'npm install --force',
    'npm install'
  ];

  for (const command of installCommands) {
    console.log(`\n🔄 Intentando: ${command}`);
    if (executeCommand(command, FRONTEND_DIR, 'Instalación de dependencias del frontend')) {
      return true;
    }
    console.log('⚠️  Comando falló, intentando siguiente método...');
  }

  console.log('❌ No se pudieron instalar las dependencias del frontend con ningún método');
  return false;
}

/**
 * Verifica la instalación
 */
function verifyInstallation() {
  console.log('\n🔍 VERIFICANDO INSTALACIÓN');
  console.log('═'.repeat(50));

  let backendOk = false;
  let frontendOk = false;

  // Verificar backend
  if (directoryExists(path.join(BACKEND_DIR, 'node_modules'))) {
    console.log('✅ Dependencias del backend instaladas');
    backendOk = true;
  } else {
    console.log('❌ Dependencias del backend NO instaladas');
  }

  // Verificar frontend
  if (directoryExists(path.join(FRONTEND_DIR, 'node_modules'))) {
    console.log('✅ Dependencias del frontend instaladas');
    frontendOk = true;
  } else {
    console.log('❌ Dependencias del frontend NO instaladas');
  }

  return { backendOk, frontendOk };
}

/**
 * Muestra instrucciones de instalación manual
 */
function showManualInstructions() {
  console.log('\n📋 INSTRUCCIONES DE INSTALACIÓN MANUAL');
  console.log('═'.repeat(50));
  
  console.log('\n🔧 Si la instalación automática falló, intenta manualmente:');
  
  console.log('\n📦 Backend:');
  console.log('   cd backend');
  console.log('   rm -rf node_modules package-lock.json');
  console.log('   npm cache clean --force');
  console.log('   npm install --legacy-peer-deps');
  
  console.log('\n📦 Frontend:');
  console.log('   cd frontend');
  console.log('   rm -rf node_modules package-lock.json');
  console.log('   npm cache clean --force');
  console.log('   npm install --legacy-peer-deps');

  console.log('\n🔧 Alternativas si npm falla:');
  console.log('   - Usar yarn: yarn install');
  console.log('   - Usar pnpm: pnpm install');
  console.log('   - Actualizar Node.js a la versión LTS más reciente');
  console.log('   - Verificar conexión a internet');
}

/**
 * Función principal
 */
async function main() {
  console.log('🚀 INSTALADOR DE DEPENDENCIAS YEGA');
  console.log('═'.repeat(50));
  
  // Verificar Node.js y npm
  try {
    const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    console.log(`✅ Node.js: ${nodeVersion}`);
    console.log(`✅ npm: ${npmVersion}`);
  } catch (error) {
    console.error('❌ Node.js o npm no están instalados');
    process.exit(1);
  }

  // Limpiar cache
  cleanNpmCache();

  // Instalar dependencias
  const backendSuccess = installBackendDependencies();
  const frontendSuccess = installFrontendDependencies();

  // Verificar instalación
  const { backendOk, frontendOk } = verifyInstallation();

  // Resumen final
  console.log('\n📊 RESUMEN DE INSTALACIÓN');
  console.log('═'.repeat(50));
  
  if (backendOk && frontendOk) {
    console.log('🎉 ¡Todas las dependencias instaladas exitosamente!');
    console.log('\n🚀 Próximos pasos:');
    console.log('1. Configurar variables de entorno:');
    console.log('   cd backend && cp .env.example .env');
    console.log('   cd frontend && cp .env.example .env');
    console.log('\n2. Iniciar servidores:');
    console.log('   # Terminal 1 - Backend');
    console.log('   cd backend && npm run dev');
    console.log('   # Terminal 2 - Frontend');
    console.log('   cd frontend && npm run dev');
  } else {
    console.log('⚠️  Instalación parcial o fallida');
    if (!backendOk) console.log('❌ Backend: dependencias no instaladas');
    if (!frontendOk) console.log('❌ Frontend: dependencias no instaladas');
    
    showManualInstructions();
  }

  console.log('\n🌐 URLs de desarrollo:');
  console.log('   Frontend: http://localhost:3000');
  console.log('   Backend:  http://localhost:5000');
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Error inesperado:', error);
    process.exit(1);
  });
}

module.exports = { main };