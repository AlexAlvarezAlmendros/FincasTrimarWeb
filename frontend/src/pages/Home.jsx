import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PropertyCard from '../components/PropertyCard/PropertyCard';
import CustomSelect from '../components/CustomSelect/CustomSelect';
import LocationAutocomplete from '../components/LocationAutocomplete/LocationAutocomplete';
import SEO from '../components/SEO';
import { useViviendas } from '../hooks/useViviendas';
import { generateOrganizationSchema, generateSearchActionSchema, generateItemListSchema } from '../utils/structuredData';
import './Home.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function Home() {
  const navigate = useNavigate();
  const [searchFilters, setSearchFilters] = useState({
    location: '',
    type: 'all',
    operation: 'Venta' // COMPRA/ALQUILER
  });

  // Hook para obtener las viviendas más recientes
  const {
    viviendas,
    isLoading,
    isError,
    error
  } = useViviendas(
    {
      published: true,
      pageSize: 6
    },
    {
      enableCache: true,
      autoFetch: true,
      onError: (error) => {
        console.error('Error loading recent properties:', error);
      }
    }
  );

  const handleFilterChange = (field, value) => {
    setSearchFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    
    // Construir query params para el listado
    const params = new URLSearchParams();
    
    if (searchFilters.location && searchFilters.location.trim()) {
      params.append('q', searchFilters.location.trim());
    }
    
    if (searchFilters.type && searchFilters.type !== 'all') {
      params.append('tipo', searchFilters.type);
    }
    
    if (searchFilters.operation) {
      params.append('tipoAnuncio', searchFilters.operation);
    }
    
    // Navegar al listado con los filtros
    const queryString = params.toString();
    navigate(`/viviendas${queryString ? `?${queryString}` : ''}`);
  };

  const handleTabChange = (operation) => {
    setSearchFilters(prev => ({
      ...prev,
      operation: operation === 'COMPRA' ? 'Venta' : 'Alquiler'
    }));
  };

  const handleImageClick = (images) => {
    // TODO: Implementar galería de imágenes
    console.log('Opening image gallery:', images);
  };

  const handleDetailsClick = (propertyId) => {
    navigate(`/viviendas/${propertyId}`);
  };

  // Opciones para el select de tipo de vivienda
  const typeOptions = [
    { value: 'all', label: 'Tipo de vivienda' },
    { value: 'Piso', label: 'Piso' },
    { value: 'Casa', label: 'Casa' },
    { value: 'Chalet', label: 'Chalet' },
    { value: 'Ático', label: 'Ático' },
    { value: 'Dúplex', label: 'Dúplex' },
    { value: 'Loft', label: 'Loft' },
    { value: 'Villa', label: 'Villa' },
  ];

  // Datos estructurados para SEO
  const organizationSchema = generateOrganizationSchema();
  const searchActionSchema = generateSearchActionSchema();
  const itemListSchema = viviendas?.length > 0 ? generateItemListSchema(viviendas) : null;

  // Combinar esquemas
  const structuredData = itemListSchema 
    ? [organizationSchema, searchActionSchema, itemListSchema]
    : [organizationSchema, searchActionSchema];

  return (
    <div className="home">
      <SEO
        title="Inicio"
        description="Encuentra tu vivienda ideal en Igualada y alrededores. Fincas Trimar ofrece venta, compra y alquiler de pisos, casas y chalets. Propiedades actualizadas diariamente."
        keywords="inmobiliaria Igualada, venta pisos Igualada, alquiler casas Igualada, chalets venta Barcelona, comprar piso Anoia, Fincas Trimar"
        type="website"
        structuredData={structuredData}
      />
      
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              La mejor forma de encontrar tu vivienda
            </h1>
            <p className="hero-subtitle">
              Ofrecemos el servicio completo de venta, <strong>compra o alquiler de tu vivienda</strong>
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="search-container">
          <form className="search-bar" onSubmit={handleSearch}>
            <div className="search-tabs">
              <button 
                type="button" 
                className={`tab ${searchFilters.operation === 'Venta' ? 'active' : ''}`}
                onClick={() => handleTabChange('COMPRA')}
              >
                COMPRA
              </button>
              <button 
                type="button" 
                className={`tab ${searchFilters.operation === 'Alquiler' ? 'active' : ''}`}
                onClick={() => handleTabChange('ALQUILER')}
              >
                ALQUILER
              </button>
              <button 
                type="button" 
                className="tab tab-vender"
                onClick={() => navigate('/vender')}
              >
                VENDER
              </button>
            </div>
            
            <div className="search-fields">
              <div className="search-field">
                <div className="field-icon"><FontAwesomeIcon icon="fa-solid fa-location-dot" /></div>
                <LocationAutocomplete
                  value={searchFilters.location}
                  onChange={(value) => handleFilterChange('location', value)}
                  placeholder="Ubicación"
                />
              </div>
              
              <div className="search-field">
                <CustomSelect
                  value={searchFilters.type}
                  onChange={(value) => handleFilterChange('type', value)}
                  options={typeOptions}
                  placeholder="Tipo de vivienda"
                />
              </div>
              
              <button type="submit" className="search-button">
                <span><FontAwesomeIcon icon="fa-solid fa-magnifying-glass" /></span>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Recent Properties Section */}
      <section className="recent-properties">
        <div className="container">
          <div className="section-header">
            <h2>Añadidas recientemente</h2>
            <Link to="/viviendas" className="view-all-link">VER TODO</Link>
          </div>
          
          {/* Loading state */}
          {isLoading && (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Cargando viviendas...</p>
            </div>
          )}
          
          {/* Error state */}
          {isError && (
            <div className="error-state">
              <p>Error al cargar las viviendas: {error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="retry-button"
              >
                Reintentar
              </button>
            </div>
          )}
          
          {/* Properties grid */}
          {!isLoading && !isError && (
            <div className="properties-grid">
              {viviendas.length > 0 ? (
                viviendas.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    onImageClick={handleImageClick}
                    onDetailsClick={handleDetailsClick}
                  />
                ))
              ) : (
                <div className="empty-state">
                  <p>No hay viviendas disponibles en este momento.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Sell Promotion Section */}
      <section className="sell-promotion">
          <div className="promotion-content">
            <div className="promotion-text">
              <h2>Vende tu inmueble hoy mismo</h2>
              <p>Ofrecemos el mejor servicio para la venta de tu propiedad con garantías de éxito.</p>
              <Link to="/vender" className="cta-button">CONTÁCTANOS</Link>
            </div>
          </div>
      </section>
    </div>
  );
}