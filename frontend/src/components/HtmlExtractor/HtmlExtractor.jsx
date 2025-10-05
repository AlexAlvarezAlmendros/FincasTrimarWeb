import { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import './HtmlExtractor.css';

const HtmlExtractor = ({ onDataExtracted }) => {
  const [file, setFile] = useState(null);
  const [htmlText, setHtmlText] = useState('');
  const [extractedData, setExtractedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState('file'); // 'file' o 'text'
  const api = useApi();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/html' && !selectedFile.name.endsWith('.html')) {
        setError('Por favor, selecciona un archivo HTML válido');
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleTextChange = (e) => {
    setHtmlText(e.target.value);
    setError(null);
  };

  const processFile = async () => {
    if (!file) {
      setError('Por favor, selecciona un archivo HTML');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('htmlFile', file);

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/parse/idealista/upload`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setExtractedData(result.data);
        if (onDataExtracted) {
          onDataExtracted(result.data.extractedData);
        }
      } else {
        setError(result.error || 'Error al procesar el archivo');
      }
    } catch (err) {
      setError('Error de conexión al procesar el archivo');
      console.error('Error processing file:', err);
    } finally {
      setLoading(false);
    }
  };

  const processText = async () => {
    if (!htmlText.trim()) {
      setError('Por favor, ingresa contenido HTML');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api('/api/v1/parse/idealista/text', {
        method: 'POST',
        body: JSON.stringify({ htmlContent: htmlText }),
      });

      if (response.success) {
        setExtractedData(response.data);
        if (onDataExtracted) {
          onDataExtracted(response.data.extractedData);
        }
      } else {
        setError(response.error || 'Error al procesar el HTML');
      }
    } catch (err) {
      setError('Error de conexión al procesar el HTML');
      console.error('Error processing text:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetExtractor = () => {
    setFile(null);
    setHtmlText('');
    setExtractedData(null);
    setError(null);
  };

  return (
    <div className="html-extractor">
      <div className="html-extractor__header">
        <h3>Extraer datos de Idealista</h3>
        <p>Sube un archivo HTML descargado de Idealista para auto-rellenar el formulario</p>
      </div>

      {/* Selector de modo */}
      <div className="html-extractor__mode-selector">
        <button 
          type="button"
          className={`mode-btn ${mode === 'file' ? 'active' : ''}`}
          onClick={() => setMode('file')}
        >
          Subir archivo
        </button>
        <button 
          type="button"
          className={`mode-btn ${mode === 'text' ? 'active' : ''}`}
          onClick={() => setMode('text')}
        >
          Pegar HTML
        </button>
      </div>

      {mode === 'file' && (
        <div className="html-extractor__file-section">
          <div className="file-input-wrapper">
            <input
              type="file"
              id="htmlFile"
              accept=".html,text/html"
              onChange={handleFileChange}
              className="file-input"
            />
            <label htmlFor="htmlFile" className="file-input-label">
              {file ? file.name : 'Seleccionar archivo HTML'}
            </label>
          </div>
          <button 
            type="button"
            onClick={processFile}
            disabled={!file || loading}
            className="extract-btn"
          >
            {loading ? 'Procesando...' : 'Extraer datos'}
          </button>
        </div>
      )}

      {mode === 'text' && (
        <div className="html-extractor__text-section">
          <textarea
            value={htmlText}
            onChange={handleTextChange}
            placeholder="Pega aquí el código HTML de la página de Idealista..."
            rows={6}
            className="html-textarea"
          />
          <button 
            type="button"
            onClick={processText}
            disabled={!htmlText.trim() || loading}
            className="extract-btn"
          >
            {loading ? 'Procesando...' : 'Extraer datos'}
          </button>
        </div>
      )}

      {error && (
        <div className="html-extractor__error">
          <p>{error}</p>
        </div>
      )}

      {extractedData && (
        <div className="html-extractor__results">
          <div className="results-header">
            <h4>Datos extraídos</h4>
            <button 
              type="button"
              onClick={resetExtractor}
              className="reset-btn"
            >
              Nuevo HTML
            </button>
          </div>

          <div className="extraction-summary">
            <div className="summary-item">
              <span className="label">Título:</span>
              <span className="value">{extractedData.extractedData.name}</span>
            </div>
            <div className="summary-item">
              <span className="label">Precio:</span>
              <span className="value">{extractedData.extractedData.price}€</span>
            </div>
            <div className="summary-item">
              <span className="label">Habitaciones:</span>
              <span className="value">{extractedData.extractedData.rooms}</span>
            </div>
            <div className="summary-item">
              <span className="label">Baños:</span>
              <span className="value">{extractedData.extractedData.bathRooms}</span>
            </div>
            <div className="summary-item">
              <span className="label">Metros:</span>
              <span className="value">{extractedData.extractedData.squaredMeters} m²</span>
            </div>
          </div>

          {extractedData.validation && !extractedData.validation.isValid && (
            <div className="validation-warnings">
              <h5>Advertencias:</h5>
              <ul>
                {extractedData.validation.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="results-actions">
            <p>Los datos han sido aplicados al formulario automáticamente.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HtmlExtractor;