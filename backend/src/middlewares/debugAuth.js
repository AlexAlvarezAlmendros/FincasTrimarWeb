import { logger } from '../utils/logger.js';

/**
 * Middleware de debug para verificar tokens JWT
 */
export const debugAuth = (req, res, next) => {
  logger.info('🔍 Debug Auth - Request Info:');
  logger.info('URL:', req.originalUrl);
  logger.info('Method:', req.method);
  logger.info('Headers Authorization:', req.headers.authorization ? 'PRESENTE' : 'AUSENTE');
  
  if (req.headers.authorization) {
    const authHeader = req.headers.authorization;
    logger.info('Auth Header:', authHeader.substring(0, 20) + '...');
    
    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      logger.info('Token presente:', token ? 'SÍ' : 'NO');
      logger.info('Token length:', token ? token.length : 0);
      logger.info('Token preview:', token ? token.substring(0, 50) + '...' : 'N/A');
    } else {
      logger.warn('⚠️ Authorization header no tiene formato Bearer');
    }
  } else {
    logger.warn('⚠️ No hay Authorization header');
  }
  
  next();
};