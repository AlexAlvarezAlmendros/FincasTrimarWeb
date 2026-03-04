/**
 * Migración: Crear tabla de Agentes
 * Fecha: 2026-03-04
 *
 * Crea la tabla Agentes para gestionar los agentes captadores.
 * Los agentes creados aquí aparecerán en el dropdown de la página de captación.
 */

import { db } from '../client.js';
import { logger } from '../../utils/logger.js';

export const up = async () => {
  try {
    logger.info('🔄 Iniciando migración: Crear tabla Agentes...');

    await db.execute({
      sql: `
        CREATE TABLE IF NOT EXISTS Agentes (
          Id TEXT PRIMARY KEY,
          Nombre TEXT NOT NULL UNIQUE,
          Activo INTEGER DEFAULT 1,
          CreatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
          UpdatedAt TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `,
      args: []
    });

    logger.info('✅ Tabla Agentes creada exitosamente');

    // Insertar agentes iniciales por defecto
    const defaultAgents = ['Aina', 'Maria', 'Trini'];
    const { v4: uuidv4 } = await import('uuid');

    for (const nombre of defaultAgents) {
      try {
        await db.execute({
          sql: `INSERT OR IGNORE INTO Agentes (Id, Nombre, Activo) VALUES (?, ?, 1)`,
          args: [uuidv4(), nombre]
        });
        logger.info(`✅ Agente por defecto insertado: ${nombre}`);
      } catch (err) {
        logger.warn(`⚠️ No se pudo insertar agente ${nombre}: ${err.message}`);
      }
    }

    logger.info('✅ Migración completada exitosamente: tabla Agentes creada');
  } catch (error) {
    logger.error('❌ Error en migración de Agentes:', error);
    throw error;
  }
};

export const down = async () => {
  try {
    logger.info('🔄 Revirtiendo migración: Eliminar tabla Agentes...');
    await db.execute({ sql: 'DROP TABLE IF EXISTS Agentes', args: [] });
    logger.info('✅ Tabla Agentes eliminada');
  } catch (error) {
    logger.error('❌ Error revirtiendo migración de Agentes:', error);
    throw error;
  }
};
