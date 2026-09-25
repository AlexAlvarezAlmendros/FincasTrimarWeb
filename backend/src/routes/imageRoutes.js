import { Router } from 'express';
import multer from 'multer';
import imageController from '../controllers/imageController.js';
import { requireCaptador } from '../middlewares/authMiddleware.js';
import { validateImageUpload } from '../schemas/imageSchemas.js';
import { logger } from '../utils/logger.js';

// Configurar multer para manejo de archivos
const upload = multer({
  storage: multer.memoryStorage(), // Almacenar en memoria para procesar
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB por archivo
    files: 10 // Máximo 10 archivos
  },
  fileFilter: (req, file, cb) => {
    // Validar tipos de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    logger.info(`📁 Recibiendo archivo: ${file.originalname}, tipo: ${file.mimetype}`);
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      logger.error(`❌ Tipo de archivo rechazado: ${file.mimetype}`);
      cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}. Permitidos: ${allowedTypes.join(', ')}`), false);
    }
  }
});

// Middleware para manejar errores de multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    let message = 'Error subiendo archivos';
    let code = 'UPLOAD_ERROR';

    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        message = 'Archivo demasiado grande. Máximo 10MB por archivo';
        code = 'FILE_TOO_LARGE';
        break;
      case 'LIMIT_FILE_COUNT':
        message = 'Demasiados archivos. Máximo 10 archivos';
        code = 'TOO_MANY_FILES';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Campo de archivo inesperado';
        code = 'UNEXPECTED_FIELD';
        break;
    }

    return res.status(400).json({
      success: false,
      error: { code, message }
    });
  }

  if (error.message.includes('Tipo de archivo no permitido')) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_FILE_TYPE',
        message: error.message
      }
    });
  }

  next(error);
};

/**
 * Rutas públicas (solo lectura)
 */
export const imagePublicRoutes = Router();

// GET /api/v1/images/status - Estado del servicio
imagePublicRoutes.get('/images/status', imageController.getServiceStatus);

// GET /api/v1/images/debug - Debug info (solo desarrollo/staging)
imagePublicRoutes.get('/images/debug', imageController.getDebugInfo);

// Las rutas de imágenes de una vivienda (GET/POST /viviendas/:id/imagenes,
// PUT .../reorder y DELETE .../:imageId) viven en propertyRoutes.js: ese router
// se monta antes en app.js, así que aquí nunca se alcanzaban.

/**
 * Rutas privadas (requieren autenticación)
 */
export const imagePrivateRoutes = Router();

// POST /api/v1/images - Subir imágenes (requiere Seller, Admin o Captador)
imagePrivateRoutes.post('/images',
  requireCaptador, // Permite AdminTrimar, SellerTrimar y CaptadorTrimar
  upload.array('images', 10), // Máximo 10 archivos con campo 'images'
  handleMulterError,
  validateImageUpload,
  imageController.uploadImages
);

export default { imagePublicRoutes, imagePrivateRoutes };