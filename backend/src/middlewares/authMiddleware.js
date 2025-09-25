import { auth } from 'express-oauth2-jwt-bearer';
import { logger } from '../utils/logger.js';

/**
 * Middleware de autenticación con Auth0
 * Verifica JWT tokens y permisos de usuario
 */

// Verificar si Auth0 está configurado
const isAuth0Configured = () => {
  return !!(process.env.AUTH0_AUDIENCE && process.env.AUTH0_ISSUER_BASE_URL);
};

// Configuración del middleware de JWT (solo si está configurado)
export const checkJwt = isAuth0Configured() 
  ? auth({
      audience: process.env.AUTH0_AUDIENCE,
      issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
      tokenSigningAlg: 'RS256'
    })
  : (req, res, next) => {
      logger.warn('⚠️  Auth0 no configurado - saltando verificación JWT');
      // En desarrollo sin Auth0, simular usuario admin
      req.auth = {
        sub: 'dev-user-123',
        permissions: ['Admin'],
        [`${process.env.AUTH0_AUDIENCE || 'https://api.localhost'}/roles`]: ['Admin'],
        [`${process.env.AUTH0_AUDIENCE || 'https://api.localhost'}/email`]: 'dev@localhost'
      };
      next();
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
      const userRoles = req.auth.permissions || req.auth[`${process.env.AUTH0_AUDIENCE}/roles`] || [];
      
      // Si no se especifican roles, permitir acceso con token válido
      if (allowedRoles.length === 0) {
        return next();
      }
      
      // Verificar si el usuario tiene al menos uno de los roles requeridos
      const hasRequiredRole = allowedRoles.some(role => userRoles.includes(role));
      
      if (!hasRequiredRole) {
        logger.warn('Acceso denegado - Roles insuficientes:', {
          userId: req.auth.sub,
          userRoles,
          requiredRoles: allowedRoles
        });
        
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'No tienes permisos suficientes para acceder a este recurso'
          }
        });
      }
      
      // Agregar información del usuario al request
      req.user = {
        id: req.auth.sub,
        roles: userRoles,
        email: req.auth[`${process.env.AUTH0_AUDIENCE}/email`] || null
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
export const requireAdmin = requireRoles(['Admin']);

/**
 * Middleware específico para rutas de Seller (Seller o Admin)
 */
export const requireSeller = requireRoles(['Seller', 'Admin']);

/**
 * Middleware específico para rutas de Captador
 */
export const requireCaptador = requireRoles(['Captador', 'Seller', 'Admin']);

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
    if (userRoles.includes('Admin')) {
      return next();
    }
    
    // TODO: Implementar verificación de propiedad del recurso
    // Aquí deberíamos verificar si el userId es el propietario de la propiedad
    // Por ahora, permitir a Sellers modificar sus propias propiedades
    if (userRoles.includes('Seller')) {
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
      req.user = {
        id: req.auth.sub,
        roles: req.auth.permissions || req.auth[`${process.env.AUTH0_AUDIENCE}/roles`] || [],
        email: req.auth[`${process.env.AUTH0_AUDIENCE}/email`] || null
      };
    }
    
    next();
  });
};