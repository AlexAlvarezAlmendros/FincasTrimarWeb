import viviendaRepository from '../repos/viviendaRepository.js';
import imagenesViviendaRepository from '../repos/imagenesViviendaRepository.js';
import { logger } from '../utils/logger.js';

/**
 * Servicio para gestión de viviendas
 * Implementa la lógica de negocio para las operaciones de propiedades
 */
class PropertyService {
  
  /**
   * Busca propiedades según los filtros especificados
   */
  async searchProperties(filters = {}) {
    try {
      logger.info('Buscando propiedades con filtros:', filters);
      
      const result = await viviendaRepository.findAll({
        q: filters.q,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        rooms: filters.rooms,
        bathRooms: filters.bathRooms,
        tipoInmueble: filters.tipoInmueble,
        tipoVivienda: filters.tipoVivienda,
        provincia: filters.provincia,
        poblacion: filters.poblacion,
        published: filters.published !== undefined ? filters.published : true,
        page: filters.page || 1,
        pageSize: filters.pageSize || 20
      });
      
      // Agregar imagen principal a cada propiedad
      for (const property of result.data) {
        const mainImage = await imagenesViviendaRepository.getMainImage(property.id);
        property.mainImage = mainImage?.url || null;
        property.imageCount = (await imagenesViviendaRepository.findByViviendaId(property.id)).length;
      }
      
      return result;
    } catch (error) {
      logger.error('Error en PropertyService.searchProperties:', error);
      throw error;
    }
  }

  /**
   * Obtiene una propiedad por ID con todas sus imágenes
   */
  async getPropertyById(id) {
    try {
      logger.info(`Obteniendo propiedad con ID: ${id}`);
      
      const property = await viviendaRepository.findById(id);
      
      if (!property) {
        const error = new Error('Propiedad no encontrada');
        error.statusCode = 404;
        error.code = 'PROPERTY_NOT_FOUND';
        throw error;
      }
      
      // Las imágenes ya vienen incluidas en findById del repository
      return property;
    } catch (error) {
      logger.error('Error en PropertyService.getPropertyById:', error);
      throw error;
    }
  }

  /**
   * Crea una nueva propiedad
   */
  async createProperty(propertyData) {
    try {
      logger.info('🏠 Iniciando creación de propiedad con datos:', JSON.stringify(propertyData, null, 2));
      
      // Validaciones de negocio
      logger.info(`🔍 Validando nombre: "${propertyData.name}" (longitud: ${propertyData.name?.length || 0})`);
      if (!propertyData.name || propertyData.name.trim().length < 5) {
        const error = new Error('El nombre de la propiedad debe tener al menos 5 caracteres');
        error.statusCode = 400;
        error.code = 'INVALID_PROPERTY_NAME';
        logger.error('❌ Validación falló: nombre inválido');
        throw error;
      }
      
      logger.info(`🔍 Validando precio: ${propertyData.price} (tipo: ${typeof propertyData.price})`);
      if (!propertyData.price || propertyData.price <= 0) {
        const error = new Error('El precio debe ser mayor a cero');
        error.statusCode = 400;
        error.code = 'INVALID_PRICE';
        logger.error('❌ Validación falló: precio inválido');
        throw error;
      }
      
      // Por defecto, las propiedades nuevas no están publicadas
      propertyData.published = propertyData.published || false;
      propertyData.estadoVenta = propertyData.estadoVenta || 'Disponible';
      
      const newProperty = await viviendaRepository.create(propertyData);
      
      logger.info(`Propiedad creada exitosamente con ID: ${newProperty.id}`);
      return newProperty;
    } catch (error) {
      logger.error('Error en PropertyService.createProperty:', error);
      throw error;
    }
  }

