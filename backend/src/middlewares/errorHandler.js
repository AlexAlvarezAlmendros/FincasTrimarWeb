import { logger } from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  // Log del error
  logger.error({
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  }, 'Error en la aplicación');

  // Si ya se envió la respuesta, delegar al manejador por defecto
  if (res.headersSent) {
    return next(err);
  }

  // Determinar código de estado
  let statusCode = err.statusCode || err.status || 500;
  let errorCode = err.code || 'INTERNAL_SERVER_ERROR';
  let message = err.message || 'Error interno del servidor';

  // No exponer detalles internos en producción
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Error interno del servidor';
  }

  res.status(statusCode).json({
    error: {
      code: errorCode,
      message: message
    }
  });
}