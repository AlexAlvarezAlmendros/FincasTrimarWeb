import express from 'express';
import duplicateCleanupController from '../controllers/duplicateCleanupController.js';
import { checkJwt, requireAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Aplicar autenticación a todas las rutas
router.use(checkJwt);
router.use(requireAdmin);

/**
 * @route GET /api/duplicates/test
 * @desc Test endpoint para verificar que las rutas funcionan
 * @access Private (requiere autenticación)
 */
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Endpoint de duplicados funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

/**
 * @route GET /api/duplicates/analyze
 * @desc Analizar viviendas duplicadas sin eliminarlas
 * @access Private (requiere autenticación)
 */
router.get('/analyze', duplicateCleanupController.analyzeDuplicates);

/**
 * @route DELETE /api/duplicates/clean
 * @desc Limpiar viviendas duplicadas
 * @access Private (requiere autenticación)
 */
router.delete('/clean', duplicateCleanupController.cleanDuplicates);

export default router;