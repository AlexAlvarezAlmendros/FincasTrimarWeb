import { executeQuery } from '../db/client.js';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger.js';

/**
 * Repositorio para operaciones de la tabla ImagenesVivienda
 */
class ImagenesViviendaRepository {
  
  /**
   * Obtiene imágenes de una vivienda ordenadas
   */
  async findByViviendaId(viviendaId) {
    try {
      const result = await executeQuery(`
        SELECT * FROM ImagenesVivienda 
        WHERE ViviendaId = ? 
        ORDER BY Orden ASC
      `, [viviendaId]);
      
      return result.rows.map(this.transformRow);
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
        ORDER BY Orden ASC 
        LIMIT 1
      `, [viviendaId]);
      
      return result.rows.length > 0 ? this.transformRow(result.rows[0]) : null;
    } catch (error) {
      logger.error('Error en ImagenesViviendaRepository.getMainImage:', error);
      throw error;
    }
  }
  
  /**
   * Añade imágenes a una propiedad
   */
  async addImagesToProperty(propertyId, images) {
    try {
      logger.info(`Añadiendo ${images.length} imágenes a propiedad ${propertyId}`);
      
      const createdImages = [];
      
      for (const imageData of images) {
        const image = await this.create({
          viviendaId: propertyId,
          url: imageData.url,
          orden: imageData.orden || null
        });
        createdImages.push(image);
      }
      
      return { images: createdImages };
    } catch (error) {
      logger.error('Error en ImagenesViviendaRepository.addImagesToProperty:', error);
      throw error;
    }
  }

  /**
   * Actualiza el orden de múltiples imágenes
   */
  async updateImageOrders(propertyId, imageOrders) {
    try {
      logger.info(`Actualizando orden de imágenes para propiedad ${propertyId}:`, imageOrders);
      
      const updatedImages = [];
      
      for (const orderData of imageOrders) {
        const { id, orden } = orderData;
        const image = await this.updateOrden(id, orden);
        if (image) {
          updatedImages.push(image);
        }
      }
      
      logger.info(`Orden actualizado para ${updatedImages.length} imágenes`);
      return { images: updatedImages };
    } catch (error) {
      logger.error('Error en ImagenesViviendaRepository.updateImageOrders:', error);
      throw error;
    }
  }

  /**
   * Elimina una imagen
   */
  async deleteImage(imageId) {
    try {
      logger.info(`Eliminando imagen: ${imageId}`);
      
      const image = await this.findById(imageId);
      if (!image) {
        return false;
      }
      
      const deleted = await this.delete(imageId);
      
      if (deleted) {
        logger.info(`Imagen eliminada exitosamente: ${imageId}`);
        return { deleted: true, image };
      }
      
      return false;
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