/**
 * Migración: Añadir campo para gestión de borradores
 * Fecha: 2024
 * 
 * Añade el siguiente campo a la tabla Vivienda:
 * - IsDraft: Indica si la vivienda es un borrador (0/1)
 */

import { db } from '../client.js';
import { logger } from '../../utils/logger.js';

export const up = async () => {
  try {
    logger.info('🔄 Iniciando migración: Añadir campo de borradores...');

    // Añadir campo IsDraft a la tabla Vivienda
    try {
      await db.execute({
        sql: 'ALTER TABLE Vivienda ADD COLUMN IsDraft INTEGER DEFAULT 0 CHECK(IsDraft IN (0, 1))',
        args: []
      });
      logger.info('✅ Campo IsDraft añadido exitosamente');
    } catch (error) {
      // Si la columna ya existe, continuamos
      if (error.message.includes('duplicate column name')) {
        logger.warn('⚠️ Campo IsDraft ya existe, saltando...');
      } else {
        throw error;
      }
    }

    // Crear índice para optimizar búsquedas por borradores
    try {
      await db.execute({
        sql: 'CREATE INDEX IF NOT EXISTS IDX_Vivienda_IsDraft ON Vivienda(IsDraft)',
        args: []
      });
      logger.info('✅ Índice IDX_Vivienda_IsDraft creado');
    } catch (error) {
      logger.warn('⚠️ Error creando índice (puede ya existir):', error.message);
    }

    // Crear índice compuesto para optimizar filtros públicos
    try {
      await db.execute({
        sql: 'CREATE INDEX IF NOT EXISTS IDX_Vivienda_Public_Filter ON Vivienda(Published, IsDraft)',
        args: []
      });
      logger.info('✅ Índice IDX_Vivienda_Public_Filter creado');
    } catch (error) {
      logger.warn('⚠️ Error creando índice compuesto (puede ya existir):', error.message);
    }

    logger.info('✅ Migración completada exitosamente: campo de borradores añadido');

  } catch (error) {
    logger.error('❌ Error en migración de borradores:', error);
    throw error;
  }
};

export const down = async () => {
  try {
    logger.info('🔄 Revirtiendo migración: Eliminar índices de borradores...');
    
    // Eliminar índices (SQLite no soporta DROP COLUMN)
    try {
      await db.execute({
        sql: 'DROP INDEX IF EXISTS IDX_Vivienda_IsDraft',
        args: []
      });
      logger.info('✅ Índice IDX_Vivienda_IsDraft eliminado');
    } catch (error) {
      logger.warn('⚠️ Error eliminando índice:', error.message);
    }

    try {
      await db.execute({
        sql: 'DROP INDEX IF EXISTS IDX_Vivienda_Public_Filter',
        args: []
      });
      logger.info('✅ Índice IDX_Vivienda_Public_Filter eliminado');
    } catch (error) {
      logger.warn('⚠️ Error eliminando índice:', error.message);
    }

    logger.info('⚠️ Migración revertida parcialmente (solo índices). El campo IsDraft sigue en la tabla.');

  } catch (error) {
    logger.error('❌ Error revirtiendo migración:', error);
    throw error;
  }
};