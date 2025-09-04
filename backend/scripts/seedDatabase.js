// backend/scripts/seedDatabase.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: __dirname + '/../.env' });

const Usuario = require('../models/Usuario');
const Producto = require('../models/Producto');

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/yega_db';
  console.log('Conectando a MongoDB:', uri);
  await mongoose.connect(uri);

  // Admin
  let admin = await Usuario.findOne({ email: 'admin@yega.local' });
  if (!admin) {
    admin = new Usuario({
      nombre: 'Admin YEGA',
      telefono: '+10000000000',
      email: 'admin@yega.local',
      password: 'admin123',
      rol: 'administrador',
      estado_validacion: 'aprobado',
      activo: true
    });
    await admin.save();
    console.log('✔ Admin creado');
  } else {
    console.log('ℹ Admin ya existía');
  }

  // Tienda
  let tienda = await Usuario.findOne({ email: 'tienda@yega.local' });
  if (!tienda) {
    tienda = new Usuario({
      nombre: 'Tienda Demo',
      telefono: '+10000000001',
      email: 'tienda@yega.local',
      password: 'tienda123',
      rol: 'tienda',
      estado_validacion: 'aprobado',
      activo: true,
      ubicacion: { latitud: -34.6, longitud: -58.4, direccion: 'Demo 123' }
    });
    await tienda.save();
    console.log('✔ Tienda creada');
  } else {
    console.log('ℹ Tienda ya existía');
  }

  // Producto demo
  const productoExistente = await Producto.findOne({ nombre: 'Hamburguesa Demo', tiendaId: tienda._id });
  if (!productoExistente) {
    await new Producto({
      nombre: 'Hamburguesa Demo',
      descripcion: 'Doble carne con queso',
      precio: 9.99,
      stock: 50,
      tiendaId: tienda._id,
      categoria: 'comida',
      tags: ['demo', 'rapida']
    }).save();
    console.log('✔ Producto demo creado');
  } else {
    console.log('ℹ Producto demo ya existía');
  }

  await mongoose.disconnect();
  console.log('Listo.');
}

main().catch(err => {
  console.error('Error en seed:', err);
  process.exit(1);
});

