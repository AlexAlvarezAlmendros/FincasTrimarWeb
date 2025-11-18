import dashboardService from '../services/dashboardService.js';
import { logger } from '../utils/logger.js';

/**
 * Controlador para el dashboard administrativo
 * Maneja las peticiones HTTP para estadísticas y métricas
 */
const dashboardController = {
  
  /**
   * GET /api/v1/dashboard/stats
   * Obtiene estadísticas generales del dashboard
   */
  async getDashboardStats(req, res, next) {
    try {
      logger.info('📊 Obteniendo estadísticas del dashboard');
      
      const stats = await dashboardService.getDashboardStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('❌ Error getting dashboard stats:', error);
      next(error);
    }
  },

  /**
   * GET /api/v1/dashboard/monthly-sales
   * Obtiene ventas mensuales
   */
  async getMonthlySales(req, res, next) {
    try {
      logger.info('📈 Obteniendo ventas mensuales');
      
      const monthlySales = await dashboardService.getMonthlySales();
      
      res.json({
        success: true,
        data: monthlySales
      });
    } catch (error) {
      logger.error('❌ Error getting monthly sales:', error);
      next(error);
    }
  },

  /**
   * GET /api/v1/dashboard/property-types
   * Obtiene estadísticas por tipo de propiedad
   */
  async getPropertyTypeStats(req, res, next) {
    try {
      logger.info('🏠 Obteniendo estadísticas por tipo de propiedad');
      
      const typeStats = await dashboardService.getPropertyTypeStats();
      
      res.json({
        success: true,
        data: typeStats
      });
    } catch (error) {
      logger.error('❌ Error getting property type stats:', error);
      next(error);
    }
  },

  /**
   * GET /api/v1/dashboard/locations
   * Obtiene estadísticas por ubicación
   */
  async getLocationStats(req, res, next) {
    try {
      logger.info('📍 Obteniendo estadísticas por ubicación');
      
      const locationStats = await dashboardService.getLocationStats();
      
      res.json({
        success: true,
        data: locationStats
      });
    } catch (error) {
      logger.error('❌ Error getting location stats:', error);
      next(error);
    }
  },

  /**
   * GET /api/v1/dashboard/recent-properties
   * Obtiene las propiedades más recientes
   */
  async getRecentProperties(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 4;
      logger.info(`🏠 Obteniendo las últimas ${limit} propiedades`);
      
      const properties = await dashboardService.getRecentProperties(limit);
      
      res.json({
        success: true,
        data: properties
      });
    } catch (error) {
      logger.error('❌ Error getting recent properties:', error);
      next(error);
    }
  }
};

export default dashboardController;