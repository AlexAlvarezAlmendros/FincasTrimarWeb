import { z } from 'zod';
import { logger } from '../utils/logger.js';

/**
 * Esquemas de validación para rutas de imágenes
 */

// Esquema para validar subida de imágenes
export const imageUploadSchema = z.object({
  files: z.array(z.object({
    fieldname: z.string(),
    originalname: z.string(),
    encoding: z.string(),
    mimetype: z.enum(['image/jpeg', 'image/jpg', 'image/png', 'image/webp'], {
      message: 'Solo se permiten archivos JPEG, JPG, PNG y WebP'
    }),
    buffer: z.instanceof(Buffer),
    size: z.number().max(10 * 1024 * 1024, 'Archivo demasiado grande (máx. 10MB)')
  })).min(1, 'Se requiere al menos una imagen').max(10, 'Máximo 10 imágenes por vez')
});

// Esquema para asociar imágenes a propiedades
export const propertyImagesSchema = z.object({
  body: z.object({
    images: z.array(z.object({
      url: z.string().url('URL de imagen inválida'),
      orden: z.number().int().min(0).optional()
    })).min(1, 'Se requiere al menos una imagen')
  }),
  params: z.object({
    id: z.string().uuid('ID de vivienda inválido')
  })
});

// Esquema para reordenar imágenes
export const imageReorderSchema = z.object({
  body: z.object({
    imageOrders: z.array(z.object({
      id: z.string().uuid('ID de imagen inválido'),
      orden: z.number().int().positive('El orden debe ser un número positivo')
    })).min(1, 'Se requiere al menos una imagen para reordenar')
  }),
  params: z.object({
    id: z.string().uuid('ID de vivienda inválido')
  })
});

// Esquema para parámetros de imagen individual
export const imageParamsSchema = z.object({
  viviendaId: z.string().uuid('ID de vivienda inválido'),
  imagenId: z.string().uuid('ID de imagen inválido')
});

/**
 * Middleware de validación para subida de imágenes
 */
export const validateImageUpload = (req, res, next) => {
  try {
    // Validar que existen archivos
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_FILES',
          message: 'No se enviaron archivos'
        }
      });
    }

    // Validar cada archivo
    const validation = imageUploadSchema.safeParse({ files: req.files });
    
    if (!validation.success) {
      const errors = validation.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));

      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Archivos inválidos',
          details: errors
        }
      });
    }

    next();

  } catch (error) {
    logger.error('Error validando subida de imágenes:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'VALIDATION_FAILED',
        message: 'Error procesando validación de archivos'
      }
    });
  }
};

/**
 * Middleware de validación para asociar imágenes a propiedades
 */
export const validatePropertyImages = (req, res, next) => {
  try {
    const validation = propertyImagesSchema.safeParse({
      body: req.body,
      params: req.params
    });

    if (!validation.success) {
      const errors = validation.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));

      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Datos de imágenes inválidos',
          details: errors
        }
      });
    }

    next();

  } catch (error) {
    logger.error('Error validando imágenes de propiedad:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'VALIDATION_FAILED',
        message: 'Error procesando validación'
      }
    });
  }
};

/**
 * Middleware de validación para reordenar imágenes
 */
export const validateImageReorder = (req, res, next) => {
  try {
    const validation = imageReorderSchema.safeParse({
      body: req.body,
      params: req.params
    });

    if (!validation.success) {
      const errors = validation.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));

      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Datos de reordenamiento inválidos',
          details: errors
        }
      });
    }

    next();

  } catch (error) {
    logger.error('Error validando reordenamiento de imágenes:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'VALIDATION_FAILED',
        message: 'Error procesando validación'
      }
    });
  }
};

/**
 * Middleware de validación para parámetros de imagen
 */
export const validateImageParams = (req, res, next) => {
  try {
    const validation = imageParamsSchema.safeParse(req.params);

    if (!validation.success) {
      const errors = validation.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));

      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Parámetros inválidos',
          details: errors
        }
      });
    }

    next();

  } catch (error) {
    logger.error('Error validando parámetros de imagen:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'VALIDATION_FAILED',
        message: 'Error procesando validación'
      }
    });
  }
};