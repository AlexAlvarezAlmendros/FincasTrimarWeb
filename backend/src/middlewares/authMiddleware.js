import { auth } from 'express-oauth2-jwt-bearer';
import crypto from 'crypto';
import { logger } from '../utils/logger.js';

/**
 * Middleware de autenticación con Auth0
 * Verifica JWT tokens y permisos de usuario
 */

// Validar que Auth0 esté configurado correctamente
if (!process.env.AUTH0_AUDIENCE || !process.env.AUTH0_ISSUER_BASE_URL) {
  throw new Error(
    'Auth0 no está configurado correctamente. Configura AUTH0_AUDIENCE y AUTH0_ISSUER_BASE_URL en el archivo .env'
  );
}

// console.log('🔐 Configurando Auth0 middleware:');
// console.log('  Audience:', process.env.AUTH0_AUDIENCE);
// console.log('  Issuer:', process.env.AUTH0_ISSUER_BASE_URL);

// Configuración del middleware de JWT (SIEMPRE requerido)
export const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  tokenSigningAlg: 'RS256'
});

// Middleware personalizado para debugging
export const debugCheckJwt = (req, res, next) => {
  // console.log('🔍 Request a endpoint protegido:');
  // console.log('  URL:', req.originalUrl);
  // console.log('  Method:', req.method);
  // console.log('  Headers:', Object.keys(req.headers));
  // console.log('  Auth header presente:', !!req.headers.authorization);
  // console.log('  Auth header:', req.headers.authorization ? req.headers.authorization.substring(0, 50) + '...' : 'AUSENTE');
  
  // if (req.headers.authorization) {
  //   console.log('  Bearer format:', req.headers.authorization.startsWith('Bearer '));
  // }
  
  // Ejecutar el middleware real de Auth0
  checkJwt(req, res, (error) => {
    if (error) {
      // console.log('❌ Error en Auth0 middleware:', error.message);
      // console.log('  Error type:', error.constructor.name);
      // console.log('  Error stack:', error.stack);
      
      // if (error.constructor.name === 'InvalidRequestError') {
      //   console.log('  💡 InvalidRequestError - Posibles causas:');
      //   console.log('    - Token malformado');
      //   console.log('    - Header Authorization incorrecto');
      //   console.log('    - Token sin Bearer prefix');
      //   console.log('    - Audience incorrecto');
      // }
      
      // Respuesta más específica para InvalidRequestError
      if (error.constructor.name === 'InvalidRequestError') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Token de autorización inválido o malformado',
            details: 'Verifica que el token JWT esté bien formado y contenga el audience correcto'
          }
        });
      }
      
      return next(error);
    }
    
    // console.log('✅ Auth0 middleware exitoso');
    // if (req.auth) {
    //   console.log('  User ID:', req.auth.sub);
    // }
    next();
  });
};

/**
 * Middleware para verificar roles específicos
 * @param {Array} allowedRoles - Roles permitidos para acceder al endpoint
 */
export const requireRoles = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      // El middleware checkJwt debe ejecutarse antes
      if (!req.auth) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Token de acceso requerido'
          }
        });
      }
      
      // Obtener roles del token (Auth0 claim personalizado)
      // IMPORTANTE: express-oauth2-jwt-bearer pone los datos en req.auth.payload
      const authData = req.auth.payload || req.auth;
      
      // console.log('🔍 Debugging roles en Vercel:', {
      //   hasPayload: !!req.auth.payload,
      //   sub: authData.sub,
      //   permissions: authData.permissions,
      //   otpRecordsClaim: authData['https://otp-records.com/roles']
      // });
      
      const userRoles = authData['https://otp-records.com/roles'] || authData.permissions || authData[`${process.env.AUTH0_AUDIENCE}/roles`] || [];
      // console.log('📋 Role verification:', {
      //   userRoles,
      //   allowedRoles,
      //   endpoint: req.originalUrl,
      //   hasRoles: userRoles.length > 0
      // });
      
      // Si no se especifican roles, permitir acceso con token válido
      if (allowedRoles.length === 0) {
        return next();
      }
      
      // Verificar si el usuario tiene al menos uno de los roles requeridos
      const hasRequiredRole = allowedRoles.some(role => userRoles.includes(role));
      // console.log('✅ Role check result:', { hasRequiredRole, userRoles, allowedRoles });
      
      if (!hasRequiredRole) {
        console.error('❌ Acceso denegado - Roles insuficientes:', {
          userId: authData.sub,
          userRoles,
          requiredRoles: allowedRoles,
          endpoint: req.originalUrl,
          environment: process.env.NODE_ENV
        });
        
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'No tienes permisos suficientes para acceder a este recurso',
            debug: {
              userRoles,
              requiredRoles: allowedRoles,
              userId: authData.sub,
              checkedNamespaces: [
                'https://otp-records.com/roles',
                'permissions',
                `${process.env.AUTH0_AUDIENCE}/roles`
              ],
              hint: 'Verifica que tu Auth0 Action agregue roles al Access Token (api.accessToken.setCustomClaim)'
            }
          }
        });
      }
      
      // Agregar información del usuario al request
      req.user = {
        id: authData.sub,
        roles: userRoles,
        email: authData['https://otp-records.com/email'] || authData[`${process.env.AUTH0_AUDIENCE}/email`] || null
      };
      
      next();
    } catch (error) {
      logger.error('Error en verificación de roles:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error interno del servidor'
        }
      });
    }
  };
};

