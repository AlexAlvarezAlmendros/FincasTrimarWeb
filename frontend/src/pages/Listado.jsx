import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PropertyCard from '../components/PropertyCard/PropertyCard';
import './Listado.css';

export default function Listado() {
  const navigate = useNavigate();
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
      bathrooms: 2,
      garage: 0,
      squaredMeters: 102,
      provincia: 'Barcelona',
      poblacion: 'Igualada',
      calle: 'C/ Major',
      numero: '12',
      tipoInmueble: 'Vivienda',
      tipoVivienda: 'Piso',
      tipoAnuncio: 'Venta',
      estado: 'BuenEstado',
      mainImage: './img/houses.webp',
      images: ['./img/houses.webp']
    },
    {
      id: '2',
      name: 'Chalet adosado con jardín privado 180 m²',
      shortDescription: 'Perfecto para familias, zona tranquila',
      price: 350000,
      rooms: 4,
      bathrooms: 3,
      garage: 2,
      squaredMeters: 180,
      provincia: 'Barcelona',
      poblacion: 'Sant Cugat',
      calle: 'Avda. Catalunya',
      numero: '45',
      tipoInmueble: 'Vivienda',
      tipoVivienda: 'Chalet',
      tipoAnuncio: 'Venta',
      estado: 'ObraNueva',
      mainImage: './img/houses.webp',
      images: ['./img/houses.webp']
    },
    {
      id: '3',
      name: 'Ático con terraza panorámica 120 m²',
      shortDescription: 'Vistas espectaculares al mar',
      price: 450000,
      rooms: 3,
      bathrooms: 2,
      garage: 1,
      squaredMeters: 120,
      provincia: 'Barcelona',
      poblacion: 'Sitges',
      calle: 'Passeig Marítim',
      numero: '8',
      tipoInmueble: 'Vivienda',
      tipoVivienda: 'Ático',
      tipoAnuncio: 'Venta',
      estado: 'BuenEstado',
      mainImage: './img/houses.webp',
      images: ['./img/houses.webp']
    },
    {
      id: '4',
      name: 'Casa rústica renovada 150 m²',
      shortDescription: 'Encanto tradicional con comodidades modernas',
      price: 280000,
      rooms: 4,
      bathrooms: 2,
      garage: 1,
      squaredMeters: 150,
      provincia: 'Barcelona',
      poblacion: 'Vilafranca del Penedès',
      calle: 'C/ Sant Antoni',
      numero: '23',
      tipoInmueble: 'Vivienda',
      tipoVivienda: 'Casa',
      tipoAnuncio: 'Venta',
      estado: 'AReformar',
      mainImage: './img/houses.webp',
      images: ['./img/houses.webp']
    },
    {
      id: '5',
      name: 'Loft moderno en distrito empresarial 85 m²',
      shortDescription: 'Diseño contemporáneo y funcional',
      price: 320000,
      rooms: 2,
      bathrooms: 2,
      garage: 1,
      squaredMeters: 85,
      provincia: 'Barcelona',
      poblacion: 'Barcelona',
      calle: 'C/ Diagonal',
      numero: '567',
      tipoInmueble: 'Vivienda',
      tipoVivienda: 'Loft',
      tipoAnuncio: 'Venta',
      estado: 'ObraNueva',
      mainImage: './img/houses.webp',
      images: ['./img/houses.webp']
    },
    {
      id: '6',
      name: 'Piso luminoso cerca del mar 95 m²',
      shortDescription: 'A 5 minutos caminando de la playa',
      price: 380000,
      rooms: 3,
      bathrooms: 2,
      garage: 0,
      squaredMeters: 95,
      provincia: 'Barcelona',
      poblacion: 'Castelldefels',
      calle: 'Avda. del Mar',
      numero: '156',
      tipoInmueble: 'Vivienda',
      tipoVivienda: 'Piso',
      tipoAnuncio: 'Venta',
      estado: 'BuenEstado',
      mainImage: './img/houses.webp',
      images: ['./img/houses.webp']
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

  const handleImageClick = (images) => {
    // TODO: Implementar galería de imágenes
    console.log('Opening image gallery:', images);
  };

  const handleDetailsClick = (propertyId) => {
    navigate(`/viviendas/${propertyId}`);
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
                  <PropertyCard
                    key={property.id}
                    property={property}
                    onImageClick={handleImageClick}
                    onDetailsClick={handleDetailsClick}
                  />
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