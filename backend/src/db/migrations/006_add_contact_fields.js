/**
 * Migración: Añadir campos de contacto
 * Fecha: 2024
 * 
 * Añade los siguientes campos a la tabla Vivienda:
 * - TelefonoContacto: Teléfono del contacto/propietario
 * - NombreContacto: Nombre del contacto/propietario
 * - UrlReferencia: URL del anuncio original o referencia externa
 */

import { db } from '../client.js';
import { logger } from '../../utils/logger.js';

export const up = async () => {
  try {
    logger.info('🔄 Iniciando migración: Añadir campos de contacto...');

    // Añadir campo TelefonoContacto
    try {
      await db.execute({
        sql: 'ALTER TABLE Vivienda ADD COLUMN TelefonoContacto TEXT',
        args: []
      });
      logger.info('✅ Campo TelefonoContacto añadido exitosamente');
    } catch (error) {
      if (error.message.includes('duplicate column name')) {
        logger.warn('⚠️ Campo TelefonoContacto ya existe, saltando...');
      } else {
        throw error;
      }
    }

    // Añadir campo NombreContacto
    try {
      await db.execute({
        sql: 'ALTER TABLE Vivienda ADD COLUMN NombreContacto TEXT',
        args: []
      });
      logger.info('✅ Campo NombreContacto añadido exitosamente');
    } catch (error) {
      if (error.message.includes('duplicate column name')) {
        logger.warn('⚠️ Campo NombreContacto ya existe, saltando...');
      } else {
        throw error;
      }
    }

    // Añadir campo UrlReferencia
    try {
      await db.execute({
        sql: 'ALTER TABLE Vivienda ADD COLUMN UrlReferencia TEXT',
        args: []
      });
      logger.info('✅ Campo UrlReferencia añadido exitosamente');
    } catch (error) {
      if (error.message.includes('duplicate column name')) {
        logger.warn('⚠️ Campo UrlReferencia ya existe, saltando...');
      } else {
        throw error;
      }
    }

    // Crear índice para búsquedas por teléfono de contacto (útil para evitar duplicados)
    try {
      await db.execute({
        sql: 'CREATE INDEX IF NOT EXISTS IDX_Vivienda_TelefonoContacto ON Vivienda(TelefonoContacto)',
        args: []
      });
      logger.info('✅ Índice IDX_Vivienda_TelefonoContacto creado');
    } catch (error) {
      logger.warn('⚠️ Error creando índice (puede ya existir):', error.message);
    }

    logger.info('✅ Migración completada exitosamente: campos de contacto añadidos');

  } catch (error) {
    logger.error('❌ Error en migración de campos de contacto:', error);
    throw error;
  }
};

export const down = async () => {
  try {
    logger.info('🔄 Revirtiendo migración: Eliminar índice de contacto...');
    
    // Eliminar índice (SQLite no soporta DROP COLUMN directamente)
    try {
      await db.execute({
        sql: 'DROP INDEX IF EXISTS IDX_Vivienda_TelefonoContacto',
        args: []
      });
      logger.info('✅ Índice IDX_Vivienda_TelefonoContacto eliminado');
    } catch (error) {
      logger.warn('⚠️ Error eliminando índice:', error.message);
    }

    logger.info('⚠️ Migración revertida parcialmente (solo índice). Los campos TelefonoContacto, NombreContacto y UrlReferencia siguen en la tabla.');
    logger.info('ℹ️ Para eliminar completamente las columnas, se requeriría recrear la tabla completa.');

  } catch (error) {
    logger.error('❌ Error revirtiendo migración:', error);
    throw error;
  }
};
