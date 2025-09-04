#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// --- Configuración ---
const PROJECT_ROOT = process.cwd();
const BACKEND_DIR = path.join(PROJECT_ROOT, 'backend');

// --- Funciones de Utilidad ---

/**
 * Crea un directorio si no existe.
 * @param {string} dirPath - La ruta del directorio a crear.
 */
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Directorio creado: ${dirPath}`);
  }
}

/**
 * Escribe contenido en un archivo.
 * @param {string} filePath - La ruta del archivo.
 * @param {string} content - El contenido a escribir.
 */
function writeToFile(filePath, content) {
  fs.writeFileSync(filePath, content.trim() + '\n');
  console.log(`📝 Archivo generado: ${filePath}`);
}

/**
 * Convierte un string a PascalCase
 * @param {string} str - String a convertir
 * @returns {string} String en PascalCase
 */
function toPascalCase(str) {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => word.toUpperCase())
    .replace(/\s+/g, '');
}

/**
 * Convierte un string a camelCase
 * @param {string} str - String a convertir
 * @returns {string} String en camelCase
 */
function toCamelCase(str) {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

/**
 * Convierte un string a kebab-case
 * @param {string} str - String a convertir
 * @returns {string} String en kebab-case
 */
function toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/\s+/g, '-')
    .toLowerCase();
}

// --- Plantillas de Código ---

/**
 * Genera el contenido del modelo Mongoose
 * @param {Object} config - Configuración del endpoint
 * @returns {string} Contenido del modelo
 */
function generateModel(config) {
  const { name, fields, timestamps = true, indexes = [] } = config;
  const modelName = toPascalCase(name);
  
  // Generar campos del esquema
  const schemaFields = fields.map(field => {
    let fieldDef = `  ${field.name}: { `;
    
    // Tipo de campo
    if (field.type === 'ObjectId') {
      fieldDef += `type: mongoose.Schema.Types.ObjectId, ref: '${field.ref}'`;
    } else if (field.type === 'Array') {
      fieldDef += `type: [${field.itemType || 'String'}]`;
    } else {
      fieldDef += `type: ${field.type}`;
    }
    
    // Propiedades adicionales
    if (field.required) fieldDef += `, required: [true, '${field.name} es requerido']`;
    if (field.unique) fieldDef += `, unique: true`;
    if (field.default !== undefined) {
      fieldDef += `, default: ${typeof field.default === 'string' ? `'${field.default}'` : field.default}`;
    }
    if (field.min !== undefined) fieldDef += `, min: [${field.min}, '${field.name} debe ser mayor a ${field.min}']`;
    if (field.max !== undefined) fieldDef += `, max: [${field.max}, '${field.name} debe ser menor a ${field.max}']`;
    if (field.minlength !== undefined) fieldDef += `, minlength: [${field.minlength}, '${field.name} debe tener al menos ${field.minlength} caracteres']`;
    if (field.maxlength !== undefined) fieldDef += `, maxlength: [${field.maxlength}, '${field.name} no puede exceder ${field.maxlength} caracteres']`;
    if (field.enum) fieldDef += `, enum: [${field.enum.map(e => `'${e}'`).join(', ')}]`;
    if (field.match) fieldDef += `, match: [${field.match}, '${field.name} tiene formato inválido']`;
    if (field.trim) fieldDef += `, trim: true`;
    if (field.lowercase) fieldDef += `, lowercase: true`;
    if (field.uppercase) fieldDef += `, uppercase: true`;
    
    fieldDef += ' }';
    return fieldDef;
  }).join(',\n');

  // Generar índices
  const indexesCode = indexes.length > 0 
    ? indexes.map(index => `${modelName}Schema.index(${JSON.stringify(index)});`).join('\n')
    : '';

  return `
// backend/models/${modelName}.js
const mongoose = require('mongoose');

const ${modelName}Schema = new mongoose.Schema({
${schemaFields}
}, { 
  timestamps: ${timestamps},
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

${indexesCode}

// Middleware pre-save (ejemplo)
${modelName}Schema.pre('save', async function(next) {
  // Agregar lógica personalizada aquí
  next();
});

// Métodos de instancia (ejemplo)
${modelName}Schema.methods.toSafeObject = function() {
  const obj = this.toObject();
  // Remover campos sensibles si es necesario
  return obj;
};

// Métodos estáticos (ejemplo)
${modelName}Schema.statics.findActive = function() {
  return this.find({ activo: true });
};

const ${modelName} = mongoose.model('${modelName}', ${modelName}Schema);
module.exports = ${modelName};
`;
}

/**
 * Genera el contenido del controlador
 * @param {Object} config - Configuración del endpoint
 * @returns {string} Contenido del controlador
 */
function generateController(config) {
  const { name, operations = ['getAll', 'getById', 'create', 'update', 'delete'] } = config;
  const modelName = toPascalCase(name);
  const controllerName = `${toCamelCase(name)}Controller`;
  
  const operationsCode = operations.map(op => {
    switch (op) {
      case 'getAll':
        return `
// @desc    Obtener todos los ${name}s con paginación y filtros
// @route   GET /api/${toKebabCase(name)}s
// @access  Private/Public (según configuración)
exports.getAll${modelName}s = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sort = '-createdAt',
      ...filters 
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Construir query de filtros
    const query = {};
    Object.keys(filters).forEach(key => {
      if (filters[key] && filters[key] !== 'undefined') {
        query[key] = filters[key];
      }
    });

    const ${toCamelCase(name)}s = await ${modelName}.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort(sort)
      .populate(''); // Agregar populate según necesidad

    const total = await ${modelName}.countDocuments(query);

    res.json({
      success: true,
      ${toCamelCase(name)}s,
      paginacion: {
        pagina_actual: parseInt(page),
        total_paginas: Math.ceil(total / parseInt(limit)),
        total_elementos: total,
        elementos_por_pagina: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error obteniendo ${name}s:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};`;

      case 'getById':
        return `
// @desc    Obtener un ${name} por ID
// @route   GET /api/${toKebabCase(name)}s/:id
// @access  Private/Public (según configuración)
exports.get${modelName}ById = async (req, res) => {
  try {
    const { id } = req.params;

    const ${toCamelCase(name)} = await ${modelName}.findById(id)
      .populate(''); // Agregar populate según necesidad

    if (!${toCamelCase(name)}) {
      return res.status(404).json({ message: '${modelName} no encontrado' });
    }

    res.json({
      success: true,
      ${toCamelCase(name)}
    });

  } catch (error) {
    console.error('Error obteniendo ${name}:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};`;

      case 'create':
        return `
// @desc    Crear un nuevo ${name}
// @route   POST /api/${toKebabCase(name)}s
// @access  Private (según roles permitidos)
exports.create${modelName} = async (req, res) => {
  try {
    const ${toCamelCase(name)}Data = req.body;
    
    // Agregar usuario autenticado si es necesario
    if (req.user) {
      ${toCamelCase(name)}Data.createdBy = req.user.id;
    }

    const nuevo${modelName} = new ${modelName}(${toCamelCase(name)}Data);
    const ${toCamelCase(name)}Creado = await nuevo${modelName}.save();

    await ${toCamelCase(name)}Creado.populate(''); // Agregar populate según necesidad

    res.status(201).json({
      success: true,
      message: '${modelName} creado exitosamente',
      ${toCamelCase(name)}: ${toCamelCase(name)}Creado
    });

  } catch (error) {
    console.error('Error creando ${name}:', error);
    
    if (error.name === 'ValidationError') {
      const errores = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Errores de validación',
        errores 
      });
    }

    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};`;

      case 'update':
        return `
// @desc    Actualizar un ${name}
// @route   PUT /api/${toKebabCase(name)}s/:id
// @access  Private (según roles y permisos)
exports.update${modelName} = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const ${toCamelCase(name)} = await ${modelName}.findById(id);

    if (!${toCamelCase(name)}) {
      return res.status(404).json({ message: '${modelName} no encontrado' });
    }

    // Verificar permisos (ejemplo)
    // if (req.user.rol !== 'administrador' && ${toCamelCase(name)}.createdBy.toString() !== req.user.id) {
    //   return res.status(403).json({ message: 'No autorizado para actualizar este ${name}' });
    // }

    // Actualizar campos
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        ${toCamelCase(name)}[key] = updateData[key];
      }
    });

    const ${toCamelCase(name)}Actualizado = await ${toCamelCase(name)}.save();
    await ${toCamelCase(name)}Actualizado.populate(''); // Agregar populate según necesidad

    res.json({
      success: true,
      message: '${modelName} actualizado exitosamente',
      ${toCamelCase(name)}: ${toCamelCase(name)}Actualizado
    });

  } catch (error) {
    console.error('Error actualizando ${name}:', error);
    
    if (error.name === 'ValidationError') {
      const errores = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Errores de validación',
        errores 
      });
    }

    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};`;

      case 'delete':
        return `
// @desc    Eliminar un ${name}
// @route   DELETE /api/${toKebabCase(name)}s/:id
// @access  Private (según roles y permisos)
exports.delete${modelName} = async (req, res) => {
  try {
    const { id } = req.params;

    const ${toCamelCase(name)} = await ${modelName}.findById(id);

    if (!${toCamelCase(name)}) {
      return res.status(404).json({ message: '${modelName} no encontrado' });
    }

    // Verificar permisos (ejemplo)
    // if (req.user.rol !== 'administrador' && ${toCamelCase(name)}.createdBy.toString() !== req.user.id) {
    //   return res.status(403).json({ message: 'No autorizado para eliminar este ${name}' });
    // }

    await ${toCamelCase(name)}.deleteOne();

    res.json({
      success: true,
      message: '${modelName} eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando ${name}:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};`;

      default:
        return `
// @desc    Operación personalizada: ${op}
// @route   [DEFINIR RUTA]
// @access  [DEFINIR ACCESO]
exports.${op} = async (req, res) => {
  try {
    // Implementar lógica personalizada aquí
    res.json({
      success: true,
      message: 'Operación ${op} ejecutada exitosamente'
    });

  } catch (error) {
    console.error('Error en ${op}:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};`;
    }
  }).join('\n');

  return `
// backend/controllers/${controllerName}.js
const ${modelName} = require('../models/${modelName}');

${operationsCode}
`;
}

/**
 * Genera el contenido de las rutas
 * @param {Object} config - Configuración del endpoint
 * @returns {string} Contenido de las rutas
 */
function generateRoutes(config) {
  const { name, operations = ['getAll', 'getById', 'create', 'update', 'delete'], auth = true, roles = [] } = config;
  const modelName = toPascalCase(name);
  const controllerName = `${toCamelCase(name)}Controller`;
  const routeName = toKebabCase(name);
  
  // Importar funciones del controlador
  const imports = operations.map(op => {
    switch (op) {
      case 'getAll': return `getAll${modelName}s`;
      case 'getById': return `get${modelName}ById`;
      case 'create': return `create${modelName}`;
      case 'update': return `update${modelName}`;
      case 'delete': return `delete${modelName}`;
      default: return op;
    }
  }).join(', ');

  // Generar middleware de autenticación
  const authMiddleware = auth ? 'const { protect, authorize } = require(\'../middleware/authMiddleware\');' : '';
  const protectMiddleware = auth ? 'protect, ' : '';
  const roleMiddleware = roles.length > 0 ? `authorize([${roles.map(r => `'${r}'`).join(', ')}]), ` : '';

  // Generar rutas
  const routesCode = operations.map(op => {
    const middleware = auth ? `${protectMiddleware}${roleMiddleware}` : '';
    
    switch (op) {
      case 'getAll':
        return `router.get('/', ${middleware}getAll${modelName}s);`;
      case 'getById':
        return `router.get('/:id', ${middleware}get${modelName}ById);`;
      case 'create':
        return `router.post('/', ${middleware}create${modelName});`;
      case 'update':
        return `router.put('/:id', ${middleware}update${modelName});`;
      case 'delete':
        return `router.delete('/:id', ${middleware}delete${modelName});`;
      default:
        return `router.post('/${toKebabCase(op)}', ${middleware}${op});`;
    }
  }).join('\n');

  return `
// backend/routes/${routeName}Routes.js
const express = require('express');
const { ${imports} } = require('../controllers/${controllerName}');
${authMiddleware}

const router = express.Router();

${routesCode}

module.exports = router;
`;
}

/**
 * Actualiza el archivo server.js para incluir las nuevas rutas
 * @param {Object} config - Configuración del endpoint
 */
function updateServerFile(config) {
  const { name } = config;
  const routeName = toKebabCase(name);
  const serverPath = path.join(BACKEND_DIR, 'server.js');
  
  if (!fs.existsSync(serverPath)) {
    console.log('⚠️  Archivo server.js no encontrado. Creando referencia manual...');
    console.log(`📝 Agregar manualmente a server.js:`);
    console.log(`   const ${toCamelCase(name)}Routes = require('./routes/${routeName}Routes');`);
    console.log(`   app.use('/api/${routeName}s', protect, ${toCamelCase(name)}Routes);`);
    return;
  }

  try {
    let serverContent = fs.readFileSync(serverPath, 'utf8');
    
    // Agregar import de rutas
    const importLine = `const ${toCamelCase(name)}Routes = require('./routes/${routeName}Routes');`;
    if (!serverContent.includes(importLine)) {
      // Buscar donde agregar el import (después de otros imports de rutas)
      const routeImportRegex = /const \w+Routes = require\('\.\/routes\/\w+Routes'\);/g;
      const matches = [...serverContent.matchAll(routeImportRegex)];
      
      if (matches.length > 0) {
        const lastMatch = matches[matches.length - 1];
        const insertIndex = lastMatch.index + lastMatch[0].length;
        serverContent = serverContent.slice(0, insertIndex) + '\n' + importLine + serverContent.slice(insertIndex);
      } else {
        // Si no hay otros imports de rutas, agregar después de los imports básicos
        const insertAfter = "const { protect } = require('./middleware/authMiddleware');";
        serverContent = serverContent.replace(insertAfter, insertAfter + '\n' + importLine);
      }
    }
    
    // Agregar uso de rutas
    const useLine = `app.use('/api/${routeName}s', protect, ${toCamelCase(name)}Routes);`;
    if (!serverContent.includes(useLine)) {
      // Buscar donde agregar el uso (después de otras rutas protegidas)
      const routeUseRegex = /app\.use\('\/api\/\w+', protect, \w+Routes\);/g;
      const matches = [...serverContent.matchAll(routeUseRegex)];
      
      if (matches.length > 0) {
        const lastMatch = matches[matches.length - 1];
        const insertIndex = lastMatch.index + lastMatch[0].length;
        serverContent = serverContent.slice(0, insertIndex) + '\n' + useLine + serverContent.slice(insertIndex);
      } else {
        // Si no hay otras rutas, agregar después de las rutas públicas
        const insertAfter = "app.use('/api/auth', authRoutes);";
        serverContent = serverContent.replace(insertAfter, insertAfter + '\n' + useLine);
      }
    }
    
    fs.writeFileSync(serverPath, serverContent);
    console.log('✅ Archivo server.js actualizado con las nuevas rutas');
    
  } catch (error) {
    console.error('❌ Error actualizando server.js:', error.message);
    console.log(`📝 Agregar manualmente a server.js:`);
    console.log(`   const ${toCamelCase(name)}Routes = require('./routes/${routeName}Routes');`);
    console.log(`   app.use('/api/${routeName}s', protect, ${toCamelCase(name)}Routes);`);
  }
}

/**
 * Función principal para generar endpoint
 * @param {Object} config - Configuración del endpoint
 */
function generateEndpoint(config) {
  const { name } = config;
  
  if (!name) {
    console.error('❌ Error: El nombre del endpoint es requerido');
    process.exit(1);
  }

  console.log(`🚀 Generando endpoint para: ${name}\n`);

  try {
    const modelName = toPascalCase(name);
    const controllerName = `${toCamelCase(name)}Controller`;
    const routeName = toKebabCase(name);

    // Crear directorios si no existen
    ensureDirectoryExists(path.join(BACKEND_DIR, 'models'));
    ensureDirectoryExists(path.join(BACKEND_DIR, 'controllers'));
    ensureDirectoryExists(path.join(BACKEND_DIR, 'routes'));

    // Generar archivos
    console.log('📊 Generando modelo...');
    const modelContent = generateModel(config);
    writeToFile(path.join(BACKEND_DIR, 'models', `${modelName}.js`), modelContent);

    console.log('🎮 Generando controlador...');
    const controllerContent = generateController(config);
    writeToFile(path.join(BACKEND_DIR, 'controllers', `${controllerName}.js`), controllerContent);

    console.log('🛣️  Generando rutas...');
    const routesContent = generateRoutes(config);
    writeToFile(path.join(BACKEND_DIR, 'routes', `${routeName}Routes.js`), routesContent);

    console.log('🔧 Actualizando server.js...');
    updateServerFile(config);

    console.log('\n✅ Endpoint generado exitosamente!');
    console.log('\n📋 Archivos creados:');
    console.log(`   - models/${modelName}.js`);
    console.log(`   - controllers/${controllerName}.js`);
    console.log(`   - routes/${routeName}Routes.js`);
    console.log('\n🔗 Rutas disponibles:');
    config.operations?.forEach(op => {
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

  } catch (error) {
    console.error('❌ Error generando endpoint:', error);
    process.exit(1);
  }
}

// --- Configuraciones de ejemplo ---

const exampleConfigs = {
  categoria: {
    name: 'categoria',
    fields: [
      { name: 'nombre', type: 'String', required: true, unique: true, trim: true, maxlength: 100 },
      { name: 'descripcion', type: 'String', maxlength: 500 },
      { name: 'icono', type: 'String', default: 'default-icon.png' },
      { name: 'activo', type: 'Boolean', default: true },
      { name: 'orden', type: 'Number', default: 0 }
    ],
    operations: ['getAll', 'getById', 'create', 'update', 'delete'],
    auth: true,
    roles: ['administrador', 'tienda'],
    indexes: [
      { nombre: 1 },
      { activo: 1, orden: 1 }
    ]
  },
  
  comentario: {
    name: 'comentario',
    fields: [
      { name: 'usuarioId', type: 'ObjectId', ref: 'Usuario', required: true },
      { name: 'productoId', type: 'ObjectId', ref: 'Producto', required: true },
      { name: 'pedidoId', type: 'ObjectId', ref: 'Pedido', required: true },
      { name: 'puntuacion', type: 'Number', required: true, min: 1, max: 5 },
      { name: 'comentario', type: 'String', maxlength: 1000 },
      { name: 'activo', type: 'Boolean', default: true }
    ],
    operations: ['getAll', 'getById', 'create', 'update', 'delete'],
    auth: true,
    roles: ['cliente', 'administrador'],
    indexes: [
      { productoId: 1, activo: 1 },
      { usuarioId: 1 },
      { pedidoId: 1 }
    ]
  },

  promocion: {
    name: 'promocion',
    fields: [
      { name: 'titulo', type: 'String', required: true, trim: true, maxlength: 200 },
      { name: 'descripcion', type: 'String', required: true, maxlength: 1000 },
      { name: 'tiendaId', type: 'ObjectId', ref: 'Usuario', required: true },
      { name: 'tipo', type: 'String', enum: ['descuento', 'envio_gratis', 'combo'], required: true },
      { name: 'valor', type: 'Number', required: true, min: 0 },
      { name: 'fecha_inicio', type: 'Date', required: true },
      { name: 'fecha_fin', type: 'Date', required: true },
      { name: 'productos', type: 'Array', itemType: 'mongoose.Schema.Types.ObjectId' },
      { name: 'activo', type: 'Boolean', default: true },
      { name: 'usos_maximos', type: 'Number', default: null },
      { name: 'usos_actuales', type: 'Number', default: 0 }
    ],
    operations: ['getAll', 'getById', 'create', 'update', 'delete', 'aplicarPromocion'],
    auth: true,
    roles: ['tienda', 'administrador'],
    indexes: [
      { tiendaId: 1, activo: 1 },
      { fecha_inicio: 1, fecha_fin: 1 },
      { tipo: 1 }
    ]
  }
};

// --- Manejo de argumentos de línea de comandos ---

function showHelp() {
  console.log(`
🛠️  Generador de Endpoints RESTful para YEGA

Uso:
  node generate-endpoint.js <nombre> [opciones]
  node generate-endpoint.js --example <tipo>
  node generate-endpoint.js --help

Ejemplos:
  node generate-endpoint.js categoria
  node generate-endpoint.js --example categoria
  node generate-endpoint.js --example comentario
  node generate-endpoint.js --example promocion

Opciones:
  --example <tipo>    Generar usando configuración de ejemplo
  --help             Mostrar esta ayuda

Configuraciones de ejemplo disponibles:
  - categoria: Categorías de productos
  - comentario: Sistema de comentarios y calificaciones
  - promocion: Sistema de promociones y descuentos

Para configuración personalizada, edita el archivo y define tu configuración.
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
    
    generateEndpoint(exampleConfigs[exampleType]);
    return;
  }

  // Configuración básica para nombre simple
  const name = args[0];
  const basicConfig = {
    name,
    fields: [
      { name: 'nombre', type: 'String', required: true, trim: true, maxlength: 200 },
      { name: 'descripcion', type: 'String', maxlength: 1000 },
      { name: 'activo', type: 'Boolean', default: true }
    ],
    operations: ['getAll', 'getById', 'create', 'update', 'delete'],
    auth: true,
    roles: ['administrador'],
    indexes: [{ nombre: 1 }, { activo: 1 }]
  };

  generateEndpoint(basicConfig);
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = { generateEndpoint, exampleConfigs };