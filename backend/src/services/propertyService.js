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
      
      // Procesar y limpiar datos antes de crear la propiedad
      const cleanedData = this.processPropertyData(propertyData);
      
      const newProperty = await viviendaRepository.create(cleanedData);
      
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
      
      // Merge con datos existentes y procesar
      const mergedData = {
        ...existingProperty,
        ...propertyData
      };
      
      const cleanedData = this.processPropertyData(mergedData);
      const updatedProperty = await viviendaRepository.update(id, cleanedData);
      
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

  /**
   * Procesa y limpia los datos de la propiedad antes de guardar
   */
  processPropertyData(propertyData) {
    const processed = { ...propertyData };

    // Limpiar y normalizar todos los campos
    Object.keys(processed).forEach(key => {
      const value = processed[key];
      
      // Convertir strings vacíos a null
      if (value === '' || value === 'undefined' || value === 'null') {
        processed[key] = null;
      }
      
      // Eliminar campos undefined
      if (value === undefined) {
        processed[key] = null;
      }
    });

    // Campos de texto opcionales - pueden ser null
    const optionalStringFields = ['shortDescription', 'description', 'provincia', 'calle', 'numero', 'tipoVivienda', 'estado', 'planta', 'tipoAnuncio'];
    optionalStringFields.forEach(field => {
      if (!processed[field] || processed[field] === '') {
        processed[field] = null;
      }
    });

    // Campos de texto obligatorios - deben tener valor
    const requiredStringFields = ['name', 'poblacion'];
    requiredStringFields.forEach(field => {
      if (!processed[field] || processed[field] === '') {
        processed[field] = processed[field] || '';
      }
    });

    // Campos numéricos - convertir y validar
    const numericFields = ['rooms', 'bathRooms', 'garage'];
    numericFields.forEach(field => {
      const val = processed[field];
      if (val === null || val === '' || val === undefined || isNaN(val)) {
        processed[field] = 0;
      } else {
        processed[field] = parseInt(val, 10) || 0;
      }
    });

    // Campos numéricos opcionales - pueden ser null
    if (processed.squaredMeters === null || processed.squaredMeters === '' || processed.squaredMeters === undefined) {
      processed.squaredMeters = null;
    } else {
      processed.squaredMeters = parseInt(processed.squaredMeters, 10) || null;
    }

    // Precio - obligatorio, debe ser número válido
    if (typeof processed.price === 'string') {
      processed.price = parseFloat(processed.price) || 0;
    }
    processed.price = Number(processed.price) || 0;

    // Asegurar que características sea un array válido
    if (!Array.isArray(processed.caracteristicas)) {
      processed.caracteristicas = [];
    }
    
    // Filtrar características vacías o inválidas
    processed.caracteristicas = processed.caracteristicas.filter(c => c && typeof c === 'string' && c.trim() !== '');

    // Valores booleanos y por defecto
    processed.published = Boolean(processed.published);
    processed.estadoVenta = processed.estadoVenta || 'Disponible';

    // Log completo de los datos procesados
    logger.info('🔧 Datos completamente procesados:', {
      name: `${processed.name} (${typeof processed.name})`,
      price: `${processed.price} (${typeof processed.price})`,
      rooms: `${processed.rooms} (${typeof processed.rooms})`,
      bathRooms: `${processed.bathRooms} (${typeof processed.bathRooms})`,
      garage: `${processed.garage} (${typeof processed.garage})`,
      squaredMeters: `${processed.squaredMeters} (${typeof processed.squaredMeters})`,
      poblacion: `${processed.poblacion} (${typeof processed.poblacion})`,
      caracteristicas: processed.caracteristicas,
      published: `${processed.published} (${typeof processed.published})`
    });

    return processed;
  }

  /**
   * Obtiene las imágenes de una propiedad
   */
  async getPropertyImages(propertyId) {
    try {
      logger.info(`Obteniendo imágenes para propiedad: ${propertyId}`);
      
      const property = await viviendaRepository.findById(propertyId);
      if (!property) {
        const error = new Error('Propiedad no encontrada');
        error.statusCode = 404;
        throw error;
      }

      return property.imagenes || [];
    } catch (error) {
      logger.error('Error en PropertyService.getPropertyImages:', error);
      throw error;
    }
  }

  /**
   * Añade imágenes a una propiedad
   */
  async addPropertyImages(propertyId, images) {
    try {
      logger.info(`Añadiendo imágenes a propiedad: ${propertyId}`, images);
      
      const result = await imagenesViviendaRepository.addImagesToProperty(propertyId, images);
      
      logger.info(`Imágenes añadidas exitosamente a propiedad: ${propertyId}`);
      return result;
    } catch (error) {
      logger.error('Error en PropertyService.addPropertyImages:', error);
      throw error;
    }
  }

  /**
   * Reordena las imágenes de una propiedad
   */
  async reorderPropertyImages(propertyId, imageOrders) {
    try {
      logger.info(`Reordenando imágenes para propiedad: ${propertyId}`, imageOrders);
      
      // Verificar que la propiedad existe
      const property = await viviendaRepository.findById(propertyId);
      if (!property) {
        const error = new Error('Propiedad no encontrada');
        error.statusCode = 404;
        throw error;
      }

      // Actualizar orden de las imágenes
      const result = await imagenesViviendaRepository.updateImageOrders(propertyId, imageOrders);
      
      logger.info(`Imágenes reordenadas exitosamente para propiedad: ${propertyId}`);
      return result;
    } catch (error) {
      logger.error('Error en PropertyService.reorderPropertyImages:', error);
      throw error;
    }
  }

  /**
   * Elimina una imagen de una propiedad
   */
  async deletePropertyImage(propertyId, imageId) {
    try {
      logger.info(`Eliminando imagen ${imageId} de propiedad: ${propertyId}`);
      
      const result = await imagenesViviendaRepository.deleteImage(imageId);
      
      if (!result) {
        const error = new Error('Imagen no encontrada');
        error.statusCode = 404;
        throw error;
      }

      logger.info(`Imagen eliminada exitosamente: ${imageId}`);
      return result;
    } catch (error) {
      logger.error('Error en PropertyService.deletePropertyImage:', error);
      throw error;
    }
  }
}

// Exportar instancia singleton
export default new PropertyService();