/**
 * Componente de prueba SOLO para subida de imágenes - Debug SIMPLIFICADO
 */
import React, { useRef, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import propertyService from '../services/propertyService.js';

const TestImageUpload = () => {
  const { isAuthenticated, user, getAccessTokenSilently } = useAuth0();
  const fileInputRef = useRef(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [error, setError] = useState(null);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
    setError(null);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError('Selecciona archivos primero');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      
      console.log('🖼️ Iniciando subida de imágenes:', selectedFiles.map(f => f.name));
      
      // Usar propertyService directamente para subir solo las imágenes
      const response = await propertyService.uploadImages(selectedFiles, getAccessTokenSilently);
      console.log('✅ Subida exitosa:', response);
      
      // Actualizar estado local
      const newImages = response.data.images.map((img, index) => ({
        id: img.id,
        url: img.url,
        displayUrl: img.displayUrl,
        thumbUrl: img.thumbUrl,
        size: img.size,
        uploadedAt: img.uploadedAt
      }));
      
      setUploadedImages(prev => [...prev, ...newImages]);
      setSelectedFiles([]);
      
      alert(`✅ ${newImages.length} imágenes subidas correctamente!`);
      
    } catch (error) {
      console.error('❌ Error en subida:', error);
      setError(error.message);
    } finally {
      setUploading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ padding: '20px', border: '2px solid orange' }}>
        <h3>🔐 Test Image Upload - No autenticado</h3>
        <p>Debes iniciar sesión para probar la subida de imágenes.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', border: '2px solid green', margin: '20px' }}>
      <h3>🖼️ Test Subida de Imágenes</h3>
      <p><strong>Usuario:</strong> {user?.email}</p>
      
      <div style={{ margin: '20px 0' }}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          style={{
            padding: '10px 20px',
            background: uploading ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: uploading ? 'not-allowed' : 'pointer',
            marginRight: '10px'
          }}
        >
          📁 Seleccionar Imágenes
        </button>

        {selectedFiles.length > 0 && (
          <button 
            onClick={handleUpload}
            disabled={uploading}
            style={{
              padding: '10px 20px',
              background: uploading ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: uploading ? 'not-allowed' : 'pointer'
            }}
          >
            {uploading ? '⏳ Subiendo...' : '🚀 Subir Imágenes'}
          </button>
        )}
      </div>

      {/* Archivos seleccionados */}
      {selectedFiles.length > 0 && (
        <div style={{ margin: '20px 0' }}>
          <h4>📋 Archivos seleccionados ({selectedFiles.length}):</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {selectedFiles.map((file, index) => (
              <div 
                key={index}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '10px',
                  width: '200px',
                  position: 'relative'
                }}
              >
                <div style={{
                  width: '100%',
                  height: '120px',
                  background: '#f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '4px',
                  fontSize: '40px'
                }}>
                  🖼️
                </div>
                <p style={{ margin: '5px 0', fontSize: '12px', wordBreak: 'break-all' }}>
                  {file.name}
                </p>
                <p style={{ margin: '0', fontSize: '10px', color: '#666' }}>
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <button
                  onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== index))}
                  style={{
                    position: 'absolute',
                    top: '5px',
                    right: '5px',
                    background: 'red',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Imágenes subidas */}
      {uploadedImages.length > 0 && (
        <div style={{ margin: '20px 0' }}>
          <h4>✅ Imágenes subidas ({uploadedImages.length}):</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {uploadedImages.map((img, index) => (
              <div 
                key={img.id || index}
                style={{
                  border: '1px solid #28a745',
                  borderRadius: '8px',
                  padding: '10px',
                  width: '200px'
                }}
              >
                <img 
                  src={img.url} 
                  alt={`Imagen ${index + 1}`}
                  style={{
                    width: '100%',
                    height: '120px',
                    objectFit: 'cover',
                    borderRadius: '4px'
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div style={{
                  width: '100%',
                  height: '120px',
                  background: '#f0f0f0',
                  display: 'none',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '4px',
                  fontSize: '30px'
                }}>
                  ✅
                </div>
                <p style={{ margin: '5px 0', fontSize: '10px', color: '#28a745' }}>
                  ✅ ID: {img.id}
                </p>
                <p style={{ margin: '0', fontSize: '8px', color: '#666' }}>
                  {img.uploadedAt}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div style={{ 
          padding: '10px', 
          background: '#ffe6e6', 
          border: '1px solid #ff9999',
          borderRadius: '5px',
          margin: '10px 0'
        }}>
          <strong>❌ Error:</strong> {error}
          <button 
            onClick={() => setError(null)}
            style={{
              marginLeft: '10px',
              padding: '5px 10px',
              background: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          >
            Cerrar
          </button>
        </div>
      )}

      <details style={{ marginTop: '20px' }}>
        <summary>Estado del Test</summary>
        <pre style={{ background: '#f5f5f5', padding: '10px', fontSize: '12px' }}>
          {JSON.stringify({
            uploading,
            selectedFilesCount: selectedFiles.length,
            uploadedImagesCount: uploadedImages.length,
            error
          }, null, 2)}
        </pre>
      </details>
    </div>
  );
};

export default TestImageUpload;