/**
 * Middleware específico para rutas de Admin
 */
export const requireAdmin = requireRoles(['AdminTrimar']);

/**
 * Compara dos secretos en tiempo constante (evita timing attacks).
 * Se hashean ambos con SHA-256 para trabajar siempre con buffers de igual
 * longitud (timingSafeEqual lanza si difieren) y no filtrar la longitud real.
 */
const safeCompare = (a, b) => {
  const hash = (v) => crypto.createHash('sha256').update(String(v)).digest();
  return crypto.timingSafeEqual(hash(a), hash(b));
};

/**
 * Autenticación por API key para acceso máquina-a-máquina (integraciones externas).
 * La clave se envía en la cabecera `X-API-Key` y se compara contra
 * `JSON_IMPORT_API_KEY` (admite varias claves separadas por comas para rotación).
 * Devuelve true y marca el request si la clave es válida.
 */
const hasValidApiKey = (req) => {
  const provided = req.headers['x-api-key'];
  const configured = process.env.JSON_IMPORT_API_KEY;

  if (!provided || !configured) return false;

  const validKeys = configured.split(',').map(k => k.trim()).filter(Boolean);
  const match = validKeys.some(key => safeCompare(provided, key));

  if (match) {
    // Identidad de servicio con permisos equivalentes a Admin
    req.user = { id: 'api-key', roles: ['AdminTrimar'], viaApiKey: true };
  }
  return match;
};

/**
 * Middleware de auth dual para endpoints accesibles desde fuera.
 * Permite el acceso si:
 *   1) Se aporta una API key válida en `X-API-Key`, o
 *   2) El request trae un JWT de Auth0 válido con rol Admin (UI interna).
 * Así el mismo endpoint sirve a integraciones externas y al panel de administración.
 */
export const requireApiKeyOrAdmin = (req, res, next) => {
  if (hasValidApiKey(req)) {
    return next();
  }

  // Sin API key válida → exigir JWT de Auth0 + rol Admin
  return checkJwt(req, res, (error) => {
    if (error) {
      // Petición externa sin credenciales válidas
      if (!req.headers.authorization) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Se requiere una API key válida (cabecera X-API-Key) o un token de administrador'
          }
        });
      }
      return next(error);
    }
    return requireAdmin(req, res, next);
  });
};

/**
 * Middleware específico para rutas de Seller (Seller o Admin)
 */
export const requireSeller = requireRoles(['SellerTrimar', 'AdminTrimar']);

/**
 * Middleware específico para rutas de Captador
 */
export const requireCaptador = requireRoles(['CaptadorTrimar', 'SellerTrimar', 'AdminTrimar']);

/**
 * Middleware para verificar si el usuario puede modificar una propiedad
 * Solo el propietario o un Admin pueden modificar
 */
export const canModifyProperty = async (req, res, next) => {
  try {
    // const { id: propertyId } = req.params;
    // const userId = req.user?.id;
    const userRoles = req.user?.roles || [];
    
    // Los Admin pueden modificar cualquier propiedad
    if (userRoles.includes('AdminTrimar')) {
      return next();
    }
    
    // TODO: Implementar verificación de propiedad del recurso
    // Aquí deberíamos verificar si el userId es el propietario de la propiedad
    // Por ahora, permitir a Sellers modificar sus propias propiedades
    if (userRoles.includes('SellerTrimar')) {
      // En una implementación completa, verificaríamos:
      // const property = await propertyService.getPropertyById(propertyId);
      // if (property.ownerId === userId) return next();
      return next();
    }
    
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Solo puedes modificar tus propias propiedades'
      }
    });
  } catch (error) {
    logger.error('Error verificando permisos de propiedad:', error);
    next(error);
  }
};

/**
 * Middleware opcional de autenticación
 * No falla si no hay token, pero añade información del usuario si está presente
 */
export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  
  // Si hay token, usar el middleware de autenticación normal
  return checkJwt(req, res, (error) => {
    if (error) {
      // Si hay error con el token, continuar sin autenticación
      return next();
    }
    
    // Si el token es válido, agregar información del usuario
    if (req.auth) {
      const authData = req.auth.payload || req.auth;
      req.user = {
        id: authData.sub,
        roles: authData['https://otp-records.com/roles'] || authData.permissions || authData[`${process.env.AUTH0_AUDIENCE}/roles`] || [],
        email: authData['https://otp-records.com/email'] || authData[`${process.env.AUTH0_AUDIENCE}/email`] || null
      };
    }
    
    next();
  });
};