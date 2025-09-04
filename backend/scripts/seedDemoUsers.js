const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: __dirname + '/../.env' });

const Usuario = require('../models/Usuario');

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI no definido. Revisa backend/.env');
    process.exit(1);
  }

  console.log('[seedDemoUsers] Conectando a MongoDB...');
  await mongoose.connect(uri);

  const demos = [
    {
      nombre: 'Cliente Prueba',
      telefono: '+10000000002',
      email: 'cliente@yega.local',
      password: 'cliente123',
      rol: 'cliente',
      estado_validacion: 'aprobado',
      activo: true,
    },
    {
      nombre: 'Repartidor Prueba',
      telefono: '+10000000003',
      email: 'repartidor@yega.local',
      password: 'repartidor123',
      rol: 'repartidor',
      estado_validacion: 'aprobado',
      activo: true,
      ubicacion: { latitud: -34.6037, longitud: -58.3816, direccion: 'CABA, AR' },
    },
  ];

  for (const d of demos) {
    const exists = await Usuario.findOne({ email: d.email });
    if (exists) {
      console.log(`[seedDemoUsers] Ya existe: ${d.email}`);
      continue;
    }
    const user = new Usuario(d);
    await user.save();
    console.log(`[seedDemoUsers] Creado: ${d.email} (${d.rol})`);
  }

  await mongoose.disconnect();
  console.log('[seedDemoUsers] Listo.');
}

main().catch((err) => {
  console.error('[seedDemoUsers] Error:', err);
  process.exit(1);
});

