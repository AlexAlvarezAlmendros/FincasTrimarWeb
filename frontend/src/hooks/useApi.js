import { useAuth0 } from '@auth0/auth0-react';

export function useApi() {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  return async function api(path, opts = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(opts.headers || {}),
    };

    // Agregar token de autorización si el usuario está autenticado
    if (isAuthenticated) {
      try {
        const token = await getAccessTokenSilently();
        headers.Authorization = `Bearer ${token}`;
      } catch (error) {
        console.warn('No se pudo obtener el token de acceso:', error);
      }
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