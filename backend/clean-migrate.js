#!/usr/bin/env node

/**
 * Script simple para limpiar y recrear tablas en Turso
 */

import dotenv from 'dotenv';
import { createClient } from '@libsql/client';

dotenv.config();

const config = {
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
};

const db = createClient(config);

async function cleanAndMigrate() {
  try {
    console.log('🧹 Limpiando y recreando tablas...');
    
    // Limpiar todo
    await db.execute('DROP TABLE IF EXISTS migrations');
    await db.execute('DROP TABLE IF EXISTS ImagenesVivienda');
    await db.execute('DROP TABLE IF EXISTS Mensaje');
    await db.execute('DROP TABLE IF EXISTS Vivienda');
    
    console.log('✅ Tablas eliminadas');
    
    // Recrear todo
    const statements = [
      `CREATE TABLE migrations (
        id TEXT PRIMARY KEY,
        description TEXT NOT NULL,
        executed_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE Vivienda (
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
      
      `CREATE TABLE ImagenesVivienda (
        Id TEXT PRIMARY KEY,
        ViviendaId TEXT NOT NULL REFERENCES Vivienda(Id) ON DELETE CASCADE,
        URL TEXT NOT NULL,
        Orden INTEGER DEFAULT 0,
        CreatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE Mensaje (
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
      )`
    ];
    
    for (let i = 0; i < statements.length; i++) {
      await db.execute(statements[i]);
      console.log(`✅ Tabla ${i + 1}/${statements.length} creada`);
    }
    
    // Registrar migración
    await db.execute(
      'INSERT INTO migrations (id, description) VALUES (?, ?)',
      ['001_create_tables', 'Crear tablas iniciales: Vivienda, ImagenesVivienda, Mensaje']
    );
    
    console.log('🎉 ¡Completado! Tablas creadas exitosamente en Turso.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

cleanAndMigrate();