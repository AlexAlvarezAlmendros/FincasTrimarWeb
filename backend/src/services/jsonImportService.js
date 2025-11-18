import { logger } from '../utils/logger.js';
import viviendaRepository from '../repos/viviendaRepository.js';
import { executeQuery } from '../db/client.js';

/**
 * Servicio para importación masiva de viviendas desde JSON
 */
class JsonImportService {
  
  /**
   * Valida la estructura del JSON de importación
   */
  validateJsonStructure(data) {
    try {
      // Validar estructura básica
      if (!data || typeof data !== 'object') {
        return { valid: false, error: 'El JSON debe ser un objeto válido' };
      }

      // Validar que exista la estructura de viviendas
      if (!data.viviendas || !data.viviendas.todas || !Array.isArray(data.viviendas.todas)) {
        return { 
          valid: false, 
          error: 'El JSON debe contener una estructura "viviendas.todas" con un array de propiedades' 
        };
      }

      // Validar que haya al menos una vivienda
      if (data.viviendas.todas.length === 0) {
        return { valid: false, error: 'No se encontraron viviendas para importar' };
      }

      // Validar campos requeridos en la primera vivienda como muestra
      const requiredFields = ['titulo', 'precio', 'ubicacion', 'url'];
      const sampleVivienda = data.viviendas.todas[0];
      
      const missingFields = requiredFields.filter(field => !sampleVivienda[field]);
      if (missingFields.length > 0) {
        return { 
          valid: false, 
          error: `Las viviendas deben incluir los campos requeridos: ${missingFields.join(', ')}` 
        };
      }

      // Validar metadatos opcionales
      if (data.total !== undefined && typeof data.total !== 'number') {
        return { valid: false, error: 'El campo "total" debe ser un número' };
      }

      return { valid: true };
      
    } catch (error) {
      logger.error('❌ Error validando estructura JSON:', error);
      return { valid: false, error: 'Error interno validando la estructura JSON' };
    }
  }

  /**
   * Procesa la importación de viviendas desde JSON
   */
  async processImport(jsonData, _user) {
    try {
      logger.info('📄 Iniciando procesamiento de importación JSON...');
      
      const viviendas = jsonData.viviendas.todas;
      logger.info(`📊 JSON procesado: ${viviendas.length} viviendas encontradas`);
      
      const results = {
        summary: {
          total: viviendas.length,
          success: 0,
          duplicates: 0,
          errors: 0
        },
        details: []
      };
      
      for (const [index, vivienda] of viviendas.entries()) {
        try {
          // Verificar duplicados dentro del mismo lote primero
          const batchDuplicate = this.checkDuplicateInBatch(viviendas, index);
          if (batchDuplicate.isDuplicate) {
            logger.warn(`⚠️ Ítem ${index + 1}: ${batchDuplicate.reason} (similar al ítem ${batchDuplicate.duplicateIndex})`);
            results.summary.duplicates++;
            results.details.push({
              row: index + 1,
              status: 'duplicate',
              titulo: vivienda.titulo,
              reason: batchDuplicate.reason
            });
            continue;
          }

          // Transformar datos del JSON al formato de la base de datos
          const transformedData = this.transformJsonToVivienda(vivienda);
          
          // Verificar duplicados por URL (principal)
          if (transformedData.urlReferencia) {
            const isDuplicateByUrl = await this.checkDuplicateByUrl(transformedData.urlReferencia);
            if (isDuplicateByUrl) {
              logger.warn(`⚠️ Ítem ${index + 1}: URL duplicada - ${transformedData.urlReferencia}`);
              results.summary.duplicates++;
              results.details.push({
                row: index + 1,
                status: 'duplicate',
                url: transformedData.urlReferencia,
                titulo: vivienda.titulo,
                reason: 'URL duplicada'
              });
              continue;
            }
          }

          // Verificar duplicados por título + precio (backup)
          const isDuplicateByTitlePrice = await this.checkDuplicateByTitlePrice(
            transformedData.name, 
            transformedData.price
          );
          if (isDuplicateByTitlePrice) {
            logger.warn(`⚠️ Ítem ${index + 1}: Título + Precio duplicado - ${transformedData.name} (${transformedData.price}€)`);
            results.summary.duplicates++;
            results.details.push({
              row: index + 1,
              status: 'duplicate',
              titulo: vivienda.titulo,
              reason: 'Título y precio duplicados'
            });
            continue;
          }
          
          // Validar datos transformados usando el schema de propiedad estándar
          // No necesitamos el jsonViviendaSchema específico, usamos validación básica aquí
          if (!transformedData.name || transformedData.name.length < 3) {
            throw new Error('El título debe tener al menos 3 caracteres');
          }
          
          if (!transformedData.price || transformedData.price <= 0) {
            throw new Error('El precio debe ser un número positivo');
          }
          
          // Agregar metadatos de importación
          const finalData = {
            ...transformedData,
            estadoVenta: 'Pendiente', // Estado por defecto para importaciones
            fechaCaptacion: new Date().toISOString(),
            observaciones: `${transformedData.observaciones} - Importado el ${new Date().toLocaleDateString()}`
          };
          
          // Crear vivienda
          const newVivienda = await viviendaRepository.create(finalData);
          
          logger.info(`✅ Ítem ${index + 1}: Vivienda creada con ID ${newVivienda.id}`);
          results.summary.success++;
          results.details.push({
            row: index + 1,
            status: 'success',
            title: vivienda.titulo,
            id: newVivienda.id
          });
          
        } catch (error) {
          logger.error(`❌ Error en ítem ${index + 1}:`, error.message);
          results.summary.errors++;
          results.details.push({
            row: index + 1,
            status: 'error',
            error: error.message,
            titulo: vivienda.titulo || 'Sin título'
          });
        }
      }
      
      logger.info(`✅ Importación JSON completada: ${results.summary.success}/${results.summary.total} viviendas procesadas`);
      return results;
      
    } catch (error) {
      logger.error('❌ Error procesando importación JSON:', error);
      throw new Error(`Error procesando importación JSON: ${error.message}`);
    }
  }

