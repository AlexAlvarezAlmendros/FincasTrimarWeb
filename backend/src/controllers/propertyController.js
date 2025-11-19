import propertyService from '../services/propertyService.js';
import { logger } from '../utils/logger.js';

/**
 * Controlador para gestión de viviendas
 * Maneja las peticiones HTTP para las operaciones de propiedades
 */

const propertyController = {
  /**
   * GET /api/v1/properties
   * Obtiene lista de propiedades con filtros opcionales
   */
  async getProperties(req, res, next) {
    try {
      const filters = {
        q: req.query.q,
        minPrice: req.query.minPrice ? parseInt(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? parseInt(req.query.maxPrice) : undefined,
        rooms: req.query.rooms ? parseInt(req.query.rooms) : undefined,
        bathRooms: req.query.bathRooms ? parseInt(req.query.bathRooms) : undefined,
        tipoInmueble: req.query.tipoInmueble,
        tipoVivienda: req.query.tipoVivienda,
        provincia: req.query.provincia,
        poblacion: req.query.poblacion,
        published: req.query.published !== undefined ? req.query.published === 'true' : true,
        page: req.query.page ? parseInt(req.query.page) : 1,
        pageSize: req.query.pageSize ? parseInt(req.query.pageSize) : 20
      };
      
      const result = await propertyService.searchProperties(filters);
      
      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      logger.error('Error getting properties:', error);
      next(error);
    }
  },

  /**
   * GET /api/v1/properties/drafts
   * Obtiene lista de borradores (requiere autenticación)
   */
  async getDrafts(req, res, next) {
    try {
      const filters = {
        q: req.query.q,
        page: req.query.page ? parseInt(req.query.page) : 1,
        pageSize: req.query.pageSize ? parseInt(req.query.pageSize) : 20
      };
      
      const result = await propertyService.getDrafts(filters);
      
      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      logger.error('Error getting drafts:', error);
      next(error);
    }
  },

  /**
   * GET /api/v1/properties/:id
   * Obtiene una propiedad por ID
   */
  async getPropertyById(req, res, next) {
    try {
      const { id } = req.params;
      const property = await propertyService.getPropertyById(id);

      res.json({
        success: true,
        data: property
      });
    } catch (error) {
      logger.error('Error getting property by ID:', error);
      next(error);
    }
  },

  /**
   * POST /api/v1/properties/search
   * Búsqueda avanzada de propiedades
   */
  async searchProperties(req, res, next) {
    try {
      const filters = req.body;
      const result = await propertyService.searchProperties(filters);
      
      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      logger.error('Error searching properties:', error);
      next(error);
    }
  },

  /**
   * GET /api/v1/properties/:id/similar
   * Obtiene propiedades similares
   */
  async getSimilarProperties(req, res, next) {
    try {
      const { id } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit) : 4;
      
      const similarProperties = await propertyService.getSimilarProperties(id, limit);
      
      res.json({
        success: true,
        data: similarProperties
      });
    } catch (error) {
      logger.error('Error getting similar properties:', error);
      next(error);
    }
  },

  /**
   * GET /api/v1/properties/stats
   * Obtiene estadísticas de propiedades
   */
  async getStats(req, res, next) {
    try {
      const stats = await propertyService.getStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Error getting property stats:', error);
      next(error);
    }
  },

  /**
   * POST /api/v1/properties
   * Crea nueva propiedad
   */
  async createProperty(req, res, next) {
    try {
      logger.info('📥 Recibida petición createProperty');
      logger.info('🔍 Body recibido:', JSON.stringify(req.body, null, 2));
      logger.info('🔍 Content-Type:', req.headers['content-type']);
      
      const propertyData = req.body;
      const newProperty = await propertyService.createProperty(propertyData);
      
      res.status(201).json({
        success: true,
        data: newProperty
      });
    } catch (error) {
      logger.error('❌ Error creating property:', error);
      next(error);
    }
  },

  /**
   * PUT /api/v1/properties/:id
   * Actualiza propiedad existente
   */
  async updateProperty(req, res, next) {
    try {
      const { id } = req.params;
      const propertyData = req.body;
      
      const updatedProperty = await propertyService.updateProperty(id, propertyData);
      
      res.json({
        success: true,
        data: updatedProperty
      });
    } catch (error) {
      logger.error('Error updating property:', error);
      next(error);
    }
  },

  /**
   * DELETE /api/v1/properties/:id
   * Elimina propiedad (solo Admin)
   */
  async deleteProperty(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await propertyService.deleteProperty(id);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'PROPERTY_NOT_FOUND',
            message: 'Propiedad no encontrada'
          }
        });
      }
      
      res.json({
        success: true,
        message: 'Propiedad eliminada correctamente'
      });
    } catch (error) {
      logger.error('Error deleting property:', error);
      next(error);
    }
  },

  /**
   * PATCH /api/v1/properties/:id/publish
   * Cambia el estado de publicación de una propiedad
   */
  async togglePublish(req, res, next) {
    try {
      const { id } = req.params;
      const { published } = req.body;
      
      const updatedProperty = await propertyService.togglePublishStatus(id, published);
      
      res.json({
        success: true,
        data: updatedProperty,
        message: `Propiedad ${published ? 'publicada' : 'despublicada'} correctamente`
      });
    } catch (error) {
      logger.error('Error toggling publish status:', error);
      next(error);
    }
  },

  /**
   * Obtener imágenes de una propiedad
   */
  async getPropertyImages(req, res, next) {
    try {
      const { id } = req.params;
      const images = await propertyService.getPropertyImages(id);
      
      res.json({
        success: true,
        data: { images }
      });
    } catch (error) {
      logger.error('Error getting property images:', error);
      next(error);
    }
  },

  /**
   * Añadir imágenes a una propiedad
   */
  async addPropertyImages(req, res, next) {
    try {
      const { id } = req.params;
      const { images } = req.body;
      
      const result = await propertyService.addPropertyImages(id, images);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error adding property images:', error);
      next(error);
    }
  },

  /**
   * Reordenar imágenes de una propiedad
   */
  async reorderPropertyImages(req, res, next) {
    try {
      const { id } = req.params;
      const { imageOrders } = req.body;
      
      logger.info(`🔄 Reordenando imágenes para propiedad ${id}:`, imageOrders);
      
      const result = await propertyService.reorderPropertyImages(id, imageOrders);
      
      res.json({
        success: true,
        data: result,
        message: 'Imágenes reordenadas correctamente'
      });
    } catch (error) {
      logger.error('Error reordering property images:', error);
      next(error);
    }
  },

  /**
   * Eliminar imagen de una propiedad
   */
  async deletePropertyImage(req, res, next) {
    try {
      const { id, imageId } = req.params;
      
      const result = await propertyService.deletePropertyImage(id, imageId);
      
      res.json({
        success: true,
        data: result,
        message: 'Imagen eliminada correctamente'
      });
    } catch (error) {
      logger.error('Error deleting property image:', error);
      next(error);
    }
  },

  /**
   * GET /api/v1/properties/captacion
   * Obtiene propiedades en proceso de captación (requiere autenticación)
   */
  async getCaptacionProperties(req, res, next) {
    try {
      const filters = {
        q: req.query.q,
        estadoVenta: req.query.estadoVenta,
        minPrice: req.query.minPrice ? parseInt(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? parseInt(req.query.maxPrice) : undefined,
        tipoInmueble: req.query.tipoInmueble,
        tipoVivienda: req.query.tipoVivienda,
        provincia: req.query.provincia,
        poblacion: req.query.poblacion,
        captadoPor: req.query.captadoPor,
        sinCaptador: req.query.sinCaptador === 'true', // Flag para viviendas sin captador asignado
        sortBy: req.query.sortBy, // Parámetro de ordenación
        page: req.query.page ? parseInt(req.query.page) : 1,
        pageSize: req.query.pageSize ? parseInt(req.query.pageSize) : 20
      };
      
      const result = await propertyService.getCaptacionProperties(filters);
      
      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      logger.error('Error getting captacion properties:', error);
      next(error);
    }
  },

  /**
   * PATCH /api/v1/properties/:id/captacion
   * Actualiza datos de captación de una propiedad (requiere autenticación)
   */
  async updateCaptacionData(req, res, next) {
    try {
      const { id } = req.params;
      const captacionData = req.body;
      
      const updatedProperty = await propertyService.updateCaptacionData(id, captacionData);
      
      res.json({
        success: true,
        data: updatedProperty,
        message: 'Datos de captación actualizados correctamente'
      });
    } catch (error) {
      logger.error('Error updating captacion data:', error);
      next(error);
    }
  }
};

export default propertyController;