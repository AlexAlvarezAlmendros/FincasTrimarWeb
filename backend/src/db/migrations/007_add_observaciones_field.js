/**
 * Migración: Añadir campo Observaciones
 * Fecha: 2025-10-17
 * 
 * Añade el campo Observaciones a la tabla Vivienda para poder
 * registrar notas y comentarios sobre la propiedad durante el proceso de captación
 */

import { db } from '../client.js';
import { logger } from '../../utils/logger.js';

export const up = async () => {
  try {
    logger.info('🔄 Iniciando migración: Añadir campo Observaciones...');

    // Añadir campo Observaciones a la tabla Vivienda
    const alterQuery = {
      sql: 'ALTER TABLE Vivienda ADD COLUMN Observaciones TEXT',
      args: []
    };

    try {
      await db.execute(alterQuery);
      logger.info('✅ Campo Observaciones añadido exitosamente');
    } catch (error) {
      // Si la columna ya existe, continuamos
      if (error.message.includes('duplicate column name')) {
        logger.warn('⚠️ Campo Observaciones ya existe, saltando migración');
        return;
      }
      throw error;
    }

    logger.info('✅ Migración completada exitosamente: campo Observaciones añadido');

  } catch (error) {
    logger.error('❌ Error en migración de Observaciones:', error);
    throw error;
  }
};

export const down = async () => {
  try {
    logger.info('🔄 Revirtiendo migración: Eliminar campo Observaciones...');

    // SQLite no soporta DROP COLUMN directamente
    logger.warn('⚠️ SQLite no soporta DROP COLUMN. Para revertir esta migración completamente, se requiere recrear la tabla.');
    logger.info('⚠️ El campo Observaciones permanecerá en la tabla.');

  } catch (error) {
    logger.error('❌ Error revirtiendo migración:', error);
    throw error;
  }
};
