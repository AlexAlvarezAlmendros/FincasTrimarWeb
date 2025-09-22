import { RateLimiterMemory } from 'rate-limiter-flexible';

// Rate limiter para API pública
const rateLimiterInstance = new RateLimiterMemory({
  keyGen: (req) => req.ip,
  points: 100, // 100 requests
  duration: 900, // por 15 minutos (900 segundos)
});

export async function rateLimiter(req, res, next) {
  try {
    await rateLimiterInstance.consume(req.ip);
    next();
  } catch (rejRes) {
    const remainingPoints = rejRes.remainingPoints || 0;
    const msBeforeNext = rejRes.msBeforeNext || 0;
    
    res.set({
      'Retry-After': Math.round(msBeforeNext / 1000) || 1,
      'X-RateLimit-Limit': 100,
      'X-RateLimit-Remaining': remainingPoints,
      'X-RateLimit-Reset': new Date(Date.now() + msBeforeNext)
    });
    
    res.status(429).json({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Demasiadas solicitudes. Inténtalo de nuevo más tarde.'
      }
    });
  }
}