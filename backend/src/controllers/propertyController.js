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
  }
};

export default propertyController;