import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import PropertyCard from '../components/PropertyCard/PropertyCard';
import LocationAutocomplete from '../components/LocationAutocomplete/LocationAutocomplete';
import CustomSelect from '../components/CustomSelect/CustomSelect';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useViviendas } from '../hooks/useViviendas';
import { 
  TipoVivienda, 
  Estado, 
  TipoAnuncio,
  DataTransformers 
} from '../types/vivienda.types';
import './Listado.css';

export default function Listado() {
  const navigate = useNavigate();
  const location = useLocation();
  const [filters, setFilters] = useState({
    location: '',
    type: 'all',
    minPrice: '',
    maxPrice: '',
    rooms: 'all',
    bathrooms: 'all',
    garage: 'all',
    minSquareMeters: '',
    maxSquareMeters: '',
    estado: 'all',
    tipoAnuncio: 'all'
  });

  // Opciones para los selectores personalizados (usando enumeraciones tipadas)
  const typeOptions = useMemo(() => [
    { value: '', label: 'Tipo de vivienda' },
    { value: TipoVivienda.PISO, label: 'Piso' },
    { value: TipoVivienda.CASA, label: 'Casa' },
    { value: TipoVivienda.CHALET, label: 'Chalet' },
    { value: TipoVivienda.ATICO, label: 'Ático' },
    { value: TipoVivienda.DUPLEX, label: 'Dúplex' },
    { value: TipoVivienda.LOFT, label: 'Loft' },
    { value: TipoVivienda.VILLA, label: 'Villa' },
    { value: TipoVivienda.MASIA, label: 'Masía' },
    { value: TipoVivienda.FINCA, label: 'Finca' }
  ], []);

  const roomOptions = useMemo(() => [
    { value: '', label: 'Cualquiera' },
    { value: '1', label: '1 habitación' },
    { value: '2', label: '2 habitaciones' },
    { value: '3', label: '3 habitaciones' },
    { value: '4', label: '4 habitaciones' },
    { value: '5', label: '5+ habitaciones' }
  ], []);

  const bathroomOptions = useMemo(() => [
    { value: '', label: 'Cualquiera' },
    { value: '1', label: '1 baño' },
    { value: '2', label: '2 baños' },
    { value: '3', label: '3 baños' },
    { value: '4', label: '4+ baños' }
  ], []);

  const garageOptions = useMemo(() => [
    { value: '', label: 'Cualquiera' },
    { value: '0', label: 'Sin garaje' },
    { value: '1', label: '1 plaza' },
    { value: '2', label: '2 plazas' },
    { value: '3', label: '3+ plazas' }
  ], []);

  const estadoOptions = useMemo(() => [
    { value: '', label: 'Cualquier estado' },
    { value: Estado.OBRA_NUEVA, label: 'Obra nueva' },
    { value: Estado.BUEN_ESTADO, label: 'Buen estado' },
    { value: Estado.A_REFORMAR, label: 'A reformar' }
  ], []);

  const tipoAnuncioOptions = useMemo(() => [
    { value: '', label: 'Venta y Alquiler' },
    { value: TipoAnuncio.VENTA, label: 'Venta' },
    { value: TipoAnuncio.ALQUILER, label: 'Alquiler' }
  ], []);

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Filtros iniciales basados en URL parameters
  const getInitialFilters = () => {
    const searchParams = new URLSearchParams(location.search);
    return {
      q: searchParams.get('q') || '',
      poblacion: searchParams.get('poblacion') || '',
      provincia: searchParams.get('provincia') || '',
      tipoVivienda: searchParams.get('tipo') || '',
      minPrice: searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')) : null,
      maxPrice: searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')) : null,
      rooms: searchParams.get('rooms') ? parseInt(searchParams.get('rooms')) : null,
      bathRooms: searchParams.get('bathrooms') ? parseInt(searchParams.get('bathrooms')) : null,
      garage: searchParams.get('garage') ? parseInt(searchParams.get('garage')) : null,
      squaredMeters: searchParams.get('minSquareMeters') ? parseInt(searchParams.get('minSquareMeters')) : null,
      estado: searchParams.get('estado') || '',
      tipoAnuncio: searchParams.get('tipoAnuncio') || '',
      published: true,
      page: 1,
      pageSize: 12
    };
  };

  // Integración con el hook useViviendas
  const {
    viviendas,
    pagination,
    isLoading,
    isError,
    error,
    isEmpty,
    hasNextPage,
    hasPrevPage,
    filters: hookFilters,
    updateFilters,
    goToPage,
    resetFilters: resetHookFilters,
    searchViviendas,
    refreshViviendas
  } = useViviendas(getInitialFilters(), {
    enableCache: true,
    debounceMs: 500,
    autoFetch: true,
    onError: (error) => {
      console.error('Error al cargar viviendas:', error);
    },
    onSuccess: (data) => {
      console.log('Viviendas cargadas:', data.viviendas.length);
    }
  });

  // Mapeo de filtros locales del formulario a filtros del hook
  const mapLocalFiltersToHook = (localFilters) => {
    return {
      q: localFilters.location || '',
      poblacion: '', // Se extraerá de location si es específico
      provincia: '', // Se extraerá de location si es específico  
      tipoVivienda: localFilters.type || '',
      minPrice: localFilters.minPrice ? parseInt(localFilters.minPrice) : null,
      maxPrice: localFilters.maxPrice ? parseInt(localFilters.maxPrice) : null,
      rooms: localFilters.rooms ? parseInt(localFilters.rooms) : null,
      bathRooms: localFilters.bathrooms ? parseInt(localFilters.bathrooms) : null,
      garage: localFilters.garage ? parseInt(localFilters.garage) : null,
      squaredMeters: localFilters.minSquareMeters ? parseInt(localFilters.minSquareMeters) : null,
      estado: localFilters.estado || '',
      tipoAnuncio: localFilters.tipoAnuncio || '',
      published: true
    };
  };

  // Mapeo inverso: de filtros del hook a filtros locales del formulario
  const mapHookFiltersToLocal = (hookFilters) => {
    return {
      location: hookFilters.q || '',
      type: hookFilters.tipoVivienda || '',
      minPrice: hookFilters.minPrice?.toString() || '',
      maxPrice: hookFilters.maxPrice?.toString() || '',
      rooms: hookFilters.rooms?.toString() || '',
      bathrooms: hookFilters.bathRooms?.toString() || '',
      garage: hookFilters.garage?.toString() || '',
      minSquareMeters: hookFilters.squaredMeters?.toString() || '',
      maxSquareMeters: '', // No tenemos máximo en el backend
      estado: hookFilters.estado || '',
      tipoAnuncio: hookFilters.tipoAnuncio || ''
    };
  };

  // Filtros locales del formulario (para el estado de la UI)
  const [localFilters, setLocalFilters] = useState(() => mapHookFiltersToLocal(hookFilters));

  // Sincronizar filtros locales cuando cambien los filtros del hook
  useEffect(() => {
    setLocalFilters(mapHookFiltersToLocal(hookFilters));
  }, [hookFilters]);

  const handleFilterChange = (field, value) => {
    const newLocalFilters = {
      ...localFilters,
      [field]: value
    };
    setLocalFilters(newLocalFilters);

    // Para campos que requieren búsqueda inmediata con debounce
    const immediateSearchFields = ['location'];
    if (immediateSearchFields.includes(field)) {
      const hookFilters = mapLocalFiltersToHook(newLocalFilters);
      updateFilters(hookFilters, { debounce: true, resetPagination: true });
    }
  };

  const handleSearch = () => {
    const hookFilters = mapLocalFiltersToHook(localFilters);
    updateFilters(hookFilters, { resetPagination: true });
  };

  const handleAdvancedSearch = () => {
    const hookFilters = mapLocalFiltersToHook(localFilters);
    searchViviendas(hookFilters);
  };

  const resetFilters = () => {
    const defaultLocalFilters = {
      location: '',
      type: '',
      minPrice: '',
      maxPrice: '',
      rooms: '',
      bathrooms: '',
      garage: '',
      minSquareMeters: '',
      maxSquareMeters: '',
      estado: '',
      tipoAnuncio: ''
    };
    setLocalFilters(defaultLocalFilters);
    resetHookFilters();
  };

  const handleImageClick = (images) => {
    // TODO: Implementar galería de imágenes
    console.log('Opening image gallery:', images);
  };

  const handleDetailsClick = (propertyId) => {
    navigate(`/viviendas/${propertyId}`);
  };

  // Funciones de paginación
  const handlePageChange = (newPage) => {
    goToPage(newPage);
    // Scroll hacia arriba al cambiar de página
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRefresh = () => {
    refreshViviendas();
  };

  // Memoizar las viviendas para optimizar re-renders
  const displayedViviendas = useMemo(() => viviendas, [viviendas]);

  return (
    <div className="listado">
      {/* Filter Bar */}
      <section className="filter-bar">
        <div className="container">
          <div className="filter-card">
            <div className="main-filters">
              <div className="filter-group">
                <div className="filter-field">
                  <LocationAutocomplete
                    value={localFilters.location}
                    onChange={(value) => handleFilterChange('location', value)}
                    placeholder="Ubicación"
                  />
                </div>
                
                <div className="filter-field">
                  <CustomSelect
                    value={localFilters.type}
                    onChange={(value) => handleFilterChange('type', value)}
                    options={typeOptions}
                    placeholder="Tipo de vivienda"
                  />
                </div>
              </div>

              <div className="filter-actions">
                <button 
                  type="button" 
                  className="icon-button"
                  onClick={handleSearch}
                  title="Buscar"
                >
                  <FontAwesomeIcon icon="fa-solid fa-magnifying-glass" />
                </button>
                <button 
                  type="button" 
                  className="icon-button"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  title="Filtros avanzados"
                >
                  <FontAwesomeIcon icon="fa-solid fa-filter" />
                </button>
                <Link to="/admin" className="icon-button" title="Añadir vivienda">
                  <FontAwesomeIcon icon="fa-solid fa-plus" />
                </Link>
              </div>
            </div>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
              <div className="advanced-filters">
                <div className="advanced-filters-grid">
                  <div className="filter-field">
                    <label>Precio mínimo</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={localFilters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    />
                  </div>
                  
                  <div className="filter-field">
                    <label>Precio máximo</label>
                    <input
                      type="number"
                      placeholder="999999"
                      value={localFilters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    />
                  </div>
                  
                  <div className="filter-field">
                    <label>Habitaciones</label>
                    <CustomSelect
                      value={localFilters.rooms}
                      onChange={(value) => handleFilterChange('rooms', value)}
                      options={roomOptions}
                      placeholder="Habitaciones"
                    />
                  </div>

                  <div className="filter-field">
                    <label>Baños</label>
                    <CustomSelect
                      value={localFilters.bathrooms}
                      onChange={(value) => handleFilterChange('bathrooms', value)}
                      options={bathroomOptions}
                      placeholder="Baños"
                    />
                  </div>

                  <div className="filter-field">
                    <label>Garaje</label>
                    <CustomSelect
                      value={localFilters.garage}
                      onChange={(value) => handleFilterChange('garage', value)}
                      options={garageOptions}
                      placeholder="Garaje"
                    />
                  </div>

                  <div className="filter-field">
                    <label>Metros mínimos</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={localFilters.minSquareMeters}
                      onChange={(e) => handleFilterChange('minSquareMeters', e.target.value)}
                    />
                  </div>

                  <div className="filter-field">
                    <label>Metros máximos</label>
                    <input
                      type="number"
                      placeholder="999"
                      value={localFilters.maxSquareMeters}
                      onChange={(e) => handleFilterChange('maxSquareMeters', e.target.value)}
                    />
                  </div>

                  <div className="filter-field">
                    <label>Estado</label>
                    <CustomSelect
                      value={localFilters.estado}
                      onChange={(value) => handleFilterChange('estado', value)}
                      options={estadoOptions}
                      placeholder="Estado"
                    />
                  </div>

                  <div className="filter-field">
                    <label>Tipo de operación</label>
                    <CustomSelect
                      value={localFilters.tipoAnuncio}
                      onChange={(value) => handleFilterChange('tipoAnuncio', value)}
                      options={tipoAnuncioOptions}
                      placeholder="Operación"
                    />
                  </div>
                  
                  <div className="filter-actions">
                    <button type="button" onClick={resetFilters} className="reset-button">
                      Limpiar filtros
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="results">
        <div className="container">
          <div className="results-header">
            <h1>Viviendas disponibles</h1>
            <p className="results-count">
              {isLoading ? 'Cargando...' : (
                pagination.total > 0
                  ? `${pagination.total} viviendas disponibles - Página ${pagination.page} de ${pagination.totalPages}`
                  : 'No hay viviendas disponibles'
              )}
            </p>
            {!isLoading && pagination.total > 0 && (
              <button 
                onClick={handleRefresh} 
                className="refresh-button"
                title="Actualizar resultados"
              >
                <FontAwesomeIcon icon="fa-solid fa-refresh" />
              </button>
            )}
          </div>

          {isError ? (
            <div className="error-state">
              <h3>Error al cargar viviendas</h3>
              <p>{error}</p>
              <button onClick={handleRefresh} className="retry-button">
                Reintentar
              </button>
            </div>
          ) : isLoading ? (
            <div className="loading">
              <div className="loading-spinner"></div>
              <p>Cargando viviendas...</p>
            </div>
          ) : (
            <>
              <div className="properties-grid">
                {displayedViviendas.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    onImageClick={handleImageClick}
                    onDetailsClick={handleDetailsClick}
                  />
                ))}
              </div>

              {isEmpty && (
                <div className="no-results">
                  <h3>No se encontraron viviendas</h3>
                  <p>Prueba a ajustar los filtros de búsqueda.</p>
                  <button onClick={resetFilters} className="reset-button">
                    Limpiar filtros
                  </button>
                </div>
              )}

              {/* Paginación */}
              {pagination.totalPages > 1 && (
                <div className="pagination">
                  <div className="pagination-info">
                    <span>
                      Mostrando {((pagination.page - 1) * pagination.pageSize) + 1} - {Math.min(pagination.page * pagination.pageSize, pagination.total)} de {pagination.total} viviendas
                    </span>
                  </div>
                  
                  <div className="pagination-controls">
                    <button 
                      onClick={() => handlePageChange(1)}
                      disabled={!hasPrevPage}
                      className="pagination-button"
                      title="Primera página"
                    >
                      <FontAwesomeIcon icon="fa-solid fa-angles-left" />
                    </button>
                    
                    <button 
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={!hasPrevPage}
                      className="pagination-button"
                      title="Página anterior"
                    >
                      <FontAwesomeIcon icon="fa-solid fa-angle-left" />
                    </button>
                    
                    <span className="pagination-current">
                      {pagination.page}
                    </span>
                    
                    <button 
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={!hasNextPage}
                      className="pagination-button"
                      title="Página siguiente"
                    >
                      <FontAwesomeIcon icon="fa-solid fa-angle-right" />
                    </button>
                    
                    <button 
                      onClick={() => handlePageChange(pagination.totalPages)}
                      disabled={!hasNextPage}
                      className="pagination-button"
                      title="Última página"
                    >
                      <FontAwesomeIcon icon="fa-solid fa-angles-right" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}