import idealistaParserService from '../services/idealistaParserService.js';
import { logger } from '../utils/logger.js';
import multer from 'multer';
import path from 'path';

// Configuración de multer para archivos HTML
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/html' || path.extname(file.originalname).toLowerCase() === '.html') {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos HTML'), false);
    }
  }
});

class HtmlParserController {
  /**
   * Procesa un archivo HTML de Idealista y extrae información de la propiedad
   */
  async parseIdealistaHtml(req, res, next) {
    try {
      logger.info('Iniciando procesamiento de HTML de Idealista');

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No se proporcionó ningún archivo HTML'
        });
      }

      // Convertir buffer a string
      const htmlContent = req.file.buffer.toString('utf-8');

      // Parsear el HTML usando el servicio
      const extractedData = idealistaParserService.parseProperty(htmlContent);

      // Validar los datos extraídos
      const validation = idealistaParserService.validateExtractedData(extractedData);

      logger.info('HTML procesado exitosamente', { 
        fileName: req.file.originalname,
        isValid: validation.isValid 
      });

      res.json({
        success: true,
        data: {
          extractedData,
          validation,
          fileName: req.file.originalname,
          fileSize: req.file.size
        }
      });

    } catch (error) {
      logger.error('Error al procesar HTML de Idealista', {
        error: error.message,
        fileName: req.file?.originalname
      });
      next(error);
    }
  }

  /**
   * Procesa texto HTML directamente (sin archivo)
   */
  async parseHtmlText(req, res, next) {
    try {
      const { htmlContent } = req.body;

      if (!htmlContent) {
        return res.status(400).json({
          success: false,
          error: 'No se proporcionó contenido HTML'
        });
      }

      logger.info('Procesando contenido HTML directo');

      // Parsear el HTML
      const extractedData = idealistaParserService.parseProperty(htmlContent);

      // Validar los datos extraídos
      const validation = idealistaParserService.validateExtractedData(extractedData);

      logger.info('HTML procesado exitosamente desde texto');

      res.json({
        success: true,
        data: {
          extractedData,
          validation
        }
      });

    } catch (error) {
      logger.error('Error al procesar contenido HTML', { error: error.message });
      next(error);
    }
  }

  /**
   * Procesa una URL de Idealista (para futuro desarrollo)
   */
  async parseIdealistaUrl(req, res, next) {
    try {
      const { url } = req.body;

      if (!url) {
        return res.status(400).json({
          success: false,
          error: 'No se proporcionó URL'
        });
      }

      // Validar que sea una URL de Idealista
      if (!url.includes('idealista.com')) {
        return res.status(400).json({
          success: false,
          error: 'Solo se admiten URLs de Idealista'
        });
      }

      // TODO: Implementar scraping directo de la URL
      // Por ahora, devolver error indicando que no está implementado
      res.status(501).json({
        success: false,
        error: 'Funcionalidad de scraping por URL no implementada aún'
      });

    } catch (error) {
      logger.error('Error al procesar URL de Idealista', { error: error.message, url: req.body.url });
      next(error);
    }
  }

  /**
   * Obtiene información sobre los tipos de datos que se pueden extraer
   */
  async getParserInfo(req, res) {
    try {
      const info = {
        supportedSources: ['idealista.com'],
        extractableFields: [
          'name',
          'shortDescription', 
          'description',
          'price',
          'rooms',
          'bathRooms',
          'squaredMeters',
          'location',
          'tipoInmueble',
          'tipoVivienda',
          'caracteristicas',
          'images'
        ],
        fileRequirements: {
          maxSize: '10MB',
          allowedTypes: ['text/html'],
          allowedExtensions: ['.html']
        }
      };

      res.json({
        success: true,
        data: info
      });

    } catch (error) {
      logger.error('Error al obtener información del parser', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
}

// Exportar el controlador y el middleware de upload
export const htmlParserController = new HtmlParserController();
export const uploadHtml = upload.single('htmlFile');