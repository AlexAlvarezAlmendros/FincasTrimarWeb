import { executeQuery } from '../client.js';
import { migration001CreateTables } from './001_create_tables.js';
import { logger } from '../../utils/logger.js';

/**
 * Sistema de migraciones para la base de datos
 */

// Lista de migraciones disponibles
const migrations = [
  migration001CreateTables
];

/**
 * Crear tabla de migraciones si no existe
 */
async function createMigrationsTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS migrations (
      id TEXT PRIMARY KEY,
      description TEXT NOT NULL,
      executed_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  await executeQuery(sql);
}

/**
 * Verificar si una migración ya fue ejecutada
 */
async function isMigrationExecuted(migrationId) {
  const result = await executeQuery(
    'SELECT id FROM migrations WHERE id = ?',
    [migrationId]
  );
  
  return result.rows.length > 0;
}

/**
 * Marcar migración como ejecutada
 */
async function markMigrationAsExecuted(migration) {
  await executeQuery(
    'INSERT INTO migrations (id, description) VALUES (?, ?)',
    [migration.id, migration.description]
  );
}

/**
 * Ejecutar todas las migraciones pendientes
 */
export async function runMigrations() {
  try {
    logger.info('Iniciando migraciones de base de datos...');
    
    // Crear tabla de migraciones
    await createMigrationsTable();
    
    // Ejecutar migraciones pendientes
    for (const migration of migrations) {
      const isExecuted = await isMigrationExecuted(migration.id);
      
      if (!isExecuted) {
        logger.info(`Ejecutando migración: ${migration.id} - ${migration.description}`);
        
        // Ejecutar SQL de la migración
        await executeQuery(migration.sql);
        
        // Marcar como ejecutada
        await markMigrationAsExecuted(migration);
        
        logger.info(`Migración ${migration.id} ejecutada exitosamente`);
      } else {
        logger.info(`Migración ${migration.id} ya fue ejecutada`);
      }
    }
    
    logger.info('Migraciones completadas');
  } catch (error) {
    logger.error('Error ejecutando migraciones:', error);
    throw error;
  }
}

/**
 * Verificar el estado de las migraciones
 */
export async function getMigrationsStatus() {
  try {
    await createMigrationsTable();
    
    const result = await executeQuery('SELECT * FROM migrations ORDER BY executed_at');
    
    return {
      executed: result.rows,
      pending: migrations.filter(m => 
        !result.rows.some(row => row.id === m.id)
      )
    };
  } catch (error) {
    logger.error('Error obteniendo estado de migraciones:', error);
    throw error;
  }
}