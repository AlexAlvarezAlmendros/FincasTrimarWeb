import { useAuth0 } from '@auth0/auth0-react';
import { Navigate } from 'react-router-dom';

export default function RequireAuth({ children, roles = [] }) {
  const { isAuthenticated, isLoading, user, loginWithRedirect } = useAuth0();
  
  if (isLoading) {
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
          Verificando permisos...
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
  
  if (!isAuthenticated) {
    // En lugar de redirigir, mostrar opción de login
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '2rem',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '3rem' }}>🔐</div>
        <div>
          <h2 style={{ color: '#333', marginBottom: '0.5rem' }}>
            Acceso Restringido
          </h2>
          <p style={{ color: '#666', marginBottom: '2rem', maxWidth: '400px' }}>
            Esta página requiere autenticación. Por favor, inicia sesión para continuar.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button 
              onClick={() => loginWithRedirect()}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500'
              }}
            >
              Iniciar Sesión
            </button>
            <button 
              onClick={() => window.history.back()}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: 'transparent',
                color: '#666',
                border: '1px solid #ddd',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // TODO: Implementar verificación de roles cuando Auth0 esté configurado
  // const userRoles = user?.[`https://fincas-trimar.com/roles`] || [];
  // const hasRequiredRole = roles.some(role => userRoles.includes(role));
  
  // if (roles.length > 0 && !hasRequiredRole) {
  //   return <Navigate to="/" replace />;
  // }
  
  return children;
}