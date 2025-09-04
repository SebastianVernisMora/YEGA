// backend/scripts/wipeUsers.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: __dirname + '/../.env' });

const Usuario = require('../models/Usuario');
const OTP = require('../models/OTP');

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/yega_db';

  console.log('Connecting to MongoDB:', uri);
  await mongoose.connect(uri);

  const deleteUsers = process.argv.includes('--users') || process.argv.length === 2;
  const deleteOtps = process.argv.includes('--otps') || process.argv.includes('--all');

  if (deleteUsers) {
    const res = await Usuario.deleteMany({});
    console.log(`Usuarios eliminados: ${res.deletedCount}`);
  }

  if (deleteOtps) {
    const res = await OTP.deleteMany({});
    console.log(`OTPs eliminados: ${res.deletedCount}`);
  }

  await mongoose.disconnect();
  console.log('Done.');
}

main().catch((err) => {
  console.error('Error wiping data:', err);
  process.exit(1);
});

