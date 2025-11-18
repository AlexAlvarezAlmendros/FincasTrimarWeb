import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faCheckCircle, faExclamationTriangle, faUpload, faDownload, faInfoCircle, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import JsonImportGuide from './JsonImportGuide.jsx';
import './JsonImportButton.css';

/**
 * Componente para importación masiva de viviendas desde JSON
 * Estructura esperada:
 * {
 *   "timestamp": "2025-11-14T18:09:42.140496",
 *   "url": "https://www.idealista.com/...",
 *   "total": 110,
 *   "particulares": 110,
 *   "inmobiliarias": 0,
 *   "viviendas": {
 *     "todas": [
 *       {
 *         "titulo": "string",
 *         "precio": "string",
 *         "ubicacion": "string",
 *         "habitaciones": "string",
 *         "metros": "string",
 *         "url": "string",
 *         "descripcion": "string",
 *         "anunciante": "string",
 *         "fecha_scraping": "string"
 *       }
 *     ]
 *   }
 * }
 */
const JsonImportButton = ({ onImportComplete }) => {
  const { getAccessTokenSilently } = useAuth0();
  const [uploading, setUploading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [importResults, setImportResults] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showDetailedGuide, setShowDetailedGuide] = useState(false);
  const [refetchExecuted, setRefetchExecuted] = useState(false);

  const validateJsonStructure = (data) => {
    if (!data || typeof data !== 'object') {
      throw new Error('El archivo JSON no tiene una estructura válida');
    }

    if (!data.viviendas || !data.viviendas.todas || !Array.isArray(data.viviendas.todas)) {
      throw new Error('El JSON debe contener una estructura "viviendas.todas" con un array de propiedades');
    }

    const requiredFields = ['titulo', 'precio', 'ubicacion', 'url'];
    const viviendas = data.viviendas.todas;

    if (viviendas.length === 0) {
      throw new Error('El JSON no contiene viviendas para importar');
    }

    // Validar que al menos las primeras viviendas tengan los campos requeridos
    const sampleVivienda = viviendas[0];
    const missingFields = requiredFields.filter(field => !sampleVivienda[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`La estructura de viviendas debe incluir los campos: ${missingFields.join(', ')}`);
    }

    return true;
  };

  const processJsonImport = async (jsonData) => {
    try {
      validateJsonStructure(jsonData);
      
      const token = await getAccessTokenSilently();
      
      // Llamar al endpoint de importación JSON
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/json/import`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(jsonData)
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage = result.error?.message || 'Error en la importación JSON';
        console.error('❌ Error del servidor:', result);
        throw new Error(errorMessage);
      }

      // Mostrar resultados
      setImportResults(result.data);
      setShowResults(true);
      setRefetchExecuted(false); // Reset del estado de refetch

      // NO ejecutar onImportComplete automáticamente
      // Dejar que el usuario decida cuándo actualizar la lista

    } catch (error) {
      console.error('Error importando JSON:', error);
      alert(`Error al importar JSON: ${error.message}`);
    }
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validar que sea un JSON
    if (!file.name.endsWith('.json')) {
      alert('Por favor, selecciona un archivo JSON válido');
      return;
    }

    await handleFile(file);
    
    // Limpiar el input para permitir subir el mismo archivo de nuevo
    event.target.value = '';
  };

  const handleFile = async (file) => {
    setUploading(true);
    setShowResults(false);

    try {
      // Leer el archivo JSON
      const fileContent = await file.text();
      const jsonData = JSON.parse(fileContent);
      
      await processJsonImport(jsonData);

    } catch (error) {
      if (error instanceof SyntaxError) {
        alert('El archivo no es un JSON válido. Por favor, verifica la sintaxis.');
      } else {
        console.error('Error procesando archivo JSON:', error);
        alert(`Error al procesar el archivo JSON: ${error.message}`);
      }
    } finally {
      setUploading(false);
    }
  };

  // Drag & Drop handlers
  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    setIsDragOver(false);

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.name.endsWith('.json')) {
        await handleFile(file);
      } else {
        alert('Por favor, suelta un archivo JSON válido');
      }
    }
  };

  // Función para cerrar el modal y ejecutar refetch
  const handleCloseAndRefetch = () => {
    setShowResults(false);
    setRefetchExecuted(true);
    
    if (onImportComplete && !refetchExecuted) {
      onImportComplete(importResults);
    }
  };

  // Función para cerrar solo el modal sin refetch
  const handleCloseOnly = () => {
    setShowResults(false);
  };

  return (
    <div className="json-import-container">
      {/* Área de drag & drop y botón de importación */}
      <div 
        className={`json-upload-area ${isDragOver ? 'drag-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <label className="btn btn--secondary json-upload-btn">
          <input
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            disabled={uploading}
            style={{ display: 'none' }}
          />
          {uploading ? (
            <FontAwesomeIcon icon={faSpinner} spin />
          ) : (
            <FontAwesomeIcon icon={faUpload} />
          )}
          <span>{uploading ? 'Importando...' : 'Importar JSON'}</span>
        </label>
        
        <div className="upload-hint">
          <small>Arrastra un archivo JSON aquí o haz clic para seleccionar</small>
        </div>
      </div>
      {showResults && importResults && (
        <>
          {/* Overlay oscuro */}
          <div 
            className="json-modal-overlay" 
            onClick={handleCloseOnly}
          />
          
          {/* Modal de resultados */}
          <div className="json-import-results">
            <div className="results-header">
              <h3>Resultados de la Importación JSON</h3>
              <button 
                className="close-btn" 
                onClick={handleCloseOnly}
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

            {/* Información adicional del JSON */}
            {importResults.metadata && (
              <div className="import-metadata">
                <h4>Información del conjunto de datos:</h4>
                <div className="metadata-grid">
                  <div className="metadata-item">
                    <span className="label">Total en origen:</span>
                    <span className="value">{importResults.metadata.total}</span>
                  </div>
                  <div className="metadata-item">
                    <span className="label">Particulares:</span>
                    <span className="value">{importResults.metadata.particulares}</span>
                  </div>
                  <div className="metadata-item">
                    <span className="label">Inmobiliarias:</span>
                    <span className="value">{importResults.metadata.inmobiliarias}</span>
                  </div>
                  <div className="metadata-item">
                    <span className="label">URL de origen:</span>
                    <span className="value">
                      <a 
                        href={importResults.metadata.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="source-link"
                      >
                        Ver origen
                      </a>
                    </span>
                  </div>
                </div>
              </div>
            )}

            {importResults.details && importResults.details.length > 0 && (
              <div className="results-details">
                <h4>Detalles:</h4>
                <div className="details-list">
                  {importResults.details.slice(0, 10).map((detail, index) => (
                    <div 
                      key={index} 
                      className={`detail-item ${detail.status}`}
                    >
                      <span className="row-number">Ítem {detail.row || index + 1}:</span>
                      <span className="detail-message">
                        {detail.status === 'success' && `✓ ${detail.title || detail.titulo}`}
                        {detail.status === 'duplicate' && (
                          <span className="duplicate-info">
                            ⚠ Duplicado: {detail.titulo}
                            {detail.reason && <small className="duplicate-reason"> - {detail.reason}</small>}
                            {detail.url && <small className="duplicate-url"> ({detail.url})</small>}
                          </span>
                        )}
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

            {/* Footer con botones de acción */}
            <div className="results-footer">
              <button 
                className="btn btn--secondary" 
                onClick={handleCloseOnly}
              >
                Cerrar
              </button>
              <button 
                className="btn btn--primary" 
                onClick={handleCloseAndRefetch}
              >
                Actualizar lista
              </button>
            </div>
          </div>
        </>
      )}

      {/* Guía detallada */}
      <JsonImportGuide 
        isVisible={showDetailedGuide} 
        onClose={() => setShowDetailedGuide(false)} 
      />
    </div>
  );
};

export default JsonImportButton;
