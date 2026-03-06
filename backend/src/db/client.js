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

// Crear cliente (mutable para permitir reconexión)
let dbClient = createClient(config);
export const db = dbClient;

/** Recrea el cliente si la conexión quedó colgada */
function recreateClient() {
  try {
    dbClient.close?.();
  } catch (_) { /* ignora errores al cerrar */ }
  dbClient = createClient(config);
  logger.info('🔄 Cliente Turso recreado');
  return dbClient;
}

/** Envuelve una promesa con un timeout. Rechaza con error claro si supera `ms`. */
function withTimeout(promise, ms, label) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`DB_TIMEOUT: "${label}" superó ${ms}ms`));
    }, ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

// Timeout por defecto para queries individuales (20 s)
const QUERY_TIMEOUT_MS = 20_000;

/**
 * Verifica la conexión a la base de datos
 */
export async function testConnection() {
  try {
    const result = await withTimeout(
      dbClient.execute('SELECT 1 as test'),
      QUERY_TIMEOUT_MS,
      'testConnection'
    );
    logger.info('Conexión a la base de datos exitosa');
    return result;
  } catch (error) {
    logger.error('Error conectando a la base de datos:', error);
    throw error;
  }
}

/**
 * Ejecuta una query con manejo de errores y timeout automático.
 * Si la query supera el timeout se intenta reconectar y reintentar UNA vez.
 */
export async function executeQuery(sql, params = []) {
  const shortSql = sql.replace(/\s+/g, ' ').trim().substring(0, 120);
  try {
    const result = await withTimeout(
      dbClient.execute({ sql, args: params }),
      QUERY_TIMEOUT_MS,
      shortSql
    );
    return result;
  } catch (error) {
    if (error.message?.startsWith('DB_TIMEOUT')) {
      logger.warn(`⏱️ Timeout en query, reconectando y reintentando: ${shortSql}`);
      const freshClient = recreateClient();
      try {
        const result = await withTimeout(
          freshClient.execute({ sql, args: params }),
          QUERY_TIMEOUT_MS,
          `retry:${shortSql}`
        );
        return result;
      } catch (retryError) {
        logger.error('❌ Reintento también falló:', { sql: shortSql, error: retryError.message });
        throw retryError;
      }
    }
    logger.error('Error ejecutando query:', { sql: shortSql, params, error: error.message });
    throw error;
  }
}

/**
 * Ejecuta una transacción
 */
export async function executeTransaction(queries) {
  try {
    const results = await withTimeout(
      dbClient.batch(queries),
      QUERY_TIMEOUT_MS * 2,
      'executeTransaction'
    );
    return results;
  } catch (error) {
    logger.error('Error ejecutando transacción:', error);
    throw error;
  }
}