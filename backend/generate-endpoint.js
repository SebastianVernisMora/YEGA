#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const axios = require('axios');

const BLACKBOX_API_KEY = process.env.BLACKBOX_API_KEY || 'TU_API_KEY_AQUI';

const prompt = `
Genera un endpoint POST /usuarios/register en Node.js con Express que reciba nombre, teléfono y rol. Simula envío de OTP (sin integración real). Guarda usuario en MongoDB con estado_validacion "pendiente" para tienda y repartidor, y "aprobado" para cliente. Retorna JSON con mensaje de éxito o error.
Incluye validaciones básicas y manejo de errores.
`;

async function generateCode(prompt) {
  try {
    const response = await axios.post(
      'https://api.blackbox.ai/chat/completions',
      {
        model: 'blackboxai/openai/gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 800,
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

async function main() {
  console.log('Generando código para endpoint /usuarios/register...');

  const code = await generateCode(prompt);

  const filePath = path.join(process.cwd(), 'routes', 'usuariosRegister.js');

  fs.mkdirSync(path.dirname(filePath), { recursive: true });

  fs.writeFileSync(filePath, code, 'utf8');

  console.log(`Archivo generado en: ${filePath}`);
}

main();

