import jsonImportService from '../services/jsonImportService.js';
import { logger } from '../utils/logger.js';

/**
 * Controlador para importación JSON de viviendas
 */
class JsonImportController {
  
  /**
   * Importa viviendas desde datos JSON
   * POST /api/v1/json/import
   */
  async importJson(req, res, next) {
    try {
      logger.info('📥 Recibiendo solicitud de importación JSON');
      
      // Verificar que se hayan proporcionado datos JSON
      if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'NO_DATA',
            message: 'No se han proporcionado datos JSON válidos'
          }
        });
      }
      
      // Validar estructura del JSON (soporta ambos formatos)
      const validation = jsonImportService.validateJsonStructure(req.body);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_JSON_STRUCTURE',
            message: validation.error
          }
        });
      }
      
      const inmuebles = jsonImportService.extractInmuebles(req.body);
      logger.info(`📊 JSON recibido (formato ${validation.format}) con ${inmuebles.length} inmuebles`);
      
      // Procesar la importación
      const result = await jsonImportService.processImport(req.body, req.user);
      
      logger.info(`✅ Importación JSON completada: ${result.summary.success} éxitos, ${result.summary.errors} errores`);
      
      // Responder con los resultados
      res.status(200).json({
        success: true,
        data: {
          summary: result.summary,
          details: result.details,
          metadata: {
            format: validation.format,
            timestamp: req.body.timestamp,
            url: req.body.url || req.body.agencia_url || null,
            total: req.body.total || inmuebles.length,
            particulares: req.body.particulares,
            inmobiliarias: req.body.inmobiliarias
          }
        }
      });
      
    } catch (error) {
      logger.error('❌ Error en importación JSON:', {
        message: error.message,
        stack: error.stack
      });
      
      // Si es un error de validación, devolver 400
      if (error.message.includes('validación') || error.message.includes('formato')) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: error.message
          }
        });
      }
      
      next(error);
    }
  }
  
  /**
   * Valida la estructura de un JSON antes de importar (sin procesar)
   * POST /api/v1/json/validate
   */
  async validateJson(req, res) {
    try {
      logger.info('🔍 Validando estructura JSON');
      
      if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'NO_DATA',
            message: 'No se han proporcionado datos JSON válidos'
          }
        });
      }
      
      const validation = jsonImportService.validateJsonStructure(req.body);
      
      if (validation.valid) {
        const viviendasCount = req.body.viviendas?.todas?.length || 0;
        res.status(200).json({
          success: true,
          data: {
            valid: true,
            viviendasCount,
            metadata: {
              timestamp: req.body.timestamp,
              url: req.body.url,
              total: req.body.total,
              particulares: req.body.particulares,
              inmobiliarias: req.body.inmobiliarias
            }
          }
        });
      } else {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_STRUCTURE',
            message: validation.error
          }
        });
      }
      
    } catch (error) {
      logger.error('❌ Error validando JSON:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Error interno validando la estructura JSON'
        }
      });
    }
  }
}

export default new JsonImportController();
