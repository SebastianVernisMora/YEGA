#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const axios = require('axios');

// --- Configuración ---
const BLACKBOX_API_KEY = process.env.BLACKBOX_API_KEY || 'TU_API_KEY_AQUI';
const BLACKBOX_API_URL = 'https://api.blackbox.ai/chat/completions';
const PROJECT_ROOT = process.cwd();
const BACKEND_DIR = path.join(PROJECT_ROOT, 'backend');

// --- Funciones de Utilidad ---

/**
 * Crea un directorio si no existe.
 */
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Directorio creado: ${dirPath}`);
  }
}

/**
 * Escribe contenido en un archivo.
 */
function writeToFile(filePath, content) {
  fs.writeFileSync(filePath, content.trim() + '\n');
  console.log(`📝 Archivo generado: ${filePath}`);
}

/**
 * Convierte string a PascalCase
 */
function toPascalCase(str) {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => word.toUpperCase())
    .replace(/\s+/g, '');
}

/**
 * Convierte string a camelCase
 */
function toCamelCase(str) {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

/**
 * Convierte string a kebab-case
 */
function toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/\s+/g, '-')
    .toLowerCase();
}

/**
 * Lee el contexto de blackbox.md si existe
 */
function readBlackboxContext() {
  const blackboxPath = path.join(BACKEND_DIR, 'blackbox.md');
  if (fs.existsSync(blackboxPath)) {
    return fs.readFileSync(blackboxPath, 'utf8');
  }
  return '';
}

/**
 * Llama a la API de Blackbox para generar código
 */
async function generateWithBlackbox(prompt, context = '') {
  const systemMessage = {
    role: 'system',
    content: `Eres un experto desarrollador backend especializado en Node.js, Express, MongoDB y arquitectura RESTful.
    Genera código limpio, bien documentado y siguiendo las mejores prácticas.
    
    Contexto del proyecto YEGA:
    - Backend: Node.js + Express + MongoDB + Mongoose
    - Arquitectura: MVC con modelos, controladores y rutas
    - Autenticación: JWT con roles (cliente, tienda, repartidor, administrador)
    - Validaciones: Mongoose validations + express-validator
    - Respuestas: JSON consistentes con success, message, data
    - Manejo de errores: try-catch con respuestas estructuradas
    
    ${context ? `Contexto adicional:\n${context}` : ''}`
  };

  const userMessage = {
    role: 'user',
    content: prompt
  };

  try {
    const response = await axios.post(BLACKBOX_API_URL, {
      model: 'blackboxai',
      messages: [systemMessage, userMessage],
      max_tokens: 3000,
      temperature: 0.3,
    }, {
      headers: {
        'Authorization': `Bearer ${BLACKBOX_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('❌ Error llamando a Blackbox API:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Extrae código de la respuesta de Blackbox
 */
function extractCode(response, language = 'javascript') {
  const codeBlockRegex = new RegExp(`\`\`\`${language}\\n([\\s\\S]*?)\`\`\``, 'g');
  const matches = [...response.matchAll(codeBlockRegex)];
  
  if (matches.length > 0) {
    return matches[0][1];
  }
  
  // Buscar cualquier bloque de código
  const anyCodeRegex = /```[\s\S]*?\n([\s\S]*?)```/g;
  const anyMatches = [...response.matchAll(anyCodeRegex)];
  
  if (anyMatches.length > 0) {
    return anyMatches[0][1];
  }
  
  return response;
}

/**
 * Actualiza server.js para incluir las nuevas rutas
 */
async function updateServerFile(entityName, context) {
  const serverPath = path.join(BACKEND_DIR, 'server.js');
  const routeName = toKebabCase(entityName);
  const camelName = toCamelCase(entityName);
  
  if (!fs.existsSync(serverPath)) {
    console.log('⚠️  server.js no encontrado. Generando instrucciones manuales...');
    console.log(`📝 Agregar manualmente a server.js:`);
    console.log(`   const ${camelName}Routes = require('./routes/${routeName}Routes');`);
    console.log(`   app.use('/api/${routeName}s', protect, ${camelName}Routes);`);
    return;
  }

  const prompt = `Actualiza el archivo server.js para incluir las nuevas rutas de ${entityName}.
  
  Necesitas:
  1. Agregar import: const ${camelName}Routes = require('./routes/${routeName}Routes');
  2. Agregar uso de rutas: app.use('/api/${routeName}s', protect, ${camelName}Routes);
  
  Mantén la estructura existente y agrega las líneas en las ubicaciones apropiadas.
  
  Archivo server.js actual:
  ${fs.readFileSync(serverPath, 'utf8')}`;

  try {
    const response = await generateWithBlackbox(prompt, context);
    const updatedCode = extractCode(response);
    
    // Hacer backup del archivo original
    fs.writeFileSync(serverPath + '.backup', fs.readFileSync(serverPath));
    writeToFile(serverPath, updatedCode);
    console.log('✅ server.js actualizado exitosamente');
    
  } catch (error) {
    console.error('❌ Error actualizando server.js:', error.message);
    console.log(`📝 Agregar manualmente a server.js:`);
    console.log(`   const ${camelName}Routes = require('./routes/${routeName}Routes');`);
    console.log(`   app.use('/api/${routeName}s', protect, ${camelName}Routes);`);
  }
}

// --- Configuraciones de Ejemplo ---

const exampleConfigs = {
  categoria: {
    name: 'categoria',
    description: 'Sistema de categorías de productos',
    fields: [
      { name: 'nombre', type: 'String', required: true, unique: true, maxlength: 100 },
      { name: 'descripcion', type: 'String', maxlength: 500 },
      { name: 'icono', type: 'String', default: 'default-icon.png' },
      { name: 'activo', type: 'Boolean', default: true },
      { name: 'orden', type: 'Number', default: 0 }
    ],
    operations: ['getAll', 'getById', 'create', 'update', 'delete'],
    roles: ['administrador', 'tienda']
  },
  
  comentario: {
    name: 'comentario',
    description: 'Sistema de comentarios y calificaciones',
    fields: [
      { name: 'usuarioId', type: 'ObjectId', ref: 'Usuario', required: true },
      { name: 'productoId', type: 'ObjectId', ref: 'Producto', required: true },
      { name: 'pedidoId', type: 'ObjectId', ref: 'Pedido', required: true },
      { name: 'puntuacion', type: 'Number', required: true, min: 1, max: 5 },
      { name: 'comentario', type: 'String', maxlength: 1000 },
      { name: 'activo', type: 'Boolean', default: true }
    ],
    operations: ['getAll', 'getById', 'create', 'update', 'delete'],
    roles: ['cliente', 'administrador']
  },
  
  promocion: {
    name: 'promocion',
    description: 'Sistema de promociones y descuentos',
    fields: [
      { name: 'titulo', type: 'String', required: true, maxlength: 200 },
      { name: 'descripcion', type: 'String', required: true, maxlength: 1000 },
      { name: 'tiendaId', type: 'ObjectId', ref: 'Usuario', required: true },
      { name: 'tipo', type: 'String', enum: ['descuento', 'envio_gratis', 'combo'], required: true },
      { name: 'valor', type: 'Number', required: true, min: 0 },
      { name: 'fecha_inicio', type: 'Date', required: true },
      { name: 'fecha_fin', type: 'Date', required: true },
      { name: 'productos', type: 'Array', itemType: 'ObjectId' },
      { name: 'activo', type: 'Boolean', default: true },
      { name: 'usos_maximos', type: 'Number', default: null },
      { name: 'usos_actuales', type: 'Number', default: 0 }
    ],
    operations: ['getAll', 'getById', 'create', 'update', 'delete', 'aplicarPromocion'],
    roles: ['tienda', 'administrador']
  }
};

// --- Función Principal ---

async function generateEndpointWithBlackbox(config) {
  console.log('🤖 GENERADOR DE ENDPOINT CON BLACKBOX AI');
  console.log('═'.repeat(50));
  
  // Verificar API key
  if (BLACKBOX_API_KEY === 'TU_API_KEY_AQUI') {
    console.error('❌ Error: Configura tu BLACKBOX_API_KEY en las variables de entorno');
    console.log('💡 Obtén tu API key en: https://www.blackbox.ai/');
    console.log('💡 Configura: export BLACKBOX_API_KEY="tu_api_key_aqui"');
    process.exit(1);
  }
  
  const { name, description, fields, operations, roles } = config;
  const modelName = toPascalCase(name);
  const controllerName = `${toCamelCase(name)}Controller`;
  const routeName = toKebabCase(name);
  
  console.log(`\n🎯 Generando endpoint para: ${name}`);
  console.log(`📝 Descripción: ${description}`);
  
  // Crear directorios
  ensureDirectoryExists(path.join(BACKEND_DIR, 'models'));
  ensureDirectoryExists(path.join(BACKEND_DIR, 'controllers'));
  ensureDirectoryExists(path.join(BACKEND_DIR, 'routes'));
  
  // Leer contexto
  const context = readBlackboxContext();
  
  try {
    // 1. Generar Modelo
    console.log(`\n🤖 Generando modelo ${modelName}...`);
    const modelPrompt = `Genera un modelo Mongoose para ${name} (${description}) con:
    
    Campos requeridos:
    ${fields.map(field => {
      let fieldDesc = `- ${field.name}: ${field.type}`;
      if (field.required) fieldDesc += ' (requerido)';
      if (field.unique) fieldDesc += ' (único)';
      if (field.ref) fieldDesc += ` (referencia a ${field.ref})`;
      if (field.enum) fieldDesc += ` (enum: ${field.enum.join(', ')})`;
      if (field.min !== undefined) fieldDesc += ` (min: ${field.min})`;
      if (field.max !== undefined) fieldDesc += ` (max: ${field.max})`;
      if (field.maxlength) fieldDesc += ` (maxlength: ${field.maxlength})`;
      if (field.default !== undefined) fieldDesc += ` (default: ${field.default})`;
      return fieldDesc;
    }).join('\n    ')}
    
    Incluye:
    - Validaciones apropiadas con mensajes de error en español
    - Timestamps automáticos
    - Índices para optimizar consultas
    - Métodos de instancia útiles
    - Métodos estáticos útiles
    - Middleware pre-save si es necesario
    - Virtuals si son útiles
    - toJSON y toObject configurados
    
    El archivo debe exportar el modelo como: module.exports = ${modelName};`;
    
    const modelResponse = await generateWithBlackbox(modelPrompt, context);
    const modelCode = extractCode(modelResponse);
    writeToFile(path.join(BACKEND_DIR, 'models', `${modelName}.js`), modelCode);
    
    // 2. Generar Controlador
    console.log(`\n🤖 Generando controlador ${controllerName}...`);
    const controllerPrompt = `Genera un controlador completo para ${name} (${description}) con:
    
    Operaciones requeridas: ${operations.join(', ')}
    Roles autorizados: ${roles.join(', ')}
    
    Para cada operación incluye:
    - Comentarios JSDoc con @desc, @route, @access
    - Validaciones de entrada robustas
    - Manejo de errores con try-catch
    - Respuestas JSON consistentes con { success, message, data }
    - Autorización por roles donde corresponde
    - Paginación para listados
    - Populate de relaciones cuando sea necesario
    - Validaciones de negocio específicas
    
    Operaciones estándar:
    - getAll: listar con paginación, filtros y búsqueda
    - getById: obtener por ID con populate
    - create: crear con validaciones
    - update: actualizar con validaciones y autorización
    - delete: eliminar con autorización
    
    Usa el modelo: const ${modelName} = require('../models/${modelName}');
    
    Exporta todas las funciones para usar en rutas.`;
    
    const controllerResponse = await generateWithBlackbox(controllerPrompt, context);
    const controllerCode = extractCode(controllerResponse);
    writeToFile(path.join(BACKEND_DIR, 'controllers', `${controllerName}.js`), controllerCode);
    
    // 3. Generar Rutas
    console.log(`\n🤖 Generando rutas ${routeName}Routes...`);
    const routesPrompt = `Genera las rutas Express para ${name} (${description}) con:
    
    Operaciones: ${operations.join(', ')}
    Roles autorizados: ${roles.join(', ')}
    
    Estructura de rutas RESTful:
    - GET / - listar (con autorización si es necesario)
    - GET /:id - obtener por ID
    - POST / - crear (roles: ${roles.join(', ')})
    - PUT /:id - actualizar (roles: ${roles.join(', ')})
    - DELETE /:id - eliminar (roles: ${roles.join(', ')})
    
    Incluye:
    - Import del controlador: const { ... } = require('../controllers/${controllerName}');
    - Import de middleware: const { protect, authorize } = require('../middleware/authMiddleware');
    - Middleware de protección y autorización apropiados
    - Comentarios explicativos
    - Export del router: module.exports = router;
    
    Usa router.route() para agrupar rutas del mismo path cuando sea posible.`;
    
    const routesResponse = await generateWithBlackbox(routesPrompt, context);
    const routesCode = extractCode(routesResponse);
    writeToFile(path.join(BACKEND_DIR, 'routes', `${routeName}Routes.js`), routesCode);
    
    // 4. Actualizar server.js
    console.log(`\n🤖 Actualizando server.js...`);
    await updateServerFile(name, context);
    
    console.log('\n🎉 ¡Endpoint generado exitosamente!');
    console.log('\n📋 Archivos creados:');
    console.log(`   - models/${modelName}.js`);
    console.log(`   - controllers/${controllerName}.js`);
    console.log(`   - routes/${routeName}Routes.js`);
    console.log(`   - server.js (actualizado)`);
    
    console.log('\n🔗 Rutas disponibles:');
    operations.forEach(op => {
      switch (op) {
        case 'getAll':
          console.log(`   GET    /api/${routeName}s`);
          break;
        case 'getById':
          console.log(`   GET    /api/${routeName}s/:id`);
          break;
        case 'create':
          console.log(`   POST   /api/${routeName}s`);
          break;
        case 'update':
          console.log(`   PUT    /api/${routeName}s/:id`);
          break;
        case 'delete':
          console.log(`   DELETE /api/${routeName}s/:id`);
          break;
        default:
          console.log(`   POST   /api/${routeName}s/${toKebabCase(op)}`);
      }
    });
    
    console.log('\n📋 Próximos pasos:');
    console.log('1. Revisar el código generado');
    console.log('2. Ajustar validaciones si es necesario');
    console.log('3. Reiniciar el servidor: npm run dev');
    console.log('4. Probar las rutas con Postman o similar');
    
  } catch (error) {
    console.error('❌ Error generando endpoint:', error);
    process.exit(1);
  }
}

// --- Manejo de argumentos ---

function showHelp() {
  console.log(`
🤖 GENERADOR DE ENDPOINTS CON BLACKBOX AI

Uso:
  node blackbox-generate-endpoint.js <nombre>
  node blackbox-generate-endpoint.js --example <tipo>
  node blackbox-generate-endpoint.js --help

Ejemplos:
  node blackbox-generate-endpoint.js miEntidad
  node blackbox-generate-endpoint.js --example categoria
  node blackbox-generate-endpoint.js --example comentario
  node blackbox-generate-endpoint.js --example promocion

Configuraciones de ejemplo disponibles:
  - categoria: Sistema de categorías de productos
  - comentario: Sistema de comentarios y calificaciones  
  - promocion: Sistema de promociones y descuentos

Requisitos:
  - Configurar BLACKBOX_API_KEY en variables de entorno
  - Tener estructura de backend creada
  - Conexión a internet para API de Blackbox

Variables de entorno:
  export BLACKBOX_API_KEY="tu_api_key_aqui"
`);
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help')) {
    showHelp();
    return;
  }

  if (args[0] === '--example') {
    const exampleType = args[1];
    if (!exampleType || !exampleConfigs[exampleType]) {
      console.error('❌ Error: Tipo de ejemplo no válido');
      console.log('Tipos disponibles:', Object.keys(exampleConfigs).join(', '));
      process.exit(1);
    }
    
    generateEndpointWithBlackbox(exampleConfigs[exampleType]);
    return;
  }

  // Configuración básica para nombre simple
  const name = args[0];
  const basicConfig = {
    name,
    description: `Sistema de gestión de ${name}`,
    fields: [
      { name: 'nombre', type: 'String', required: true, maxlength: 200 },
      { name: 'descripcion', type: 'String', maxlength: 1000 },
      { name: 'activo', type: 'Boolean', default: true }
    ],
    operations: ['getAll', 'getById', 'create', 'update', 'delete'],
    roles: ['administrador']
  };

  generateEndpointWithBlackbox(basicConfig);
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = { generateEndpointWithBlackbox, exampleConfigs };