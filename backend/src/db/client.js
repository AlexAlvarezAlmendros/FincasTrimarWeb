import { createClient } from '@libsql/client';
import { logger } from '../utils/logger.js';

/**
 * Cliente de base de datos Turso SQLite
 */

// Configuración del cliente
const config = {
  url: process.env.TURSO_DATABASE_URL || 'file:local.db',
  authToken: process.env.TURSO_AUTH_TOKEN,
};

// Validar configuración
if (!config.url) {
  throw new Error('TURSO_DATABASE_URL no está configurada');
}

// En producción validar que exista el token
if (process.env.NODE_ENV === 'production' && !config.authToken) {
  throw new Error('TURSO_AUTH_TOKEN es requerido en producción');
}

// Crear cliente
export const db = createClient(config);

/**
 * Verifica la conexión a la base de datos
 */
export async function testConnection() {
  try {
    const result = await db.execute('SELECT 1 as test');
    logger.info('Conexión a la base de datos exitosa');
    return result;
  } catch (error) {
    logger.error('Error conectando a la base de datos:', error);
    throw error;
  }
}

/**
 * Ejecuta una query con manejo de errores
 */
export async function executeQuery(sql, params = []) {
  try {
    const result = await db.execute({ sql, args: params });
    return result;
  } catch (error) {
    logger.error('Error ejecutando query:', { sql, params, error: error.message });
    throw error;
  }
}

/**
 * Ejecuta una transacción
 */
export async function executeTransaction(queries) {
  try {
    const results = await db.batch(queries);
    return results;
  } catch (error) {
    logger.error('Error ejecutando transacción:', error);
    throw error;
  }
}