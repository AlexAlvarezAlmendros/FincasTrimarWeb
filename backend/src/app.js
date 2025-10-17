import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { logger } from './utils/logger.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { rateLimiter } from './middlewares/rateLimiter.js';

// Importar rutas
import healthRoutes from './routes/healthRoutes.js';
import { publicRoutes as propertyPublicRoutes, privateRoutes as propertyPrivateRoutes } from './routes/propertyRoutes.js';
import { publicRoutes as messagePublicRoutes, privateRoutes as messagePrivateRoutes } from './routes/messageRoutes.js';
import { imagePublicRoutes, imagePrivateRoutes } from './routes/imageRoutes.js';
import htmlParserRoutes from './routes/htmlParserRoutes.js';
import { privateRoutes as dashboardPrivateRoutes } from './routes/dashboardRoutes.js';
import csvImportRoutes from './routes/csvImportRoutes.js';

const app = express();

// Middleware de seguridad
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Logging
app.use(morgan('combined', { 
  stream: { 
    write: (message) => logger.info(message.trim()) 
  } 
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting para rutas públicas
app.use('/api/', rateLimiter);

// Middleware de autenticación (configurado en authMiddleware.js)
import { debugCheckJwt } from './middlewares/authMiddleware.js';
import propertyController from './controllers/propertyController.js';

// Rutas públicas (sin autenticación)
app.use('/api', healthRoutes);

// IMPORTANTE: Registrar rutas específicas de captación ANTES de las rutas públicas generales
// para evitar que /viviendas/:id capture "captacion" como un ID
app.get('/api/v1/viviendas/captacion', debugCheckJwt, propertyController.getCaptacionProperties);

// Rutas públicas generales
app.use('/api/v1', propertyPublicRoutes);
app.use('/api/v1', messagePublicRoutes);
app.use('/api/v1', imagePublicRoutes);
app.use('/api/v1/parse', htmlParserRoutes);

// Rutas protegidas (requieren JWT) - usando middleware de debug
app.use('/api/v1', debugCheckJwt);
app.use('/api/v1', propertyPrivateRoutes);
app.use('/api/v1', messagePrivateRoutes);
app.use('/api/v1', imagePrivateRoutes);
app.use('/api/v1', dashboardPrivateRoutes);
app.use('/api/v1/csv', csvImportRoutes);

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'Ruta no encontrada'
    }
  });
});

// Manejo global de errores
app.use(errorHandler);

export default app;