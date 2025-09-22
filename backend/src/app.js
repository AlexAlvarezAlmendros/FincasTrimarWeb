import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { auth } from 'express-oauth2-jwt-bearer';
import { logger } from './utils/logger.js';
import { errorHandler } from './middlewares/error-handler.js';
import { rateLimiter } from './middlewares/rate-limiter.js';

// Importar rutas
import healthRoutes from './routes/health.js';
// import viviendas from './routes/viviendas.js';
// import mensajes from './routes/mensajes.js';
// import images from './routes/images.js';

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

// Auth0 JWT middleware (comentado hasta configurar Auth0)
// const checkJwt = auth({
//   audience: process.env.AUTH0_AUDIENCE,
//   issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
// });

// Rutas públicas
app.use('/api', healthRoutes);
// app.use('/api/v1', viviendas.publicRoutes);
// app.use('/api/v1', mensajes.publicRoutes);

// Rutas protegidas (requieren JWT)
// app.use('/api/v1', checkJwt);
// app.use('/api/v1', viviendas.privateRoutes);
// app.use('/api/v1', images.privateRoutes);
// app.use('/api/v1', mensajes.privateAdminRoutes);

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