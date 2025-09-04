// backend/scripts/cleanupDemoOrders.js
const mongoose = require('mongoose')
const dotenv = require('dotenv')

dotenv.config({ path: __dirname + '/../.env' })

const Pedido = require('../models/Pedido')

async function main() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error('[cleanupDemoOrders] MONGODB_URI no definido. Revisa backend/.env')
    process.exit(1)
  }

  const dryRun = process.argv.includes('--dry')

  console.log('[cleanupDemoOrders] Conectando a MongoDB...')
  await mongoose.connect(uri)

  const filter = { notas: /DEMO/i }
  const total = await Pedido.countDocuments(filter)
  console.log(`[cleanupDemoOrders] Pedidos DEMO encontrados: ${total}`)

  if (dryRun) {
    console.log('[cleanupDemoOrders] Dry-run activado. No se eliminará nada.')
    await mongoose.disconnect()
    return
  }

  if (total === 0) {
    console.log('[cleanupDemoOrders] No hay pedidos DEMO para eliminar.')
    await mongoose.disconnect()
    return
  }

  const result = await Pedido.deleteMany(filter)
  console.log(`[cleanupDemoOrders] Pedidos DEMO eliminados: ${result.deletedCount}`)

  await mongoose.disconnect()
  console.log('[cleanupDemoOrders] Listo.')
}

main().catch((err) => {
  console.error('[cleanupDemoOrders] Error:', err)
  process.exit(1)
})

