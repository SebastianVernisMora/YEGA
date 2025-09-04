const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: __dirname + '/../.env' });

const Usuario = require('../models/Usuario');
const Producto = require('../models/Producto');
const Pedido = require('../models/Pedido');

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('[seedDemoOrders] MONGODB_URI no definido. Revisa backend/.env');
    process.exit(1);
  }

  console.log('[seedDemoOrders] Conectando a MongoDB...');
  await mongoose.connect(uri);

  const tienda = await Usuario.findOne({ email: 'tienda@yega.local' });
  const cliente = await Usuario.findOne({ email: 'cliente@yega.local' });
  const repartidor = await Usuario.findOne({ email: 'repartidor@yega.local' });

  if (!tienda || !cliente || !repartidor) {
    console.error('[seedDemoOrders] Faltan usuarios requeridos (tienda/cliente/repartidor).');
    console.error('  tienda:', !!tienda, 'cliente:', !!cliente, 'repartidor:', !!repartidor);
    process.exit(1);
  }

  let producto = await Producto.findOne({ tiendaId: tienda._id });
  if (!producto) {
    console.log('[seedDemoOrders] No se encontró producto para la tienda. Creando demo...');
    producto = await new Producto({
      nombre: 'Hamburguesa Demo',
      descripcion: 'Doble carne con queso',
      precio: 9.99,
      stock: 100,
      tiendaId: tienda._id,
      categoria: 'comida',
      tags: ['demo', 'seed']
    }).save();
  }

  const direccion_envio = {
    calle: 'Av. Demo',
    numero: '123',
    ciudad: 'CABA',
    codigo_postal: '1000',
    referencias: 'Depto 1',
    latitud: -34.6037,
    longitud: -58.3816,
  };

  // Evitar duplicados: si ya hay pedidos con notas DEMO, no crear más de 3
  const existentes = await Pedido.countDocuments({ notas: /DEMO/i });
  if (existentes >= 3) {
    console.log('[seedDemoOrders] Ya existen pedidos DEMO. Nada que hacer.');
    await mongoose.disconnect();
    return;
  }

  const crearPedido = async (estado, asignarRepartidor = false) => {
    const cantidad = 2;
    const subtotal_item = producto.precio * cantidad;
    const costo_envio = 2.5;
    const total = subtotal_item + costo_envio;

    const count = await Pedido.countDocuments();
    const numero_pedido = `YEGA-${String(count + 1).padStart(6, '0')}`;

    const pedido = new Pedido({
      numero_pedido,
      clienteId: cliente._id,
      tiendaId: tienda._id,
      repartidorId: asignarRepartidor ? repartidor._id : undefined,
      productos: [{
        producto: producto._id,
        cantidad,
        precio_unitario: producto.precio,
        subtotal: subtotal_item,
      }],
      subtotal: subtotal_item,
      costo_envio,
      total,
      estado,
      direccion_envio,
      metodo_pago: 'efectivo',
      notas: 'Pedido DEMO para pruebas de front',
      tiempo_estimado: 30,
    });
    await pedido.save();
    console.log(`[seedDemoOrders] Pedido creado: ${pedido.numero_pedido} estado=${estado} asignado=${!!asignarRepartidor}`);
  };

  // Crear 3 pedidos: pendiente (sin asignar), listo (asignado), en_camino (asignado)
  await crearPedido('pendiente', false);
  await crearPedido('listo', true);
  await crearPedido('en_camino', true);

  await mongoose.disconnect();
  console.log('[seedDemoOrders] Listo.');
}

main().catch((err) => {
  console.error('[seedDemoOrders] Error:', err);
  process.exit(1);
});
