import React from 'react';
import { useCreateViviendaSimple } from '../../../hooks/useCreateViviendaSimple.js';

/**
 * Versión simplificada del componente para debugging
 */
const PropertyCreatePageSimple = () => {
  // Usar solo el hook básico de creación
  const {
    formData,
    updateField,
    createVivienda,
    isCreating,
    error,
    success
  } = useCreateViviendaSimple();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const result = await createVivienda(formData);
      console.log('Vivienda creada:', result);
    } catch (error) {
      console.error('Error creando vivienda:', error);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px' }}>
      <h1>Crear Vivienda (Simple)</h1>
      
      {error && (
        <div style={{ color: 'red', marginBottom: '10px' }}>
          Error: {error}
        </div>
      )}
      
      {success && (
        <div style={{ color: 'green', marginBottom: '10px' }}>
          ¡Vivienda creada exitosamente!
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>
            Nombre de la vivienda:
            <input
              type="text"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              placeholder="Ej: Piso céntrico con terraza"
            />
          </label>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>
            Precio:
            <input
              type="number"
              value={formData.price}
              onChange={(e) => updateField('price', e.target.value)}
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              placeholder="Ej: 250000"
            />
          </label>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>
            Descripción breve:
            <textarea
              value={formData.shortDescription}
              onChange={(e) => updateField('shortDescription', e.target.value)}
              style={{ width: '100%', padding: '8px', marginTop: '5px', height: '60px' }}
              placeholder="Descripción breve de la vivienda"
            />
          </label>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>
            Habitaciones:
            <input
              type="number"
              value={formData.rooms}
              onChange={(e) => updateField('rooms', e.target.value)}
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              placeholder="Número de habitaciones"
            />
          </label>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>
            Población:
            <input
              type="text"
              value={formData.poblacion}
              onChange={(e) => updateField('poblacion', e.target.value)}
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              placeholder="Ej: Barcelona"
            />
          </label>
        </div>

        <button 
          type="submit" 
          disabled={isCreating}
          style={{
            padding: '10px 20px',
            backgroundColor: isCreating ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isCreating ? 'not-allowed' : 'pointer'
          }}
        >
          {isCreating ? 'Creando...' : 'Crear Vivienda'}
        </button>
      </form>

      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        <h3>Datos del formulario (debug):</h3>
        <pre>{JSON.stringify(formData, null, 2)}</pre>
      </div>
    </div>
  );
};

export default PropertyCreatePageSimple;