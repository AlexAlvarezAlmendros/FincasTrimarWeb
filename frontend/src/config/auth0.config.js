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



export const TOKEN_CONFIG = {
  // Duración recomendada del access token (se configura en Auth0)
  accessTokenLifetime: 86400, // 24 horas en segundos
  
  // Duración del refresh token (se configura en Auth0 - MÁXIMO PERMITIDO)
  refreshTokenLifetime: 2592000, // 30 días en segundos (MÁXIMO de Auth0)
};
