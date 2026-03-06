import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { usePropertiesApi, useImagesApi } from '../../../hooks/admin/useAdminApi.js';
import LocationAutocomplete from '../../LocationAutocomplete/LocationAutocomplete';
import CustomSelect from '../../CustomSelect/CustomSelect';
import CharacteristicsSelector from '../../CharacteristicsSelector';
import './PropertyForm.css';

// Opciones para los selects
const TIPO_INMUEBLE_OPTIONS = [
  { value: 'Vivienda', label: 'Vivienda' },
  { value: 'Oficina', label: 'Oficina' },
  { value: 'Local', label: 'Local' },
  { value: 'Nave', label: 'Nave' },
  { value: 'Garaje', label: 'Garaje' },
  { value: 'Terreno', label: 'Terreno' },
  { value: 'Trastero', label: 'Trastero' },
  { value: 'Edificio', label: 'Edificio' },
  { value: 'ObraNueva', label: 'Obra Nueva' }
];

const TIPO_VIVIENDA_OPTIONS = [
  { value: 'Piso', label: 'Piso' },
  { value: 'Ático', label: 'Ático' },
  { value: 'Dúplex', label: 'Dúplex' },
  { value: 'Casa', label: 'Casa' },
  { value: 'Chalet', label: 'Chalet' },
  { value: 'Villa', label: 'Villa' },
  { value: 'Masía', label: 'Masía' },
  { value: 'Finca', label: 'Finca' },
  { value: 'Loft', label: 'Loft' }
];

const ESTADO_OPTIONS = [
  { value: 'ObraNueva', label: 'Obra Nueva' },
  { value: 'BuenEstado', label: 'Buen Estado' },
  { value: 'AReformar', label: 'A Reformar' }
];

const PLANTA_OPTIONS = [
  { value: 'UltimaPlanta', label: 'Última Planta' },
  { value: 'PlantaIntermedia', label: 'Planta Intermedia' },
  { value: 'Bajo', label: 'Planta Baja' }
];

const TIPO_ANUNCIO_OPTIONS = [
  { value: 'Venta', label: 'Venta' },
  { value: 'Alquiler', label: 'Alquiler' }
];

const ESTADO_VENTA_OPTIONS = [
  { value: 'Disponible', label: 'Disponible' },
  { value: 'Reservada', label: 'Reservada' },
  { value: 'Vendida', label: 'Vendida' },
  { value: 'Cerrada', label: 'Cerrada' }
];



// Valores iniciales del formulario
const getInitialFormData = () => ({
  name: '',
  shortDescription: '',
  description: '',
  price: '',
  rooms: '',
  bathRooms: '',
  garage: '',
  squaredMeters: '',
  provincia: '',
  poblacion: '',
  calle: '',
  numero: '',
  tipoInmueble: 'Vivienda',
  tipoVivienda: 'Piso',
  estado: 'BuenEstado',
  planta: 'PlantaIntermedia',
  tipoAnuncio: 'Venta',
  estadoVenta: 'Disponible',
  caracteristicas: [],
  published: false
});

