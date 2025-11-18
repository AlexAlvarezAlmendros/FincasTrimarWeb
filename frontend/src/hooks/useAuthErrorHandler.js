import { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { isTokenExpiredError } from '../../utils/authHelpers';

/**
 * Hook personalizado para manejar errores de autenticación
 * Detecta errores de token expirado y redirige al login automáticamente
 */
export const useAuthErrorHandler = () => {
  const { loginWithRedirect, isAuthenticated, logout } = useAuth0();

  const handleAuthError = async (error) => {
    // Verificar si es un error de token expirado
    if (isTokenExpiredError(error)) {
      console.warn('Sesión expirada, cerrando sesión y redirigiendo al login...');
      
      // Cerrar sesión y limpiar todo
      await logout({
        logoutParams: {
          returnTo: window.location.origin
        }
      });
      
      // Opcional: mostrar un mensaje al usuario
      // Esto se puede hacer con un toast o notificación
      return true; // Indica que el error fue manejado
    }
    
    return false; // No es un error de autenticación que podamos manejar
  };

  return { handleAuthError };
};

/**
 * Componente wrapper que maneja errores de autenticación globalmente
 */
export const AuthErrorBoundary = ({ children, onAuthError }) => {
  useEffect(() => {
    // Escuchar errores no manejados relacionados con autenticación
    const handleError = (event) => {
      if (isTokenExpiredError(event.error)) {
        event.preventDefault();
        if (onAuthError) {
          onAuthError(event.error);
        }
      }
    };

    window.addEventListener('unhandledrejection', handleError);
    
    return () => {
      window.removeEventListener('unhandledrejection', handleError);
    };
  }, [onAuthError]);

  return children;
};
