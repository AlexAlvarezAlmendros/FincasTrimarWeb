import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PropertyCard from '../components/PropertyCard/PropertyCard';
import CustomSelect from '../components/CustomSelect/CustomSelect';
import LocationAutocomplete from '../components/LocationAutocomplete/LocationAutocomplete';
import './Home.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function Home() {
  const navigate = useNavigate();
  const [searchFilters, setSearchFilters] = useState({
    location: '',
    type: 'all',
    operation: 'Venta' // COMPRA/ALQUILER
  });

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

  // Datos mock para las viviendas recientes
  const recentProperties = [
    {
      id: '1',
      name: 'Piso reformado en centro histórico',
      shortDescription: 'Precioso piso en zona premium',
      price: 240000,
      rooms: 3,
      bathrooms: 2,
      garage: 0,
      squaredMeters: 102,
      poblacion: 'Igualada',
      tipoInmueble: 'Vivienda',
      tipoVivienda: 'Piso',
      tipoAnuncio: 'Venta',
      mainImage: './img/houses.webp',
      images: ['./img/houses.webp']
    },
    {
      id: '2',
      name: 'Chalet adosado con jardín',
      shortDescription: 'Perfecto para familias',
      price: 350000,
      rooms: 4,
      bathrooms: 3,
      garage: 2,
      squaredMeters: 180,
      poblacion: 'Barcelona',
      tipoInmueble: 'Vivienda',
      tipoVivienda: 'Chalet',
      tipoAnuncio: 'Venta',
      mainImage: './img/houses.webp',
      images: ['./img/houses.webp']
    },
    {
      id: '3',
      name: 'Ático con terraza panorámica',
      shortDescription: 'Vistas espectaculares',
      price: 450000,
      rooms: 3,
      bathrooms: 2,
      garage: 1,
      squaredMeters: 120,
      poblacion: 'Sitges',
      tipoInmueble: 'Vivienda',
      tipoVivienda: 'Ático',
      tipoAnuncio: 'Venta',
      mainImage: './img/houses.webp',
      images: ['./img/houses.webp']
    },
    {
      id: '4',
      name: 'Casa rústica renovada',
      shortDescription: 'Encanto y modernidad',
      price: 280000,
      rooms: 4,
      bathrooms: 2,
      garage: 1,
      squaredMeters: 150,
      poblacion: 'Vilafranca',
      tipoInmueble: 'Vivienda',
      tipoVivienda: 'Casa',
      tipoAnuncio: 'Venta',
      mainImage: './img/houses.webp',
      images: ['./img/houses.webp']
    },
    {
      id: '5',
      name: 'Loft moderno en distrito empresarial',
      shortDescription: 'Diseño contemporáneo',
      price: 320000,
      rooms: 2,
      bathrooms: 2,
      garage: 1,
      squaredMeters: 85,
      poblacion: 'Barcelona',
      tipoInmueble: 'Vivienda',
      tipoVivienda: 'Loft',
      tipoAnuncio: 'Venta',
      mainImage: './img/houses.webp',
      images: ['./img/houses.webp']
    },
    {
      id: '6',
      name: 'Piso luminoso cerca del mar',
      shortDescription: 'A 5 minutos de la playa',
      price: 380000,
      rooms: 3,
      bathrooms: 2,
      garage: 0,
      squaredMeters: 95,
      poblacion: 'Castelldefels',
      tipoInmueble: 'Vivienda',
      tipoVivienda: 'Piso',
      tipoAnuncio: 'Venta',
      mainImage: './img/houses.webp',
      images: ['./img/houses.webp']
    }
  ];

  return (
    <div className="home">
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
          
          <div className="properties-grid">
            {recentProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onImageClick={handleImageClick}
                onDetailsClick={handleDetailsClick}
              />
            ))}
          </div>
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