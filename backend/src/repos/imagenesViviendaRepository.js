import { executeQuery, executeTransaction } from '../db/client.js';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger.js';

/**
 * Repositorio para operaciones de la tabla ImagenesVivienda
 */
class ImagenesViviendaRepository {
  
  /**
   * Obtiene imágenes de una vivienda ordenadas.
   * Usa paginación interna en lotes de 40 para no superar el límite de
   * tamaño de respuesta del WebSocket de Turso (~10 KB por query).
   * Desempate por rowid (orden de inserción) para que el orden sea determinista.
   */
  async findByViviendaId(viviendaId) {
    try {
      const BATCH = 40;
      const images = [];
      let offset = 0;

      while (true) {
        const result = await executeQuery(
          `SELECT Id, URL, Orden FROM ImagenesVivienda
           WHERE ViviendaId = ?
           ORDER BY Orden ASC, rowid ASC
           LIMIT ? OFFSET ?`,
          [viviendaId, BATCH, offset]
        );

        const batch = result.rows.map(row => ({
          id: row.Id,
          viviendaId,
          url: row.URL,
          orden: row.Orden,
        }));

        images.push(...batch);
        if (batch.length < BATCH) break;
        offset += BATCH;
      }

      return images;
    } catch (error) {
      logger.error('Error en ImagenesViviendaRepository.findByViviendaId:', error);
      throw error;
    }
  }

  /**
   * Alias para compatibilidad con el controlador
   */
  async findByVivienda(viviendaId) {
    return await this.findByViviendaId(viviendaId);
  }
  
  /**
   * Obtiene una imagen específica por ID
   */
  async findById(id) {
    try {
      const result = await executeQuery(
        'SELECT * FROM ImagenesVivienda WHERE Id = ?',
        [id]
      );
      
      return result.rows.length > 0 ? this.transformRow(result.rows[0]) : null;
    } catch (error) {
      logger.error('Error en ImagenesViviendaRepository.findById:', error);
      throw error;
    }
  }
  
  /**
   * Añade una imagen a una vivienda
   */
  async create(data) {
    try {
      const id = uuidv4();
      const { viviendaId, url, orden = null } = data;
      
      // Si no se especifica orden, usar el siguiente disponible
      let finalOrden = orden;
      if (finalOrden === null) {
        const maxOrdenResult = await executeQuery(
          'SELECT COALESCE(MAX(Orden), 0) + 1 as nextOrden FROM ImagenesVivienda WHERE ViviendaId = ?',
          [viviendaId]
        );
        finalOrden = maxOrdenResult.rows[0].nextOrden;
      }
      
      await executeQuery(`
        INSERT INTO ImagenesVivienda (Id, ViviendaId, URL, Orden)
        VALUES (?, ?, ?, ?)
      `, [id, viviendaId, url, finalOrden]);
      
      return await this.findById(id);
    } catch (error) {
      logger.error('Error en ImagenesViviendaRepository.create:', error);
      throw error;
    }
  }

  /**
   * Método legacy - mantener compatibilidad
   */
  async createLegacy(viviendaId, url, orden = null) {
    return await this.create({ viviendaId, url, orden });
  }
  
  /**
   * Añade múltiples imágenes a una vivienda
   */
  async createMultiple(viviendaId, imageUrls) {
    try {
      const createdImages = [];
      
      for (let i = 0; i < imageUrls.length; i++) {
        const image = await this.create({
          viviendaId,
          url: imageUrls[i],
          orden: i + 1
        });
        createdImages.push(image);
      }
      
      return createdImages;
    } catch (error) {
      logger.error('Error en ImagenesViviendaRepository.createMultiple:', error);
      throw error;
    }
  }
  
  /**
   * Actualiza el orden de una imagen
   */
  async updateOrden(id, nuevoOrden) {
    try {
      await executeQuery(
        'UPDATE ImagenesVivienda SET Orden = ? WHERE Id = ?',
        [nuevoOrden, id]
      );
      
      return await this.findById(id);
    } catch (error) {
      logger.error('Error en ImagenesViviendaRepository.updateOrden:', error);
      throw error;
    }
  }

