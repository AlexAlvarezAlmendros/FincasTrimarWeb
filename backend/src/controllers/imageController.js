import imageService from '../services/imageService.js';
import imagenesViviendaRepository from '../repos/imagenesViviendaRepository.js';
import { logger } from '../utils/logger.js';

/**
 * Controlador para manejo de imágenes
 */
const imageController = {

  /**
   * Subir imágenes (proxy a ImgBB)
   * POST /api/v1/images
   */
  async uploadImages(req, res, next) {
    try {
      // Verificar que se enviaron archivos
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'NO_FILES',
            message: 'No se enviaron archivos'
          }
        });
      }

      logger.info(`📤 Subiendo ${req.files.length} imágenes...`);

      // Subir imágenes a ImgBB
      const uploadResult = await imageService.uploadMultiple(req.files);
      
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
        response.warnings = uploadResult.errors;
      }

      res.status(200).json(response);

    } catch (error) {
      logger.error('❌ Error en uploadImages:', error);
      next(error);
    }
  },

  /**
   * Asociar imágenes a una vivienda
   * POST /api/v1/viviendas/:id/imagenes
   */
  async addPropertyImages(req, res, next) {
    try {
      const { id: viviendaId } = req.params;
      const { images } = req.body;

      // Validar entrada
      if (!Array.isArray(images) || images.length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_IMAGES_DATA',
            message: 'Se requiere un array de imágenes con url y orden'
          }
        });
      }

      logger.info(`🖼️ Asociando ${images.length} imágenes a vivienda ${viviendaId}`);
      logger.info('🔍 Datos de imágenes recibidos:', images);

      const results = [];
      
      // Procesar cada imagen
      for (let i = 0; i < images.length; i++) {
        const imageData = images[i];
        
        if (!imageData.url) {
          results.push({
            index: i,
            success: false,
            error: 'URL requerida'
          });
          continue;
        }

        try {
          const imagen = await imagenesViviendaRepository.create({
            viviendaId,
            url: imageData.url,
            orden: imageData.orden || i + 1
          });

          results.push({
            index: i,
            success: true,
            data: imagen
          });

        } catch (error) {
          logger.error(`❌ Error asociando imagen ${i}:`, error);
          results.push({
            index: i,
            success: false,
            error: error.message
          });
        }
      }

      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);

      res.status(200).json({
        success: true,
        data: {
          viviendaId,
          summary: {
            total: images.length,
            successful: successful.length,
            failed: failed.length
          },
          results,
          images: successful.map(r => r.data)
        }
      });

    } catch (error) {
      logger.error('❌ Error en addPropertyImages:', error);
      next(error);
    }
  },

  /**
   * Obtener imágenes de una vivienda
   * GET /api/v1/viviendas/:id/imagenes
   */
  async getPropertyImages(req, res, next) {
    try {
      const { id: viviendaId } = req.params;
      
      const images = await imagenesViviendaRepository.findByVivienda(viviendaId);
      
      res.json({
        success: true,
        data: {
          viviendaId,
          images,
          count: images.length
        }
      });

    } catch (error) {
      logger.error('❌ Error en getPropertyImages:', error);
      next(error);
    }
  },

  /**
   * Eliminar una imagen de vivienda
   * DELETE /api/v1/viviendas/:viviendaId/imagenes/:imagenId
   */
  async deletePropertyImage(req, res, next) {
    try {
      const { viviendaId, imagenId } = req.params;
      
      // Verificar que existe la imagen
      const imagen = await imagenesViviendaRepository.findById(imagenId);
      if (!imagen) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'IMAGE_NOT_FOUND',
            message: 'Imagen no encontrada'
          }
        });
      }

      // Verificar que pertenece a la vivienda
      if (imagen.viviendaId !== viviendaId) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'IMAGE_VIVIENDA_MISMATCH',
            message: 'La imagen no pertenece a esta vivienda'
          }
        });
      }

      // Eliminar de la base de datos
      await imagenesViviendaRepository.delete(imagenId);

      logger.info(`🗑️ Imagen ${imagenId} eliminada de vivienda ${viviendaId}`);

      res.json({
        success: true,
        data: {
          viviendaId,
          imagenId,
          message: 'Imagen eliminada correctamente'
        }
      });

    } catch (error) {
      logger.error('❌ Error en deletePropertyImage:', error);
      next(error);
    }
  },

  /**
   * Reordenar imágenes de una vivienda
   * PUT /api/v1/viviendas/:id/imagenes/reorder
   */
  async reorderPropertyImages(req, res, next) {
    try {
      const { id: viviendaId } = req.params;
      const { imageOrders } = req.body;

      // Validar entrada
      if (!Array.isArray(imageOrders) || imageOrders.length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_ORDER_DATA',
            message: 'Se requiere un array imageOrders con {id, orden}'
          }
        });
      }

      logger.info(`🔄 Reordenando ${imageOrders.length} imágenes de vivienda ${viviendaId}`);

      const results = [];

      for (const imageOrder of imageOrders) {
        if (!imageOrder.id || typeof imageOrder.orden !== 'number') {
          results.push({
            id: imageOrder.id,
            success: false,
            error: 'ID y orden requeridos'
          });
          continue;
        }

        try {
          await imagenesViviendaRepository.updateOrder(imageOrder.id, imageOrder.orden);
          results.push({
            id: imageOrder.id,
            success: true,
            newOrder: imageOrder.orden
          });
        } catch (error) {
          results.push({
            id: imageOrder.id,
            success: false,
            error: error.message
          });
        }
      }

      const successful = results.filter(r => r.success);

      res.json({
        success: true,
        data: {
          viviendaId,
          reordered: successful.length,
          results
        }
      });

    } catch (error) {
      logger.error('❌ Error en reorderPropertyImages:', error);
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