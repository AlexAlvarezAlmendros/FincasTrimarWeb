import { parse } from 'csv-parse/sync';
import { logger } from '../utils/logger.js';
import { csvPropertySchema } from '../schemas/validationSchemas.js';
import viviendaRepository from '../repos/viviendaRepository.js';
import { executeQuery } from '../db/client.js';

/**
 * Servicio para importación masiva de viviendas desde CSV
 */
class CsvImportService {
  
  /**
   * Procesa un archivo CSV y retorna las viviendas procesadas
   */
  async processCSV(fileContent) {
    try {
      logger.info('📄 Iniciando procesamiento de CSV...');
      
      // Parsear CSV
      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        bom: true // Manejar BOM para archivos UTF-8
      });
      
      logger.info(`📊 CSV parseado: ${records.length} registros encontrados`);
      
      const results = {
        total: records.length,
        success: 0,
        duplicates: 0,
        errors: 0,
        details: []
      };
      
      for (const [index, record] of records.entries()) {
        try {
          // Validar y transformar datos del CSV
          const validatedData = csvPropertySchema.parse(record);
          
          // Verificar duplicados por URL si existe
          if (validatedData.URL) {
            const isDuplicate = await this.checkDuplicateByUrl(validatedData.URL);
            if (isDuplicate) {
              logger.warn(`⚠️ Fila ${index + 1}: URL duplicada - ${validatedData.URL}`);
              results.duplicates++;
              results.details.push({
                row: index + 1,
                status: 'duplicate',
                url: validatedData.URL,
                title: validatedData.Titulo
              });
              continue;
            }
          }
          
          // Transformar datos CSV a formato de vivienda
          const viviendaData = this.transformCsvToVivienda(validatedData);
          
          // Crear la vivienda
          const newVivienda = await viviendaRepository.create(viviendaData);
          
          logger.info(`✅ Fila ${index + 1}: Vivienda creada - ${newVivienda.name}`);
          results.success++;
          results.details.push({
            row: index + 1,
            status: 'success',
            id: newVivienda.id,
            title: newVivienda.name
          });
          
        } catch (error) {
          logger.error(`❌ Error procesando fila ${index + 1}:`, error);
          results.errors++;
          results.details.push({
            row: index + 1,
            status: 'error',
            error: error.message,
            data: record
          });
        }
      }
      
      logger.info(`🎉 Procesamiento completado: ${results.success} éxitos, ${results.duplicates} duplicados, ${results.errors} errores`);
      
      return results;
      
    } catch (error) {
      logger.error('❌ Error general procesando CSV:', error);
      throw new Error(`Error procesando CSV: ${error.message}`);
    }
  }
  
  /**
   * Verifica si ya existe una vivienda con la misma URL
   */
  async checkDuplicateByUrl(url) {
    try {
      if (!url) return false;
      
      const result = await executeQuery(
        'SELECT COUNT(*) as count FROM Vivienda WHERE UrlReferencia = ?',
        [url]
      );
      
      return result.rows[0].count > 0;
    } catch (error) {
      logger.error('Error verificando duplicado por URL:', error);
      return false;
    }
  }
  
  /**
   * Transforma datos del CSV al formato de Vivienda
   */
  transformCsvToVivienda(csvData) {
    // Parsear ubicación (formato esperado: "Ciudad, Provincia" o "Calle, Ciudad")
    let provincia = null;
    let poblacion = null;
    const calle = null;
    
    if (csvData.Ubicacion) {
      const parts = csvData.Ubicacion.split(',').map(p => p.trim());
      if (parts.length >= 2) {
        poblacion = parts[0];
        provincia = parts[1];
      } else {
        poblacion = parts[0];
      }
    }
    
    // Intentar extraer tipo de vivienda del título
    const tipoVivienda = this.extractTipoVivienda(csvData.Titulo);
    
    return {
      name: csvData.Titulo,
      shortDescription: `Propiedad importada desde CSV${csvData.Ubicacion ? ` - ${csvData.Ubicacion}` : ''}`,
      description: null,
      price: csvData.Precio,
      rooms: csvData.Habitaciones || 0,
      bathRooms: csvData.Banos || 0,
      garage: 0,
      squaredMeters: csvData.Superficie || null,
      provincia,
      poblacion,
      calle,
      numero: null,
      tipoInmueble: 'Vivienda',
      tipoVivienda,
      estado: null,
      planta: null,
      tipoAnuncio: null,
      estadoVenta: 'Pendiente', // Siempre Pendiente según requisitos
      caracteristicas: [],
      published: false, // No publicar automáticamente
      isDraft: false,
      comisionGanada: 0,
      captadoPor: null,
      porcentajeCaptacion: 0,
      fechaCaptacion: null,
      // Nuevos campos de contacto
      telefonoContacto: csvData.Telefono || null,
      nombreContacto: csvData.Nombre_Contacto || null,
      urlReferencia: csvData.URL || null
    };
  }
  
  /**
   * Intenta extraer el tipo de vivienda del título
   */
  extractTipoVivienda(titulo) {
    const tituloLower = titulo.toLowerCase();
    
    if (tituloLower.includes('piso')) return 'Piso';
    if (tituloLower.includes('ático') || tituloLower.includes('atico')) return 'Ático';
    if (tituloLower.includes('dúplex') || tituloLower.includes('duplex')) return 'Dúplex';
    if (tituloLower.includes('casa')) return 'Casa';
    if (tituloLower.includes('chalet')) return 'Chalet';
    if (tituloLower.includes('villa')) return 'Villa';
    if (tituloLower.includes('masía') || tituloLower.includes('masia')) return 'Masía';
    if (tituloLower.includes('finca')) return 'Finca';
    if (tituloLower.includes('loft')) return 'Loft';
    
    return null;
  }
  
  /**
   * Valida el formato del archivo CSV
   */
  validateCsvFormat(fileContent) {
    try {
      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        bom: true,
        to_line: 2 // Leer header + primera fila de datos para validar
      });
      
      if (!records || records.length === 0) {
        return {
          valid: false,
          error: 'El archivo CSV está vacío o no tiene datos'
        };
      }
      
      const requiredColumns = ['Titulo', 'Precio'];
      const headers = Object.keys(records[0] || {});
      
      // Normalizar headers para comparación (sin espacios, sin acentos especiales)
      const normalizedHeaders = headers.map(h => h.trim());
      const normalizedRequired = requiredColumns.map(c => c.trim());
      
      logger.info('📋 Headers encontrados en CSV:', normalizedHeaders);
      logger.info('📋 Headers requeridos:', normalizedRequired);
      
      const missingColumns = normalizedRequired.filter(col => 
        !normalizedHeaders.some(h => h === col)
      );
      
      if (missingColumns.length > 0) {
        return {
          valid: false,
          error: `Faltan columnas requeridas: ${missingColumns.join(', ')}`
        };
      }
      
      return { valid: true };
      
    } catch (error) {
      logger.error('Error validando CSV:', error);
      return {
        valid: false,
        error: `Error al parsear CSV: ${error.message}`
      };
    }
  }
}

export default new CsvImportService();
