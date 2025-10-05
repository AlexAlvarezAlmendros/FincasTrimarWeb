import { JSDOM } from 'jsdom';
import { logger } from '../utils/logger.js';

class IdealistaParserService {
  constructor() {
    // Selectores comunes para extraer información de Idealista
    this.selectors = {
      title: 'h1.main-info__title, .main-info__title-main',
      price: '.info-data-price, .main-info__title-minor',
      description: '.comment .expandable-content, .adCommentsLanguage',
      features: '.details-property_features li',
      characteristics: '.info-features li',
      location: '.main-info__title-minor, .breadcrumb-area',
      images: '.detail-multimedia-gallery img, .gallery-image img',
      rooms: '.info-data-price + .info-data span:contains("hab")',
      bathrooms: '.info-data span:contains("baño")',
      size: '.info-data span:contains("m²")',
      type: '.breadcrumb-area a, .main-info__title',
    };
  }

  /**
   * Parsea un archivo HTML de Idealista y extrae información de la propiedad
   * @param {string} htmlContent - Contenido HTML del archivo
   * @returns {Object} Datos estructurados de la propiedad
   */
  parseProperty(htmlContent) {
    try {
      const dom = new JSDOM(htmlContent);
      const document = dom.window.document;

      // Debug: log de elementos encontrados
      logger.info('Iniciando parsing - título de página:', document.title);
      logger.info('H1 encontrados:', Array.from(document.querySelectorAll('h1')).map(h => h.textContent.trim()));

      const extractedData = {
        name: this.extractTitle(document),
        shortDescription: this.extractShortDescription(document),
        description: this.extractDescription(document),
        price: this.extractPrice(document),
        rooms: this.extractRooms(document),
        bathRooms: this.extractBathrooms(document),
        squaredMeters: this.extractSize(document),
        location: this.extractLocation(document),
        tipoInmueble: this.extractPropertyType(document),
        tipoVivienda: this.extractHousingType(document),
        caracteristicas: this.extractCharacteristics(document),
        images: this.extractImages(document),
        estado: 'BuenEstado', // Por defecto
        tipoAnuncio: 'Venta', // Extraer del contexto si es posible
      };

      logger.info('Propiedad parseada exitosamente', { title: extractedData.name });
      return extractedData;

    } catch (error) {
      logger.error('Error al parsear HTML de Idealista', error);
      throw new Error('Error al procesar el archivo HTML');
    }
  }

  /**
   * Extrae el título de la propiedad
   */
  extractTitle(document) {
    // Múltiples selectores para diferentes versiones de Idealista
    const titleSelectors = [
      'h1.main-info__title',
      'h1[data-test="property-title"]',
      '.main-info__title-main',
      '.main-info__title',
      'h1.detail-info__title',
      '.property-title',
      'h1:contains("Dúplex")',
      'h1:contains("Piso")',
      'h1:contains("Casa")',
      'title', // Como último recurso, usar el título de la página
      'h1' // Cualquier h1
    ];

    for (const selector of titleSelectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent.trim()) {
        let title = element.textContent.trim();
        // Si es el title tag, limpiar el sufijo de Idealista
        if (selector === 'title') {
          title = title.replace(/\s*—\s*idealista$/, '').trim();
        }
        if (title && title !== 'Título no encontrado') {
          return title;
        }
      }
    }

