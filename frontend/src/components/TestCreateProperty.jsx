/**
 * Componente de prueba para crear propiedades - Solo para debug
 */
import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useCreateViviendaSimple } from '../hooks/useCreateViviendaSimple.js';

const TestCreateProperty = () => {
  const { isAuthenticated, user } = useAuth0();
  const [testData, setTestData] = useState({
    name: 'Casa de prueba para debug',
    price: '150000',
    shortDescription: 'Descripción de prueba',
    description: 'Descripción completa de la propiedad de prueba',
    rooms: '3',
    bathRooms: '2',
    garage: '1',
    squaredMeters: '100'
  });

  const { 
    createVivienda, 
    isCreating, 
    error, 
    success, 
    formData,
    updateField 
  } = useCreateViviendaSimple({
    onSuccess: (data) => {
      console.log('✅ Vivienda creada exitosamente:', data);
      alert('¡Vivienda creada correctamente!');
    },
    onError: (error) => {
      console.error('❌ Error creando vivienda:', error);
    }
  });

  const handleTestCreate = async () => {
    try {
      console.log('🏠 Iniciando test de creación con datos:', testData);
      
      // Actualizar campos uno por uno
      Object.entries(testData).forEach(([field, value]) => {
        updateField(field, value);
      });

      // Crear la vivienda
      await createVivienda(testData);
    } catch (error) {
      console.error('Error en test:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ padding: '20px', border: '2px solid orange' }}>
        <h3>🔐 Test Create Property - No autenticado</h3>
        <p>Debes iniciar sesión para probar la creación de propiedades.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', border: '2px solid blue', margin: '20px' }}>
      <h3>🧪 Test Crear Propiedad</h3>
      <p><strong>Usuario:</strong> {user?.email}</p>
      
      <div style={{ margin: '20px 0' }}>
        <h4>Datos de prueba:</h4>
        <pre style={{ background: '#f5f5f5', padding: '10px', fontSize: '12px' }}>
          {JSON.stringify(testData, null, 2)}
        </pre>
      </div>

      <div style={{ margin: '10px 0' }}>
        <button 
          onClick={handleTestCreate}
          disabled={isCreating}
          style={{
            padding: '10px 20px',
            background: isCreating ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isCreating ? 'not-allowed' : 'pointer'
          }}
        >
          {isCreating ? 'Creando...' : '🚀 Crear Propiedad de Prueba'}
        </button>
      </div>

      {error && (
        <div style={{ 
          padding: '10px', 
          background: '#ffe6e6', 
          border: '1px solid #ff9999',
          borderRadius: '5px',
          margin: '10px 0'
        }}>
          <strong>❌ Error:</strong> {error}
        </div>
      )}

      {success && (
        <div style={{ 
          padding: '10px', 
          background: '#e6ffe6', 
          border: '1px solid #99ff99',
          borderRadius: '5px',
          margin: '10px 0'
        }}>
          <strong>✅ Éxito:</strong> Propiedad creada correctamente
        </div>
      )}

      <details style={{ marginTop: '20px' }}>
        <summary>Estado del formulario interno</summary>
        <pre style={{ background: '#f5f5f5', padding: '10px', fontSize: '12px' }}>
          {JSON.stringify(formData, null, 2)}
        </pre>
      </details>
    </div>
  );
};

export default TestCreateProperty;