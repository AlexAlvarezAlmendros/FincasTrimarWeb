import { useAuth0 } from '@auth0/auth0-react';
import { useEffect, useState } from 'react';

/**
 * Hook personalizado para manejar la persistencia de sesión mejorada
 * Incluye retry automático y mejor manejo de errores
 */
export const usePersistedAuth = () => {
  const auth0 = useAuth0();
  const [isInitialized, setIsInitialized] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  useEffect(() => {
    // Marcar como inicializado después de que Auth0 termine de cargar
    if (!auth0.isLoading) {
      setIsInitialized(true);
    }
  }, [auth0.isLoading]);

  // Función para intentar recuperar la sesión
  const retryAuth = async () => {
    if (retryCount < maxRetries) {
      try {
        setRetryCount(prev => prev + 1);
        // Intentar obtener un token silenciosamente (esto verifica la sesión)
        await auth0.getAccessTokenSilently({
          cacheMode: 'cache-only' // Solo usar cache, no hacer nuevas peticiones
        });
      } catch (error) {
        console.warn(`Intento ${retryCount + 1} de recuperación de sesión falló:`, error);
        
        if (retryCount >= maxRetries - 1) {
          console.error('Máximo número de reintentos alcanzado para recuperación de sesión');
        }
      }
    }
  };

  // Función para verificar el estado de la sesión
  const checkSession = async () => {
    if (!auth0.isAuthenticated && !auth0.isLoading && isInitialized) {
      // Intentar recuperar la sesión si no está autenticado pero ya inicializó
      await retryAuth();
    }
  };

  // Función para logout mejorado
  const enhancedLogout = (options = {}) => {
    // Limpiar localStorage de Auth0 explícitamente
    localStorage.removeItem(`@@auth0spajs@@::${auth0.clientId}::${auth0.audience}::openid profile email`);
    
    return auth0.logout({
      logoutParams: {
        returnTo: window.location.origin
      },
      ...options
    });
  };

  // Función para login con mejor manejo
  const enhancedLogin = (options = {}) => {
    return auth0.loginWithRedirect({
      authorizationParams: {
        screen_hint: 'login', // Forzar pantalla de login
        prompt: 'login' // Forzar re-autenticación
      },
      ...options
    });
  };

  return {
    ...auth0,
    isInitialized,
    retryCount,
    checkSession,
    enhancedLogout,
    enhancedLogin,
    // Información adicional útil
    sessionInfo: {
      hasValidSession: auth0.isAuthenticated && !auth0.error,
      isExpired: !auth0.isAuthenticated && !auth0.isLoading && isInitialized,
      needsReauth: auth0.error?.error === 'login_required'
    }
  };
};

export default usePersistedAuth;