import { db } from '../db/client.js';
import { logger } from '../utils/logger.js';

/**
 * Servicio para limpiar viviendas duplicadas
 */
class DuplicateCleanupService {
  
  /**
   * Analiza viviendas duplicadas sin eliminarlas
   */
  async analyzeDuplicates() {
    try {
      const duplicatesQuery = `
        SELECT 
          UrlReferencia,
          COUNT(*) as count,
          GROUP_CONCAT(Id) as ids,
          GROUP_CONCAT(Name) as names
        FROM Vivienda 
        WHERE EstadoVenta = 'Pendiente' 
          AND UrlReferencia IS NOT NULL 
          AND UrlReferencia != ''
        GROUP BY UrlReferencia 
        HAVING COUNT(*) > 1
        ORDER BY COUNT(*) DESC
      `;
      
      const result = await db.execute(duplicatesQuery);
      
      if (!result.rows || result.rows.length === 0) {
        return {
          found: false,
          duplicateUrls: 0,
          totalDuplicates: 0,
          details: []
        };
      }
      
      let totalDuplicates = 0;
      const details = [];
      
      for (const row of result.rows) {
        const ids = row.ids.split(',');
        const names = row.names.split(',');
        
        totalDuplicates += (row.count - 1); // No contamos el que vamos a mantener
        
        details.push({
          url: row.UrlReferencia,
          count: row.count,
          toDelete: row.count - 1,
          properties: ids.map((id, index) => ({
            id: id.trim(),
            name: names[index]?.trim() || 'Sin nombre'
          }))
        });
      }
      
      return {
        found: true,
        duplicateUrls: result.rows.length,
        totalDuplicates,
        details
      };
      
    } catch (error) {
      logger.error('Error analizando duplicados:', error);
      throw error;
    }
  }
  
  /**
   * Verifica dependencias de una vivienda
   */
  async checkDependencies(viviendaId) {
    try {
      // Verificar mensajes
      const mensajes = await db.execute(
        'SELECT COUNT(*) as count FROM Mensaje WHERE ViviendaId = ?',
        [viviendaId]
      );
      
      // Verificar imágenes
      const imagenes = await db.execute(
        'SELECT COUNT(*) as count FROM ImagenesVivienda WHERE ViviendaId = ?',
        [viviendaId]
      );
      
      return {
        mensajes: mensajes.rows[0].count,
        imagenes: imagenes.rows[0].count
      };
      
    } catch (error) {
      logger.error(`Error verificando dependencias para ${viviendaId}:`, error);
      return { mensajes: 0, imagenes: 0 };
    }
  }
  
  /**
   * Elimina una vivienda de forma segura
   */
  async safeDeleteVivienda(viviendaId) {
    try {
      // 1. Eliminar mensajes asociados
      await db.execute(
        'DELETE FROM Mensaje WHERE ViviendaId = ?',
        [viviendaId]
      );
      
      // 2. Eliminar imágenes asociadas
      await db.execute(
        'DELETE FROM ImagenesVivienda WHERE ViviendaId = ?',
        [viviendaId]
      );
      
      // 3. Eliminar la vivienda
      const deleteResult = await db.execute(
        'DELETE FROM Vivienda WHERE Id = ?',
        [viviendaId]
      );
      
      return deleteResult.rowsAffected > 0;
      
    } catch (error) {
      logger.error(`Error eliminando vivienda ${viviendaId}:`, error);
      return false;
    }
  }
  
  /**
   * Ejecuta la limpieza de duplicados
   */
  async cleanDuplicates() {
    try {
      logger.info('🧹 Iniciando limpieza de viviendas duplicadas...');
      
      // Primero analizar
      const analysis = await this.analyzeDuplicates();
      
      if (!analysis.found) {
        return {
          success: true,
          message: 'No se encontraron duplicados para limpiar',
          deleted: 0,
          errors: 0,
          details: []
        };
      }
      
      let deleted = 0;
      let errors = 0;
      const details = [];
      
      for (const group of analysis.details) {
        const { url, properties } = group;
        
        // Ordenar por ID para mantener consistencia (mantener el primero alfabéticamente)
        const sortedProperties = [...properties].sort((a, b) => a.id.localeCompare(b.id));
        
        // Mantener el primero, eliminar el resto
        const toKeep = sortedProperties[0];
        const toDelete = sortedProperties.slice(1);
        
        details.push({
          url,
          kept: toKeep,
          deleted: []
        });
        
        logger.info(`🔗 Procesando URL: ${url}`);
        logger.info(`   🛡️  Manteniendo: ${toKeep.name} (${toKeep.id})`);
        
        for (const property of toDelete) {
          logger.info(`   🗑️  Eliminando: ${property.name} (${property.id})`);
          
          const success = await this.safeDeleteVivienda(property.id);
          
          if (success) {
            deleted++;
            details[details.length - 1].deleted.push({
              ...property,
              success: true
            });
            logger.info(`   ✅ Eliminado exitosamente: ${property.name}`);
          } else {
            errors++;
            details[details.length - 1].deleted.push({
              ...property,
              success: false
            });
            logger.error(`   ❌ Error eliminando: ${property.name}`);
          }
        }
      }
      
      logger.info(`🎉 Limpieza completada: ${deleted} eliminadas, ${errors} errores`);
      
      return {
        success: true,
        message: `Limpieza completada: ${deleted} viviendas eliminadas`,
        deleted,
        errors,
        details
      };
      
    } catch (error) {
      logger.error('Error durante la limpieza de duplicados:', error);
      return {
        success: false,
        message: `Error durante la limpieza: ${error.message}`,
        deleted: 0,
        errors: 1,
        details: []
      };
    }
  }
}

export default new DuplicateCleanupService();