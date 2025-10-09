import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

/**
 * Wrapper para manejar el estado de carga inicial de Auth0
 * Evita el parpadeo mientras se verifica la sesión persistente
 */
const AuthWrapper = ({ children }) => {
  const { isLoading, error, isAuthenticated } = useAuth0();
  
  // Debug logs
  React.useEffect(() => {
    console.log('🔄 AuthWrapper State:', { isLoading, isAuthenticated, error: error?.message });
  }, [isLoading, isAuthenticated, error]);

  // No mostrar loading si estamos en el callback de Auth0
  const isCallback = window.location.pathname.includes('/callback') || 
                     window.location.search.includes('code=') ||
                     window.location.search.includes('state=');

  // Mostrar loading mientras Auth0 inicializa y verifica la sesión (excepto en callbacks)
  if (isLoading && !isCallback) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ color: '#666', fontFamily: 'Arial, sans-serif' }}>
          Verificando sesión...
        </p>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  // Mostrar error si hay problemas con Auth0
  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '1rem',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '2rem' }}>⚠️</div>
        <h2 style={{ color: '#e74c3c', marginBottom: '0.5rem' }}>
          Error de Autenticación
        </h2>
        <p style={{ color: '#666', marginBottom: '1rem' }}>
          {error.message}
        </p>
        <button 
          onClick={() => window.location.reload()}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Reintentar
        </button>
      </div>
    );
  }

  // Renderizar la aplicación una vez que Auth0 está listo
  return children;
};

export default AuthWrapper;