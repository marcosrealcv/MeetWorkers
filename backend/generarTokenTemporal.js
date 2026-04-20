#!/usr/bin/env node

const jsonwebtoken = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('❌ Error: JWT_SECRET no está configurado en .env');
  process.exit(1);
}

// Genera token válido por 24 horas
const payload = {
  email: 'test@meetworkers.com',
  idCliente: '507f1f77bcf86cd799439011'
};

const token = jsonwebtoken.sign(
  payload,
  JWT_SECRET,
  { 
    expiresIn: '24h',
    subject: '507f1f77bcf86cd799439011'
  }
);

console.log('\n✅ Token generado:\n');
console.log(token);
console.log('\n📋 Datos del token:');
console.log(`   Email: ${payload.email}`);
console.log(`   ID: ${payload.idCliente}`);
console.log(`   Vencimiento: 24 horas\n`);
