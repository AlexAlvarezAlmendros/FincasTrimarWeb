import propertyService from '../services/propertyService.js';
import { logger } from '../utils/logger.js';

/**
 * Controlador para gestión de viviendas
 * Sigue la nomenclatura camelCase para archivos
 */

const propertyController = {
  /**
   * GET /api/v1/properties
   * Obtiene lista de propiedades con filtros opcionales
   */
  async getProperties(req, res, next) {
    try {
      const filters = req.query;
      const properties = await propertyService.searchProperties(filters);
      
      res.json({
        success: true,
        data: properties,
        count: properties.length
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
      
      if (!property) {
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
      const results = await propertyService.searchProperties(filters);
      
      res.json({
        success: true,
        data: results,
        count: results.length
      });
    } catch (error) {
      logger.error('Error searching properties:', error);
      next(error);
    }
  },

  /**
   * POST /api/v1/properties
   * Crea nueva propiedad
   */
  async createProperty(req, res, next) {
    try {
      const propertyData = req.body;
      const newProperty = await propertyService.createProperty(propertyData);
      
      res.status(201).json({
        success: true,
        data: newProperty
      });
    } catch (error) {
      logger.error('Error creating property:', error);
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
   * Elimina propiedad
   */
  async deleteProperty(req, res, next) {
    try {
      const { id } = req.params;
      await propertyService.deleteProperty(id);
      
      res.json({
        success: true,
        message: 'Propiedad eliminada correctamente'
      });
    } catch (error) {
      logger.error('Error deleting property:', error);
      next(error);
    }
  }
};

export default propertyController;