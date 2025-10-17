import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faCheckCircle, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import './CsvImportButton.css';

/**
 * Componente para importación masiva de viviendas desde CSV
 */
const CsvImportButton = ({ onImportComplete }) => {
  const { getAccessTokenSilently } = useAuth0();
  const [uploading, setUploading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [importResults, setImportResults] = useState(null);

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validar que sea un CSV
    if (!file.name.endsWith('.csv')) {
      alert('Por favor, selecciona un archivo CSV válido');
      return;
    }

    setUploading(true);
    setShowResults(false);

    try {
      const token = await getAccessTokenSilently();
      
      // Crear FormData para subir el archivo
      const formData = new FormData();
      formData.append('file', file);

      // Llamar al endpoint de importación
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/csv/import`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage = result.error?.message || 'Error en la importación';
        console.error('❌ Error del servidor:', result);
        throw new Error(errorMessage);
      }

      // Mostrar resultados
      setImportResults(result.data);
      setShowResults(true);

      // Notificar al componente padre
      if (onImportComplete) {
        onImportComplete(result.data);
      }

    } catch (error) {
      console.error('Error importando CSV:', error);
      alert(`Error al importar CSV: ${error.message}`);
    } finally {
      setUploading(false);
      // Limpiar el input para permitir subir el mismo archivo de nuevo
      event.target.value = '';
    }
  };

  return (
    <div className="csv-import-container">
      {/* Botón de importación estilo header */}
      <label className="btn btn--secondary csv-upload-btn">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          disabled={uploading}
          style={{ display: 'none' }}
        />
        {uploading ? (
          <FontAwesomeIcon icon={faSpinner} spin />
        ) : (
          '📥'
        )}
        <span>{uploading ? 'Importando...' : 'Importar CSV'}</span>
      </label>

      {showResults && importResults && (
        <>
          {/* Overlay oscuro */}
          <div 
            className="csv-modal-overlay" 
            onClick={() => setShowResults(false)}
          />
          
          {/* Modal de resultados */}
          <div className="csv-import-results">
            <div className="results-header">
              <h3>Resultados de la Importación</h3>
              <button 
                className="close-btn" 
                onClick={() => setShowResults(false)}
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>

          <div className="results-summary">
            <div className="summary-item success">
              <FontAwesomeIcon icon={faCheckCircle} />
              <span>{importResults.summary.success} viviendas creadas</span>
            </div>
            <div className="summary-item warning">
              <FontAwesomeIcon icon={faExclamationTriangle} />
              <span>{importResults.summary.duplicates} duplicados omitidos</span>
            </div>
            <div className="summary-item error">
              <FontAwesomeIcon icon={faExclamationTriangle} />
              <span>{importResults.summary.errors} errores</span>
            </div>
          </div>

          {importResults.details && importResults.details.length > 0 && (
            <div className="results-details">
              <h4>Detalles:</h4>
              <div className="details-list">
                {importResults.details.slice(0, 10).map((detail, index) => (
                  <div 
                    key={index} 
                    className={`detail-item ${detail.status}`}
                  >
                    <span className="row-number">Fila {detail.row}:</span>
                    <span className="detail-message">
                      {detail.status === 'success' && `✓ ${detail.title}`}
                      {detail.status === 'duplicate' && `⚠ Duplicado: ${detail.url}`}
                      {detail.status === 'error' && `✗ ${detail.error}`}
                    </span>
                  </div>
                ))}
                {importResults.details.length > 10 && (
                  <p className="details-more">
                    ... y {importResults.details.length - 10} más
                  </p>
                )}
              </div>
            </div>
          )}
          </div>
        </>
      )}
    </div>
  );
};

export default CsvImportButton;