  /**
   * Transforma los datos del JSON al formato de vivienda de la base de datos
   */
  transformJsonToVivienda(jsonVivienda) {
    // Extraer precio numérico del texto (ej: "90.000€" -> 90000)
    const precioNumerico = this.parsePrecio(jsonVivienda.precio);
    
    // Separar ubicación en provincia/población si es posible
    const { provincia, poblacion } = this.parseUbicacion(jsonVivienda.ubicacion);
    
    return {
      // Mapeo de campos del JSON a la estructura de la BD que espera el repositorio
      name: jsonVivienda.titulo?.trim(),
      description: jsonVivienda.descripcion?.trim(),
      price: precioNumerico,
      rooms: this.parseHabitaciones(jsonVivienda.habitaciones),
      bathRooms: 0, // No viene en el JSON, valor por defecto
      garage: 0, // No viene en el JSON, valor por defecto  
      squaredMeters: this.parseMetrosCuadrados(jsonVivienda.metros),
      provincia: provincia,
      poblacion: poblacion,
      
      // Campos específicos de captación
      estadoVenta: 'Pendiente', // Estado por defecto para importaciones
      tipoInmueble: 'Vivienda', // Por defecto
      tipoVivienda: this.inferirTipoVivienda(jsonVivienda.titulo),
      tipoAnuncio: 'Venta', // Asumimos venta por defecto
      
      // Metadatos de importación
      captadoPor: null, // Se puede agregar el usuario actual si está disponible
      fechaCaptacion: new Date().toISOString(),
      urlReferencia: jsonVivienda.url?.trim(),
      observaciones: `Importado desde JSON - Anunciante: ${jsonVivienda.anunciante || 'N/A'}`,
      
      // Configuración de publicación (como borrador para revisión)
      published: false,
      isDraft: false // Se crea como captación pendiente, no como borrador
    };
  }

  /**
   * Extrae el número de habitaciones del texto
   */
  parseHabitaciones(habitacionesText) {
    if (!habitacionesText) return null;
    
    const match = habitacionesText.match(/(\d+)/);
    return match ? parseInt(match[1]) : null;
  }

  /**
   * Extrae los metros cuadrados del texto
   */
  parseMetrosCuadrados(metrosText) {
    if (!metrosText) return null;
    
    const match = metrosText.match(/(\d+)/);
    return match ? parseInt(match[1]) : null;
  }

  /**
   * Extrae el precio numérico del texto (ej: "90.000€" -> 90000)
   */
  parsePrecio(precioText) {
    if (!precioText) return 0;
    
    // Remover símbolos de moneda, puntos de miles, espacios
    const cleaned = precioText.replace(/[€$.,\s]/g, '');
    return parseInt(cleaned, 10) || 0;
  }

