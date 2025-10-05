import { createClient } from '@libsql/client';
import { logger } from '../utils/logger.js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

/**
 * Cliente de base de datos Turso SQLite
 */

// Variables de entorno cargadas correctamente

// Validar configuración de Turso
if (!process.env.TURSO_DATABASE_URL) {
  throw new Error('TURSO_DATABASE_URL es obligatorio - configúralo en el archivo .env');
}

if (!process.env.TURSO_AUTH_TOKEN) {
  throw new Error('TURSO_AUTH_TOKEN es obligatorio - configúralo en el archivo .env');
}

// Configuración del cliente - SIEMPRE usar Turso
const config = {
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
};

// Log de configuración
console.log('🗄️ Usando Turso como base de datos:', config.url.substring(0, 50) + '...');

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