import { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const DuplicateCleanupButton = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [cleanupResult, setCleanupResult] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAnalysis(null);
    setCleanupResult(null);
    
    try {
      const token = await getAccessTokenSilently();
      
      // Probar el endpoint de análisis
      console.log('🧪 Probando análisis de duplicados...');
      const response = await fetch('/api/v1/duplicates/analyze', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Analyze response status:', response.status);

      if (!response.ok) {
        let errorMessage = `Error ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // Si no se puede parsear el JSON, obtener respuesta como texto para debug
          const responseText = await response.text();
          console.log('Response was not JSON:', responseText);
          if (responseText.includes('<!doctype') || responseText.includes('<html')) {
            errorMessage = 'El servidor devolvió HTML en lugar de JSON. Verifica las rutas del API.';
          }
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('✅ Análisis exitoso:', result);
      setAnalysis(result.data);
      setShowModal(true);
      
    } catch (error) {
      console.error('Error analizando duplicados:', error);
      alert(`Error analizando duplicados: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCleanup = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar las viviendas duplicadas? Esta acción no se puede deshacer.')) {
      return;
    }

    setIsCleaning(true);
    
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch('/api/v1/duplicates/clean', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        let errorMessage = `Error ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // Si no se puede parsear el JSON, obtener respuesta como texto para debug
          try {
            const responseText = await response.text();
            console.log('Cleanup response was not JSON:', responseText);
            if (responseText.includes('<!doctype') || responseText.includes('<html')) {
              errorMessage = 'El servidor devolvió HTML en lugar de JSON. Verifica las rutas del API.';
            }
          } catch (textError) {
            console.log('Could not read response as text either:', textError);
          }
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      setCleanupResult(result);
      
      // Actualizar análisis después de limpiar
      if (result.success) {
        // Esperar un momento y volver a analizar
        setTimeout(async () => {
          try {
            const token = await getAccessTokenSilently();
            const newAnalysis = await fetch('/api/v1/duplicates/analyze', {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            const newResult = await newAnalysis.json();
            setAnalysis(newResult.data);
          } catch (e) {
            console.error('Error actualizando análisis:', e);
          }
        }, 1000);
      }
      
    } catch (error) {
      console.error('Error limpiando duplicados:', error);
      alert(`Error limpiando duplicados: ${error.message}`);
    } finally {
      setIsCleaning(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setAnalysis(null);
    setCleanupResult(null);
  };

  return (
    <>
      <button
        onClick={handleAnalyze}
        disabled={isAnalyzing || isCleaning}
        className="btn btn-warning"
        title="Analizar y limpiar viviendas duplicadas"
      >
        <i className={`fas ${isAnalyzing ? 'fa-spinner fa-spin' : 'fa-broom'}`}></i>
        {isAnalyzing ? 'Analizando...' : 'Analizar Duplicados'}
      </button>

      {/* Modal de análisis y limpieza */}
      {showModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-broom me-2"></i>
                  Limpieza de Duplicados
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                ></button>
              </div>
              
              <div className="modal-body">
                {/* Resultado de limpieza */}
                {cleanupResult && (
                  <div className={`alert ${cleanupResult.success ? 'alert-success' : 'alert-danger'}`}>
                    <h6>
                      <i className={`fas ${cleanupResult.success ? 'fa-check' : 'fa-times'} me-2`}></i>
                      Resultado de limpieza
                    </h6>
                    <p className="mb-1">{cleanupResult.message}</p>
                    {cleanupResult.data && (
                      <small>
                        Eliminadas: {cleanupResult.data.deleted} | Errores: {cleanupResult.data.errors}
                      </small>
                    )}
                  </div>
                )}

                {/* Análisis */}
                {analysis && (
                  <>
                    {analysis.found ? (
                      <div>
                        <div className="alert alert-warning">
                          <h6>
                            <i className="fas fa-exclamation-triangle me-2"></i>
                            Duplicados encontrados
                          </h6>
                          <p className="mb-1">
                            Se encontraron <strong>{analysis.duplicateUrls}</strong> URLs con duplicados,
                            totalizando <strong>{analysis.totalDuplicates}</strong> viviendas que pueden ser eliminadas.
                          </p>
                        </div>

                        <div className="mb-3">
                          <h6>Detalles de duplicados:</h6>
                          <div className="accordion" id="duplicatesAccordion">
                            {analysis.details.map((group, index) => (
                              <div key={index} className="accordion-item">
                                <h2 className="accordion-header">
                                  <button
                                    className="accordion-button collapsed"
                                    type="button"
                                    data-bs-toggle="collapse"
                                    data-bs-target={`#collapse${index}`}
                                  >
                                    <strong>{group.toDelete}</strong> duplicados para eliminar
                                    <small className="text-muted ms-2">
                                      {group.url.substring(0, 50)}...
                                    </small>
                                  </button>
                                </h2>
                                <div
                                  id={`collapse${index}`}
                                  className="accordion-collapse collapse"
                                  data-bs-parent="#duplicatesAccordion"
                                >
                                  <div className="accordion-body">
                                    <p><strong>URL:</strong> <small>{group.url}</small></p>
                                    <ul className="list-group list-group-flush">
                                      {group.properties.map((property, propIndex) => (
                                        <li
                                          key={property.id}
                                          className={`list-group-item d-flex justify-content-between align-items-center ${propIndex === 0 ? 'list-group-item-success' : 'list-group-item-warning'}`}
                                        >
                                          <div>
                                            <strong>{property.name}</strong>
                                            <br />
                                            <small className="text-muted">{property.id}</small>
                                          </div>
                                          <span className={`badge ${propIndex === 0 ? 'bg-success' : 'bg-warning text-dark'}`}>
                                            {propIndex === 0 ? 'Mantener' : 'Eliminar'}
                                          </span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Botón de limpieza */}
                        {!cleanupResult && (
                          <div className="d-grid">
                            <button
                              onClick={handleCleanup}
                              disabled={isCleaning}
                              className="btn btn-danger"
                            >
                              {isCleaning ? (
                                <>
                                  <i className="fas fa-spinner fa-spin me-2"></i>
                                  Limpiando duplicados...
                                </>
                              ) : (
                                <>
                                  <i className="fas fa-trash me-2"></i>
                                  Eliminar {analysis.totalDuplicates} duplicados
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="alert alert-success">
                        <h6>
                          <i className="fas fa-check me-2"></i>
                          ¡Excelente!
                        </h6>
                        <p className="mb-0">No se encontraron viviendas duplicadas en estado Pendiente.</p>
                      </div>
                    )}
                  </>
                )}
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cerrar
                </button>
                {!analysis && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                  >
                    <i className={`fas ${isAnalyzing ? 'fa-spinner fa-spin' : 'fa-search'}`}></i>
                    {isAnalyzing ? 'Analizando...' : 'Volver a analizar'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DuplicateCleanupButton;