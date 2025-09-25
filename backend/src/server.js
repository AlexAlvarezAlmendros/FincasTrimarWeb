import dotenv from 'dotenv';
import app from './app.js';
import { logger } from './utils/logger.js';
import { testConnection } from './db/client.js';
import { runMigrations } from './db/migrations/migrationRunner.js';
import { runSeeds } from './db/seeds/initialData.js';

// Cargar variables de entorno
dotenv.config();

const PORT = process.env.PORT || 8080;

/**
 * Inicializar base de datos
 */
async function initializeDatabase() {
  try {
    logger.info('🗄️  Inicializando base de datos...');
    
    // Verificar conexión
    await testConnection();
    
    // Ejecutar migraciones
    await runMigrations();
    
    // Ejecutar seeds si es desarrollo
    if (process.env.NODE_ENV !== 'production') {
      await runSeeds();
    }
    
    logger.info('✅ Base de datos inicializada correctamente');
  } catch (error) {
    logger.error('❌ Error inicializando base de datos:', error);
    process.exit(1);
  }
}

/**
 * Iniciar servidor
 */
async function startServer() {
  try {
    // Inicializar base de datos
    await initializeDatabase();
    
    // Iniciar servidor HTTP
    app.listen(PORT, () => {
      logger.info(`🚀 Servidor iniciado en puerto ${PORT}`);
      logger.info(`📍 API disponible en http://localhost:${PORT}/api/v1`);
      logger.info(`🏥 Health check en http://localhost:${PORT}/api/health`);
      logger.info(`📖 Documentación: http://localhost:${PORT}/api/v1/docs`);
      
      if (process.env.NODE_ENV === 'development') {
        logger.info('🛠️  Modo desarrollo - Seeds de ejemplo cargados');
      }
    });
  } catch (error) {
    logger.error('❌ Error iniciando servidor:', error);
    process.exit(1);
  }
}

// Manejar cierre graceful
process.on('SIGINT', () => {
  logger.info('🛑 Cerrando servidor...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('🛑 Cerrando servidor...');
  process.exit(0);
});

// Iniciar aplicación
startServer();