import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

export default function Home() {
  const [searchFilters, setSearchFilters] = useState({
    location: '',
    type: 'all'
  });

  const handleFilterChange = (field, value) => {
    setSearchFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // TODO: Implementar búsqueda
    console.log('Searching with filters:', searchFilters);
  };

  // Datos mock para las viviendas recientes
  const recentProperties = [
    {
      id: '1',
      name: 'Piso reformado en centro histórico',
      shortDescription: 'Precioso piso en zona premium',
      price: 240000,
      rooms: 3,
      bathRooms: 2,
      garage: 0,
      squaredMeters: 102,
      poblacion: 'Igualada',
      tipoVivienda: 'Piso',
      tipoAnuncio: 'Venta',
      imageUrl: '/api/placeholder/300/200'
    },
    {
      id: '2',
      name: 'Chalet adosado con jardín',
      shortDescription: 'Perfecto para familias',
      price: 350000,
      rooms: 4,
      bathRooms: 3,
      garage: 2,
      squaredMeters: 180,
      poblacion: 'Barcelona',
      tipoVivienda: 'Chalet',
      tipoAnuncio: 'Venta',
      imageUrl: '/api/placeholder/300/200'
    },
    {
      id: '3',
      name: 'Ático con terraza panorámica',
      shortDescription: 'Vistas espectaculares',
      price: 450000,
      rooms: 3,
      bathRooms: 2,
      garage: 1,
      squaredMeters: 120,
      poblacion: 'Sitges',
      tipoVivienda: 'Ático',
      tipoAnuncio: 'Venta',
      imageUrl: '/api/placeholder/300/200'
    },
    {
      id: '4',
      name: 'Casa rústica renovada',
      shortDescription: 'Encanto y modernidad',
      price: 280000,
      rooms: 4,
      bathRooms: 2,
      garage: 1,
      squaredMeters: 150,
      poblacion: 'Vilafranca',
      tipoVivienda: 'Casa',
      tipoAnuncio: 'Venta',
      imageUrl: '/api/placeholder/300/200'
    },
    {
      id: '5',
      name: 'Loft moderno en distrito empresarial',
      shortDescription: 'Diseño contemporáneo',
      price: 320000,
      rooms: 2,
      bathRooms: 2,
      garage: 1,
      squaredMeters: 85,
      poblacion: 'Barcelona',
      tipoVivienda: 'Loft',
      tipoAnuncio: 'Venta',
      imageUrl: '/api/placeholder/300/200'
    },
    {
      id: '6',
      name: 'Piso luminoso cerca del mar',
      shortDescription: 'A 5 minutos de la playa',
      price: 380000,
      rooms: 3,
      bathRooms: 2,
      garage: 0,
      squaredMeters: 95,
      poblacion: 'Castelldefels',
      tipoVivienda: 'Piso',
      tipoAnuncio: 'Venta',
      imageUrl: '/api/placeholder/300/200'
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
          <div className="hero-image">
            <img src="/api/placeholder/600/400" alt="Casa moderna con fachada elegante" />
          </div>
        </div>

        {/* Search Bar */}
        <div className="search-container">
          <form className="search-bar" onSubmit={handleSearch}>
            <div className="search-tabs">
              <button type="button" className="tab active">COMPRA</button>
              <button type="button" className="tab">ALQUILER</button>
            </div>
            
            <div className="search-fields">
              <div className="search-field">
                <div className="field-icon">📍</div>
                <input
                  type="text"
                  placeholder="Ubicación"
                  value={searchFilters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                />
              </div>
              
              <div className="search-field">
                <select
                  value={searchFilters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                >
                  <option value="all">Tipo de vivienda</option>
                  <option value="piso">Piso</option>
                  <option value="casa">Casa</option>
                  <option value="chalet">Chalet</option>
                  <option value="atico">Ático</option>
                </select>
              </div>
              
              <button type="submit" className="search-button">
                <span>🔍</span>
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
              <article key={property.id} className="property-card">
                <div className="property-image">
                  <img src={property.imageUrl} alt={property.name} loading="lazy" />
                </div>
                
                <div className="property-info">
                  <h3 className="property-title">{property.name}</h3>
                  
                  <div className="property-specs">
                    <div className="spec-row">
                      <span className="spec">{property.rooms} Habitaciones</span>
                      <span className="spec">{property.garage} Garajes</span>
                    </div>
                    <div className="spec-row">
                      <span className="spec">{property.squaredMeters} m²</span>
                      <span className="spec">{property.bathRooms} Baños</span>
                    </div>
                  </div>
                  
                  <div className="property-tags">
                    <span className="chip chip-green">Vivienda</span>
                    <span className="chip chip-yellow">{property.tipoVivienda}</span>
                    <span className="chip chip-purple">{property.tipoAnuncio}</span>
                  </div>
                  
                  <div className="property-price">
                    <span className="price-amount">{property.price.toLocaleString('es-ES')} €</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Sell Promotion Section */}
      <section className="sell-promotion">
        <div className="container">
          <div className="promotion-content">
            <div className="promotion-text">
              <h2>Vende tu inmueble hoy mismo</h2>
              <p>Ofrecemos el mejor servicio para la venta de tu propiedad con garantías de éxito.</p>
              <Link to="/vender" className="cta-button">CONTÁCTANOS</Link>
            </div>
            <div className="promotion-image">
              <img src="/api/placeholder/400/300" alt="Edificio moderno para venta" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}