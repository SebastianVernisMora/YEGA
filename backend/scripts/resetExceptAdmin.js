// backend/scripts/resetExceptAdmin.js
// Borra todos los datos (usuarios, pedidos, productos, OTPs) excepto los administradores
// Uso: node scripts/resetExceptAdmin.js [--dry]

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: __dirname + '/../.env' });

const Usuario = require('../models/Usuario');
const Pedido = require('../models/Pedido');
const Producto = require('../models/Producto');
const OTP = require('../models/OTP');

async function main() {
  const uri = process.env.MONGODB_URI;
  const dryRun = process.argv.includes('--dry');

  if (!uri) {
    console.error('[resetExceptAdmin] MONGODB_URI no definido. Revisa backend/.env');
    process.exit(1);
  }

  console.log(`[resetExceptAdmin] Conectando a MongoDB: ${uri}`);
  await mongoose.connect(uri);

  // Identificar administradores a preservar
  const admins = await Usuario.find({ rol: 'administrador' }).select('_id email rol telefono');
  const keepIds = admins.map(a => a._id);
  const keepEmails = admins.map(a => a.email).filter(Boolean);
  const keepPhones = admins.map(a => a.telefono).filter(Boolean);

  console.log(`[resetExceptAdmin] Admins a conservar (${admins.length}):`, keepEmails.join(', ') || '(ninguno)');

  // Conteos actuales
  const counts = {
    usuarios: await Usuario.countDocuments(),
    productos: await Producto.countDocuments().catch(() => 0),
    pedidos: await Pedido.countDocuments().catch(() => 0),
    otps: await OTP.countDocuments().catch(() => 0),
  };
  console.log('[resetExceptAdmin] Conteos actuales:', counts);

  if (dryRun) {
    console.log('[resetExceptAdmin] Dry-run activo. No se aplicarán cambios.');
    await mongoose.disconnect();
    return;
  }

  // Eliminar pedidos (todos)
  const delPedidos = await Pedido.deleteMany({}).catch(() => ({ deletedCount: 0 }));
  // Eliminar productos (todos)
  const delProductos = await Producto.deleteMany({}).catch(() => ({ deletedCount: 0 }));

  // Eliminar OTPs que no correspondan a admins
  const otpFilter = { $or: [] };
  if (keepEmails.length) otpFilter.$or.push({ email: { $nin: keepEmails } });
  if (keepPhones.length) otpFilter.$or.push({ telefono: { $nin: keepPhones } });
  let delOtps = { deletedCount: 0 };
  if (otpFilter.$or.length) {
    delOtps = await OTP.deleteMany({ $or: otpFilter.$or });
  } else {
    // No hay admins con email/telefono, borrar todos los OTPs
    delOtps = await OTP.deleteMany({});
  }

  // Eliminar usuarios que no sean administradores
  const delUsuarios = await Usuario.deleteMany({ rol: { $ne: 'administrador' } });

  console.log('[resetExceptAdmin] Eliminados:', {
    pedidos: delPedidos.deletedCount,
    productos: delProductos.deletedCount,
    otps: delOtps.deletedCount,
    usuarios: delUsuarios.deletedCount,
  });

  await mongoose.disconnect();
  console.log('[resetExceptAdmin] Listo.');
}

main().catch((err) => {
  console.error('[resetExceptAdmin] Error:', err);
  process.exit(1);
});

