import csvImportService from '../services/csvImportService.js';
import { logger } from '../utils/logger.js';

/**
 * Controlador para importación CSV de viviendas
 */
class CsvImportController {
  
  /**
   * Importa viviendas desde un archivo CSV
   * POST /api/v1/csv/import
   */
  async importCsv(req, res, next) {
    try {
      logger.info('📥 Recibiendo solicitud de importación CSV');
      
      // Verificar que se haya subido un archivo
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'NO_FILE',
            message: 'No se ha proporcionado ningún archivo CSV'
          }
        });
      }
      
      // Verificar tipo de archivo
      const allowedMimeTypes = ['text/csv', 'application/vnd.ms-excel', 'text/plain'];
      if (!allowedMimeTypes.includes(req.file.mimetype)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_FILE_TYPE',
            message: 'El archivo debe ser un CSV válido'
          }
        });
      }
      
      logger.info(`📄 Archivo recibido: ${req.file.originalname} (${req.file.size} bytes)`);
      
      // Convertir buffer a string
      const fileContent = req.file.buffer.toString('utf-8');
      
      // Log de las primeras líneas para debug
      const firstLines = fileContent.split('\n').slice(0, 3).join('\n');
      logger.info('📋 Primeras líneas del CSV:', firstLines);
      
      // Validar formato del CSV
      const validation = csvImportService.validateCsvFormat(fileContent);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_CSV_FORMAT',
            message: validation.error
          }
        });
      }
      
      // Procesar el CSV
      const results = await csvImportService.processCSV(fileContent);
      
      // Retornar resultados
      res.status(200).json({
        success: true,
        data: {
          summary: {
            total: results.total,
            success: results.success,
            duplicates: results.duplicates,
            errors: results.errors
          },
          details: results.details
        },
        message: `Importación completada: ${results.success} viviendas creadas, ${results.duplicates} duplicados omitidos, ${results.errors} errores`
      });
      
    } catch (error) {
      logger.error('❌ Error en importación CSV:', error);
      next(error);
    }
  }
  
  /**
   * Obtiene una plantilla de ejemplo del CSV
   * GET /api/v1/csv/template
   */
  async getTemplate(req, res, next) {
    try {
      const template = `ID,Portal,URL,Titulo,Precio,Ubicacion,Superficie,Habitaciones,Banos,Telefono,Nombre_Contacto,Requiere_Formulario,Fecha_Publicacion,Fecha_Deteccion,Ultima_Actualizacion,Estado,Notas
1,Idealista,https://www.idealista.com/inmueble/12345,Piso céntrico en Barcelona,250000,Barcelona,85,3,2,612345678,Juan Pérez,No,2024-01-15,2024-01-15,2024-01-15,Activo,Propiedad en buen estado
2,Fotocasa,https://www.fotocasa.es/inmueble/67890,Ático con terraza en Madrid,380000,Madrid,120,4,2,698765432,María García,Sí,2024-01-16,2024-01-16,2024-01-16,Activo,Excelentes vistas`;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="plantilla_importacion.csv"');
      res.send(template);
      
    } catch (error) {
      logger.error('❌ Error generando plantilla CSV:', error);
      next(error);
    }
  }
}

export default new CsvImportController();
