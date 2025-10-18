import { useAuth0 } from '@auth0/auth0-react';
import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function RequireAuth({ children, roles = [] }) {
  const { isAuthenticated, isLoading, user, loginWithRedirect } = useAuth0();
  const [checking, setChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const checkPermissions = () => {
      if (isLoading) return;

      // Si no está autenticado, no tiene acceso
      if (!isAuthenticated || !user) {
        setHasAccess(false);
        setChecking(false);
        return;
      }

      // Si no se requieren roles específicos, permitir acceso
      if (roles.length === 0) {
        setHasAccess(true);
        setChecking(false);
        return;
      }

      // Obtener roles del usuario desde Auth0 claims
      // Probar múltiples ubicaciones donde Auth0 puede poner los roles
      const userRoles = 
        user[`${import.meta.env.VITE_AUTH0_AUDIENCE}/roles`] ||
        user['https://fincas-trimar.com/roles'] ||
        user.roles ||
        user.permissions ||
        [];

      console.log('🔐 Verificación de roles:', {
        requiredRoles: roles,
        userRoles,
        user,
        audienceClaim: `${import.meta.env.VITE_AUTH0_AUDIENCE}/roles`
      });

      // Verificar si el usuario tiene alguno de los roles requeridos
      const hasRequiredRole = roles.some(role => userRoles.includes(role));
      
      setHasAccess(hasRequiredRole);
      setChecking(false);
    };

    checkPermissions();
  }, [isAuthenticated, isLoading, user, roles]);

  // Mostrar loading mientras se verifica
  if (isLoading || checking) {
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
  
  // Si no está autenticado, mostrar opción de login
  if (!isAuthenticated) {
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

  // Si no tiene los roles necesarios
  if (!hasAccess) {
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
        <div style={{ fontSize: '3rem' }}>🚫</div>
        <div>
          <h2 style={{ color: '#d32f2f', marginBottom: '0.5rem' }}>Acceso Denegado</h2>
          <p style={{ color: '#666', marginBottom: '2rem', maxWidth: '400px' }}>
            No tienes los permisos necesarios para acceder a esta página.
            <br />
            <small style={{ fontSize: '0.875rem', marginTop: '0.5rem', display: 'block' }}>
              Se requiere uno de los siguientes roles: {roles.join(', ')}
            </small>
          </p>
          <button 
            onClick={() => window.location.href = '/'}
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
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }
  
  return children;
}