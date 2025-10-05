import express from 'express';
import { htmlParserController, uploadHtml } from '../controllers/htmlParserController.js';
import { rateLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

/**
 * @route POST /api/v1/parse/idealista/upload
 * @desc Parsea un archivo HTML de Idealista subido
 * @access Public (con rate limit)
 */
router.post('/idealista/upload', 
  rateLimiter, // Usar el rate limiter global
  uploadHtml,
  htmlParserController.parseIdealistaHtml
);

/**
 * @route POST /api/v1/parse/idealista/text
 * @desc Parsea contenido HTML de Idealista enviado como texto
 * @access Public (con rate limit)
 */
router.post('/idealista/text',
  rateLimiter, // Usar el rate limiter global
  htmlParserController.parseHtmlText
);

/**
 * @route POST /api/v1/parse/idealista/url
 * @desc Parsea una URL de Idealista (futuro)
 * @access Public (con rate limit)
 */
router.post('/idealista/url',
  rateLimiter, // Usar el rate limiter global
  htmlParserController.parseIdealistaUrl
);

/**
 * @route GET /api/v1/parse/info
 * @desc Obtiene información sobre el servicio de parsing
 * @access Public
 */
router.get('/info', htmlParserController.getParserInfo);

export default router;