// Componente para subir imágenes
const ImageUploader = ({ images = [], onImagesChange, isLoading }) => {
  const [dragActive, setDragActive] = useState(false);
  
  // Asegurar que images siempre sea un array válido
  const safeImages = Array.isArray(images) ? images.filter(img => img != null) : [];
  
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const sortFiles = (files) =>
    [...files].sort((a, b) =>
      (a.name || '').localeCompare(b.name || '', undefined, { numeric: true, sensitivity: 'base' })
    );

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files).filter(
      file => file.type.startsWith('image/')
    );
    
    if (files.length > 0) {
      onImagesChange([...safeImages, ...sortFiles(files)]);
    }
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files).filter(
      file => file.type.startsWith('image/')
    );
    
    if (files.length > 0) {
      onImagesChange([...safeImages, ...sortFiles(files)]);
    }
  };

  const removeImage = (index) => {
    console.log('Eliminando imagen en índice:', index, 'de:', safeImages);
    const newImages = safeImages.filter((_, i) => i !== index);
    console.log('Nuevas imágenes:', newImages);
    onImagesChange(newImages);
  };

  const getImagePreview = (file) => {
    // Si es una string, es una URL existente
    if (typeof file === 'string') {
      return file;
    }
    
    // Si es un objeto con propiedad url (formato de base de datos)
    if (file && typeof file === 'object' && file.url) {
      return file.url;
    }
    
    // Si es un File object, crear object URL
    if (file instanceof File || file instanceof Blob) {
      return URL.createObjectURL(file);
    }
    
    // Fallback - retornar URL de placeholder si no se puede determinar el tipo
    console.warn('Tipo de imagen no reconocido:', file);
    return '/img/placeholder-image.jpg';
  };

  return (
    <div className="image-uploader">
      <div 
        className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          className="file-input"
          id="images-input"
          disabled={isLoading}
        />
        <label htmlFor="images-input" className="upload-label">
          <div className="upload-icon">📷</div>
          <h4>Añadir Imágenes</h4>
          <p>Arrastra y suelta las imágenes aquí o haz clic para seleccionar</p>
          <span className="file-types">JPG, PNG, WEBP (máx. 10MB cada una)</span>
        </label>
      </div>
      
      {safeImages.length > 0 && (
        <div className="images-preview">
          <h5>Imágenes ({safeImages.length})</h5>
          <div className="images-grid">
            {safeImages.map((image, index) => (
              <div key={`image-${index}-${typeof image === 'string' ? image.substring(image.lastIndexOf('/') + 1) : 'file'}`} className="image-preview">
                <img 
                  src={getImagePreview(image)} 
                  alt={`Preview ${index + 1}`}
                  onError={(e) => {
                    console.warn('Error cargando imagen:', image);
                    e.target.src = '/img/placeholder-image.jpg';
                  }}
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="remove-image"
                  disabled={isLoading}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Componente principal del formulario
const PropertyForm = () => {
  const { id } = useParams(); // Si hay ID, estamos editando
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  
  const [formData, setFormData] = useState(getInitialFormData());
  const [images, setImages] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { 
    getProperty, 
    createProperty, 
    updateProperty, 
    loading: propertyLoading, 
    error: propertyError 
  } = usePropertiesApi();
  
  const { 
    uploadImages, 
    attachImagesToProperty, 
    loading: imageLoading, 
    error: imageError 
  } = useImagesApi();

  // Cargar datos si estamos editando
  useEffect(() => {
    console.log('useEffect ejecutado - isEditing:', isEditing, 'id:', id);
    if (isEditing && id) {
      console.log('Intentando cargar datos de la propiedad...');
      loadPropertyData();
    }
  }, [isEditing, id]);

  const loadPropertyData = async () => {
    try {
      console.log('Cargando datos de la propiedad con ID:', id);
      const response = await getProperty(id);
      console.log('Respuesta del backend:', response);
      const property = response.data;
      console.log('Datos de la propiedad:', property);
      
      setFormData({
        name: property.name || '',
        shortDescription: property.shortDescription || '',
        description: property.description || '',
        price: property.price?.toString() || '',
        rooms: property.rooms?.toString() || '',
        bathRooms: property.bathRooms?.toString() || '',
        garage: property.garage?.toString() || '',
        squaredMeters: property.squaredMeters?.toString() || '',
        provincia: property.provincia || '',
        poblacion: property.poblacion || '',
        calle: property.calle || '',
        numero: property.numero || '',
        tipoInmueble: property.tipoInmueble || 'Vivienda',
        tipoVivienda: property.tipoVivienda || 'Piso',
        estado: property.estado || 'BuenEstado',
        planta: property.planta || 'PlantaIntermedia',
        tipoAnuncio: property.tipoAnuncio || 'Venta',
        estadoVenta: property.estadoVenta || 'Disponible',
        caracteristicas: Array.isArray(property.caracteristicas) ? property.caracteristicas : [],
        published: Boolean(property.published)
      });
      
      // Cargar imágenes existentes - normalizar formato
      let imagesToLoad = [];
      
      if (property.imagenes && property.imagenes.length > 0) {
        // Formato desde base de datos: array de objetos con url
        imagesToLoad = property.imagenes.map(img => {
          if (typeof img === 'string') {
            return img; // Ya es una URL
          }
          return img.url || img.URL || img; // Diferentes posibles formatos
        });
      } else if (property.images && property.images.length > 0) {
        // Formato alternativo: array directo de URLs
        imagesToLoad = property.images;
      }
      
      // Filtrar valores válidos
      const validImages = imagesToLoad.filter(img => img && typeof img === 'string');
      console.log('Imágenes cargadas:', validImages);
      setImages(validImages);
    } catch (error) {
      console.error('Error loading property:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Limpiar error de validación si existe
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLocationSelect = (location) => {
    setFormData(prev => ({
      ...prev,
      provincia: location.provincia || '',
      poblacion: location.poblacion || location.name || ''
    }));
  };

  const handleCaracteristicasChange = (selectedCharacteristics) => {
    setFormData(prev => ({
      ...prev,
      caracteristicas: selectedCharacteristics
    }));
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'El nombre es obligatorio';
    }
    
    if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      errors.price = 'El precio debe ser un número mayor a 0';
    }
    
    if (!formData.poblacion.trim()) {
      errors.poblacion = 'La población es obligatoria';
    }
    
    if (formData.rooms && (isNaN(formData.rooms) || parseInt(formData.rooms) < 0)) {
      errors.rooms = 'Las habitaciones deben ser un número válido';
    }
    
    if (formData.bathRooms && (isNaN(formData.bathRooms) || parseInt(formData.bathRooms) < 0)) {
      errors.bathRooms = 'Los baños deben ser un número válido';
    }
    
    if (formData.squaredMeters && (isNaN(formData.squaredMeters) || parseFloat(formData.squaredMeters) <= 0)) {
      errors.squaredMeters = 'Los metros cuadrados deben ser un número mayor a 0';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Preparar datos para envío
      const propertyData = {
        ...formData,
        price: parseFloat(formData.price),
        rooms: parseInt(formData.rooms) || 0,
        bathRooms: parseInt(formData.bathRooms) || 0,
        garage: parseInt(formData.garage) || 0,
        squaredMeters: parseInt(formData.squaredMeters) || 0
      };

      let propertyResponse;
      
      if (isEditing) {
        propertyResponse = await updateProperty(id, propertyData);
      } else {
        propertyResponse = await createProperty(propertyData);
      }

      const propertyId = propertyResponse.data.id || id;

      // Subir nuevas imágenes si las hay
      const newImageFiles = images.filter(img => typeof img !== 'string');
      if (newImageFiles.length > 0) {
        const uploadResponse = await uploadImages(newImageFiles);
        if (uploadResponse.data && uploadResponse.data.images) {
          await attachImagesToProperty(propertyId, uploadResponse.data.images);
        }
      }

      // Redirigir a la gestión de propiedades
      navigate('/admin/viviendas', { 
        state: { 
          message: isEditing ? 'Propiedad actualizada correctamente' : 'Propiedad creada correctamente' 
        }
      });

    } catch (error) {
      console.error('Error saving property:', error);
      setValidationErrors({
        general: error.message || 'Error al guardar la propiedad'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = propertyLoading || imageLoading || isSubmitting;

  return (
    <div className="property-form">
      <div className="form-header">
        <div className="header-content">
          <h1 className="form-title">
            {isEditing ? 'Editar Vivienda' : 'Crear Nueva Vivienda'}
          </h1>
          <p className="form-subtitle">
            {isEditing 
              ? 'Modifica los datos de la propiedad' 
              : 'Completa la información para añadir una nueva propiedad al catálogo'
            }
          </p>
        </div>
        <div className="header-actions">
          <Link to="/admin/viviendas" className="btn btn--secondary">
            ← Volver
          </Link>
        </div>
      </div>

      {(propertyError || imageError || validationErrors.general) && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <span>{propertyError || imageError || validationErrors.general}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="form-content">
        {/* Información Básica */}
        <div className="form-section">
          <h2 className="section-title">Información Básica</h2>
          
          <div className="form-grid">
            <div className="form-group full-width">
              <label htmlFor="name">Nombre de la propiedad *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={validationErrors.name ? 'error' : ''}
                placeholder="Ej: Piso reformado en centro de Igualada"
                disabled={isLoading}
              />
              {validationErrors.name && (
                <span className="error-text">{validationErrors.name}</span>
              )}
            </div>

            <div className="form-group full-width">
              <label htmlFor="shortDescription">Descripción breve</label>
              <input
                type="text"
                id="shortDescription"
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleInputChange}
                placeholder="Ej: Precioso piso reformado en el centro histórico"
                disabled={isLoading}
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="description">Descripción completa</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={6}
                placeholder="Descripción detallada de la propiedad, características, entorno, etc."
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        {/* Características Principales */}
        <div className="form-section">
          <h2 className="section-title">Características Principales</h2>
          
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="price">Precio *</label>
              <div className="input-with-suffix">
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className={validationErrors.price ? 'error' : ''}
                  placeholder="240000"
                  min="0"
                  step="1000"
                  disabled={isLoading}
                />
                <span className="input-suffix">€</span>
              </div>
              {validationErrors.price && (
                <span className="error-text">{validationErrors.price}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="rooms">Habitaciones</label>
              <input
                type="number"
                id="rooms"
                name="rooms"
                value={formData.rooms}
                onChange={handleInputChange}
                className={validationErrors.rooms ? 'error' : ''}
                placeholder="3"
                min="0"
                disabled={isLoading}
              />
              {validationErrors.rooms && (
                <span className="error-text">{validationErrors.rooms}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="bathRooms">Baños</label>
              <input
                type="number"
                id="bathRooms"
                name="bathRooms"
                value={formData.bathRooms}
                onChange={handleInputChange}
                className={validationErrors.bathRooms ? 'error' : ''}
                placeholder="2"
                min="0"
                disabled={isLoading}
              />
              {validationErrors.bathRooms && (
                <span className="error-text">{validationErrors.bathRooms}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="garage">Plazas de garaje</label>
              <input
                type="number"
                id="garage"
                name="garage"
                value={formData.garage}
                onChange={handleInputChange}
                placeholder="1"
                min="0"
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="squaredMeters">Metros cuadrados</label>
              <div className="input-with-suffix">
                <input
                  type="number"
                  id="squaredMeters"
                  name="squaredMeters"
                  value={formData.squaredMeters}
                  onChange={handleInputChange}
                  className={validationErrors.squaredMeters ? 'error' : ''}
                  placeholder="102"
                  min="0"
                  disabled={isLoading}
                />
                <span className="input-suffix">m²</span>
              </div>
              {validationErrors.squaredMeters && (
                <span className="error-text">{validationErrors.squaredMeters}</span>
              )}
            </div>
          </div>
        </div>

        {/* Ubicación */}
        <div className="form-section">
          <h2 className="section-title">Ubicación</h2>
          
          <div className="form-grid">
            <div className="form-group full-width">
              <label>Población *</label>
              <LocationAutocomplete
                onLocationSelect={handleLocationSelect}
                initialValue={formData.poblacion}
                placeholder="Busca la población..."
                disabled={isLoading}
              />
              {validationErrors.poblacion && (
                <span className="error-text">{validationErrors.poblacion}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="calle">Calle</label>
              <input
                type="text"
                id="calle"
                name="calle"
                value={formData.calle}
                onChange={handleInputChange}
                placeholder="Ej: Carrer Major"
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="numero">Número</label>
              <input
                type="text"
                id="numero"
                name="numero"
                value={formData.numero}
                onChange={handleInputChange}
                placeholder="Ej: 12, 3º 2ª"
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        {/* Clasificación */}
        <div className="form-section">
          <h2 className="section-title">Clasificación</h2>
          
          <div className="form-grid">
            <div className="form-group">
              <label>Tipo de inmueble</label>
              <CustomSelect
                options={TIPO_INMUEBLE_OPTIONS}
                value={formData.tipoInmueble}
                onChange={(value) => handleSelectChange('tipoInmueble', value)}
                placeholder="Selecciona tipo..."
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label>Tipo de vivienda</label>
              <CustomSelect
                options={TIPO_VIVIENDA_OPTIONS}
                value={formData.tipoVivienda}
                onChange={(value) => handleSelectChange('tipoVivienda', value)}
                placeholder="Selecciona tipo..."
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label>Estado</label>
              <CustomSelect
                options={ESTADO_OPTIONS}
                value={formData.estado}
                onChange={(value) => handleSelectChange('estado', value)}
                placeholder="Selecciona estado..."
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label>Planta</label>
              <CustomSelect
                options={PLANTA_OPTIONS}
                value={formData.planta}
                onChange={(value) => handleSelectChange('planta', value)}
                placeholder="Selecciona planta..."
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label>Tipo de anuncio</label>
              <CustomSelect
                options={TIPO_ANUNCIO_OPTIONS}
                value={formData.tipoAnuncio}
                onChange={(value) => handleSelectChange('tipoAnuncio', value)}
                placeholder="Selecciona tipo..."
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label>Estado de venta</label>
              <CustomSelect
                options={ESTADO_VENTA_OPTIONS}
                value={formData.estadoVenta}
                onChange={(value) => handleSelectChange('estadoVenta', value)}
                placeholder="Selecciona estado..."
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        {/* Características Adicionales */}
        <div className="form-section">
          <CharacteristicsSelector
            selectedCharacteristics={formData.caracteristicas}
            onChange={handleCaracteristicasChange}
            disabled={isLoading}
            title="Características Adicionales"
            subtitle="Selecciona todas las características que apliquen a esta vivienda. Estas características aparecerán destacadas en los listados y ayudarán a los usuarios a encontrar la propiedad perfecta."
          />
        </div>

        {/* Imágenes */}
        <div className="form-section">
          <h2 className="section-title">Imágenes</h2>
          <ImageUploader
            images={images}
            onImagesChange={setImages}
            isLoading={isLoading}
          />
        </div>

        {/* Estado de Publicación */}
        <div className="form-section">
          <h2 className="section-title">Publicación</h2>
          
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="published"
                checked={formData.published}
                onChange={handleInputChange}
                disabled={isLoading}
              />
              <span className="checkbox-text">
                Publicar inmediatamente
              </span>
            </label>
            <p className="form-help">
              Si no marcas esta opción, la propiedad se guardará como borrador.
            </p>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="form-actions">
          <Link to="/admin/viviendas" className="btn btn--secondary">
            Cancelar
          </Link>
          <button
            type="submit"
            className="btn btn--primary"
            disabled={isLoading}
          >
            {isLoading && <span className="btn-spinner"></span>}
            {isEditing ? 'Actualizar Propiedad' : 'Crear Propiedad'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PropertyForm;