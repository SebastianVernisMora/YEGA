const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: __dirname + '/../.env' });

const Usuario = require('../models/Usuario');
const Producto = require('../models/Producto');
const Pedido = require('../models/Pedido');
const OTP = require('../models/OTP');

async function main() {
  const uri = process.env.MONGODB_URI;
  const dryRun = process.argv.includes('--dry');

  if (!uri) {
    console.error('MONGODB_URI no definido. Revisa backend/.env');
    process.exit(1);
  }

  console.log(`[reset] Conectando a MongoDB: ${uri}`);
  await mongoose.connect(uri);

  // Conteos actuales
  const counts = {
    usuarios: await Usuario.countDocuments(),
    productos: await Producto.countDocuments().catch(() => 0),
    pedidos: await Pedido.countDocuments().catch(() => 0),
    otps: await OTP.countDocuments().catch(() => 0),
  };
  console.log('[reset] Conteos actuales:', counts);

  if (dryRun) {
    console.log('[reset] Dry-run activo. No se aplicarán cambios.');
    await mongoose.disconnect();
    return;
  }

  // Eliminar datos existentes (para evitar referencias huérfanas)
  const delPedidos = await Pedido.deleteMany({}).catch(() => ({ deletedCount: 0 }));
  const delProductos = await Producto.deleteMany({}).catch(() => ({ deletedCount: 0 }));
  const delOtps = await OTP.deleteMany({}).catch(() => ({ deletedCount: 0 }));
  const delUsuarios = await Usuario.deleteMany({});

  console.log('[reset] Eliminados:', {
    pedidos: delPedidos.deletedCount,
    productos: delProductos.deletedCount,
    otps: delOtps.deletedCount,
    usuarios: delUsuarios.deletedCount,
  });

  // Crear usuarios de prueba: Cliente y Repartidor
  const cliente = new Usuario({
    nombre: 'Cliente Prueba',
    telefono: '+10000000002',
    email: 'cliente@yega.local',
    password: 'cliente123',
    rol: 'cliente',
    estado_validacion: 'aprobado',
    activo: true,
  });

  const repartidor = new Usuario({
    nombre: 'Repartidor Prueba',
    telefono: '+10000000003',
    email: 'repartidor@yega.local',
    password: 'repartidor123',
    rol: 'repartidor',
    estado_validacion: 'aprobado',
    activo: true,
    ubicacion: { latitud: -34.6037, longitud: -58.3816, direccion: 'CABA, AR' },
  });

  await cliente.save();
  await repartidor.save();

  console.log('[reset] Usuarios creados:');
  console.log('  - Cliente: cliente@yega.local / cliente123');
  console.log('  - Repartidor: repartidor@yega.local / repartidor123');

  await mongoose.disconnect();
  console.log('[reset] Listo.');
}

main().catch((err) => {
  console.error('[reset] Error:', err);
  process.exit(1);
});

