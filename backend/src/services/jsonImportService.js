import { logger } from '../utils/logger.js';
import viviendaRepository from '../repos/viviendaRepository.js';
import imagenesViviendaRepository from '../repos/imagenesViviendaRepository.js';
import { executeQuery } from '../db/client.js';

/**
 * Características disponibles en la plataforma para matching con datos externos
 */
const CARACTERISTICAS_PLATAFORMA = [
  'AireAcondicionado',
  'ArmariosEmpotrados',
  'Ascensor',
  'Balcón',
  'Terraza',
  'Exterior',
  'Garaje',
  'Jardín',
  'Piscina',
  'Trastero',
  'ViviendaAccesible',
  'VistasAlMar',
  'ViviendaDeLujo',
  'VistasAMontaña',
  'FuegoATierra',
  'Calefacción',
  'Guardilla',
  'CocinaOffice'
];

/**
 * Mapa de keywords del JSON externo a características de la plataforma
 */
const CARACTERISTICAS_MATCHING = {
  'AireAcondicionado': ['aire acondicionado', 'a/c', 'climatización', 'climatizacion'],
  'ArmariosEmpotrados': ['armarios empotrados', 'armario empotrado'],
  'Ascensor': ['ascensor', 'con ascensor', 'elevador'],
  'Balcón': ['balcón', 'balcon'],
  'Terraza': ['terraza', 'terraza y balcón', 'terraza y balcon'],
  'Exterior': ['exterior', 'planta.*exterior'],
  'Garaje': ['garaje', 'plaza de garaje', 'parking', 'aparcamiento', 'garaje incluido'],
  'Jardín': ['jardín', 'jardin', 'zona ajardinada'],
  'Piscina': ['piscina', 'piscina comunitaria', 'piscina privada'],
  'Trastero': ['trastero', 'almacén', 'almacen'],
  'ViviendaAccesible': ['accesible', 'adaptad'],
  'VistasAlMar': ['vistas al mar', 'vista al mar', 'primera línea de playa', 'primera linea de playa'],
  'ViviendaDeLujo': ['lujo', 'premium', 'exclusiv'],
  'VistasAMontaña': ['vistas a la montaña', 'vistas a montaña', 'vistas a montana'],
  'FuegoATierra': ['chimenea', 'fuego a tierra', 'hogar', 'leña'],
  'Calefacción': ['calefacción', 'calefaccion', 'calefacción individual', 'calefaccion individual', 'gas natural'],
  'Guardilla': ['guardilla', 'buhardilla', 'altillo'],
  'CocinaOffice': ['cocina office', 'office', 'cocina americana']
};

/**
 * Servicio para importación masiva de viviendas desde JSON
 */
class JsonImportService {
  
  /**
   * Valida la estructura del JSON de importación.
   * Soporta dos formatos:
   *   - Formato agencia: { inmuebles: [...] }
   *   - Formato legacy:  { viviendas: { todas: [...] } }
   */
  validateJsonStructure(data) {
    try {
      if (!data || typeof data !== 'object') {
        return { valid: false, error: 'El JSON debe ser un objeto válido' };
      }

      // Formato agencia: { inmuebles: [...] }
      if (Array.isArray(data.inmuebles)) {
        if (data.inmuebles.length === 0) {
          return { valid: false, error: 'No se encontraron inmuebles para importar' };
        }
        const requiredFields = ['titulo', 'precio', 'ubicacion'];
        const sample = data.inmuebles[0];
        const missing = requiredFields.filter(f => !sample[f]);
        if (missing.length > 0) {
          return { valid: false, error: `Los inmuebles deben incluir: ${missing.join(', ')}` };
        }
        return { valid: true, format: 'agencia' };
      }

      // Formato legacy: { viviendas: { todas: [...] } }
      if (data.viviendas?.todas && Array.isArray(data.viviendas.todas)) {
        if (data.viviendas.todas.length === 0) {
          return { valid: false, error: 'No se encontraron viviendas para importar' };
        }
        const requiredFields = ['titulo', 'precio', 'ubicacion', 'url'];
        const sample = data.viviendas.todas[0];
        const missing = requiredFields.filter(f => !sample[f]);
        if (missing.length > 0) {
          return { valid: false, error: `Las viviendas deben incluir: ${missing.join(', ')}` };
        }
        return { valid: true, format: 'legacy' };
      }

      return {
        valid: false,
        error: 'El JSON debe contener "inmuebles" (array) o "viviendas.todas" (array)'
      };
    } catch (error) {
      logger.error('❌ Error validando estructura JSON:', error);
      return { valid: false, error: 'Error interno validando la estructura JSON' };
    }
  }