  /**
   * Separa ubicación en provincia y población
   */
  parseUbicacion(ubicacionText) {
    if (!ubicacionText) {
      return { provincia: null, poblacion: null };
    }
    
    // Formato típico: "Poble Nou, Manresa" o "Centro, Ciudad"
    const parts = ubicacionText.split(',').map(part => part.trim());
    
    if (parts.length >= 2) {
      return {
        provincia: parts[parts.length - 1], // Última parte como provincia
        poblacion: parts.slice(0, -1).join(', ') // Todo lo demás como población
      };
    } else {
      return {
        provincia: null,
        poblacion: ubicacionText.trim()
      };
    }
  }

  /**
   * Infiere el tipo de vivienda desde el título
   */
  inferirTipoVivienda(titulo) {
    if (!titulo) return 'Piso';
    
    const tituloLower = titulo.toLowerCase();
    
    if (tituloLower.includes('ático') || tituloLower.includes('atico')) return 'Ático';
    if (tituloLower.includes('casa')) return 'Casa';
    if (tituloLower.includes('chalet')) return 'Chalet';
    if (tituloLower.includes('dúplex') || tituloLower.includes('duplex')) return 'Dúplex';
    if (tituloLower.includes('villa')) return 'Villa';
    if (tituloLower.includes('loft')) return 'Loft';
    if (tituloLower.includes('estudio')) return 'Loft';
    
    return 'Piso'; // Por defecto
  }

  /**
   * Verifica si existe una vivienda con la misma URL
   */
  async checkDuplicateByUrl(url) {
    if (!url) return false;
    
    try {
      const query = `
        SELECT COUNT(*) as count
        FROM Vivienda 
        WHERE UrlReferencia = ?
      `;
      const result = await executeQuery(query, [url]);
      
      // Manejar tanto el formato directo como el ResultSetImpl
      const rows = Array.isArray(result) ? result : result.rows;
      return rows[0].count > 0;
      
    } catch (error) {
      logger.error('❌ Error verificando duplicado por URL:', error);
      return false;
    }
  }

  /**
   * Verifica si existe una vivienda con el mismo título y precio
   * (verificación secundaria para casos sin URL o URLs diferentes)
   */
  async checkDuplicateByTitlePrice(name, price) {
    if (!name || !price) return false;
    
    try {
      const query = `
        SELECT COUNT(*) as count
        FROM Vivienda 
        WHERE Name = ? AND Price = ?
      `;
      const result = await executeQuery(query, [name.trim(), price]);
      
      // Manejar tanto el formato directo como el ResultSetImpl
      const rows = Array.isArray(result) ? result : result.rows;
      return rows[0].count > 0;
      
    } catch (error) {
      logger.error('❌ Error verificando duplicado por título y precio:', error);
      return false;
    }
  }

  /**
   * Verifica duplicados dentro del mismo lote de importación
   * (para evitar duplicados en la misma importación)
   */
  checkDuplicateInBatch(viviendas, currentIndex) {
    const currentVivienda = viviendas[currentIndex];
    
    for (let i = 0; i < currentIndex; i++) {
      const previousVivienda = viviendas[i];
      
      // Verificar por URL
      if (currentVivienda.url && previousVivienda.url && 
          currentVivienda.url === previousVivienda.url) {
        return {
          isDuplicate: true,
          reason: 'URL duplicada en el mismo lote',
          duplicateIndex: i + 1
        };
      }
      
      // Verificar por título + precio
      if (currentVivienda.titulo && previousVivienda.titulo &&
          currentVivienda.precio && previousVivienda.precio &&
          currentVivienda.titulo.trim() === previousVivienda.titulo.trim() &&
          currentVivienda.precio === previousVivienda.precio) {
        return {
          isDuplicate: true,
          reason: 'Título y precio duplicados en el mismo lote',
          duplicateIndex: i + 1
        };
      }
    }
    
    return { isDuplicate: false };
  }

  /**
   * Obtiene estadísticas de la importación
   */
  async getImportStats() {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_importadas,
          COUNT(CASE WHEN DATE(FechaCaptacion) = DATE('now') THEN 1 END) as importadas_hoy,
          COUNT(CASE WHEN Observaciones LIKE '%Importado desde JSON%' THEN 1 END) as desde_json
        FROM Vivienda
        WHERE Observaciones LIKE '%Importado desde%'
      `;
      
      const result = await executeQuery(query);
      
      // Manejar tanto el formato directo como el ResultSetImpl
      const rows = Array.isArray(result) ? result : result.rows;
      return rows[0];
      
    } catch (error) {
      logger.error('❌ Error obteniendo estadísticas de importación:', error);
      return { total_importadas: 0, importadas_hoy: 0, desde_json: 0 };
    }
  }
}

export default new JsonImportService();
