import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Listado.css';

export default function Listado() {
  const [filters, setFilters] = useState({
    location: '',
    type: 'all',
    minPrice: '',
    maxPrice: '',
    rooms: 'all'
  });

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Mock data para las viviendas
  const mockProperties = [
    {
      id: '1',
      name: 'Piso reformado en centro histórico de Igualada 102 m²',
      shortDescription: 'Precioso piso en una de las mejores zonas de Igualada',
      price: 240000,
      rooms: 3,
      bathRooms: 2,
      garage: 0,
      squaredMeters: 102,
      provincia: 'Barcelona',
      poblacion: 'Igualada',
      calle: 'C/ Major',
      numero: '12',
      tipoVivienda: 'Piso',
      tipoAnuncio: 'Venta',
      estado: 'BuenEstado',
      imageUrl: '/api/placeholder/300/200'
    },
    {
      id: '2',
      name: 'Chalet adosado con jardín privado 180 m²',
      shortDescription: 'Perfecto para familias, zona tranquila',
      price: 350000,
      rooms: 4,
      bathRooms: 3,
      garage: 2,
      squaredMeters: 180,
      provincia: 'Barcelona',
      poblacion: 'Sant Cugat',
      calle: 'Avda. Catalunya',
      numero: '45',
      tipoVivienda: 'Chalet',
      tipoAnuncio: 'Venta',
      estado: 'ObraNueva',
      imageUrl: '/api/placeholder/300/200'
    },
    {
      id: '3',
      name: 'Ático con terraza panorámica 120 m²',
      shortDescription: 'Vistas espectaculares al mar',
      price: 450000,
      rooms: 3,
      bathRooms: 2,
      garage: 1,
      squaredMeters: 120,
      provincia: 'Barcelona',
      poblacion: 'Sitges',
      calle: 'Passeig Marítim',
      numero: '8',
      tipoVivienda: 'Ático',
      tipoAnuncio: 'Venta',
      estado: 'BuenEstado',
      imageUrl: '/api/placeholder/300/200'
    },
    {
      id: '4',
      name: 'Casa rústica renovada 150 m²',
      shortDescription: 'Encanto tradicional con comodidades modernas',
      price: 280000,
      rooms: 4,
      bathRooms: 2,
      garage: 1,
      squaredMeters: 150,
      provincia: 'Barcelona',
      poblacion: 'Vilafranca del Penedès',
      calle: 'C/ Sant Antoni',
      numero: '23',
      tipoVivienda: 'Casa',
      tipoAnuncio: 'Venta',
      estado: 'AReformar',
      imageUrl: '/api/placeholder/300/200'
    },
    {
      id: '5',
      name: 'Loft moderno en distrito empresarial 85 m²',
      shortDescription: 'Diseño contemporáneo y funcional',
      price: 320000,
      rooms: 2,
      bathRooms: 2,
      garage: 1,
      squaredMeters: 85,
      provincia: 'Barcelona',
      poblacion: 'Barcelona',
      calle: 'C/ Diagonal',
      numero: '567',
      tipoVivienda: 'Loft',
      tipoAnuncio: 'Venta',
      estado: 'ObraNueva',
      imageUrl: '/api/placeholder/300/200'
    },
    {
      id: '6',
      name: 'Piso luminoso cerca del mar 95 m²',
      shortDescription: 'A 5 minutos caminando de la playa',
      price: 380000,
      rooms: 3,
      bathRooms: 2,
      garage: 0,
      squaredMeters: 95,
      provincia: 'Barcelona',
      poblacion: 'Castelldefels',
      calle: 'Avda. del Mar',
      numero: '156',
      tipoVivienda: 'Piso',
      tipoAnuncio: 'Venta',
      estado: 'BuenEstado',
      imageUrl: '/api/placeholder/300/200'
    }
  ];

  useEffect(() => {
    // Simular carga de datos
    setLoading(true);
    setTimeout(() => {
      setProperties(mockProperties);
      setTotalPages(Math.ceil(mockProperties.length / 6));
      setLoading(false);
    }, 500);
  }, [filters]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setCurrentPage(1);
  };

  const handleSearch = () => {
    // TODO: Implementar búsqueda real
    console.log('Searching with filters:', filters);
  };

  const resetFilters = () => {
    setFilters({
      location: '',
      type: 'all',
      minPrice: '',
      maxPrice: '',
      rooms: 'all'
    });
  };

  const getEstadoChipClass = (estado) => {
    switch (estado) {
      case 'ObraNueva': return 'chip-blue';
      case 'BuenEstado': return 'chip-green';
      case 'AReformar': return 'chip-orange';
      default: return 'chip-gray';
    }
  };

  const filteredProperties = properties.filter(property => {
    if (filters.location && !property.poblacion.toLowerCase().includes(filters.location.toLowerCase())) {
      return false;
    }
    if (filters.type !== 'all' && property.tipoVivienda.toLowerCase() !== filters.type) {
      return false;
    }
    if (filters.minPrice && property.price < parseInt(filters.minPrice)) {
      return false;
    }
    if (filters.maxPrice && property.price > parseInt(filters.maxPrice)) {
      return false;
    }
    if (filters.rooms !== 'all' && property.rooms !== parseInt(filters.rooms)) {
      return false;
    }
    return true;
  });

  return (
    <div className="listado">
      {/* Filter Bar */}
      <section className="filter-bar">
        <div className="container">
          <div className="filter-card">
            <div className="main-filters">
              <div className="filter-group">
                <div className="filter-field">
                  <div className="field-icon">📍</div>
                  <input
                    type="text"
                    placeholder="Ubicación"
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                  />
                </div>
                
                <div className="filter-field">
                  <select
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                  >
                    <option value="all">Tipo de vivienda</option>
                    <option value="piso">Piso</option>
                    <option value="casa">Casa</option>
                    <option value="chalet">Chalet</option>
                    <option value="ático">Ático</option>
                    <option value="loft">Loft</option>
                  </select>
                </div>
              </div>

              <div className="filter-actions">
                <button 
                  type="button" 
                  className="icon-button"
                  onClick={handleSearch}
                  title="Buscar"
                >
                  🔍
                </button>
                <button 
                  type="button" 
                  className="icon-button"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  title="Filtros avanzados"
                >
                  ⚙️
                </button>
                <Link to="/admin" className="icon-button" title="Añadir vivienda">
                  ➕
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
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    />
                  </div>
                  
                  <div className="filter-field">
                    <label>Precio máximo</label>
                    <input
                      type="number"
                      placeholder="999999"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    />
                  </div>
                  
                  <div className="filter-field">
                    <label>Habitaciones</label>
                    <select
                      value={filters.rooms}
                      onChange={(e) => handleFilterChange('rooms', e.target.value)}
                    >
                      <option value="all">Cualquiera</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5+</option>
                    </select>
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
              {loading ? 'Cargando...' : `${filteredProperties.length} viviendas encontradas`}
            </p>
          </div>

          {loading ? (
            <div className="loading">
              <div className="loading-spinner"></div>
              <p>Cargando viviendas...</p>
            </div>
          ) : (
            <>
              <div className="properties-grid">
                {filteredProperties.map((property) => (
                  <article key={property.id} className="property-card">
                    <Link to={`/viviendas/${property.id}`} className="property-link">
                      <div className="property-image">
                        <img src={property.imageUrl} alt={property.name} loading="lazy" />
                      </div>
                      
                      <div className="property-info">
                        <h3 className="property-title">{property.name}</h3>
                        <p className="property-description">{property.shortDescription}</p>
                        
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
                          <span className={`chip ${getEstadoChipClass(property.estado)}`}>
                            {property.estado.replace('BuenEstado', 'Buen Estado').replace('AReformar', 'A Reformar').replace('ObraNueva', 'Obra Nueva')}
                          </span>
                        </div>
                        
                        <div className="property-price">
                          <span className="price-amount">{property.price.toLocaleString('es-ES')} €</span>
                        </div>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>

              {filteredProperties.length === 0 && (
                <div className="no-results">
                  <h3>No se encontraron viviendas</h3>
                  <p>Prueba a ajustar los filtros de búsqueda.</p>
                  <button onClick={resetFilters} className="reset-button">
                    Limpiar filtros
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}