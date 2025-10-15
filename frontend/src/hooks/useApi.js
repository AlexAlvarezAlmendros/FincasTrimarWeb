import { useAuth0 } from '@auth0/auth0-react';

export function useApi() {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  return async function api(path, opts = {}) {
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
        console.log('🔑 Token obtenido:', token.substring(0, 50) + '...');
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
      const error = await response.json().catch(() => ({ 
        message: `HTTP ${response.status}` 
      }));
      throw error;
    }

    return response.json();
  };
}