  /**
   * Extrae la lista de inmuebles del JSON independientemente del formato
   */
  extractInmuebles(jsonData) {
    if (Array.isArray(jsonData.inmuebles)) return jsonData.inmuebles;
    if (jsonData.viviendas?.todas) return jsonData.viviendas.todas;
    return [];
  }

  /**
   * Procesa la importación de viviendas desde JSON
   */
  async processImport(jsonData, _user) {
    try {
      logger.info('📄 Iniciando procesamiento de importación JSON...');

      const viviendas = this.extractInmuebles(jsonData);
      const validation = this.validateJsonStructure(jsonData);
      const isAgenciaFormat = validation.format === 'agencia';

      logger.info(`📊 JSON procesado (formato ${validation.format}): ${viviendas.length} viviendas encontradas`);
      
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

          // Transformar datos según el formato
          const transformedData = isAgenciaFormat
            ? this.transformAgenciaToVivienda(vivienda)
            : this.transformJsonToVivienda(vivienda);
          
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
          
          // Validar datos transformados
          if (!transformedData.name || transformedData.name.length < 3) {
            throw new Error('El título debe tener al menos 3 caracteres');
          }
          
          if (!transformedData.price || transformedData.price <= 0) {
            throw new Error('El precio debe ser un número positivo');
          }
          
          // Agregar metadatos de importación
          const finalData = {
            ...transformedData,
            fechaCaptacion: new Date().toISOString(),
            observaciones: transformedData.observaciones
              ? `${transformedData.observaciones} - Importado el ${new Date().toLocaleDateString()}`
              : `Importado el ${new Date().toLocaleDateString()}`
          };
          
          // Crear vivienda
          const newVivienda = await viviendaRepository.create(finalData);

          // Asociar imágenes (si existen) directamente como URLs
          const imageUrls = isAgenciaFormat
            ? this.filterImageUrls(vivienda.imagenes)
            : [];

          if (imageUrls.length > 0 && newVivienda?.id) {
            try {
              const imageRecords = imageUrls.map((url, i) => ({ url, orden: i + 1 }));
              await imagenesViviendaRepository.addImagesToProperty(newVivienda.id, imageRecords);
              logger.info(`🖼️ ${imageUrls.length} imágenes asociadas a vivienda ${newVivienda.id}`);
            } catch (imgError) {
              logger.error(`⚠️ Error asociando imágenes a ${newVivienda.id}:`, imgError.message);
              // No falla la importación si las imágenes fallan
            }
          }
          
          logger.info(`✅ Ítem ${index + 1}: Vivienda creada con ID ${newVivienda.id} (${imageUrls.length} imágenes)`);
          results.summary.success++;
          results.details.push({
            row: index + 1,
            status: 'success',
            title: vivienda.titulo,
            id: newVivienda.id,
            images: imageUrls.length
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
   * Filtra las URLs de imágenes del array del JSON de agencia.
   * Solo conserva imágenes reales (jpg/webp de tamaño XL), no SVGs, no flags, etc.
   * Desduplicación por hash de imagen (parte final de la URL).
   */
  filterImageUrls(imagenes) {
    if (!Array.isArray(imagenes) || imagenes.length === 0) return [];

    const seen = new Set();
    const filtered = [];

    for (const url of imagenes) {
      if (typeof url !== 'string') continue;

      // Excluir SVGs, flags, logos y otros assets no-foto
      if (url.endsWith('.svg')) continue;
      if (url.includes('/flags/')) continue;
      if (url.includes('logo-default')) continue;

      // Solo imágenes de propiedades (contienen "image.master")
      if (!url.includes('image.master')) continue;

      // Preferir variante XL si disponible; excluir duplicados menores (WEB_DETAIL sin XL, TOP)
      // Extraer hash único del archivo (última parte de la ruta)
      const hashMatch = url.match(/([a-f0-9]{2}\/[a-f0-9]{2}\/[a-f0-9]{2}\/\d+)/);
      if (!hashMatch) continue;

      const imageHash = hashMatch[1];
      if (seen.has(imageHash)) continue;
      seen.add(imageHash);

      // Preferir formato jpg XL
      filtered.push(url);
    }

    return filtered;
  }

  /**
   * Transforma datos del formato agencia ({ inmuebles }) al formato de vivienda de la BD.
   * - Extrae descripción corta
   * - Ubicación como campo único → poblacion
   * - TipoInmueble/TipoVivienda inteligente
   * - Matching de características
   * - TipoAnuncio = Venta, EstadoVenta = Disponible, Published = true
   */
  transformAgenciaToVivienda(inmueble) {
    const precioNumerico = this.parsePrecio(inmueble.precio);
    const description = inmueble.descripcion?.trim() || '';
    const shortDescription = this.extractShortDescription(description);
    const { tipoInmueble, tipoVivienda } = this.inferirTiposDesdeInmueble(inmueble);
    const estado = this.inferirEstado(inmueble.estado);
    const planta = this.inferirPlanta(inmueble.caracteristicas);
    const caracteristicas = this.matchCaracteristicas(inmueble.caracteristicas || []);

    // Convertir descripción a HTML
    const htmlDescription = description
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => `<p>${line}</p>`)
      .join('');

    return {
      name: inmueble.titulo?.trim(),
      shortDescription,
      description: htmlDescription || description,
      price: precioNumerico,
      rooms: this.parseNumeric(inmueble.habitaciones),
      bathRooms: this.parseNumeric(inmueble.banos),
      garage: this.parseNumeric(inmueble.garajes),
      squaredMeters: this.parseNumeric(inmueble.metros_cuadrados),

      // Ubicación: un solo campo → poblacion
      provincia: null,
      poblacion: inmueble.ubicacion?.trim() || null,
      calle: null,
      numero: null,

      // Clasificación inteligente
      tipoInmueble,
      tipoVivienda,
      estado,
      planta,
      tipoAnuncio: 'Venta',
      estadoVenta: 'Disponible',
      caracteristicas,

      // Auto-publicar
      published: true,
      isDraft: false,

      // Metadatos
      captadoPor: null,
      fechaCaptacion: new Date().toISOString(),
      urlReferencia: inmueble.url?.trim() || null,
      observaciones: `Importado desde JSON agencia`
    };
  }

  /**
   * Extrae una descripción corta (máx 300 chars) de la descripción completa
   */
  extractShortDescription(description, maxLength = 300) {
    if (!description) return '';
    // Tomar la primera frase significativa (hasta punto, o primeros N chars)
    const clean = description.replace(/\s+/g, ' ').trim();
    // Buscar el primer punto seguido de espacio o fin
    const firstSentenceEnd = clean.search(/\.\s|\.$/);
    if (firstSentenceEnd > 0 && firstSentenceEnd <= maxLength) {
      return clean.substring(0, firstSentenceEnd + 1).trim();
    }
    // Si no hay punto razonable, cortar por palabra
    if (clean.length <= maxLength) return clean;
    const truncated = clean.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    return (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated) + '...';
  }

  /**
   * Infiere TipoInmueble y TipoVivienda a partir de los datos del inmueble
   */
  inferirTiposDesdeInmueble(inmueble) {
    const tipoRaw = (inmueble.tipo_inmueble || inmueble.titulo || '').toLowerCase();

    // Mapeo de tipo_inmueble del JSON a TipoVivienda de la plataforma
    const viviendaMap = {
      'piso': 'Piso',
      'ático': 'Ático', 'atico': 'Ático',
      'dúplex': 'Dúplex', 'duplex': 'Dúplex',
      'casa': 'Casa',
      'chalet': 'Chalet',
      'villa': 'Villa',
      'masía': 'Masía', 'masia': 'Masía',
      'finca': 'Finca',
      'loft': 'Loft',
      'estudio': 'Loft'
    };

    // Mapeo de tipos NO-vivienda a TipoInmueble
    const noViviendaMap = {
      'oficina': 'Oficina',
      'local': 'Local',
      'nave': 'Nave',
      'garaje': 'Garaje',
      'terreno': 'Terreno',
      'trastero': 'Trastero',
      'edificio': 'Edificio'
    };

    // Primero revisar si es un tipo no-vivienda
    for (const [keyword, tipoInmueble] of Object.entries(noViviendaMap)) {
      if (tipoRaw.includes(keyword)) {
        return { tipoInmueble, tipoVivienda: null };
      }
    }

    // Es vivienda: determinar el tipo específico
    for (const [keyword, tipoVivienda] of Object.entries(viviendaMap)) {
      if (tipoRaw.includes(keyword)) {
        return { tipoInmueble: 'Vivienda', tipoVivienda };
      }
    }

    // Default
    return { tipoInmueble: 'Vivienda', tipoVivienda: 'Piso' };
  }

  /**
   * Infiere el estado de conservación
   */
  inferirEstado(estadoRaw) {
    if (!estadoRaw) return null;
    const lower = estadoRaw.toLowerCase();
    if (lower.includes('obra nueva') || lower.includes('nueva construcción') || lower.includes('nueva construccion')) return 'ObraNueva';
    if (lower.includes('buen estado') || lower.includes('segunda mano')) return 'BuenEstado';
    if (lower.includes('reformar') || lower.includes('reformado')) return 'BuenEstado';
    if (lower.includes('a reformar')) return 'AReformar';
    return 'BuenEstado';
  }

  /**
   * Infiere la planta desde las características
   */
  inferirPlanta(caracteristicas) {
    if (!Array.isArray(caracteristicas)) return null;
    const joined = caracteristicas.join(' ').toLowerCase();
    if (joined.includes('última planta') || joined.includes('ultima planta') || joined.includes('ático') || joined.includes('atico')) return 'UltimaPlanta';
    if (joined.includes('bajo') || joined.includes('planta baja')) return 'Bajo';
    if (joined.match(/planta\s+\d/)) return 'PlantaIntermedia';
    return null;
  }

  /**
   * Hace matching de características externas con las de la plataforma
   */
  matchCaracteristicas(caracteristicasExternas) {
    if (!Array.isArray(caracteristicasExternas) || caracteristicasExternas.length === 0) return [];

    const matched = new Set();
    const textoCompleto = caracteristicasExternas.join(' | ').toLowerCase();

    for (const [caracteristica, keywords] of Object.entries(CARACTERISTICAS_MATCHING)) {
      for (const keyword of keywords) {
        // Soportar regex en keywords
        try {
          const regex = new RegExp(keyword, 'i');
          if (regex.test(textoCompleto)) {
            matched.add(caracteristica);
            break;
          }
        } catch {
          if (textoCompleto.includes(keyword.toLowerCase())) {
            matched.add(caracteristica);
            break;
          }
        }
      }
    }

    return Array.from(matched);
  }

  /**
   * Parse genérico de valor numérico desde string
   */
  parseNumeric(value) {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return value;
    const match = String(value).match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  /**
   * Transforma los datos del JSON legacy al formato de vivienda de la base de datos
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
