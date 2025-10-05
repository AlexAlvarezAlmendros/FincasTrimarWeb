/**
 * Test simple para probar autenticación y conexión al backend
 */
import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useApi } from '../hooks/useApi.js';

const TestApiConnection = () => {
  const { isAuthenticated, user } = useAuth0();
  const api = useApi();
  const [testResults, setTestResults] = useState([]);
  const [testing, setTesting] = useState(false);

  const runTest = async (testName, apiCall) => {
    try {
      setTesting(true);
      const startTime = Date.now();
      
      const result = await apiCall();
      const endTime = Date.now();
      
      setTestResults(prev => [...prev, {
        name: testName,
        status: 'success',
        result: result,
        duration: endTime - startTime,
        timestamp: new Date().toLocaleTimeString()
      }]);
    } catch (error) {
      setTestResults(prev => [...prev, {
        name: testName,
        status: 'error',
        error: error.message,
        timestamp: new Date().toLocaleTimeString()
      }]);
    } finally {
      setTesting(false);
    }
  };

  const testHealth = () => {
    runTest('Health Check', async () => {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/health`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    });
  };

  const testAuthenticatedEndpoint = () => {
    runTest('Authenticated Endpoint', async () => {
      return await api('/api/v1/viviendas');
    });
  };

  const testImageStatus = () => {
    runTest('Image Service Status', async () => {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/images/status`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    });
  };

  const testUploadEndpoint = () => {
    runTest('Upload Endpoint (Auth Required)', async () => {
      // Crear un archivo de prueba muy pequeño
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(0, 0, 1, 1);
      
      return new Promise((resolve, reject) => {
        canvas.toBlob(async (blob) => {
          try {
            const formData = new FormData();
            formData.append('images', blob, 'test.png');
            
            const response = await api('/api/v1/images', {
              method: 'POST',
              body: formData,
              headers: {} // Dejar que el navegador establezca el Content-Type automáticamente
            });
            
            resolve(response);
          } catch (error) {
            reject(error);
          }
        }, 'image/png');
      });
    });
  };

  const clearResults = () => setTestResults([]);

  if (!isAuthenticated) {
    return (
      <div style={{ padding: '20px', border: '2px solid orange' }}>
        <h3>🔐 Test API Connection - No autenticado</h3>
        <p>Debes iniciar sesión para probar los endpoints autenticados.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', border: '2px solid blue', margin: '20px' }}>
      <h3>🔗 Test Conexión API</h3>
      <p><strong>Usuario:</strong> {user?.email}</p>
      
      <div style={{ margin: '20px 0', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button 
          onClick={testHealth}
          disabled={testing}
          style={{
            padding: '10px 15px',
            background: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: testing ? 'not-allowed' : 'pointer'
          }}
        >
          🏥 Test Health
        </button>
        
        <button 
          onClick={testAuthenticatedEndpoint}
          disabled={testing}
          style={{
            padding: '10px 15px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: testing ? 'not-allowed' : 'pointer'
          }}
        >
          🔐 Test Auth Endpoint
        </button>
        
        <button 
          onClick={testImageStatus}
          disabled={testing}
          style={{
            padding: '10px 15px',
            background: '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: testing ? 'not-allowed' : 'pointer'
          }}
        >
          🖼️ Test Image Status
        </button>
        
        <button 
          onClick={testUploadEndpoint}
          disabled={testing}
          style={{
            padding: '10px 15px',
            background: '#fd7e14',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: testing ? 'not-allowed' : 'pointer'
          }}
        >
          📤 Test Upload Auth
        </button>
        
        <button 
          onClick={clearResults}
          style={{
            padding: '10px 15px',
            background: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          🗑️ Clear
        </button>
      </div>

      {testing && (
        <div style={{ 
          padding: '10px', 
          background: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '5px',
          margin: '10px 0'
        }}>
          ⏳ Ejecutando test...
        </div>
      )}

      {testResults.length > 0 && (
        <div style={{ margin: '20px 0' }}>
          <h4>📋 Resultados de Tests ({testResults.length}):</h4>
          {testResults.map((result, index) => (
            <div 
              key={index}
              style={{
                border: `1px solid ${result.status === 'success' ? '#28a745' : '#dc3545'}`,
                borderRadius: '5px',
                padding: '10px',
                margin: '10px 0',
                background: result.status === 'success' ? '#d4edda' : '#f8d7da'
              }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '10px'
              }}>
                <strong>
                  {result.status === 'success' ? '✅' : '❌'} {result.name}
                </strong>
                <small>{result.timestamp}</small>
              </div>
              
              {result.status === 'success' ? (
                <div>
                  <p><strong>Duración:</strong> {result.duration}ms</p>
                  <details>
                    <summary>Ver respuesta</summary>
                    <pre style={{ 
                      background: '#f8f9fa', 
                      padding: '10px', 
                      fontSize: '12px',
                      overflow: 'auto',
                      maxHeight: '200px'
                    }}>
                      {JSON.stringify(result.result, null, 2)}
                    </pre>
                  </details>
                </div>
              ) : (
                <p><strong>Error:</strong> {result.error}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TestApiConnection;