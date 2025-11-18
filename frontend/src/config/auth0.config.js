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
 * Para que la sesión dure 2 años, debes configurar en Auth0 Dashboard:
 * 
 * 1. Access Token Lifetime: Máximo 24 horas (86400 segundos)
 * 2. Refresh Token Rotation: Enabled
 * 3. Refresh Token Expiration: Absolute - 730 days (2 años)
 * 4. Refresh Token Inactivity: Disabled o 730 days
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
 * - Absolute Lifetime: 63072000 segundos (730 días = 2 años)
 */

export const TOKEN_CONFIG = {
  // Duración recomendada del access token (se configura en Auth0)
  accessTokenLifetime: 86400, // 24 horas en segundos
  
  // Duración del refresh token (se configura en Auth0)
  refreshTokenLifetime: 63072000, // 2 años en segundos (730 días)
};
