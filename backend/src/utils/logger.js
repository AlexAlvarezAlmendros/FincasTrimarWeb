import pino from 'pino';

// Configuración del logger con manejo de errores mejorado
const createLogger = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

  try {
    // En producción, usar formato JSON simple
    if (isProduction) {
      return pino({
        level: 'info',
        formatters: {
          level: (label) => ({ level: label }),
          time: () => ({ time: new Date().toISOString() })
        }
      });
    }

    // En desarrollo, intentar usar pino-pretty
    if (isDevelopment) {
      return pino({
        level: 'debug',
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'yyyy-mm-dd HH:MM:ss',
            ignore: 'pid,hostname',
            levelFirst: true
          }
        }
      });
    }
  } catch (error) {
    // Fallback: logger simple sin pretty printing
    // Crear logger básico primero
    const basicLogger = pino({
      level: isDevelopment ? 'debug' : 'info',
      formatters: {
        level: (label) => ({ level: label }),
        time: () => ({ time: new Date().toISOString() })
      }
    });
    
    // Ahora usar el logger para el warning
    basicLogger.warn('pino-pretty not available, using basic logger format');
    return basicLogger;
  }
};

export const logger = createLogger();