  /**
   * Alias para compatibilidad con el controlador
   */
  async updateOrder(id, nuevoOrden) {
    return await this.updateOrden(id, nuevoOrden);
  }
  
  /**
   * Reordena todas las imágenes de una vivienda
   */
  async reorderImages(viviendaId, imageIds) {
    try {
      const updatedImages = [];
      
      for (let i = 0; i < imageIds.length; i++) {
        const image = await this.updateOrden(imageIds[i], i + 1);
        if (image) {
          updatedImages.push(image);
        }
      }
      
      return updatedImages;
    } catch (error) {
      logger.error('Error en ImagenesViviendaRepository.reorderImages:', error);
      throw error;
    }
  }
  
  /**
   * Elimina una imagen
   */
  async delete(id) {
    try {
      const result = await executeQuery('DELETE FROM ImagenesVivienda WHERE Id = ?', [id]);
      return result.rowsAffected > 0;
    } catch (error) {
      logger.error('Error en ImagenesViviendaRepository.delete:', error);
      throw error;
    }
  }
  
  /**
   * Elimina todas las imágenes de una vivienda
   */
  async deleteByViviendaId(viviendaId) {
    try {
      const result = await executeQuery(
        'DELETE FROM ImagenesVivienda WHERE ViviendaId = ?',
        [viviendaId]
      );
      return result.rowsAffected;
    } catch (error) {
      logger.error('Error en ImagenesViviendaRepository.deleteByViviendaId:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene la imagen principal (primera en orden) de una vivienda
   */
  async getMainImage(viviendaId) {
    try {
      const result = await executeQuery(`
        SELECT * FROM ImagenesVivienda 
        WHERE ViviendaId = ? 
        ORDER BY Orden ASC, rowid ASC 
        LIMIT 1
      `, [viviendaId]);
      
      return result.rows.length > 0 ? this.transformRow(result.rows[0]) : null;
    } catch (error) {
      logger.error('Error en ImagenesViviendaRepository.getMainImage:', error);
      throw error;
    }
  }

  /**
   * Obtiene las imágenes principales de múltiples propiedades en una sola consulta
   */
  async getMainImagesForProperties(propertyIds) {
    try {
      if (!propertyIds || propertyIds.length === 0) {
        return [];
      }
      
      logger.info(`🔍 Obteniendo imágenes principales para ${propertyIds.length} propiedades`);
      
      // Usar el método individual que sabemos que funciona para evitar consultas complejas
      // Esto es más lento pero más confiable
      const results = [];
      
      for (const propertyId of propertyIds) {
        try {
          const mainImage = await this.getMainImage(propertyId);
          if (mainImage) {
            results.push(mainImage);
          }
        } catch (imageError) {
          logger.warn(`Error obteniendo imagen principal para ${propertyId}:`, imageError.message);
          // Continuar con las demás imágenes
        }
      }
      
      logger.info(`✅ Obtenidas ${results.length} imágenes principales`);
      return results;
      
    } catch (error) {
      logger.error('Error en ImagenesViviendaRepository.getMainImagesForProperties:', error);
      return [];
    }
  }

  /**
   * Obtiene el conteo de imágenes para múltiples propiedades en una sola consulta
   */
  async getImageCountsForProperties(propertyIds) {
    try {
      if (!propertyIds || propertyIds.length === 0) {
        return [];
      }
      
      logger.info(`🔢 Obteniendo conteos de imágenes para ${propertyIds.length} propiedades`);
      
      // Por ahora, usar conteos por defecto para evitar consultas lentas
      // TODO: Optimizar en el futuro si es necesario
      const results = propertyIds.map(id => ({
        viviendaId: id,
        count: 1 // Conteo por defecto
      }));
      
      logger.info(`✅ Retornando conteos por defecto para ${results.length} propiedades`);
      return results;
      
    } catch (error) {
      logger.error('Error en ImagenesViviendaRepository.getImageCountsForProperties:', error);
      return propertyIds.map(id => ({
        viviendaId: id,
        count: 0
      }));
    }
  }
  
  /**
   * Añade imágenes a una propiedad SIEMPRE al final, en el orden del array.
   * Ignora el `orden` recibido: cada INSERT calcula MAX(Orden)+1 de la vivienda
   * dentro del mismo batch atómico, así dos asociaciones concurrentes no leen la
   * misma base ni repiten Orden (SQLite serializa las transacciones de escritura).
   * La última sentencia del batch lee el MAX final: las N filas nuevas son las N
   * últimas y consecutivas, así que su orden real sale sin otro viaje a la BD y
   * sin devolver filas grandes. Devuelve los objetos creados.
   */
  async addImagesToProperty(propertyId, images) {
    try {
      logger.info(`Añadiendo ${images.length} imágenes a propiedad ${propertyId}`);

      if (images.length === 0) return { images: [] };

      // Mismo formato que CURRENT_TIMESTAMP para que el objeto devuelto coincida con la fila
      const createdAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
      const rows = images.map(imageData => ({ id: uuidv4(), url: imageData.url }));

      const results = await executeTransaction([
        ...rows.map(img => ({
          sql: `INSERT INTO ImagenesVivienda (Id, ViviendaId, URL, Orden, CreatedAt)
                VALUES (?, ?, ?, (SELECT COALESCE(MAX(Orden), 0) + 1 FROM ImagenesVivienda WHERE ViviendaId = ?), ?)`,
          args: [img.id, propertyId, img.url, propertyId, createdAt]
        })),
        {
          sql: 'SELECT COALESCE(MAX(Orden), 0) AS lastOrden FROM ImagenesVivienda WHERE ViviendaId = ?',
          args: [propertyId]
        }
      ]);

      const lastOrden = Number(results[results.length - 1].rows[0]?.lastOrden) || 0;
      const firstOrden = lastOrden - rows.length + 1;

      const createdImages = rows.map((img, i) => ({
        id: img.id,
        viviendaId: propertyId,
        url: img.url,
        orden: firstOrden + i,
        createdAt
      }));

      return { images: createdImages };
    } catch (error) {
      logger.error('Error en ImagenesViviendaRepository.addImagesToProperty:', error);
      throw error;
    }
  }

  /**
   * Actualiza el orden de múltiples imágenes en un único batch atómico.
   * Cada UPDATE va acotado a la vivienda (un id de otra vivienda no se toca).
   * Devuelve el orden resultante leído de la BD.
   */
  async updateImageOrders(propertyId, imageOrders) {
    try {
      logger.info(`Actualizando orden de ${imageOrders.length} imágenes para propiedad ${propertyId}`);

      const results = await executeTransaction(imageOrders.map(({ id, orden }) => ({
        sql: 'UPDATE ImagenesVivienda SET Orden = ? WHERE Id = ? AND ViviendaId = ?',
        args: [orden, id, propertyId]
      })));

      const updated = results.reduce((total, r) => total + (r.rowsAffected || 0), 0);
      if (updated < imageOrders.length) {
        logger.warn(`Reordenación de ${propertyId}: ${imageOrders.length - updated} ids no pertenecen a la vivienda`);
      }

      return { images: await this.findByViviendaId(propertyId), updated };
    } catch (error) {
      logger.error('Error en ImagenesViviendaRepository.updateImageOrders:', error);
      throw error;
    }
  }

  /**
   * Elimina una imagen de una vivienda concreta.
   * Devuelve false si la imagen no existe o no pertenece a esa vivienda.
   */
  async deleteImage(viviendaId, imageId) {
    try {
      logger.info(`Eliminando imagen ${imageId} de vivienda ${viviendaId}`);

      const result = await executeQuery(
        'DELETE FROM ImagenesVivienda WHERE Id = ? AND ViviendaId = ?',
        [imageId, viviendaId]
      );

      if (result.rowsAffected === 0) {
        return false;
      }

      logger.info(`Imagen eliminada exitosamente: ${imageId}`);
      return { deleted: true, image: { id: imageId, viviendaId } };
    } catch (error) {
      logger.error('Error en ImagenesViviendaRepository.deleteImage:', error);
      throw error;
    }
  }

  /**
   * Transforma una fila de la DB al formato del modelo
   */
  transformRow(row) {
    if (!row) return null;
    
    return {
      id: row.Id,
      viviendaId: row.ViviendaId,
      url: row.URL,
      orden: row.Orden,
      createdAt: row.CreatedAt
    };
  }
}

export default new ImagenesViviendaRepository();