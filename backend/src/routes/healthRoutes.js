import { Router } from 'express';

const router = Router();

/**
 * @route GET /api/health
 * @desc Health check endpoint
 * @access Public
 */
const getHealthStatus = (req, res) => {
  const healthInfo = {
    status: 'ok',
    message: '🏠 Fincas Trimar API - ¡Backend funcionando correctamente!',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: 'pending', // TODO: Verificar conexión a Turso
      auth: 'pending',     // TODO: Verificar Auth0
      imgbb: 'pending',    // TODO: Verificar ImgBB
      gmail: 'pending'     // TODO: Verificar Gmail
    }
  };

  res.json(healthInfo);
};

router.get('/health', getHealthStatus);

const getHelloMessage = (req, res) => {
  res.json({
    message: '¡Hola desde Fincas Trimar API! 🏡',
    description: 'La mejor forma de encontrar tu vivienda',
    frontend_connected: true,
    backend_status: 'running',
    next_steps: [
      'Configurar Auth0',
      'Conectar base de datos Turso',
      'Implementar endpoints de viviendas',
      'Configurar ImgBB para imágenes',
      'Configurar Gmail para notificaciones'
    ]
  });
};

/**
 * @route GET /api/v1/hello
 * @desc Hello World endpoint específico
 * @access Public
 */
router.get('/v1/hello', getHelloMessage);

export default router;