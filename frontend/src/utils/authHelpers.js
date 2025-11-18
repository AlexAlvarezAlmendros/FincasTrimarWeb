import { AUTH0_CONFIG } from '../config/auth0.config';

/**
 * Obtiene el access token de forma segura, manejando errores de refresh token
 * @param {Function} getAccessTokenSilently - Función de Auth0 para obtener tokens
 * @returns {Promise<string>} - Access token
 */
export const getAccessToken = async (getAccessTokenSilently) => {
  try {
    // Intentar obtener el token con las opciones configuradas
    const token = await getAccessTokenSilently(AUTH0_CONFIG.tokenOptions);
    return token;
  } catch (error) {
    // Si el error es por refresh token expirado o inválido
    if (error.error === 'missing_refresh_token' || 
        error.error === 'invalid_grant' ||
        error.message?.includes('Missing Refresh Token')) {
      
      console.warn('Refresh token expirado o no disponible. Requiere nueva autenticación.');
      
      // Limpiar el storage de Auth0
      localStorage.removeItem(`@@auth0spajs@@::${AUTH0_CONFIG.provider.clientId}::${AUTH0_CONFIG.authorizationParams.audience}::${AUTH0_CONFIG.authorizationParams.scope}`);
      
      // Re-lanzar el error para que el componente pueda manejarlo
      throw new Error('La sesión ha expirado. Por favor, inicia sesión nuevamente.');
    }
    
    // Para otros errores, simplemente re-lanzarlos
    throw error;
  }
};

/**
 * Verifica si un error es debido a un token expirado
 * @param {Error} error - Error a verificar
 * @returns {boolean}
 */
export const isTokenExpiredError = (error) => {
  return error.error === 'missing_refresh_token' || 
         error.error === 'invalid_grant' ||
         error.message?.includes('Missing Refresh Token') ||
         error.message?.includes('La sesión ha expirado');
};

/**
 * Limpia la sesión de Auth0 del localStorage
 */
export const clearAuth0Session = () => {
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith('@@auth0spajs@@')) {
      localStorage.removeItem(key);
    }
  });
};
