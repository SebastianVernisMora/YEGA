#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const axios = require('axios');

const BLACKBOX_API_KEY = process.env.BLACKBOX_API_KEY || 'TU_API_KEY_AQUI';

const BACKEND_ROOT = process.cwd();
const FILE_EXTENSIONS = ['.js', '.ts'];
const FOLDERS_TO_READ = ['models', 'routes', 'controllers', 'middlewares', 'config'];

// Lee archivos recursivamente y concatena contenido
function readFilesRecursively(dir) {
  let filesContent = '';

  if (!fs.existsSync(dir)) return '';

  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      filesContent += readFilesRecursively(fullPath);
    } else if (FILE_EXTENSIONS.includes(path.extname(file))) {
      const content = fs.readFileSync(fullPath, 'utf8');
      filesContent += `\nArchivo: ${path.relative(BACKEND_ROOT, fullPath)}\n`;
      filesContent += '```js\n' + content + '\n```\n';
    }
  }

  return filesContent;
}

// Llama a la API Blackbox con contexto y tarea
async function generateCodeWithContext(filesContent, taskDescription) {
  const systemMessage = {
    role: 'system',
    content: 'Eres un asistente experto en backend Node.js con Express y MongoDB. Mantén estilo y estructura coherente.'
  };

  const userMessage = {
    role: 'user',
    content: `
Estos son los archivos actuales del backend:

${filesContent}

Tarea: ${taskDescription}
Por favor, genera el código solicitado respetando la estructura y estilo del proyecto.
`
  };

  try {
    const response = await axios.post(
      'https://api.blackbox.ai/chat/completions',
      {
        model: 'blackboxai/openai/gpt-4',
        messages: [systemMessage, userMessage],
        max_tokens: 2000,
        temperature: 0.3,
      },
      {
        headers: {
          Authorization: `Bearer ${BLACKBOX_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generando código:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Guarda código generado en archivo, crea carpetas si no existen
function saveGeneratedCode(relativePath, code) {
  const fullPath = path.join(BACKEND_ROOT, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, code, 'utf8');
  console.log(`Archivo generado/actualizado en: ${fullPath}`);
}

async function main() {
  // Lista de tareas a ejecutar secuencialmente
  const tasks = [
    {
      description: 'Genera el endpoint POST /usuarios/register que reciba nombre, teléfono y rol. Simula envío de OTP. Guarda usuario en MongoDB con estado_validacion "pendiente" para tienda y repartidor, y "aprobado" para cliente. Retorna JSON con mensaje de éxito o error. Incluye validaciones básicas y manejo de errores.',
      outputPath: 'routes/usuariosRegister.js',
    },
    {
      description: 'Genera el endpoint POST /usuarios/login que valide usuario y contraseña, retorne JWT y maneje errores. Usa la estructura y modelos existentes.',
      outputPath: 'routes/usuariosLogin.js',
    },
    {
      description: 'Genera el modelo Mongoose para productos con campos: nombre, descripción, precio, stock, tiendaId. Incluye validaciones básicas.',
      outputPath: 'models/Producto.js',
    },
    {
      description: 'Genera el endpoint GET /productos que liste productos con paginación y filtro por tiendaId.',
      outputPath: 'routes/productosList.js',
    },
    // Agrega más tareas aquí según necesites
  ];

  for (const task of tasks) {
    console.log(`\n=== Procesando tarea: ${task.description.substring(0, 60)}... ===`);

    // Leer estructura actualizada antes de cada tarea
    let filesContent = '';
    for (const folder of FOLDERS_TO_READ) {
      filesContent += readFilesRecursively(path.join(BACKEND_ROOT, folder));
    }

    // También incluye archivos generados en rutas para que el modelo tenga contexto
    filesContent += readFilesRecursively(path.join(BACKEND_ROOT, 'routes'));

    if (!filesContent) {
      console.warn('No se encontraron archivos en las carpetas clave.');
    }

    // Generar código con contexto
    const generatedCode = await generateCodeWithContext(filesContent, task.description);

    // Guardar código generado
    saveGeneratedCode(task.outputPath, generatedCode);
  }

  console.log('\n=== Todas las tareas completadas ===');
}

main();
