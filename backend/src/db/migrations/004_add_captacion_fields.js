/**
 * Migración: Añadir campos de gestión de captación
 * Fecha: 2024
 * 
 * Añade los siguientes campos a la tabla Vivienda:
 * - ComisionGanada: Porcentaje de comisión ganada (0-100)
 * - CaptadoPor: ID del usuario/agente que captó la vivienda
 * - PorcentajeCaptacion: Porcentaje que se lleva el agente captador (0-100)
 * - FechaCaptacion: Fecha cuando se captó la vivienda
 */

import { db } from '../client.js';
import { logger } from '../../utils/logger.js';

export const up = async () => {
  try {
    logger.info('🔄 Iniciando migración: Añadir campos de captación...');

    // Añadir campos de captación a la tabla Vivienda
    const alterQueries = [
      {
        sql: 'ALTER TABLE Vivienda ADD COLUMN ComisionGanada REAL DEFAULT 0.0 CHECK(ComisionGanada >= 0.0 AND ComisionGanada <= 100.0)',
        args: []
      },
      {
        sql: 'ALTER TABLE Vivienda ADD COLUMN CaptadoPor TEXT',
        args: []
      },
      {
        sql: 'ALTER TABLE Vivienda ADD COLUMN PorcentajeCaptacion REAL DEFAULT 0.0 CHECK(PorcentajeCaptacion >= 0.0 AND PorcentajeCaptacion <= 100.0)',
        args: []
      },
      {
        sql: 'ALTER TABLE Vivienda ADD COLUMN FechaCaptacion TEXT',
        args: []
      }
    ];

    // Ejecutar las queries una por una (SQLite no permite múltiples ALTER TABLE en una transacción)
    for (const query of alterQueries) {
      try {
        await db.execute(query);
        logger.info(`✅ Campo añadido exitosamente: ${query.sql}`);
      } catch (error) {
        // Si la columna ya existe, continuamos
        if (error.message.includes('duplicate column name')) {
          logger.warn(`⚠️ Campo ya existe, saltando: ${query.sql}`);
          continue;
        }
        throw error;
      }
    }

    // Crear índice para optimizar búsquedas por captador
    try {
      await db.execute({
        sql: 'CREATE INDEX IF NOT EXISTS IDX_Vivienda_CaptadoPor ON Vivienda(CaptadoPor)',
        args: []
      });
      logger.info('✅ Índice IDX_Vivienda_CaptadoPor creado');
    } catch (error) {
      logger.warn('⚠️ Error creando índice (puede ya existir):', error.message);
    }

    // Crear índice para optimizar búsquedas por fecha de captación
    try {
      await db.execute({
        sql: 'CREATE INDEX IF NOT EXISTS IDX_Vivienda_FechaCaptacion ON Vivienda(FechaCaptacion)',
        args: []
      });
      logger.info('✅ Índice IDX_Vivienda_FechaCaptacion creado');
    } catch (error) {
      logger.warn('⚠️ Error creando índice (puede ya existir):', error.message);
    }

    logger.info('✅ Migración completada exitosamente: campos de captación añadidos');

  } catch (error) {
    logger.error('❌ Error en migración de captación:', error);
    throw error;
  }
};

export const down = async () => {
  try {
    logger.info('🔄 Revirtiendo migración: Eliminar campos de captación...');

    // SQLite no soporta DROP COLUMN directamente
    // Tendríamos que recrear la tabla sin esos campos
    logger.warn('⚠️ SQLite no soporta DROP COLUMN. Para revertir esta migración completamente, se requiere recrear la tabla.');
    
    // Por ahora, solo eliminamos los índices
    try {
      await db.execute({
        sql: 'DROP INDEX IF EXISTS IDX_Vivienda_CaptadoPor',
        args: []
      });
      logger.info('✅ Índice IDX_Vivienda_CaptadoPor eliminado');
    } catch (error) {
      logger.warn('⚠️ Error eliminando índice:', error.message);
    }

    try {
      await db.execute({
        sql: 'DROP INDEX IF EXISTS IDX_Vivienda_FechaCaptacion',
        args: []
      });
      logger.info('✅ Índice IDX_Vivienda_FechaCaptacion eliminado');
    } catch (error) {
      logger.warn('⚠️ Error eliminando índice:', error.message);
    }

    logger.info('⚠️ Migración revertida parcialmente (solo índices). Los campos siguen en la tabla.');

  } catch (error) {
    logger.error('❌ Error revirtiendo migración:', error);
    throw error;
  }
};