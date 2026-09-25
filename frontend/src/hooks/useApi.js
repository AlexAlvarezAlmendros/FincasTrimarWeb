import { useAuth0 } from '@auth0/auth0-react';
import { useCallback } from 'react';

export function useApi() {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  return useCallback(async (path, opts = {}) => {
    const headers = {
      ...(opts.headers || {}),
    };
    
    // Solo establecer Content-Type si no se está enviando FormData
    if (!(opts.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    // Agregar token de autorización si el usuario está autenticado
    if (isAuthenticated) {
      try {
        // Configurar opciones para token de larga duración
        const token = await getAccessTokenSilently({
          cacheMode: 'cache-first', // Priorizar el cache para tokens de larga duración
          timeoutInSeconds: 60, // Timeout extendido para refresh
        });
        // Solo loguear una vez cuando se obtiene el token (comentado para producción)
        // console.log('🔑 Token obtenido:', token.substring(0, 50) + '...');
        headers.Authorization = `Bearer ${token}`;
      } catch (error) {
        console.warn('❌ No se pudo obtener el token de acceso:', error);
        throw new Error('No se pudo obtener el token de autenticación');
      }
    } else {
      console.warn('⚠️ Usuario no autenticado, no se enviará token');
      throw new Error('Debes iniciar sesión para realizar esta acción');
    }

    const url = `${import.meta.env.VITE_API_BASE_URL}${path}`;
    
    const response = await fetch(url, {
      ...opts,
      headers,
    });

    if (!response.ok) {
      // Error real (con message) a partir del envelope {success:false,error:{code,message,details}}.
      // e.error conserva el cuerpo de error para quien lea err.error?.message / code / details.
      const body = await response.json().catch(() => ({}));
      const apiError = body?.error;
      const message =
        (typeof apiError === 'string' ? apiError : apiError?.message) ||
        body?.message ||
        `HTTP ${response.status}`;
      const error = new Error(message);
      error.status = response.status;
      error.error = apiError;
      throw error;
    }

    return response.json();
  }, [getAccessTokenSilently, isAuthenticated]);
}