/**
 * Rutas para sitemap.xml
 */

import express from 'express';
import { generateSitemap } from '../controllers/sitemapController.js';

const router = express.Router();

// GET /sitemap.xml - Genera el sitemap dinámicamente
router.get('/sitemap.xml', generateSitemap);

export default router;
