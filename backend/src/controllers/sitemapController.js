/**
 * Controller para generar sitemap.xml dinámico
 */

import viviendaRepository from '../repos/viviendaRepository.js';

/**
 * Genera el sitemap.xml con todas las URLs del sitio
 */
export const generateSitemap = async (req, res, next) => {
  try {
    // Obtener la URL base del sitio (desde request o configuración)
    const baseUrl = process.env.FRONTEND_URL || 'https://fincastrimar.com';
    
    // Obtener todas las viviendas publicadas
    const viviendas = await viviendaRepository.findAll({ published: true });
    
    // Fecha actual para páginas estáticas
    const today = new Date().toISOString().split('T')[0];
    
    // Construir XML del sitemap
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    // Página principal (mayor prioridad y frecuencia)
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}/</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += '    <changefreq>daily</changefreq>\n';
    xml += '    <priority>1.0</priority>\n';
    xml += '  </url>\n';
    
    // Página de listado de viviendas
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}/viviendas</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += '    <changefreq>daily</changefreq>\n';
    xml += '    <priority>0.9</priority>\n';
    xml += '  </url>\n';
    
    // Páginas estáticas
    const staticPages = [
      { path: '/vender', priority: '0.8', changefreq: 'weekly' },
      { path: '/contacto', priority: '0.8', changefreq: 'weekly' },
      { path: '/politica-privacidad', priority: '0.3', changefreq: 'monthly' },
      { path: '/cookies', priority: '0.3', changefreq: 'monthly' },
      { path: '/terminos-uso', priority: '0.3', changefreq: 'monthly' }
    ];
    
    staticPages.forEach(page => {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}${page.path}</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += '  </url>\n';
    });
    
    // Páginas individuales de viviendas
    viviendas.forEach(vivienda => {
      const lastmod = vivienda.FechaPublicacion 
        ? new Date(vivienda.FechaPublicacion).toISOString().split('T')[0]
        : today;
      
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/viviendas/${vivienda.Id}</loc>\n`;
      xml += `    <lastmod>${lastmod}</lastmod>\n`;
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.7</priority>\n';
      xml += '  </url>\n';
    });
    
    xml += '</urlset>';
    
    // Enviar respuesta con tipo de contenido XML
    res.header('Content-Type', 'application/xml');
    res.send(xml);
    
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error generating sitemap:', error);
    next(error);
  }
};
