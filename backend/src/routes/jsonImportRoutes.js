import express from 'express';
import jsonImportController from '../controllers/jsonImportController.js';
import { requireApiKeyOrAdmin } from '../middlewares/authMiddleware.js';
import { rateLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

/**
 * Rutas para importación/sincronización JSON de viviendas.
 * Auth dual: API key (cabecera X-API-Key) para integraciones externas,
 * o JWT de Auth0 con rol Admin para el panel interno.
 */

// Middleware global para todas las rutas JSON
router.use(requireApiKeyOrAdmin);

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
