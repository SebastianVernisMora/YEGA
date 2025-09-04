// backend/scripts/cleanupAllProducts.js
const mongoose = require('mongoose')
const dotenv = require('dotenv')

dotenv.config({ path: __dirname + '/../.env' })

const Producto = require('../models/Producto')

async function main() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error('[cleanupAllProducts] MONGODB_URI no definido. Revisa backend/.env')
    process.exit(1)
  }

  const dryRun = process.argv.includes('--dry')

  console.log('[cleanupAllProducts] Conectando a MongoDB...')
  await mongoose.connect(uri)

  const total = await Producto.countDocuments({})
  console.log(`[cleanupAllProducts] Productos encontrados: ${total}`)

  if (dryRun) {
    console.log('[cleanupAllProducts] Dry-run activado. No se eliminará nada.')
    await mongoose.disconnect()
    return
  }

  if (total === 0) {
    console.log('[cleanupAllProducts] No hay productos para eliminar.')
    await mongoose.disconnect()
    return
  }

  const result = await Producto.deleteMany({})
  console.log(`[cleanupAllProducts] Productos eliminados: ${result.deletedCount}`)

  await mongoose.disconnect()
  console.log('[cleanupAllProducts] Listo.')
}

main().catch((err) => {
  console.error('[cleanupAllProducts] Error:', err)
  process.exit(1)
})