    return 'Título no encontrado';
  }

  /**
   * Extrae el precio de la propiedad
   */
  extractPrice(document) {
    const priceSelectors = [
      '.info-data-price',
      '[data-test="price"]',
      '.main-info__title-minor',
      '.price',
      '.property-price',
      '.detail-info__price'
    ];

    for (const selector of priceSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        const priceText = element.textContent;
        // Buscar patrones de precio más flexibles
        const priceMatch = priceText.match(/(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d+)?)\s*€?/);
        if (priceMatch) {
          const cleanPrice = priceMatch[1].replace(/[.,]/g, '');
          const price = parseInt(cleanPrice);
          if (price > 0) {
            return price;
          }
        }
      }
    }
    return 0;
  }

  /**
   * Extrae la descripción larga de la propiedad
   */
  extractDescription(document) {
    const descriptionSelectors = [
      '.comment .expandable-content',
      '[data-test="description"]',
      '.adCommentsLanguage',
      '.comments-container .expandable-content',
      '.description-content',
      '.property-description',
      '.detail-description',
      '.comment',
      '.comments'
    ];

    for (const selector of descriptionSelectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent.trim()) {
        return element.textContent.trim();
      }
    }

    // Si no encuentra descripción específica, buscar párrafos largos de texto
    const paragraphs = document.querySelectorAll('p');
    for (const p of paragraphs) {
      const text = p.textContent.trim();
      if (text.length > 100 && !text.includes('©') && !text.includes('idealista')) {
        return text;
      }
    }

    return '';
  }

  /**
   * Extrae una descripción corta basada en características principales
   */
  extractShortDescription(document) {
    const characteristics = [];
    
    // Buscar habitaciones
    const rooms = this.extractRooms(document);
    if (rooms > 0) characteristics.push(`${rooms} habitaciones`);

    // Buscar baños
    const bathrooms = this.extractBathrooms(document);
    if (bathrooms > 0) characteristics.push(`${bathrooms} baños`);

    // Buscar metros cuadrados
    const size = this.extractSize(document);
    if (size > 0) characteristics.push(`${size} m²`);

    return characteristics.join(', ');
  }

  /**
   * Extrae el número de habitaciones
   */
  extractRooms(document) {
    // Buscar específicamente en div info-features primero
    const infoFeaturesDiv = document.querySelector('.info-features, .info-data');
    if (infoFeaturesDiv) {
      const text = infoFeaturesDiv.textContent;
      const patterns = [
        /(\d+)\s*hab(?:itacion)?(?:es)?/i,
        /(\d+)\s*dorm(?:itorio)?(?:s)?/i,
        /hab(?:itacion)?(?:es)?:?\s*(\d+)/i
      ];
      
      for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
          const rooms = parseInt(match[1]);
          if (rooms > 0 && rooms <= 20) {
            logger.info('Habitaciones encontradas en info-features:', rooms);
            return rooms;
          }
        }
      }
    }

    // Buscar en otros elementos como fallback
    const searchElements = document.querySelectorAll('*');
    
    for (const element of searchElements) {
      const text = element.textContent;
      const patterns = [
        /(\d+)\s*hab(?:itacion)?(?:es)?/i,
        /(\d+)\s*dorm(?:itorio)?(?:s)?/i,
        /(\d+)\s*cuartos?/i,
        /hab(?:itacion)?(?:es)?:?\s*(\d+)/i,
        /dormitorios?:?\s*(\d+)/i
      ];
      
      for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
          const rooms = parseInt(match[1]);
          if (rooms > 0 && rooms <= 20) {
            return rooms;
          }
        }
      }
    }
    return 0;
  }

  /**
   * Extrae el número de baños
   */
  extractBathrooms(document) {
    const searchElements = document.querySelectorAll('*');
    
    for (const element of searchElements) {
      const text = element.textContent;
      // Patrones para baños
      const patterns = [
        /(\d+)\s*baño?s?/i,
        /(\d+)\s*aseos?/i,
        /baños?:?\s*(\d+)/i,
        /aseos?:?\s*(\d+)/i
      ];
      
      for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
          const baths = parseInt(match[1]);
          if (baths > 0 && baths <= 10) { // Validación razonable
            return baths;
          }
        }
      }
    }
    return 0;
  }

  /**
   * Extrae los metros cuadrados
   */
  extractSize(document) {
    // Buscar específicamente en div info-features primero
    const infoFeaturesDiv = document.querySelector('.info-features, .info-data');
    if (infoFeaturesDiv) {
      const text = infoFeaturesDiv.textContent;
      const patterns = [
        /(\d+)\s*m²?/i,
        /(\d+)\s*metros??\s*cuadrados?/i,
        /(\d+)\s*m2/i,
        /superficie:?\s*(\d+)\s*m/i
      ];
      
      for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
          const size = parseInt(match[1]);
          if (size > 20 && size <= 2000) {
            logger.info('Metros cuadrados encontrados en info-features:', size);
            return size;
          }
        }
      }
    }

    // Buscar en otros elementos como fallback
    const searchElements = document.querySelectorAll('*');
    
    for (const element of searchElements) {
      const text = element.textContent;
      const patterns = [
        /(\d+)\s*m²?/i,
        /(\d+)\s*metros??\s*cuadrados?/i,
        /(\d+)\s*m2/i,
        /superficie:?\s*(\d+)\s*m/i,
        /tamaño:?\s*(\d+)\s*m/i
      ];
      
      for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
          const size = parseInt(match[1]);
          if (size > 20 && size <= 2000) {
            return size;
          }
        }
      }
    }
    return 0;
  }

  /**
   * Extrae información de ubicación
   */
  extractLocation(document) {
    // Buscar específicamente en main-info__title-minor primero
    const titleMinorElement = document.querySelector('.main-info__title-minor');
    if (titleMinorElement) {
      const locationText = titleMinorElement.textContent.trim();
      logger.info('Ubicación encontrada en main-info__title-minor:', locationText);
      
      // Intentar separar provincia, población, etc.
      const parts = locationText.split(',').map(part => part.trim());
      return {
        poblacion: parts[0] || '',
        provincia: parts[1] || '',
        fullLocation: locationText
      };
    }

    // Fallback: buscar en breadcrumb u otros elementos
    const locationSelectors = [
      '.breadcrumb-area',
      '[data-test="address-title"]',
      '.location',
      '.address'
    ];

    for (const selector of locationSelectors) {
      const locationElement = document.querySelector(selector);
      if (locationElement) {
        const locationText = locationElement.textContent.trim();
        const parts = locationText.split(',').map(part => part.trim());
        return {
          poblacion: parts[0] || '',
          provincia: parts[1] || '',
          fullLocation: locationText
        };
      }
    }

    return { poblacion: '', provincia: '', fullLocation: '' };
  }

  /**
   * Extrae el tipo de inmueble
   */
  extractPropertyType(document) {
    const breadcrumbElements = document.querySelectorAll('.breadcrumb-area a, .breadcrumb li');
    for (const element of breadcrumbElements) {
      const text = element.textContent.toLowerCase();
      if (text.includes('piso') || text.includes('apartamento')) return 'Vivienda';
      if (text.includes('casa') || text.includes('chalet')) return 'Vivienda';
      if (text.includes('oficina')) return 'Oficina';
      if (text.includes('local')) return 'Local';
      if (text.includes('garaje')) return 'Garaje';
      if (text.includes('terreno')) return 'Terreno';
    }
    return 'Vivienda'; // Por defecto
  }

  /**
   * Extrae el tipo específico de vivienda
   */
  extractHousingType(document) {
    const titleElement = document.querySelector('h1');
    if (titleElement) {
      const title = titleElement.textContent.toLowerCase();
      if (title.includes('dúplex') || title.includes('duplex')) return 'Dúplex';
      if (title.includes('ático')) return 'Ático';
      if (title.includes('piso')) return 'Piso';
      if (title.includes('casa')) return 'Casa';
      if (title.includes('chalet')) return 'Chalet';
      if (title.includes('villa')) return 'Villa';
      if (title.includes('loft')) return 'Loft';
    }
    return 'Piso'; // Por defecto
  }

  /**
   * Extrae características de la propiedad
   */
  extractCharacteristics(document) {
    const characteristics = {};
    
    // Buscar específicamente en details-property_features primero
    const detailsFeaturesDiv = document.querySelector('.details-property_features');
    if (detailsFeaturesDiv) {
      const featureElements = detailsFeaturesDiv.querySelectorAll('li, .info-feature-item');
      logger.info('Características encontradas en details-property_features:', featureElements.length);
      
      featureElements.forEach(element => {
        const text = element.textContent.toLowerCase().trim();
        
        // Mapear características comunes con patrones más específicos
        if (text.includes('ascensor')) characteristics.Ascensor = true;
        if (text.includes('terraza')) characteristics.Terraza = true;
        if (text.includes('balcón') || text.includes('balcon')) characteristics.Balcón = true;
        if (text.includes('garaje') || text.includes('parking')) characteristics.Garaje = true;
        if (text.includes('jardín') || text.includes('jardin')) characteristics.Jardín = true;
        if (text.includes('piscina')) characteristics.Piscina = true;
        if (text.includes('aire acondicionado') || text.includes('a/a') || text.includes('climatización')) characteristics.AireAcondicionado = true;
        if (text.includes('calefacción') || text.includes('calefaccion')) characteristics.Calefacción = true;
        if (text.includes('armarios empotrados') || text.includes('armarios')) characteristics.ArmariosEmpotrados = true;
        if (text.includes('trastero')) characteristics.Trastero = true;
        if (text.includes('exterior') || text.includes('luminoso')) characteristics.Exterior = true;
        if (text.includes('vistas al mar')) characteristics.VistasAlMar = true;
        if (text.includes('vistas a montaña') || text.includes('vistas montaña')) characteristics.VistasAMontaña = true;
      });
    }

    // Fallback: buscar en otros elementos
    if (Object.keys(characteristics).length === 0) {
      const featureElements = document.querySelectorAll('.info-features li, .features li, .property-features li');
      
      featureElements.forEach(element => {
        const text = element.textContent.toLowerCase().trim();
        
        if (text.includes('ascensor')) characteristics.Ascensor = true;
        if (text.includes('terraza')) characteristics.Terraza = true;
        if (text.includes('balcón')) characteristics.Balcón = true;
        if (text.includes('garaje')) characteristics.Garaje = true;
        if (text.includes('jardín')) characteristics.Jardín = true;
        if (text.includes('piscina')) characteristics.Piscina = true;
        if (text.includes('aire acondicionado')) characteristics.AireAcondicionado = true;
        if (text.includes('calefacción')) characteristics.Calefacción = true;
        if (text.includes('armarios empotrados')) characteristics.ArmariosEmpotrados = true;
      });
    }

    return characteristics;
  }

  /**
   * Extrae URLs de imágenes
   */
  extractImages(document) {
    const images = [];
    const imageElements = document.querySelectorAll('.detail-multimedia-gallery img, .gallery-image img, [data-test="gallery"] img');
    
    imageElements.forEach((img, index) => {
      const src = img.getAttribute('src') || img.getAttribute('data-src');
      if (src && src.includes('http')) {
        images.push({
          url: src,
          orden: index + 1
        });
      }
    });

    return images;
  }

  /**
   * Valida que los datos extraídos sean válidos
   */
  validateExtractedData(data) {
    const errors = [];

    if (!data.name || data.name === 'Título no encontrado') {
      errors.push('No se pudo extraer el título de la propiedad');
    }

    if (data.price <= 0) {
      errors.push('No se pudo extraer el precio de la propiedad');
    }

    if (!data.description) {
      errors.push('No se pudo extraer la descripción de la propiedad');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default new IdealistaParserService();