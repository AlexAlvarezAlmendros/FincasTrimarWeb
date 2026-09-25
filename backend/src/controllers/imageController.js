import imageService from '../services/imageService.js';
import { logger } from '../utils/logger.js';

/**
 * Controlador para manejo de imágenes (subida a ImgBB y estado del servicio).
 * Las imágenes de una vivienda (asociar, listar, reordenar, borrar) las atiende
 * propertyController a través de propertyRoutes.
 */
const imageController = {

  /**
   * Subir imágenes (proxy a ImgBB)
   * POST /api/v1/images
   */
  async uploadImages(req, res, next) {
    try {
      logger.info('📥 [CONTROLLER] Petición de subida recibida');
      logger.info(`📥 [CONTROLLER] Headers: ${JSON.stringify({
        contentType: req.get('content-type'),
        contentLength: req.get('content-length'),
        origin: req.get('origin')
      })}`);

      // Verificar que se enviaron archivos
      if (!req.files || req.files.length === 0) {
        logger.warn('⚠️ [CONTROLLER] No se enviaron archivos');
        return res.status(400).json({
          success: false,
          error: {
            code: 'NO_FILES',
            message: 'No se enviaron archivos'
          }
        });
      }

      logger.info(`📤 [CONTROLLER] Subiendo ${req.files.length} imágenes...`);
      req.files.forEach((file, index) => {
        logger.info(`📄 [CONTROLLER] Archivo ${index + 1}: ${file.originalname} (${file.size} bytes, ${file.mimetype})`);
      });

      // Subir imágenes a ImgBB
      const uploadResult = await imageService.uploadMultiple(req.files);
      
      logger.info(`📊 [CONTROLLER] Resultado: ${uploadResult.successful}/${uploadResult.total} exitosos`);
      
      // Preparar respuesta
      const response = {
        success: true,
        data: {
          summary: {
            total: uploadResult.total,
            successful: uploadResult.successful,
            failed: uploadResult.failed
          },
          images: uploadResult.results
            .filter(result => result.success)
            .map(result => ({
              id: result.data.id,
              url: result.data.url,
              displayUrl: result.data.displayUrl,
              thumbUrl: result.data.thumbUrl,
              mediumUrl: result.data.mediumUrl,
              size: result.data.size,
              width: result.data.width,
              height: result.data.height,
              uploadedAt: result.data.uploadedAt
            }))
        }
      };

      // Incluir errores si los hay
      if (uploadResult.errors && uploadResult.errors.length > 0) {
        logger.warn(`⚠️ [CONTROLLER] Errores en subida: ${JSON.stringify(uploadResult.errors)}`);
        response.warnings = uploadResult.errors;
      }

      res.status(200).json(response);

    } catch (error) {
      logger.error('❌ [CONTROLLER] Error en uploadImages:', {
        message: error.message,
        stack: error.stack,
        hasFiles: !!req.files,
        filesCount: req.files ? req.files.length : 0
      });
      next(error);
    }
  },

  /**
   * Obtener información del servicio de imágenes
   * GET /api/v1/images/status
   */
  async getServiceStatus(req, res, next) {
    try {
      const isConfigured = imageService.isConfigured();
      
      res.json({
        success: true,
        data: {
          service: 'ImgBB',
          configured: isConfigured,
          status: isConfigured ? 'available' : 'disabled',
          message: isConfigured 
            ? 'Servicio de imágenes disponible'
            : 'Servicio de imágenes no configurado (IMGBB_API_KEY faltante)'
        }
      });

    } catch (error) {
      logger.error('❌ Error en getServiceStatus:', error);
      next(error);
    }
  },

  /**
   * Debug endpoint - Información de configuración
   * GET /api/v1/images/debug
   */
  async getDebugInfo(req, res, next) {
    try {
      const debugInfo = {
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        imgbbConfigured: imageService.isConfigured(),
        corsOrigins: process.env.CORS_ORIGINS || 'Not configured',
        apiUrl: process.env.VITE_API_BASE_URL || 'Not set',
        headers: {
          contentType: req.get('content-type'),
          authorization: req.get('authorization') ? 'Present (token hidden)' : 'Missing',
          origin: req.get('origin') || 'Not present',
          userAgent: req.get('user-agent') || 'Not present'
        },
        bodyParserLimits: {
          json: '50mb (configured in app.js)',
          urlencoded: '50mb (configured in app.js)',
          multer: '10MB per file, max 10 files'
        },
        vercel: {
          region: process.env.VERCEL_REGION || 'Not on Vercel',
          env: process.env.VERCEL_ENV || 'Not on Vercel'
        }
      };

      logger.info('🔍 Debug info requested');

      res.json({
        success: true,
        data: debugInfo
      });
    } catch (error) {
      logger.error('❌ Error en getDebugInfo:', error);
      next(error);
    }
  }

};

export default imageController;