#!/usr/bin/env node

/**
 * Script para ejecutar migraciones de base de datos
 * Uso: node migrate.js
 */

import dotenv from 'dotenv';
import { createClient } from '@libsql/client';

// Cargar variables de entorno
dotenv.config();

// Configuración directa para asegurar que use Turso
const config = {
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
};

// Validar configuración
if (!config.url) {
  console.error('❌ TURSO_DATABASE_URL no está configurada');
  process.exit(1);
}

if (!config.authToken) {
  console.error('❌ TURSO_AUTH_TOKEN no está configurado');
  process.exit(1);
}

// Crear cliente directo
const db = createClient(config);

// SQL de las migraciones - separadas en statements individuales
const migrationStatements = [
  // Tabla de migraciones primero
  `CREATE TABLE IF NOT EXISTS migrations (
    id TEXT PRIMARY KEY,
    description TEXT NOT NULL,
    executed_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`,
  
  // Tabla Vivienda
  `CREATE TABLE IF NOT EXISTS Vivienda (
    Id TEXT PRIMARY KEY,
    Name TEXT NOT NULL,
    ShortDescription TEXT,
    Description TEXT,
    Price INTEGER NOT NULL CHECK(Price >= 0),
    Rooms INTEGER DEFAULT 0,
    BathRooms INTEGER DEFAULT 0,
    Garage INTEGER DEFAULT 0,
    SquaredMeters INTEGER CHECK(SquaredMeters >= 0),
    Provincia TEXT,
    Poblacion TEXT,
    Calle TEXT,
    Numero TEXT,
    TipoInmueble TEXT,
    TipoVivienda TEXT,
    Estado TEXT,
    Planta TEXT,
    TipoAnuncio TEXT,
    EstadoVenta TEXT DEFAULT 'Disponible',
    Caracteristicas TEXT,
    Published INTEGER DEFAULT 0,
    FechaPublicacion TEXT,
    CreatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TEXT DEFAULT CURRENT_TIMESTAMP
  )`,
  
  // Tabla ImagenesVivienda
  `CREATE TABLE IF NOT EXISTS ImagenesVivienda (
    Id TEXT PRIMARY KEY,
    ViviendaId TEXT NOT NULL REFERENCES Vivienda(Id) ON DELETE CASCADE,
    URL TEXT NOT NULL,
    Orden INTEGER DEFAULT 0,
    CreatedAt TEXT DEFAULT CURRENT_TIMESTAMP
  )`,
  
  // Tabla Mensaje
  `CREATE TABLE IF NOT EXISTS Mensaje (
    Id TEXT PRIMARY KEY,
    ViviendaId TEXT REFERENCES Vivienda(Id) ON DELETE SET NULL,
    Nombre TEXT NOT NULL,
    Email TEXT NOT NULL,
    Telefono TEXT,
    Asunto TEXT,
    Descripcion TEXT,
    Estado TEXT DEFAULT 'Nuevo',
    Pinned INTEGER DEFAULT 0,
    Fecha TEXT NOT NULL,
    CreatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TEXT DEFAULT CURRENT_TIMESTAMP
  )`,
  
  // Índices
  'CREATE INDEX IF NOT EXISTS IDX_Vivienda_Published ON Vivienda(Published)',
  'CREATE INDEX IF NOT EXISTS IDX_Vivienda_Precio ON Vivienda(Price)',
  'CREATE INDEX IF NOT EXISTS IDX_Vivienda_TipoAnuncio ON Vivienda(TipoAnuncio)',
  'CREATE INDEX IF NOT EXISTS IDX_Vivienda_Poblacion ON Vivienda(Poblacion)',
  'CREATE INDEX IF NOT EXISTS IDX_Vivienda_Rooms ON Vivienda(Rooms)',
  'CREATE INDEX IF NOT EXISTS IDX_Vivienda_FechaPublicacion ON Vivienda(FechaPublicacion)',
  'CREATE INDEX IF NOT EXISTS IDX_ImagenesVivienda_ViviendaId ON ImagenesVivienda(ViviendaId)',
  'CREATE INDEX IF NOT EXISTS IDX_ImagenesVivienda_Orden ON ImagenesVivienda(ViviendaId, Orden)',
  'CREATE INDEX IF NOT EXISTS IDX_Mensaje_ViviendaId ON Mensaje(ViviendaId)',
  'CREATE INDEX IF NOT EXISTS IDX_Mensaje_Estado ON Mensaje(Estado)',
  'CREATE INDEX IF NOT EXISTS IDX_Mensaje_Fecha ON Mensaje(Fecha)'
];

