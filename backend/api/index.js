// Vercel Serverless Function Wrapper
import app from '../src/app.js';

// Inicializar la base de datos antes de manejar requests
import { initializeDatabase } from '../src/db/client.js';

let dbInitialized = false;

// Middleware para inicializar DB en el primer request
const ensureDbInitialized = async (req, res, next) => {
  if (!dbInitialized) {
    try {
      await initializeDatabase();
      dbInitialized = true;
    } catch (error) {
      console.error('Error initializing database:', error);
    }
  }
  next();
};

app.use(ensureDbInitialized);

export default app;
