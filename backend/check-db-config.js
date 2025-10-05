#!/usr/bin/env node

/**
 * Script para verificar la configuración de la base de datos
 */

import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

console.log('🔍 Verificando configuración de base de datos...\n');

console.log('Variables de entorno:');
console.log('TURSO_DATABASE_URL:', process.env.TURSO_DATABASE_URL ? '✅ Configurada' : '❌ No configurada');
console.log('TURSO_AUTH_TOKEN:', process.env.TURSO_AUTH_TOKEN ? '✅ Configurado' : '❌ No configurado');
console.log('NODE_ENV:', process.env.NODE_ENV || 'no definido');

// Configuración del cliente (igual que en client.js)
const config = {
  url: process.env.TURSO_DATABASE_URL || 'file:local.db',
  authToken: process.env.TURSO_AUTH_TOKEN,
};

console.log('\nConfiguración del cliente:');
console.log('URL:', config.url);
console.log('Auth Token:', config.authToken ? 'Presente' : 'Ausente');

// Determinar qué base de datos se está usando
if (config.url.startsWith('libsql://')) {
  console.log('\n✅ Usando Turso (remoto)');
} else if (config.url.startsWith('file:')) {
  console.log('\n⚠️  Usando SQLite local');
} else {
  console.log('\n❓ Tipo de base de datos desconocido');
}