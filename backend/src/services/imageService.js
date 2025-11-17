import { logger } from '../utils/logger.js';

/**
 * Servicio para subida de imágenes a ImgBB
 */
class ImageService {
  constructor() {
    this.apiKey = process.env.IMGBB_API_KEY;
    this.baseUrl = 'https://api.imgbb.com/1/upload';
    
    if (!this.apiKey) {
      logger.warn('⚠️  IMGBB_API_KEY no configurada - servicio de imágenes deshabilitado');
    }
  }

  /**
   * Verificar si el servicio está configurado
   */
  isConfigured() {
    return !!this.apiKey;
  }

  /**
   * Validar archivo de imagen
   */
  validateImage(file) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error(`Tipo de archivo no permitido. Permitidos: ${allowedTypes.join(', ')}`);
    }
    
    if (file.size > maxSize) {
      throw new Error(`Archivo demasiado grande. Máximo: ${maxSize / (1024 * 1024)}MB`);
    }
    
    return true;
  }

  /**
   * Subir una imagen a ImgBB
   */
  async uploadSingle(file) {
    try {
      logger.info(`🔍 [UPLOAD] Iniciando subida - Archivo: ${file.originalname}, Tamaño: ${file.size} bytes, Tipo: ${file.mimetype}`);
      
      if (!this.isConfigured()) {
        logger.error('❌ [UPLOAD] ImgBB API key no configurada');
        throw new Error('Servicio de imágenes no configurado');
      }

      // Validar archivo
      this.validateImage(file);
      logger.info('✅ [UPLOAD] Validación de archivo exitosa');

      // Verificar buffer
      if (!file.buffer || file.buffer.length === 0) {
        logger.error('❌ [UPLOAD] Buffer del archivo está vacío');
        throw new Error('Archivo sin contenido');
      }
      
      logger.info(`📦 [UPLOAD] Buffer size: ${file.buffer.length} bytes`);

      // Preparar FormData
      const formData = new FormData();
      formData.append('image', file.buffer.toString('base64'));
      
      if (file.originalname) {
        // Limpiar nombre de archivo
        const cleanName = file.originalname
          .replace(/[^a-zA-Z0-9.-]/g, '_')
          .substring(0, 50);
        formData.append('name', cleanName);
        logger.info(`📝 [UPLOAD] Nombre de archivo: ${cleanName}`);
      }

      logger.info('🌐 [UPLOAD] Enviando petición a ImgBB...');

      // Hacer petición a ImgBB con timeout
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout

      try {
        const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
          method: 'POST',
          body: formData,
          signal: controller.signal,
          headers: {
            'User-Agent': 'Inmobiliaria-API/1.0'
          }
        });

        clearTimeout(timeout);

        logger.info(`📡 [UPLOAD] Respuesta de ImgBB: Status ${response.status}`);

        if (!response.ok) {
          const errorText = await response.text();
          logger.error(`❌ [UPLOAD] Error ImgBB: ${response.status} - ${errorText}`);
          throw new Error(`Error ImgBB ${response.status}: ${errorText}`);
        }

        const result = await response.json();

        if (!result.success) {
          logger.error(`❌ [UPLOAD] ImgBB falló: ${JSON.stringify(result.error)}`);
          throw new Error(`ImgBB falló: ${result.error?.message || 'Error desconocido'}`);
        }

        // Extraer URLs útiles
        const imageData = {
          id: result.data.id,
          url: result.data.url,
          displayUrl: result.data.display_url,
          thumbUrl: result.data.thumb?.url || result.data.url,
          mediumUrl: result.data.medium?.url || result.data.url,
          deleteUrl: result.data.delete_url,
          size: result.data.size,
          width: result.data.width,
          height: result.data.height,
          uploadedAt: new Date().toISOString()
        };

        logger.info(`✅ [UPLOAD] Imagen subida exitosamente: ${imageData.id}`);
        return imageData;

      } catch (fetchError) {
        clearTimeout(timeout);
        
        if (fetchError.name === 'AbortError') {
          logger.error('❌ [UPLOAD] Timeout subiendo a ImgBB (30s)');
          throw new Error('Timeout al subir imagen a ImgBB');
        }
        
        throw fetchError;
      }

    } catch (error) {
      logger.error('❌ [UPLOAD] Error en uploadSingle:', {
        message: error.message,
        stack: error.stack,
        file: file ? {
          name: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
          hasBuffer: !!file.buffer
        } : 'no file'
      });
      throw error;
    }
  }

  /**
   * Subir múltiples imágenes
   */
  async uploadMultiple(files) {
    if (!Array.isArray(files) || files.length === 0) {
      throw new Error('No se proporcionaron archivos');
    }

    const maxFiles = 10;
    if (files.length > maxFiles) {
      throw new Error(`Máximo ${maxFiles} archivos por vez`);
    }

    logger.info(`📤 Subiendo ${files.length} imágenes...`);

    const results = [];
    const errors = [];

    // Procesar archivos secuencialmente para evitar rate limits
    for (let i = 0; i < files.length; i++) {
      try {
        const result = await this.uploadSingle(files[i]);
        results.push({
          index: i,
          success: true,
          data: result
        });
        
        // Pequeña pausa entre uploads
        if (i < files.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
      } catch (error) {
        logger.error(`❌ Error subiendo archivo ${i + 1}:`, error.message);
        errors.push({
          index: i,
          filename: files[i].originalname,
          error: error.message
        });
        
        results.push({
          index: i,
          success: false,
          error: error.message
        });
      }
    }

    const summary = {
      total: files.length,
      successful: results.filter(r => r.success).length,
      failed: errors.length,
      results,
      errors: errors.length > 0 ? errors : undefined
    };

    logger.info(`📊 Upload completado: ${summary.successful}/${summary.total} exitosos`);

    return summary;
  }

  /**
   * Generar URL de placeholder para desarrollo
   */
  generatePlaceholder(width = 800, height = 600, text = 'Imagen') {
    const backgroundColor = '4A90E2';
    const textColor = 'FFFFFF';
    return `https://via.placeholder.com/${width}x${height}/${backgroundColor}/${textColor}?text=${encodeURIComponent(text)}`;
  }

  /**
   * Procesar URLs de imágenes para diferentes tamaños
   */
  processImageUrls(baseUrl) {
    // ImgBB automáticamente genera diferentes tamaños
    // Solo retornamos la URL base, el frontend puede usar parámetros si es necesario
    return {
      original: baseUrl,
      large: baseUrl,
      medium: baseUrl,
      thumb: baseUrl,
      // Para casos especiales, ImgBB permite parámetros como ?width=400
      custom: (width, height) => `${baseUrl}${width ? `?width=${width}` : ''}${height ? `&height=${height}` : ''}`
    };
  }
}

// Instancia singleton
const imageService = new ImageService();

export default imageService;
export { ImageService };