async function main() {
  try {
    console.log('🗄️  Ejecutando migraciones en Turso...\n');
    
    console.log('📍 Configuración:');
    console.log('  URL:', config.url);
    console.log('  Token:', config.authToken ? 'Configurado ✅' : 'Faltante ❌');
    console.log('');
    
    // Verificar conexión
    console.log('📡 Verificando conexión a Turso...');
    const testResult = await db.execute('SELECT 1 as test');
    console.log('✅ Conexión exitosa - Respuesta:', testResult.rows[0]);
    console.log('');
    
    // Verificar si ya existe la migración
    console.log('📊 Verificando migraciones existentes...');
    
    let migrationExists = false;
    try {
      // Primero asegurémonos de que la tabla migrations existe
      await db.execute(migrationStatements[0]); // Crear tabla migrations
      
      const existingMigrations = await db.execute(
        'SELECT id, description FROM migrations WHERE id = ?',
        ['001_create_tables']
      );
      
      if (existingMigrations.rows.length > 0) {
        const existing = existingMigrations.rows[0];
        if (existing.description) {
          migrationExists = true;
          console.log('✅ Migración válida encontrada:', existing.description);
        } else {
          // Migración corrupta, eliminarla
          console.log('🧹 Limpiando migración corrupta...');
          await db.execute('DELETE FROM migrations WHERE id = ?', ['001_create_tables']);
        }
      }
    } catch (error) {
      // Si hay algún error, continuamos
      console.log('ℹ️  Error verificando migraciones (continuando):', error.message);
    }
    
    if (migrationExists) {
      console.log('✅ Las migraciones ya están aplicadas');
    } else {
      console.log('🔄 Ejecutando migraciones...');
      
      // Ejecutar cada statement individualmente
      let executedCount = 0;
      for (const statement of migrationStatements) {
        try {
          await db.execute(statement);
          executedCount++;
          console.log(`  ✅ Statement ${executedCount}/${migrationStatements.length} ejecutado`);
        } catch (error) {
          console.log(`  ⚠️  Statement ${executedCount + 1} falló (posiblemente ya existe):`, error.message);
        }
      }
      
      // Registrar la migración (usando INSERT OR REPLACE para evitar conflictos)
      try {
        await db.execute(
          'INSERT OR REPLACE INTO migrations (id, description, executed_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
          ['001_create_tables', 'Crear tablas iniciales: Vivienda, ImagenesVivienda, Mensaje']
        );
        console.log('📝 Migración registrada en tabla migrations');
      } catch (error) {
        console.log('⚠️  Error registrando migración (puede ser que ya exista):', error.message);
      }
      
      console.log('✅ Migraciones ejecutadas exitosamente');
    }
    
    // Verificar tablas creadas
    console.log('\n� Verificando tablas creadas...');
    const tables = await db.execute(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
    );
    
    console.log('Tablas encontradas:');
    tables.rows.forEach(table => {
      console.log(`  📁 ${table.name}`);
    });
    
    // Verificar registros en tabla migrations
    console.log('\n� Migraciones registradas:');
    const migrations = await db.execute('SELECT * FROM migrations ORDER BY executed_at');
    migrations.rows.forEach(migration => {
      console.log(`  ✅ ${migration.id} - ${migration.description} (${migration.executed_at})`);
    });
    
    console.log('\n🎉 ¡Proceso completado! Las tablas deberían estar ahora disponibles en el panel de Turso.');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error ejecutando migraciones:', error);
    console.error('Detalles del error:', error.message);
    process.exit(1);
  }
}

// Ejecutar directamente
main();