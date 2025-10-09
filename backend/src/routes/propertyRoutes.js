import { Router } from 'express';
import propertyController from '../controllers/propertyController.js';
import { 
  validatePropertyCreation, 
  validateUUID
} from '../middlewares/validationMiddleware.js';

// Rutas públicas para propiedades
const publicRoutes = Router();

/**
 * @route GET /api/v1/viviendas
 * @desc Obtener lista de propiedades publicadas
 * @access Public
 */
publicRoutes.get('/viviendas', propertyController.getProperties);

/**
 * @route GET /api/v1/viviendas/stats
 * @desc Obtener estadísticas de propiedades
 * @access Public
 */
publicRoutes.get('/viviendas/stats', propertyController.getStats);

/**
 * @route GET /api/v1/viviendas/:id
 * @desc Obtener detalles de una propiedad específica
 * @access Public
 */
publicRoutes.get('/viviendas/:id', validateUUID('id'), propertyController.getPropertyById);

/**
 * @route GET /api/v1/viviendas/:id/similar
 * @desc Obtener propiedades similares
 * @access Public
 */
publicRoutes.get('/viviendas/:id/similar', validateUUID('id'), propertyController.getSimilarProperties);

/**
 * @route POST /api/v1/viviendas/search
 * @desc Buscar propiedades con filtros
 * @access Public
 */
publicRoutes.post('/viviendas/search', propertyController.searchProperties);

// Rutas privadas para propiedades (requieren autenticación)
const privateRoutes = Router();

/**
 * @route GET /api/v1/viviendas/drafts
 * @desc Obtener lista de borradores
 * @access Private (Seller, Admin)
 */
privateRoutes.get('/viviendas/drafts', propertyController.getDrafts);

/**
 * @route POST /api/v1/viviendas
 * @desc Crear nueva propiedad
 * @access Private (Seller, Admin)
 */
privateRoutes.post('/viviendas', validatePropertyCreation, propertyController.createProperty);

/**
 * @route PUT /api/v1/viviendas/:id
 * @desc Actualizar propiedad existente
 * @access Private (Owner, Admin)
 */
privateRoutes.put('/viviendas/:id', 
  validateUUID('id'), 
  validatePropertyCreation, 
  propertyController.updateProperty
);

/**
 * @route PATCH /api/v1/viviendas/:id/publish
 * @desc Cambiar estado de publicación
 * @access Private (Owner, Admin)
 */
privateRoutes.patch('/viviendas/:id/publish', 
  validateUUID('id'), 
  propertyController.togglePublish
);

/**
 * @route DELETE /api/v1/viviendas/:id
 * @desc Eliminar propiedad
 * @access Private (Admin only)
 */
privateRoutes.delete('/viviendas/:id', validateUUID('id'), propertyController.deleteProperty);

/**
 * @route GET /api/v1/viviendas/:id/imagenes
 * @desc Obtener imágenes de una propiedad
 * @access Private (Owner, Admin)
 */
privateRoutes.get('/viviendas/:id/imagenes', validateUUID('id'), propertyController.getPropertyImages);

/**
 * @route POST /api/v1/viviendas/:id/imagenes
 * @desc Añadir imágenes a una propiedad
 * @access Private (Owner, Admin)
 */
privateRoutes.post('/viviendas/:id/imagenes', validateUUID('id'), propertyController.addPropertyImages);

/**
 * @route PUT /api/v1/viviendas/:id/imagenes/reorder
 * @desc Reordenar imágenes de una propiedad
 * @access Private (Owner, Admin)
 */
privateRoutes.put('/viviendas/:id/imagenes/reorder', validateUUID('id'), propertyController.reorderPropertyImages);

/**
 * @route DELETE /api/v1/viviendas/:id/imagenes/:imageId
 * @desc Eliminar imagen de una propiedad
 * @access Private (Owner, Admin)
 */
privateRoutes.delete('/viviendas/:id/imagenes/:imageId', 
  validateUUID('id'), 
  validateUUID('imageId'), 
  propertyController.deletePropertyImage
);

export { publicRoutes, privateRoutes };