  /**
   * Actualiza una propiedad existente
   */
  async updateProperty(id, propertyData) {
    try {
      logger.info(`Actualizando propiedad ID: ${id}`);
      
      // Verificar que la propiedad existe
      const existingProperty = await viviendaRepository.findById(id);
      if (!existingProperty) {
        const error = new Error('Propiedad no encontrada');
        error.statusCode = 404;
        error.code = 'PROPERTY_NOT_FOUND';
        throw error;
      }
      
      // Validaciones de negocio
      if (propertyData.name && propertyData.name.trim().length < 5) {
        const error = new Error('El nombre de la propiedad debe tener al menos 5 caracteres');
        error.statusCode = 400;
        error.code = 'INVALID_PROPERTY_NAME';
        throw error;
      }
      
      if (propertyData.price !== undefined && propertyData.price <= 0) {
        const error = new Error('El precio debe ser mayor a cero');
        error.statusCode = 400;
        error.code = 'INVALID_PRICE';
        throw error;
      }
      
      // Merge con datos existentes
      const updateData = {
        ...existingProperty,
        ...propertyData
      };
      
      const updatedProperty = await viviendaRepository.update(id, updateData);
      
      logger.info(`Propiedad actualizada exitosamente: ${id}`);
      return updatedProperty;
    } catch (error) {
      logger.error('Error en PropertyService.updateProperty:', error);
      throw error;
    }
  }

  /**
   * Elimina una propiedad
   */
  async deleteProperty(id) {
    try {
      logger.info(`Eliminando propiedad ID: ${id}`);
      
      // Verificar que la propiedad existe
      const existingProperty = await viviendaRepository.findById(id);
      if (!existingProperty) {
        const error = new Error('Propiedad no encontrada');
        error.statusCode = 404;
        error.code = 'PROPERTY_NOT_FOUND';
        throw error;
      }
      
      // Las imágenes se eliminan automáticamente por CASCADE
      const deleted = await viviendaRepository.delete(id);
      
      if (deleted) {
        logger.info(`Propiedad eliminada exitosamente: ${id}`);
      }
      
      return deleted;
    } catch (error) {
      logger.error('Error en PropertyService.deleteProperty:', error);
      throw error;
    }
  }
  
  /**
   * Cambia el estado de publicación de una propiedad
   */
  async togglePublishStatus(id, published) {
    try {
      logger.info(`Cambiando estado de publicación para propiedad ${id} a: ${published}`);
      
      const updatedProperty = await viviendaRepository.updatePublishStatus(id, published);
      
      if (!updatedProperty) {
        const error = new Error('Propiedad no encontrada');
        error.statusCode = 404;
        error.code = 'PROPERTY_NOT_FOUND';
        throw error;
      }
      
      return updatedProperty;
    } catch (error) {
      logger.error('Error en PropertyService.togglePublishStatus:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene propiedades similares a una dada
   */
  async getSimilarProperties(propertyId, limit = 4) {
    try {
      const property = await viviendaRepository.findById(propertyId);
      
      if (!property) {
        return [];
      }
      
      // Buscar propiedades similares basándose en ubicación y tipo
      const similarProperties = await viviendaRepository.findAll({
        poblacion: property.poblacion,
        tipoVivienda: property.tipoVivienda,
        tipoAnuncio: property.tipoAnuncio,
        published: true,
        pageSize: limit + 1 // +1 para excluir la propiedad actual
      });
      
      // Filtrar la propiedad actual y agregar imágenes principales
      const filtered = similarProperties.data.filter(p => p.id !== propertyId);
      
      for (const prop of filtered.slice(0, limit)) {
        const mainImage = await imagenesViviendaRepository.getMainImage(prop.id);
        prop.mainImage = mainImage?.url || null;
      }
      
      return filtered.slice(0, limit);
    } catch (error) {
      logger.error('Error en PropertyService.getSimilarProperties:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene estadísticas básicas de propiedades
   */
  async getStats() {
    try {
      const published = await viviendaRepository.findAll({ published: true, pageSize: 1 });
      const drafts = await viviendaRepository.findAll({ published: false, pageSize: 1 });
      const forSale = await viviendaRepository.findAll({ tipoAnuncio: 'Venta', published: true, pageSize: 1 });
      const forRent = await viviendaRepository.findAll({ tipoAnuncio: 'Alquiler', published: true, pageSize: 1 });
      
      return {
        total: published.pagination.total + drafts.pagination.total,
        published: published.pagination.total,
        drafts: drafts.pagination.total,
        forSale: forSale.pagination.total,
        forRent: forRent.pagination.total
      };
    } catch (error) {
      logger.error('Error en PropertyService.getStats:', error);
      throw error;
    }
  }
}

// Exportar instancia singleton
export default new PropertyService();