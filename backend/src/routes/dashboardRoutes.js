import { Router } from 'express';
import dashboardController from '../controllers/dashboardController.js';

// Rutas privadas para dashboard (requieren autenticación)
const privateRoutes = Router();

/**
 * @route GET /api/v1/dashboard/stats
 * @desc Obtener estadísticas generales del dashboard
 * @access Private (Admin)
 */
privateRoutes.get('/dashboard/stats', dashboardController.getDashboardStats);

/**
 * @route GET /api/v1/dashboard/monthly-sales
 * @desc Obtener ventas mensuales
 * @access Private (Admin)
 */
privateRoutes.get('/dashboard/monthly-sales', dashboardController.getMonthlySales);

/**
 * @route GET /api/v1/dashboard/property-types
 * @desc Obtener estadísticas por tipo de propiedad
 * @access Private (Admin)
 */
privateRoutes.get('/dashboard/property-types', dashboardController.getPropertyTypeStats);

/**
 * @route GET /api/v1/dashboard/locations
 * @desc Obtener estadísticas por ubicación
 * @access Private (Admin)
 */
privateRoutes.get('/dashboard/locations', dashboardController.getLocationStats);

/**
 * @route GET /api/v1/dashboard/recent-properties
 * @desc Obtener las propiedades más recientes
 * @access Private (Admin)
 */
privateRoutes.get('/dashboard/recent-properties', dashboardController.getRecentProperties);

export { privateRoutes };