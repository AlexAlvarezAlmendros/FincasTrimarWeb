import { useAuth0 } from '@auth0/auth0-react';

/**
 * Componente temporal para debug de Auth0
 * Muestra información detallada del estado de autenticación
 */
const Auth0Debug = () => {
  const auth0 = useAuth0();

  // Solo mostrar en desarrollo
  if (import.meta.env.PROD) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: '#f0f0f0',
      border: '1px solid #ccc',
      borderRadius: '8px',
      padding: '12px',
      fontSize: '12px',
      fontFamily: 'monospace',
      zIndex: 9999,
      maxWidth: '300px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>
        🔍 Auth0 Debug Info
      </div>
      
      <div style={{ marginBottom: '4px' }}>
        <strong>Loading:</strong> {auth0.isLoading ? '✅ Yes' : '❌ No'}
      </div>
      
      <div style={{ marginBottom: '4px' }}>
        <strong>Authenticated:</strong> {auth0.isAuthenticated ? '✅ Yes' : '❌ No'}
      </div>
      
      <div style={{ marginBottom: '4px' }}>
        <strong>User:</strong> {auth0.user?.email || 'None'}
      </div>
      
      <div style={{ marginBottom: '4px' }}>
        <strong>Error:</strong> {auth0.error?.message || 'None'}
      </div>
      
      {auth0.error && (
        <div style={{ marginTop: '8px', color: '#e74c3c' }}>
          <strong>Error Details:</strong>
          <pre style={{ margin: 0, fontSize: '10px', wordBreak: 'break-all' }}>
            {JSON.stringify(auth0.error, null, 2)}
          </pre>
        </div>
      )}
      
      <div style={{ marginTop: '8px', fontSize: '10px', color: '#666' }}>
        <strong>Current URL:</strong> {window.location.href}
      </div>
      
      <div style={{ marginTop: '4px', fontSize: '10px', color: '#666' }}>
        <strong>Redirect URI:</strong> {window.location.origin}
      </div>

      {/* Botón para limpiar cache */}
      <button
        onClick={() => {
          const keys = Object.keys(localStorage);
          keys.forEach(key => {
            if (key.startsWith('@@auth0spajs@@')) {
              localStorage.removeItem(key);
            }
          });
          window.location.reload();
        }}
        style={{
          marginTop: '8px',
          padding: '4px 8px',
          fontSize: '10px',
          background: '#e74c3c',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Clear Auth Cache & Reload
      </button>
    </div>
  );
};

export default Auth0Debug;