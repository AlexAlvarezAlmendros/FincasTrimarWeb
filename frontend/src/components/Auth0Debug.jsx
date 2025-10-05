import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

/**
 * Componente de debug para mostrar el estado de Auth0
 * Solo para desarrollo
 */
export default function Auth0Debug() {
  const { 
    isLoading, 
    isAuthenticated, 
    user, 
    error,
    loginWithRedirect,
    logout,
    getAccessTokenSilently
  } = useAuth0();

  const [tokenInfo, setTokenInfo] = React.useState(null);

  React.useEffect(() => {
    if (isAuthenticated) {
      getAccessTokenSilently()
        .then(token => {
          // Decodificar el JWT para ver el contenido (solo para debug)
          let decodedToken = null;
          try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            decodedToken = JSON.parse(jsonPayload);
          } catch (e) {
            decodedToken = { error: 'No se pudo decodificar' };
          }

          setTokenInfo({
            hasToken: !!token,
            tokenPreview: token ? token.substring(0, 50) + '...' : null,
            tokenLength: token ? token.length : 0,
            decoded: decodedToken
          });
        })
        .catch(err => {
          setTokenInfo({ error: err.message });
        });
    }
  }, [isAuthenticated, getAccessTokenSilently]);

  if (isLoading) {
    return (
      <div style={{ 
        padding: '1rem', 
        margin: '1rem 0', 
        border: '2px solid #ffa500', 
        borderRadius: '8px',
        backgroundColor: '#fff3cd' 
      }}>
        🔄 Cargando Auth0...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: '1rem', 
        margin: '1rem 0', 
        border: '2px solid #dc3545', 
        borderRadius: '8px',
        backgroundColor: '#f8d7da' 
      }}>
        ❌ Error Auth0: {error.message}
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '1rem', 
      margin: '1rem 0', 
      border: '2px solid #28a745', 
      borderRadius: '8px',
      backgroundColor: isAuthenticated ? '#d4edda' : '#f8d7da' 
    }}>
      <h4>🔐 Estado de Auth0</h4>
      <p><strong>Autenticado:</strong> {isAuthenticated ? '✅ Sí' : '❌ No'}</p>
      {isAuthenticated && (
        <>
          <p><strong>Usuario:</strong> {user?.email || 'N/A'}</p>
          <p><strong>Nombre:</strong> {user?.name || 'N/A'}</p>
          {tokenInfo && (
            <>
              <p><strong>Token:</strong> {tokenInfo.hasToken ? '✅ Presente' : '❌ Ausente'}</p>
              {tokenInfo.hasToken && (
                <>
                  <p><strong>Token Length:</strong> {tokenInfo.tokenLength}</p>
                  <p><strong>Token Preview:</strong> <code style={{fontSize: '12px'}}>{tokenInfo.tokenPreview}</code></p>
                  {tokenInfo.decoded && (
                    <details style={{ marginTop: '10px' }}>
                      <summary><strong>Token Decoded (Claims)</strong></summary>
                      <pre style={{ 
                        background: '#f5f5f5', 
                        padding: '10px', 
                        fontSize: '10px',
                        overflow: 'auto',
                        maxHeight: '300px'
                      }}>
                        {JSON.stringify(tokenInfo.decoded, null, 2)}
                      </pre>
                    </details>
                  )}
                </>
              )}
              {tokenInfo.error && (
                <p><strong>Error Token:</strong> <span style={{color: 'red'}}>{tokenInfo.error}</span></p>
              )}
            </>
          )}
          <button 
            onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
            style={{ 
              padding: '0.5rem 1rem', 
              backgroundColor: '#dc3545', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Cerrar sesión
          </button>
          <button 
            onClick={async () => {
              try {
                const token = await getAccessTokenSilently();
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/viviendas`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify({
                    name: 'Test',
                    price: 100000,
                    shortDescription: 'Test',
                    description: 'Test description'
                  })
                });
                console.log('Test response:', response.status, await response.text());
                alert(`Test response: ${response.status}`);
              } catch (error) {
                console.error('Test error:', error);
                alert(`Test error: ${error.message}`);
              }
            }}
            style={{ 
              padding: '0.5rem 1rem', 
              backgroundColor: '#28a745', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer',
              marginLeft: '0.5rem'
            }}
          >
            🧪 Test API
          </button>
        </>
      )}
      {!isAuthenticated && (
        <button 
          onClick={() => loginWithRedirect()}
          style={{ 
            padding: '0.5rem 1rem', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Iniciar sesión
        </button>
      )}
    </div>
  );
}