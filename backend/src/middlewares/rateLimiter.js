import { RateLimiterMemory } from 'rate-limiter-flexible';
import { logger } from '../utils/logger.js';

/**
 * Rate limiting de la API.
 * - Sin JWT válido: cupo por IP (API pública y cualquier Bearer falso o caducado).
 * - Con JWT VERIFICADO: cupo propio por usuario (sub), más generoso, que no gasta
 *   el de la IP. Así el trabajo del admin (subir, reordenar, guardar) no agota
 *   el cupo ni compite con los visitantes que salen por la misma IP.
 */
const IP_POINTS = 100;
const USER_POINTS = 2000;
const DURATION_SECONDS = 900; // 15 minutos

const ipLimiter = new RateLimiterMemory({ points: IP_POINTS, duration: DURATION_SECONDS });
const userLimiter = new RateLimiterMemory({ points: USER_POINTS, duration: DURATION_SECONDS });

// authMiddleware valida AUTH0_* al importarse y el .env se carga al importar
// db/client.js: se importa en la primera petición para no depender del orden
// de imports de app.js
let checkJwtPromise = null;
const loadCheckJwt = () => {
  checkJwtPromise ??= import('./authMiddleware.js').then(m => m.checkJwt);
  return checkJwtPromise;
};

/**
 * Verifica de forma opcional el Bearer de la petición.
 * Devuelve el sub si el JWT es válido y null en cualquier otro caso (sin
 * cabecera, token inválido o caducado, o JWKS inaccesible): falla cerrado
 * hacia el cupo por IP.
 */
const getVerifiedSub = async (req, res) => {
  const header = req.headers.authorization;
  if (typeof header !== 'string' || !header.startsWith('Bearer ')) return null;

  try {
    const checkJwt = await loadCheckJwt();
    return await new Promise((resolve) => {
      checkJwt(req, res, (error) => {
        resolve(error ? null : (req.auth?.payload?.sub || null));
      });
    });
  } catch (error) {
    logger.warn('Rate limiter: no se pudo verificar el JWT, se aplica el cupo por IP:', error.message);
    return null;
  }
};

export const rateLimiter = async (req, res, next) => {
  const sub = await getVerifiedSub(req, res);
  const limiter = sub ? userLimiter : ipLimiter;
  const limit = sub ? USER_POINTS : IP_POINTS;

  try {
    await limiter.consume(sub || req.ip);
    next();
  } catch (rejRes) {
    // consume() rechaza con un RateLimiterRes al agotar el cupo; un Error es un fallo interno
    if (rejRes instanceof Error) return next(rejRes);

    const msBeforeNext = rejRes.msBeforeNext || 0;

    res.set({
      'Retry-After': Math.ceil(msBeforeNext / 1000) || 1,
      'X-RateLimit-Limit': limit,
      'X-RateLimit-Remaining': rejRes.remainingPoints || 0,
      'X-RateLimit-Reset': new Date(Date.now() + msBeforeNext).toISOString()
    });

    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Demasiadas solicitudes. Inténtalo de nuevo más tarde.'
      }
    });
  }
};
