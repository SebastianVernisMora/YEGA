#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const axios = require('axios');

const BLACKBOX_API_KEY = process.env.BLACKBOX_API_KEY || 'TU_API_KEY_AQUI';

// Carpeta raíz del backend (ajusta si es necesario)
const BACKEND_ROOT = process.cwd();

// Extensiones de archivos a leer
const FILE_EXTENSIONS = ['.js', '.ts'];

// Carpetas clave a incluir en el contexto
const FOLDERS_TO_READ = ['models', 'routes', 'controllers', 'middlewares', 'config'];

// Función para leer archivos recursivamente en carpetas específicas
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
      filesContent += '