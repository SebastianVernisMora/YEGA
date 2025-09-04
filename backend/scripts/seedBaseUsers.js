// backend/scripts/seedBaseUsers.js
const mongoose = require('mongoose')
const dotenv = require('dotenv')

dotenv.config({ path: __dirname + '/../.env' })

const Usuario = require('../models/Usuario')

async function ensureUser({ nombre, telefono, email, password, rol, ubicacion }) {
  let u = await Usuario.findOne({ email })
  if (!u) {
    u = new Usuario({ nombre, telefono, email, password, rol, estado_validacion: 'aprobado', activo: true, ubicacion })
    await u.save()
    console.log(`✔ Creado: ${email} (${rol})`)
  } else {
    // Asegurar flags clave
    u.estado_validacion = 'aprobado'
    u.activo = true
    if (ubicacion) u.ubicacion = ubicacion
    await u.save()
    console.log(`ℹ Ya existía: ${email} (${rol})`)
  }
  return u
}

async function main() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error('[seedBaseUsers] MONGODB_URI no definido. Revisa backend/.env')
    process.exit(1)
  }
  await mongoose.connect(uri)

  await ensureUser({
    nombre: 'Admin YEGA',
    telefono: '+10000000000',
    email: 'admin@yega.local',
    password: 'admin123',
    rol: 'administrador',
  })

  await ensureUser({
    nombre: 'Tienda Demo',
    telefono: '+10000000001',
    email: 'tienda@yega.local',
    password: 'tienda123',
    rol: 'tienda',
    ubicacion: { latitud: -34.6, longitud: -58.4, direccion: 'Demo 123' },
  })

  await ensureUser({
    nombre: 'Cliente Prueba',
    telefono: '+10000000002',
    email: 'cliente@yega.local',
    password: 'cliente123',
    rol: 'cliente',
  })

  await ensureUser({
    nombre: 'Repartidor Prueba',
    telefono: '+10000000003',
    email: 'repartidor@yega.local',
    password: 'repartidor123',
    rol: 'repartidor',
    ubicacion: { latitud: -34.6037, longitud: -58.3816, direccion: 'CABA, AR' },
  })

  await mongoose.disconnect()
  console.log('[seedBaseUsers] Listo.')
}

main().catch((err) => {
  console.error('[seedBaseUsers] Error:', err)
  process.exit(1)
})

