import React, { useState, useRef, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFileImport,
  faUpload,
  faSpinner,
  faCheckCircle,
  faExclamationTriangle,
  faTimesCircle,
  faChevronDown,
  faChevronUp,
  faImage,
  faBuilding
} from '@fortawesome/free-solid-svg-icons';
import './JsonBulkImport.css';

/**
 * Componente para importación masiva de viviendas desde JSON.
 * Soporta formato agencia: { inmuebles: [...] }
 * Reemplaza al panel HtmlExtractor en PropertyCreatePage.
 */
const JsonBulkImport = ({ onImportComplete, resetTrigger }) => {
  const { getAccessTokenSilently } = useAuth0();
  const fileInputRef = useRef(null);

  const [isExpanded, setIsExpanded] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [importResults, setImportResults] = useState(null);
  const [error, setError] = useState(null);

  // Reset cuando cambia resetTrigger
  React.useEffect(() => {
    setPreviewData(null);
    setImportResults(null);
    setError(null);
    setIsUploading(false);
  }, [resetTrigger]);

  /**
   * Valida la estructura básica del JSON en el frontend
   */
  const validateAndPreview = (jsonData) => {
    if (!jsonData || typeof jsonData !== 'object') {
      throw new Error('El archivo no contiene un JSON válido');
    }

    let inmuebles = null;
    let format = null;

    if (Array.isArray(jsonData.inmuebles)) {
      inmuebles = jsonData.inmuebles;
      format = 'agencia';
    } else if (jsonData.viviendas?.todas && Array.isArray(jsonData.viviendas.todas)) {
      inmuebles = jsonData.viviendas.todas;
      format = 'legacy';
    } else {
      throw new Error(
        'El JSON debe contener "inmuebles" (array) o "viviendas.todas" (array)'
      );
    }

    if (inmuebles.length === 0) {
      throw new Error('No se encontraron inmuebles en el archivo');
    }

    return {
      format,
      total: inmuebles.length,
      inmuebles,
      agenciaUrl: jsonData.agencia_url || jsonData.url || null,
      timestamp: jsonData.timestamp || null
    };
  };

  /**
   * Lee y previsualiza el archivo JSON
   */
  const processFile = useCallback(async (file) => {
    setError(null);
    setImportResults(null);

    if (!file.name.endsWith('.json')) {
      setError('Por favor, selecciona un archivo .json');
      return;
    }

    try {
      const content = await file.text();
      const jsonData = JSON.parse(content);
      const preview = validateAndPreview(jsonData);
      setPreviewData({ ...preview, rawData: jsonData, fileName: file.name });
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError('El archivo no es un JSON válido. Verifica la sintaxis.');
      } else {
        setError(err.message);
      }
      setPreviewData(null);
    }
  }, []);

  /**
   * Envía el JSON al backend para importación
   */
  const handleImport = async () => {
    if (!previewData?.rawData) return;

    setIsUploading(true);
    setError(null);

    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/json/import`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(previewData.rawData)
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Error en la importación');
      }

      setImportResults(result.data);

      if (onImportComplete) {
        onImportComplete(result.data);
      }
    } catch (err) {
      setError(`Error al importar: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Drag & Drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) processFile(file);
    e.target.value = '';
  };

  const handleReset = () => {
    setPreviewData(null);
    setImportResults(null);
    setError(null);
  };

  return (
    <div className={`json-bulk-import ${isExpanded ? 'expanded' : 'collapsed'}`}>
      {/* Toggle header */}
      <button
        type="button"
        className="json-bulk-import__toggle"
        onClick={() => setIsExpanded((v) => !v)}
      >
        <div className="toggle-content">
          <div className="toggle-icon">
            <FontAwesomeIcon icon={faFileImport} />
          </div>
          <div className="toggle-text">
            <h3>Importar inmuebles desde JSON</h3>
            <p>
              Sube un archivo JSON con listado de inmuebles para crearlos y
              publicarlos automáticamente
            </p>
          </div>
          <FontAwesomeIcon
            icon={isExpanded ? faChevronUp : faChevronDown}
            className="toggle-chevron"
          />
        </div>
      </button>

      {/* Expandable content */}
      {isExpanded && (
        <div className="json-bulk-import__content">
          {/* Upload zone (solo si no hay preview ni resultados) */}
          {!previewData && !importResults && (
            <div
              className={`json-bulk-import__dropzone ${isDragOver ? 'drag-over' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              aria-label="Zona para subir archivo JSON"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              <FontAwesomeIcon icon={faUpload} className="dropzone-icon" />
              <p className="dropzone-text">
                Arrastra un archivo <strong>.json</strong> aquí o haz clic para
                seleccionar
              </p>
              <span className="dropzone-hint">
                Formato soportado: JSON con listado de inmuebles
              </span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="json-bulk-import__error">
              <FontAwesomeIcon icon={faTimesCircle} />
              <span>{error}</span>
              <button type="button" onClick={handleReset} className="error-retry">
                Reintentar
              </button>
            </div>
          )}

          {/* Preview */}
          {previewData && !importResults && (
            <div className="json-bulk-import__preview">
              <div className="preview-header">
                <FontAwesomeIcon icon={faBuilding} className="preview-icon" />
                <div className="preview-info">
                  <h4>{previewData.fileName}</h4>
                  <p>
                    <strong>{previewData.total}</strong> inmueble
                    {previewData.total !== 1 ? 's' : ''} encontrado
                    {previewData.total !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* Mini-lista preview */}
              <div className="preview-list">
                {previewData.inmuebles.slice(0, 5).map((inmueble, i) => (
                  <div key={i} className="preview-item">
                    <span className="preview-item__index">{i + 1}</span>
                    <span className="preview-item__title">
                      {inmueble.titulo}
                    </span>
                    <span className="preview-item__price">
                      {inmueble.precio}
                    </span>
                    {inmueble.imagenes && (
                      <span className="preview-item__images" title="Imágenes">
                        <FontAwesomeIcon icon={faImage} />
                        {Array.isArray(inmueble.imagenes)
                          ? inmueble.imagenes.length
                          : 0}
                      </span>
                    )}
                  </div>
                ))}
                {previewData.total > 5 && (
                  <div className="preview-item preview-item--more">
                    ...y {previewData.total - 5} más
                  </div>
                )}
              </div>

              <div className="preview-notice">
                <FontAwesomeIcon icon={faExclamationTriangle} />
                <span>
                  Los inmuebles se crearán y <strong>publicarán automáticamente</strong>
                  . Las imágenes se importarán directamente desde las URLs del JSON.
                </span>
              </div>

              <div className="preview-actions">
                <button
                  type="button"
                  className="btn--secondary"
                  onClick={handleReset}
                  disabled={isUploading}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn--primary"
                  onClick={handleImport}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin />
                      Importando...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faFileImport} />
                      Importar {previewData.total} inmueble
                      {previewData.total !== 1 ? 's' : ''}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Results */}
          {importResults && (
            <div className="json-bulk-import__results">
              <div className="results-summary-cards">
                <div className="summary-card success">
                  <FontAwesomeIcon icon={faCheckCircle} />
                  <div>
                    <span className="card-number">
                      {importResults.summary.success}
                    </span>
                    <span className="card-label">Creadas</span>
                  </div>
                </div>
                <div className="summary-card warning">
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                  <div>
                    <span className="card-number">
                      {importResults.summary.duplicates}
                    </span>
                    <span className="card-label">Duplicadas</span>
                  </div>
                </div>
                <div className="summary-card error">
                  <FontAwesomeIcon icon={faTimesCircle} />
                  <div>
                    <span className="card-number">
                      {importResults.summary.errors}
                    </span>
                    <span className="card-label">Errores</span>
                  </div>
                </div>
              </div>

              {importResults.details && importResults.details.length > 0 && (
                <div className="results-detail-list">
                  {importResults.details.slice(0, 15).map((detail, i) => (
                    <div
                      key={i}
                      className={`result-detail-item ${detail.status}`}
                    >
                      <span className="detail-row">#{detail.row}</span>
                      <span className="detail-message">
                        {detail.status === 'success' && (
                          <>
                            <FontAwesomeIcon icon={faCheckCircle} />
                            {detail.title || detail.titulo}
                            {detail.images > 0 && (
                              <span className="detail-images">
                                ({detail.images} img)
                              </span>
                            )}
                          </>
                        )}
                        {detail.status === 'duplicate' && (
                          <>
                            <FontAwesomeIcon icon={faExclamationTriangle} />
                            {detail.titulo} — {detail.reason}
                          </>
                        )}
                        {detail.status === 'error' && (
                          <>
                            <FontAwesomeIcon icon={faTimesCircle} />
                            {detail.titulo || 'Error'} — {detail.error}
                          </>
                        )}
                      </span>
                    </div>
                  ))}
                  {importResults.details.length > 15 && (
                    <div className="result-detail-item more">
                      ...y {importResults.details.length - 15} más
                    </div>
                  )}
                </div>
              )}

              <div className="results-actions">
                <button
                  type="button"
                  className="btn--primary"
                  onClick={handleReset}
                >
                  Importar otro archivo
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default JsonBulkImport;
