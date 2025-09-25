import { Router } from 'express';
import propertyController from '../controllers/propertyController.js';

// Rutas públicas para propiedades
const publicRoutes = Router();

/**
 * @route GET /api/v1/properties
 * @desc Obtener lista de propiedades publicadas
 * @access Public
 */
publicRoutes.get('/properties', propertyController.getProperties);

/**
 * @route GET /api/v1/properties/:id
 * @desc Obtener detalles de una propiedad específica
 * @access Public
 */
publicRoutes.get('/properties/:id', propertyController.getPropertyById);

/**
 * @route POST /api/v1/properties/search
 * @desc Buscar propiedades con filtros
 * @access Public
 */
publicRoutes.post('/properties/search', propertyController.searchProperties);

// Rutas privadas para propiedades (requieren autenticación)
const privateRoutes = Router();

/**
 * @route POST /api/v1/properties
 * @desc Crear nueva propiedad
 * @access Private (Seller, Admin)
 */
privateRoutes.post('/properties', propertyController.createProperty);

/**
 * @route PUT /api/v1/properties/:id
 * @desc Actualizar propiedad existente
 * @access Private (Owner, Admin)
 */
privateRoutes.put('/properties/:id', propertyController.updateProperty);

/**
 * @route DELETE /api/v1/properties/:id
 * @desc Eliminar propiedad
 * @access Private (Admin only)
 */
privateRoutes.delete('/properties/:id', propertyController.deleteProperty);

export { publicRoutes, privateRoutes };