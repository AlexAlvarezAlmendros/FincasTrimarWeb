#!/usr/bin/env node

/**
 * Script para verificar la conexión a Turso y mostrar las tablas
 */

import dotenv from 'dotenv';
import { testConnection, executeQuery } from './src/db/client.js';

dotenv.config();

async function verifyTursoConnection() {
  try {
    console.log('🔍 Verificando conexión a Turso...');
    
    // Probar conexión
    await testConnection();
    console.log('✅ Conexión exitosa');
    
    // Mostrar tablas
    console.log('\n📋 Tablas disponibles en Turso:');
    const result = await executeQuery(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
    );
    
    if (result.rows.length === 0) {
      console.log('❌ No se encontraron tablas. Ejecuta las migraciones primero.');
    } else {
      result.rows.forEach(row => {
        console.log(`  📁 ${row.name}`);
      });
    }
    
    // Verificar tabla Vivienda específicamente
    console.log('\n🏠 Verificando tabla Vivienda:');
    try {
      const viviendaCheck = await executeQuery('SELECT COUNT(*) as count FROM Vivienda');
      console.log(`✅ Tabla Vivienda encontrada con ${viviendaCheck.rows[0].count} registros`);
    } catch (error) {
      console.log('❌ Error accediendo a tabla Vivienda:', error.message);
    }
    
    // Verificar tabla ImagenesVivienda específicamente
    console.log('\n📸 Verificando tabla ImagenesVivienda:');
    try {
      const imagenesCheck = await executeQuery('SELECT COUNT(*) as count FROM ImagenesVivienda');
      console.log(`✅ Tabla ImagenesVivienda encontrada con ${imagenesCheck.rows[0].count} registros`);
    } catch (error) {
      console.log('❌ Error accediendo a tabla ImagenesVivienda:', error.message);
    }
    
    console.log('\n🎉 Verificación completada');
    
  } catch (error) {
    console.error('❌ Error verificando conexión:', error.message);
  }
}

verifyTursoConnection();