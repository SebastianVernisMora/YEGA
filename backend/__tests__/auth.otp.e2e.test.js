// backend/__tests__/auth.otp.e2e.test.js
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
let app;
let request;

describe('YEGA E2E: Auth + OTP + Productos', () => {
  let mongod;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    process.env.MONGODB_URI = uri;
    process.env.JWT_SECRET = 'test_secret';
    process.env.NODE_ENV = 'development';
    // Cargar server después de setear env
    app = require('../server');
    request = require('supertest')(app);
    // Asegurar conexión mongoose activa
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.connection.close();
    if (mongod) await mongod.stop();
  });

  test('Registro tienda -> OTP -> verificación -> perfil', async () => {
    const tienda = {
      nombre: 'Tienda Test',
      telefono: '+5491111111111',
      email: 'tienda@test.com',
      password: 'secret123',
      rol: 'tienda',
      ubicacion: { latitud: -34.6, longitud: -58.4 }
    };

    const regRes = await request.post('/api/auth/register').send(tienda);
    expect(regRes.statusCode).toBe(201);
    expect(regRes.body.success).toBe(true);
    expect(regRes.body.requiere_otp).toBe(true);

    // Obtener OTP desde la colección
    const OTP = require('../models/OTP');
    const lastOtp = await OTP.findOne({ telefono: tienda.telefono }).sort({ createdAt: -1 });
    expect(lastOtp).toBeTruthy();

    // Verificar OTP
    const verRes = await request.post('/api/auth/verify-otp').send({
      email: tienda.email,
      otp: lastOtp.codigo,
      telefono: tienda.telefono,
      tipo: 'registro'
    });
    expect(verRes.statusCode).toBe(200);
    expect(verRes.body.success).toBe(true);
    expect(verRes.body.token).toBeTruthy();
    const tiendaToken = verRes.body.token;

    // Perfil
    const profRes = await request.get('/api/auth/profile').set('Authorization', `Bearer ${tiendaToken}`);
    expect(profRes.statusCode).toBe(200);
    expect(profRes.body.usuario.email).toBe(tienda.email);
  });

  test('Cliente: registro (auto-login) y perfil', async () => {
    const cliente = {
      nombre: 'Cliente Test',
      telefono: '+5491222222222',
      email: 'cliente@test.com',
      password: 'secret123',
      rol: 'cliente'
    };

    const regRes = await request.post('/api/auth/register').send(cliente);
    expect(regRes.statusCode).toBe(201);
    expect(regRes.body.success).toBe(true);
    expect(regRes.body.requiere_otp).toBe(false);
    const clienteToken = regRes.body.token;
    expect(clienteToken).toBeTruthy();

    const profRes = await request.get('/api/auth/profile').set('Authorization', `Bearer ${clienteToken}`);
    expect(profRes.statusCode).toBe(200);
    expect(profRes.body.usuario.email).toBe(cliente.email);
  });
});

