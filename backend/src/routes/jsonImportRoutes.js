import express from 'express';
import jsonImportController from '../controllers/jsonImportController.js';
import { requireAdmin } from '../middlewares/authMiddleware.js';
import { rateLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

/**
 * Rutas para importación JSON de viviendas
 * Todas las rutas requieren autenticación
 */

// Middleware global para todas las rutas JSON
router.use(requireAdmin);

// Rate limiting para importaciones
// Usamos el rateLimiter global que ya está configurado

/**
 * POST /api/v1/json/import
 * Importa viviendas desde datos JSON
 */
router.post('/import', rateLimiter, jsonImportController.importJson);

/**
 * POST /api/v1/json/validate
 * Valida estructura JSON sin procesar importación
 */
router.post('/validate', jsonImportController.validateJson);

export default router;
