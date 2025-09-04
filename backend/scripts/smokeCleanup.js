// backend/scripts/smokeCleanup.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: __dirname + '/../.env' });

const Usuario = require('../models/Usuario');
const Producto = require('../models/Producto');
const Pedido = require('../models/Pedido');
const OTP = require('../models/OTP');

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/yega_db';
  const dryRun = process.argv.includes('--dry');

  console.log(`Conectando a MongoDB: ${uri}`);
  await mongoose.connect(uri);

  // 1) Usuarios de smoke (dominio @test.local)
  const testUserFilter = { email: { $regex: /@test\.local$/i } };
  const testUsers = await Usuario.find(testUserFilter).select('_id email telefono');
  const userIds = testUsers.map(u => u._id);
  const phones = testUsers.map(u => u.telefono).filter(Boolean);
  console.log(`Usuarios de smoke encontrados: ${testUsers.length}`);

  // 2) OTPs asociados (por email dominio o por teléfono de usuarios)
  const otpFilter = { $or: [] };
  otpFilter.$or.push({ email: { $regex: /@test\.local$/i } });
  if (phones.length) otpFilter.$or.push({ telefono: { $in: phones } });

  // 3) Pedidos del cliente de smoke
  const orderFilter = userIds.length ? { clienteId: { $in: userIds } } : { _id: { $in: [] } };

  // 4) Productos de smoke (creados por scripts): por nombre o tags
  const productFilter = {
    $or: [
      { nombre: { $regex: /(Empanada CLI|Pizza CLI)/i } },
      { tags: 'cli' }
    ]
  };

  // Preview counts
  const counts = {
    users: await Usuario.countDocuments(testUserFilter),
    otps: await OTP.countDocuments(otpFilter),
    orders: await Pedido.countDocuments(orderFilter),
    products: await Producto.countDocuments(productFilter)
  };
  console.log('Resumen a eliminar:', counts);

  if (dryRun) {
    console.log('Dry-run activado. No se eliminará nada.');
    await mongoose.disconnect();
    return;
  }

  // Eliminar en orden: pedidos -> productos -> otps -> usuarios
  const delOrders = await Pedido.deleteMany(orderFilter);
  const delProducts = await Producto.deleteMany(productFilter);
  const delOtps = await OTP.deleteMany(otpFilter);
  const delUsers = await Usuario.deleteMany(testUserFilter);

  console.log('Eliminados:', {
    orders: delOrders.deletedCount,
    products: delProducts.deletedCount,
    otps: delOtps.deletedCount,
    users: delUsers.deletedCount
  });

  await mongoose.disconnect();
  console.log('Smoke cleanup completado.');
}

main().catch((err) => {
  console.error('Error en smokeCleanup:', err);
  process.exit(1);
});

