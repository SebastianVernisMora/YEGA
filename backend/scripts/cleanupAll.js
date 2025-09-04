// backend/scripts/cleanupAll.js
const mongoose = require('mongoose')
const dotenv = require('dotenv')

dotenv.config({ path: __dirname + '/../.env' })

const Usuario = require('../models/Usuario')
const Producto = require('../models/Producto')
const Pedido = require('../models/Pedido')
const OTP = require('../models/OTP')
const fs = require('fs')
const path = require('path')

async function main() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error('[cleanupAll] MONGODB_URI no definido. Revisa backend/.env')
    process.exit(1)
  }

  const dryRun = process.argv.includes('--dry')

  console.log('[cleanupAll] Conectando a MongoDB...')
  await mongoose.connect(uri)

  const counts = {
    usuarios: await Usuario.countDocuments().catch(() => 0),
    productos: await Producto.countDocuments().catch(() => 0),
    pedidos: await Pedido.countDocuments().catch(() => 0),
    otps: await OTP.countDocuments().catch(() => 0),
  }
  console.log('[cleanupAll] Conteos actuales:', counts)

  if (dryRun) {
    console.log('[cleanupAll] Dry-run activado. No se eliminará nada.')
    await mongoose.disconnect()
    return
  }

  const delPedidos = await Pedido.deleteMany({}).catch(() => ({ deletedCount: 0 }))
  const delProductos = await Producto.deleteMany({}).catch(() => ({ deletedCount: 0 }))
  const delOtps = await OTP.deleteMany({}).catch(() => ({ deletedCount: 0 }))
  const delUsuarios = await Usuario.deleteMany({}).catch(() => ({ deletedCount: 0 }))

  console.log('[cleanupAll] Eliminados:', {
    pedidos: delPedidos.deletedCount,
    productos: delProductos.deletedCount,
    otps: delOtps.deletedCount,
    usuarios: delUsuarios.deletedCount,
  })

  // Limpiar posibles carpetas de uploads si existen
  const uploadDirs = [
    path.join(__dirname, '..', 'uploads'),
    path.join(__dirname, '..', 'public', 'uploads'),
  ]

  for (const dir of uploadDirs) {
    try {
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir)
        for (const f of files) {
          const p = path.join(dir, f)
          try {
            const stat = fs.statSync(p)
            if (stat.isDirectory()) {
              fs.rmSync(p, { recursive: true, force: true })
            } else {
              fs.unlinkSync(p)
            }
          } catch {}
        }
        console.log(`[cleanupAll] Directorio limpiado: ${dir}`)
      }
    } catch {}
  }

  await mongoose.disconnect()
  console.log('[cleanupAll] Listo.')
}

main().catch((err) => {
  console.error('[cleanupAll] Error:', err)
  process.exit(1)
})

