import dotenv from 'dotenv';
import app from './app.js';
import { logger } from './utils/logger.js';

// Cargar variables de entorno
dotenv.config();

const PORT = process.env.PORT || 8080;

// Iniciar servidor
app.listen(PORT, () => {
  logger.info(`🚀 Servidor iniciado en puerto ${PORT}`);
  logger.info(`📍 API disponible en http://localhost:${PORT}/api/v1`);
  logger.info(`🏥 Health check en http://localhost:${PORT}/api/health`);
});