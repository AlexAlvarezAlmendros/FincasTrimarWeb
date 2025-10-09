/**
 * Configuración de Auth0 optimizada para persistencia de sesión
 * Incluye todas las mejores prácticas para SPAs
 */

export const auth0Config = {
  // Configuración básica
  domain: import.meta.env.VITE_AUTH0_DOMAIN,
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
  
  // Parámetros de autorización
  authorizationParams: {
    redirect_uri: window.location.origin,
    audience: import.meta.env.VITE_AUTH0_AUDIENCE,
    scope: "openid profile email read:viviendas write:viviendas read:mensajes write:mensajes"
  },

  // Configuración de persistencia mejorada
  cacheLocation: "localstorage", // Almacenar en localStorage para persistencia
  useRefreshTokens: true, // Habilitar refresh tokens
  useRefreshTokensFallback: false, // No usar fallback automático

  // Configuración de advanced features
  skipRedirectCallback: window.location.pathname === '/',
  
  // Configuración de seguridad
  useCookiesForTransactions: true, // Usar cookies para transacciones (más seguro)
  
  // Configuración de timeout y retry
  httpTimeoutInSeconds: 60, // Timeout más largo para conexiones lentas
  
  // Configuración de logging en desarrollo
  ...(import.meta.env.DEV && {
    advancedOptions: {
      defaultScope: 'openid profile email'
    }
  }),

  // Configuración específica para el entorno
  sessionCheckExpiryDays: 7, // Verificar sesión por 7 días
  
  // Configuración de la aplicación
  organizationId: undefined, // No usar organizaciones por ahora
  
  // Configuración de cookies (importante para persistencia)
  cookieDomain: undefined, // Usar dominio automático
  
  // Configuración de cache avanzada
  nowProvider: () => Date.now(), // Provider de tiempo personalizable
  
  // Configuración de error handling
  legacySameSiteCookie: false, // Usar SameSite moderno
};

/**
 * Utilidades para Auth0
 */
export const auth0Utils = {
  // Función para limpiar el cache completamente
  clearAuthCache: () => {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('@@auth0spajs@@')) {
        localStorage.removeItem(key);
      }
    });
  },

  // Función para verificar si hay una sesión válida en cache
  hasValidCachedSession: () => {
    try {
      const keys = Object.keys(localStorage);
      const auth0Key = keys.find(key => key.startsWith('@@auth0spajs@@'));
      
      if (!auth0Key) return false;
      
      const cacheData = JSON.parse(localStorage.getItem(auth0Key) || '{}');
      const now = Date.now() / 1000; // Convertir a segundos
      
      // Verificar si hay un token válido
      return Object.values(cacheData).some(entry => {
        if (entry && typeof entry === 'object' && entry.body && entry.body.access_token) {
          const expiresAt = entry.body.expires_in ? 
            (entry.body.decodedToken?.header?.exp || now + entry.body.expires_in) : 
            now + 3600; // Default 1 hora
          
          return expiresAt > now;
        }
        return false;
      });
    } catch (error) {
      console.error('Error verificando cache de Auth0:', error);
      return false;
    }
  },

  // Función para obtener información de debug sobre el cache
  getCacheDebugInfo: () => {
    try {
      const keys = Object.keys(localStorage);
      const auth0Keys = keys.filter(key => key.startsWith('@@auth0spajs@@'));
      
      return auth0Keys.map(key => {
        const data = JSON.parse(localStorage.getItem(key) || '{}');
        return {
          key,
          entries: Object.keys(data).length,
          hasTokens: Object.values(data).some(entry => 
            entry && typeof entry === 'object' && entry.body && entry.body.access_token
          )
        };
      });
    } catch (error) {
      console.error('Error obteniendo info de debug:', error);
      return [];
    }
  }
};

export default auth0Config;