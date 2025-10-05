#!/usr/bin/env node

/**
 * Script para verificar la configuración de Auth0
 */

import dotenv from 'dotenv';

dotenv.config();

console.log('🔐 Verificando configuración de Auth0...\n');

console.log('Variables de entorno del backend:');
console.log('AUTH0_AUDIENCE:', process.env.AUTH0_AUDIENCE || '❌ NO CONFIGURADO');
console.log('AUTH0_ISSUER_BASE_URL:', process.env.AUTH0_ISSUER_BASE_URL || '❌ NO CONFIGURADO');

console.log('\n📋 Estado de configuración:');
const backendConfigured = !!(process.env.AUTH0_AUDIENCE && process.env.AUTH0_ISSUER_BASE_URL);
console.log('Backend Auth0:', backendConfigured ? '✅ CONFIGURADO' : '❌ FALTA CONFIGURACIÓN');

if (!backendConfigured) {
  console.log('\n🔧 Para configurar Auth0 en el backend, agrega al archivo .env:');
  console.log('AUTH0_AUDIENCE=trimar');
  console.log('AUTH0_ISSUER_BASE_URL=https://docai.eu.auth0.com/');
}

console.log('\n🌐 Configuración esperada del frontend (.env):');
console.log('VITE_AUTH0_DOMAIN=docai.eu.auth0.com');
console.log('VITE_AUTH0_CLIENT_ID=QY6cycWooCkYwLvpiN4yExJXN5Y4VVt1');
console.log('VITE_AUTH0_AUDIENCE=trimar');

if (backendConfigured) {
  console.log('\n✅ Auth0 configurado correctamente. El backend requerirá JWT tokens.');
} else {
  console.log('\n❌ Auth0 no está configurado. El servidor no arrancará.');
}