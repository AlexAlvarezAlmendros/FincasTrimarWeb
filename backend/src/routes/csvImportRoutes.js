import express from 'express';
import multer from 'multer';
import csvImportController from '../controllers/csvImportController.js';

const router = express.Router();

// Configuración de multer para manejo de archivos CSV en memoria
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB máximo
  },
  fileFilter: (req, file, cb) => {
    // Aceptar archivos CSV
    if (
      file.mimetype === 'text/csv' ||
      file.mimetype === 'application/vnd.ms-excel' ||
      file.mimetype === 'text/plain' ||
      file.originalname.endsWith('.csv')
    ) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos CSV'));
    }
  }
});

/**
 * @route POST /api/v1/csv/import
 * @desc Importa viviendas desde un archivo CSV
 * @access Private (requiere autenticación)
 */
router.post('/import', upload.single('file'), csvImportController.importCsv);

/**
 * @route GET /api/v1/csv/template
 * @desc Descarga una plantilla de ejemplo del CSV
 * @access Private (requiere autenticación)
 */
router.get('/template', csvImportController.getTemplate);

export default router;
