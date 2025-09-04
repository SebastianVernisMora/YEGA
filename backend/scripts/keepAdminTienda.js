const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: __dirname + '/../.env' });

const Usuario = require('../models/Usuario');
const OTP = require('../models/OTP');

const ADMIN_EMAIL = 'admin@yega.local';
const TIENDA_EMAIL = 'tienda@yega.local';

async function main() {
  const uri = process.env.MONGODB_URI;
  const dryRun = process.argv.includes('--dry');

  if (!uri) {
    console.error('MONGODB_URI no definido. Revisa backend/.env');
    process.exit(1);
  }

  await mongoose.connect(uri);

  const keepEmails = [ADMIN_EMAIL, TIENDA_EMAIL];
  const keepUsers = await Usuario.find({ email: { $in: keepEmails } }).select('_id email rol');

  if (keepUsers.length < keepEmails.length) {
    console.warn('[keep] Advertencia: No se encontraron todos los usuarios a conservar:', keepEmails);
  }

  const allUsers = await Usuario.find().select('_id email rol');
  const toDelete = allUsers.filter(u => !keepEmails.includes(u.email));

  console.log(`[keep] Usuarios totales: ${allUsers.length}`);
  console.log(`[keep] Usuarios a conservar (${keepUsers.length}):`, keepUsers.map(u => `${u.email} (${u.rol})`));
  console.log(`[keep] Usuarios a eliminar (${toDelete.length}):`, toDelete.map(u => `${u.email} (${u.rol})`));

  if (dryRun) {
    await mongoose.disconnect();
    return;
  }

  // Eliminar OTPs asociados a los usuarios que se eliminarán
  const deleteEmails = toDelete.map(u => u.email);
  const deletePhones = toDelete.map(u => u.telefono).filter(Boolean);

  const otpFilter = { $or: [] };
  if (deleteEmails.length) otpFilter.$or.push({ email: { $in: deleteEmails } });
  if (deletePhones.length) otpFilter.$or.push({ telefono: { $in: deletePhones } });

  if (otpFilter.$or.length) {
    const delOtps = await OTP.deleteMany(otpFilter);
    console.log(`[keep] OTPs eliminados: ${delOtps.deletedCount}`);
  } else {
    console.log('[keep] No hay OTPs para eliminar');
  }

  const delUsers = await Usuario.deleteMany({ email: { $nin: keepEmails } });
  console.log(`[keep] Usuarios eliminados: ${delUsers.deletedCount}`);

  await mongoose.disconnect();
  console.log('[keep] Listo.');
}

main().catch((err) => {
  console.error('[keep] Error:', err);
  process.exit(1);
});

