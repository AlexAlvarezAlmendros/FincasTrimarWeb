import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './PropertyCreatePage.css';

// Hook personalizado para el formulario
const usePropertyForm = () => {
  const [formData, setFormData] = useState({
    // Información básica
    name: '',
    shortDescription: '',
    description: '',
    price: '',
    
    // Características físicas
    rooms: '',
    bathrooms: '',
    garage: '',
    squaredMeters: '',
    
    // Ubicación
    provincia: '',
    poblacion: '',
    calle: '',
    numero: '',
    
    // Clasificación
    tipoInmueble: 'Vivienda',
    tipoVivienda: 'Piso',
    estado: 'BuenEstado',
    planta: 'PlantaIntermedia',
    tipoAnuncio: 'Venta',
    estadoVenta: 'Disponible',
    
    // Características adicionales
    caracteristicas: [],
    
    // Control
    published: false
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);

  const updateField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error del campo si existe
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const toggleCaracteristica = (caracteristica) => {
    setFormData(prev => ({
      ...prev,
      caracteristicas: prev.caracteristicas.includes(caracteristica)
        ? prev.caracteristicas.filter(c => c !== caracteristica)
        : [...prev.caracteristicas, caracteristica]
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Campos obligatorios
    if (!formData.name.trim()) newErrors.name = 'El nombre es obligatorio';
    if (!formData.price || formData.price <= 0) newErrors.price = 'El precio debe ser mayor a 0';
    if (!formData.poblacion.trim()) newErrors.poblacion = 'La población es obligatoria';
    if (!formData.provincia.trim()) newErrors.provincia = 'La provincia es obligatoria';
    
    // Validaciones numéricas
    if (formData.rooms && formData.rooms < 0) newErrors.rooms = 'Las habitaciones no pueden ser negativas';
    if (formData.bathrooms && formData.bathrooms < 0) newErrors.bathrooms = 'Los baños no pueden ser negativos';
    if (formData.garage && formData.garage < 0) newErrors.garage = 'Las plazas de garaje no pueden ser negativas';
    if (formData.squaredMeters && formData.squaredMeters <= 0) newErrors.squaredMeters = 'Los metros cuadrados deben ser mayor a 0';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitForm = async (asDraft = false) => {
    if (!asDraft && !validateForm()) {
      return false;
    }

    setLoading(true);
    
    try {
      // Simular llamada API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const propertyData = {
        ...formData,
        published: !asDraft,
        images: images.map((img, index) => ({ url: img.url, orden: index }))
      };

      console.log('Propiedad creada:', propertyData);
      
      setLoading(false);
      return true;
    } catch (error) {
      console.error('Error creating property:', error);
      setLoading(false);
      return false;
    }
  };

  return {
    formData,
    errors,
    loading,
    images,
    setImages,
    updateField,
    toggleCaracteristica,
    submitForm
  };
};

// Componente de subida de imágenes
const ImageUpload = ({ images, onImagesChange }) => {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (files) => {
    setUploading(true);
    
    try {
      // Simular subida de imágenes
      for (let file of files) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockUrl = URL.createObjectURL(file);
        const newImage = {
          id: Date.now() + Math.random(),
          url: mockUrl,
          name: file.name,
          size: file.size
        };
        
        onImagesChange(prev => [...prev, newImage]);
      }
    } catch (error) {
      console.error('Error uploading images:', error);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (imageId) => {
    onImagesChange(prev => prev.filter(img => img.id !== imageId));
  };

  return (
    <div className="image-upload-section">
      <h3>Imágenes de la propiedad</h3>
      
      <div className="image-upload-area">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFileUpload(Array.from(e.target.files))}
          disabled={uploading}
          className="file-input"
          id="property-images"
        />
        <label htmlFor="property-images" className="upload-label">
          {uploading ? (
            <>
              <span className="upload-spinner">⏳</span>
              <span>Subiendo imágenes...</span>
            </>
          ) : (
            <>
              <span className="upload-icon">📸</span>
              <span>Hacer clic para seleccionar imágenes</span>
              <small>JPG, PNG, WEBP (máx. 10MB cada una)</small>
            </>
          )}
        </label>
      </div>

      {images.length > 0 && (
        <div className="images-preview">
          <h4>Imágenes seleccionadas ({images.length})</h4>
          <div className="images-grid">
            {images.map((image, index) => (
              <div key={image.id} className="image-preview-item">
                <img src={image.url} alt={`Vista previa ${index + 1}`} />
                <div className="image-overlay">
                  <span className="image-order">#{index + 1}</span>
                  <button
                    onClick={() => removeImage(image.id)}
                    className="remove-image-btn"
                    type="button"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Componente principal
const PropertyCreatePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    formData,
    errors,
    loading,
    images,
    setImages,
    updateField,
    toggleCaracteristica,
    submitForm
  } = usePropertyForm();

  const handleSubmit = async (e, asDraft = false) => {
    e.preventDefault();
    
    const success = await submitForm(asDraft);
    
    if (success) {
      const message = asDraft ? 'Borrador guardado correctamente' : 'Vivienda publicada correctamente';
      alert(message); // En producción, usar un sistema de notificaciones
      
      if (asDraft) {
        navigate('/admin/viviendas/borradores');
      } else {
        navigate('/admin/viviendas');
      }
    }
  };

  const caracteristicasDisponibles = [
    'AireAcondicionado', 'ArmariosEmpotrados', 'Ascensor', 'Balcón', 
    'Terraza', 'Exterior', 'Jardín', 'Piscina', 'Trastero', 
    'ViviendaAccesible', 'VistasAlMar', 'ViviendaDeLujo', 'VistasAMontaña', 
    'Calefacción', 'Guardilla', 'CocinaOffice'
  ];

  return (
    <div className="property-create-page">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">
            {id ? 'Editar Vivienda' : 'Crear Nueva Vivienda'}
          </h1>
          <p className="page-subtitle">
            {id ? 'Modifica los datos de la propiedad' : 'Añade una nueva propiedad al catálogo'}
          </p>
        </div>
        <div className="header-actions">
          <button
            onClick={() => navigate('/admin/viviendas')}
            className="btn btn--secondary"
            type="button"
          >
            ← Volver al listado
          </button>
        </div>
      </div>

      <form onSubmit={(e) => handleSubmit(e)} className="property-form">
        {/* Información Básica */}
        <section className="form-section">
          <h2 className="section-title">Información Básica</h2>
          <div className="form-grid">
            <div className="form-group form-group--full">
              <label htmlFor="name" className="form-label">
                Nombre de la propiedad *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                className={`form-input ${errors.name ? 'error' : ''}`}
                placeholder="Ej: Piso reformado en centro de Igualada 102 m²"
                maxLength={200}
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="form-group form-group--full">
              <label htmlFor="shortDescription" className="form-label">
                Descripción breve
              </label>
              <input
                type="text"
                id="shortDescription"
                value={formData.shortDescription}
                onChange={(e) => updateField('shortDescription', e.target.value)}
                className="form-input"
                placeholder="Descripción que aparecerá en las tarjetas de listado"
                maxLength={300}
              />
            </div>

            <div className="form-group form-group--full">
              <label htmlFor="description" className="form-label">
                Descripción completa
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                className="form-textarea"
                placeholder="Descripción detallada de la propiedad..."
                rows={6}
              />
            </div>

            <div className="form-group">
              <label htmlFor="price" className="form-label">
                Precio (€) *
              </label>
              <input
                type="number"
                id="price"
                value={formData.price}
                onChange={(e) => updateField('price', parseInt(e.target.value) || '')}
                className={`form-input ${errors.price ? 'error' : ''}`}
                placeholder="240000"
                min="0"
              />
              {errors.price && <span className="error-message">{errors.price}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="tipoAnuncio" className="form-label">
                Tipo de operación
              </label>
              <select
                id="tipoAnuncio"
                value={formData.tipoAnuncio}
                onChange={(e) => updateField('tipoAnuncio', e.target.value)}
                className="form-select"
              >
                <option value="Venta">Venta</option>
                <option value="Alquiler">Alquiler</option>
              </select>
            </div>
          </div>
        </section>

        {/* Características Físicas */}
        <section className="form-section">
          <h2 className="section-title">Características Físicas</h2>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="rooms" className="form-label">
                Habitaciones
              </label>
              <input
                type="number"
                id="rooms"
                value={formData.rooms}
                onChange={(e) => updateField('rooms', parseInt(e.target.value) || '')}
                className={`form-input ${errors.rooms ? 'error' : ''}`}
                placeholder="3"
                min="0"
              />
              {errors.rooms && <span className="error-message">{errors.rooms}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="bathrooms" className="form-label">
                Baños
              </label>
              <input
                type="number"
                id="bathrooms"
                value={formData.bathrooms}
                onChange={(e) => updateField('bathrooms', parseInt(e.target.value) || '')}
                className={`form-input ${errors.bathrooms ? 'error' : ''}`}
                placeholder="2"
                min="0"
              />
              {errors.bathrooms && <span className="error-message">{errors.bathrooms}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="garage" className="form-label">
                Plazas de garaje
              </label>
              <input
                type="number"
                id="garage"
                value={formData.garage}
                onChange={(e) => updateField('garage', parseInt(e.target.value) || '')}
                className={`form-input ${errors.garage ? 'error' : ''}`}
                placeholder="1"
                min="0"
              />
              {errors.garage && <span className="error-message">{errors.garage}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="squaredMeters" className="form-label">
                Metros cuadrados
              </label>
              <input
                type="number"
                id="squaredMeters"
                value={formData.squaredMeters}
                onChange={(e) => updateField('squaredMeters', parseInt(e.target.value) || '')}
                className={`form-input ${errors.squaredMeters ? 'error' : ''}`}
                placeholder="102"
                min="1"
              />
              {errors.squaredMeters && <span className="error-message">{errors.squaredMeters}</span>}
            </div>
          </div>
        </section>

        {/* Ubicación */}
        <section className="form-section">
          <h2 className="section-title">Ubicación</h2>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="provincia" className="form-label">
                Provincia *
              </label>
              <input
                type="text"
                id="provincia"
                value={formData.provincia}
                onChange={(e) => updateField('provincia', e.target.value)}
                className={`form-input ${errors.provincia ? 'error' : ''}`}
                placeholder="Barcelona"
              />
              {errors.provincia && <span className="error-message">{errors.provincia}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="poblacion" className="form-label">
                Población *
              </label>
              <input
                type="text"
                id="poblacion"
                value={formData.poblacion}
                onChange={(e) => updateField('poblacion', e.target.value)}
                className={`form-input ${errors.poblacion ? 'error' : ''}`}
                placeholder="Igualada"
              />
              {errors.poblacion && <span className="error-message">{errors.poblacion}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="calle" className="form-label">
                Calle
              </label>
              <input
                type="text"
                id="calle"
                value={formData.calle}
                onChange={(e) => updateField('calle', e.target.value)}
                className="form-input"
                placeholder="Carrer Major"
              />
            </div>

            <div className="form-group">
              <label htmlFor="numero" className="form-label">
                Número
              </label>
              <input
                type="text"
                id="numero"
                value={formData.numero}
                onChange={(e) => updateField('numero', e.target.value)}
                className="form-input"
                placeholder="15"
              />
            </div>
          </div>
        </section>

        {/* Clasificación */}
        <section className="form-section">
          <h2 className="section-title">Clasificación</h2>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="tipoInmueble" className="form-label">
                Tipo de inmueble
              </label>
              <select
                id="tipoInmueble"
                value={formData.tipoInmueble}
                onChange={(e) => updateField('tipoInmueble', e.target.value)}
                className="form-select"
              >
                <option value="Vivienda">Vivienda</option>
                <option value="Oficina">Oficina</option>
                <option value="Local">Local</option>
                <option value="Nave">Nave</option>
                <option value="Garaje">Garaje</option>
                <option value="Terreno">Terreno</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="tipoVivienda" className="form-label">
                Tipo de vivienda
              </label>
              <select
                id="tipoVivienda"
                value={formData.tipoVivienda}
                onChange={(e) => updateField('tipoVivienda', e.target.value)}
                className="form-select"
              >
                <option value="Piso">Piso</option>
                <option value="Ático">Ático</option>
                <option value="Dúplex">Dúplex</option>
                <option value="Casa">Casa</option>
                <option value="Chalet">Chalet</option>
                <option value="Villa">Villa</option>
                <option value="Masía">Masía</option>
                <option value="Finca">Finca</option>
                <option value="Loft">Loft</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="estado" className="form-label">
                Estado de conservación
              </label>
              <select
                id="estado"
                value={formData.estado}
                onChange={(e) => updateField('estado', e.target.value)}
                className="form-select"
              >
                <option value="ObraNueva">Obra nueva</option>
                <option value="BuenEstado">Buen estado</option>
                <option value="AReformar">A reformar</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="planta" className="form-label">
                Planta
              </label>
              <select
                id="planta"
                value={formData.planta}
                onChange={(e) => updateField('planta', e.target.value)}
                className="form-select"
              >
                <option value="Bajo">Bajo</option>
                <option value="PlantaIntermedia">Planta intermedia</option>
                <option value="UltimaPlanta">Última planta</option>
              </select>
            </div>
          </div>
        </section>

        {/* Características adicionales */}
        <section className="form-section">
          <h2 className="section-title">Características Adicionales</h2>
          <div className="characteristics-grid">
            {caracteristicasDisponibles.map(caracteristica => (
              <label key={caracteristica} className="characteristic-item">
                <input
                  type="checkbox"
                  checked={formData.caracteristicas.includes(caracteristica)}
                  onChange={() => toggleCaracteristica(caracteristica)}
                />
                <span className="characteristic-label">{caracteristica}</span>
              </label>
            ))}
          </div>
        </section>

        {/* Subida de imágenes */}
        <section className="form-section">
          <ImageUpload images={images} onImagesChange={setImages} />
        </section>

        {/* Botones de acción */}
        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/admin/viviendas')}
            className="btn btn--secondary"
            disabled={loading}
          >
            Cancelar
          </button>
          
          <button
            type="button"
            onClick={(e) => handleSubmit(e, true)}
            className="btn btn--draft"
            disabled={loading}
          >
            {loading ? 'Guardando...' : '📝 Guardar como borrador'}
          </button>
          
          <button
            type="submit"
            className="btn btn--primary"
            disabled={loading}
          >
            {loading ? 'Publicando...' : '🚀 Publicar vivienda'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PropertyCreatePage;