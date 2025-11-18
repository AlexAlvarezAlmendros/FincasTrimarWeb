/**
 * Configuración centralizada para Auth0
 */

export const AUTH0_CONFIG = {
  // Configuración del provider
  provider: {
    domain: import.meta.env.VITE_AUTH0_DOMAIN,
    clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
    cacheLocation: 'localstorage',
    useRefreshTokens: true,
    useRefreshTokensFallback: true,
  },
  
  // Parámetros de autorización
  authorizationParams: {
    audience: import.meta.env.VITE_AUTH0_AUDIENCE,
    scope: 'openid profile email offline_access',
  },
  
  // Opciones para getAccessTokenSilently
  tokenOptions: {
    authorizationParams: {
      audience: import.meta.env.VITE_AUTH0_AUDIENCE,
      scope: 'openid profile email offline_access',
    },
    cacheMode: 'on', // Usar caché cuando esté disponible
  }
};

/**
 * Configuración de duración de tokens (esto se configura en Auth0 Dashboard)
 * 
 * NOTA: El máximo permitido por Auth0 para Refresh Token Absolute Lifetime es 2,592,000 segundos (30 días)
 * 
 * Para maximizar la duración de la sesión (30 días), debes configurar en Auth0 Dashboard:
 * 
 * 1. Access Token Lifetime: Máximo 24 horas (86400 segundos)
 * 2. Refresh Token Rotation: Enabled
 * 3. Refresh Token Expiration: Absolute - 2592000 segundos (30 días - MÁXIMO)
 * 4. Refresh Token Inactivity: Inactivity - 2592000 segundos (30 días)
 * 
 * Ruta en Auth0 Dashboard:
 * Applications > [Tu App] > Settings > Advanced Settings > Grant Types
 * - Asegurar que "Refresh Token" esté habilitado
 * 
 * APIs > [Tu API] > Settings > Token Settings
 * - Token Expiration: 86400 (1 día)
 * - Allow Offline Access: Yes
 * 
 * Tenant Settings > Advanced > Refresh Token Behavior
 * - Rotating
 * - Absolute Lifetime: 2592000 segundos (30 días - MÁXIMO PERMITIDO)
 * - Inactivity Lifetime: 2592000 segundos (30 días)
 * 
 * Con esta configuración, el usuario permanecerá autenticado durante 30 días
 * siempre que use la aplicación al menos una vez cada 30 días.
 */

export const TOKEN_CONFIG = {
  // Duración recomendada del access token (se configura en Auth0)
  accessTokenLifetime: 86400, // 24 horas en segundos
  
  // Duración del refresh token (se configura en Auth0 - MÁXIMO PERMITIDO)
  refreshTokenLifetime: 2592000, // 30 días en segundos (MÁXIMO de Auth0)
};
