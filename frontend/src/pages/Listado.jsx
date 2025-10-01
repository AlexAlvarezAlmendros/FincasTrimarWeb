import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PropertyCard from '../components/PropertyCard/PropertyCard';
import LocationAutocomplete from '../components/LocationAutocomplete/LocationAutocomplete';
import CustomSelect from '../components/CustomSelect/CustomSelect';
import './Listado.css';

export default function Listado() {
  const navigate = useNavigate();
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

  // Opciones para los selectores personalizados
  const typeOptions = [
    { value: 'all', label: 'Tipo de vivienda' },
    { value: 'piso', label: 'Piso' },
    { value: 'casa', label: 'Casa' },
    { value: 'chalet', label: 'Chalet' },
    { value: 'ático', label: 'Ático' },
    { value: 'loft', label: 'Loft' }
  ];

  const roomOptions = [
    { value: 'all', label: 'Cualquiera' },
    { value: '1', label: '1 habitación' },
    { value: '2', label: '2 habitaciones' },
    { value: '3', label: '3 habitaciones' },
    { value: '4', label: '4 habitaciones' },
    { value: '5', label: '5+ habitaciones' }
  ];

  const bathroomOptions = [
    { value: 'all', label: 'Cualquiera' },
    { value: '1', label: '1 baño' },
    { value: '2', label: '2 baños' },
    { value: '3', label: '3 baños' },
    { value: '4', label: '4+ baños' }
  ];

  const garageOptions = [
    { value: 'all', label: 'Cualquiera' },
    { value: '0', label: 'Sin garaje' },
    { value: '1', label: '1 plaza' },
    { value: '2', label: '2 plazas' },
    { value: '3', label: '3+ plazas' }
  ];

  const estadoOptions = [
    { value: 'all', label: 'Cualquier estado' },
    { value: 'ObraNueva', label: 'Obra nueva' },
    { value: 'BuenEstado', label: 'Buen estado' },
    { value: 'AReformar', label: 'A reformar' }
  ];

  const tipoAnuncioOptions = [
    { value: 'all', label: 'Venta y Alquiler' },
    { value: 'venta', label: 'Venta' },
    { value: 'alquiler', label: 'Alquiler' }
  ];

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
    },
    {
      id: '7',
      name: 'Casa de alquiler con piscina 200 m²',
      shortDescription: 'Perfecta para vacaciones familiares',
      price: 1200,
      rooms: 5,
      bathrooms: 3,
      garage: 2,
      squaredMeters: 200,
      provincia: 'Barcelona',
      poblacion: 'Calafell',
      calle: 'C/ del Mar',
      numero: '78',
      tipoInmueble: 'Vivienda',
      tipoVivienda: 'Casa',
      tipoAnuncio: 'Alquiler',
      estado: 'BuenEstado',
      mainImage: './img/houses.webp',
      images: ['./img/houses.webp']
    },
    {
      id: '8',
      name: 'Estudio céntrico para reformar 45 m²',
      shortDescription: 'Gran potencial de inversión',
      price: 90000,
      rooms: 1,
      bathrooms: 1,
      garage: 0,
      squaredMeters: 45,
      provincia: 'Barcelona',
      poblacion: 'Mataró',
      calle: 'C/ Real',
      numero: '34',
      tipoInmueble: 'Vivienda',
      tipoVivienda: 'Piso',
      tipoAnuncio: 'Venta',
      estado: 'AReformar',
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
    // Simulamos una búsqueda aplicando los filtros
    setLoading(true);
    setTimeout(() => {
      // En una implementación real, aquí se haría la llamada a la API
      console.log('Searching with filters:', filters);
      setLoading(false);
    }, 300);
  };

  const resetFilters = () => {
    setFilters({
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
    if (filters.location) {
      const locationFilter = filters.location.toLowerCase();
      const poblacion = property.poblacion.toLowerCase();
      const provincia = property.provincia.toLowerCase();
      const calle = property.calle.toLowerCase();
      
      // Buscar en población, provincia y calle
      if (!poblacion.includes(locationFilter) && 
          !provincia.includes(locationFilter) && 
          !calle.includes(locationFilter)) {
        return false;
      }
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
    if (filters.rooms !== 'all') {
      const roomFilter = parseInt(filters.rooms);
      if (roomFilter === 5 && property.rooms < 5) return false;
      if (roomFilter !== 5 && property.rooms !== roomFilter) return false;
    }
    if (filters.bathrooms !== 'all') {
      const bathroomFilter = parseInt(filters.bathrooms);
      if (bathroomFilter === 4 && property.bathrooms < 4) return false;
      if (bathroomFilter !== 4 && property.bathrooms !== bathroomFilter) return false;
    }
    if (filters.garage !== 'all') {
      const garageFilter = parseInt(filters.garage);
      if (garageFilter === 3 && property.garage < 3) return false;
      if (garageFilter !== 3 && property.garage !== garageFilter) return false;
    }
    if (filters.minSquareMeters && property.squaredMeters < parseInt(filters.minSquareMeters)) {
      return false;
    }
    if (filters.maxSquareMeters && property.squaredMeters > parseInt(filters.maxSquareMeters)) {
      return false;
    }
    if (filters.estado !== 'all' && property.estado !== filters.estado) {
      return false;
    }
    if (filters.tipoAnuncio !== 'all') {
      const propertyType = property.tipoAnuncio.toLowerCase();
      const filterType = filters.tipoAnuncio.toLowerCase();
      if (propertyType !== filterType) return false;
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
                  <LocationAutocomplete
                    value={filters.location}
                    onChange={(value) => handleFilterChange('location', value)}
                    placeholder="Ubicación"
                  />
                </div>
                
                <div className="filter-field">
                  <CustomSelect
                    value={filters.type}
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
                    <CustomSelect
                      value={filters.rooms}
                      onChange={(value) => handleFilterChange('rooms', value)}
                      options={roomOptions}
                      placeholder="Habitaciones"
                    />
                  </div>

                  <div className="filter-field">
                    <label>Baños</label>
                    <CustomSelect
                      value={filters.bathrooms}
                      onChange={(value) => handleFilterChange('bathrooms', value)}
                      options={bathroomOptions}
                      placeholder="Baños"
                    />
                  </div>

                  <div className="filter-field">
                    <label>Garaje</label>
                    <CustomSelect
                      value={filters.garage}
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
                      value={filters.minSquareMeters}
                      onChange={(e) => handleFilterChange('minSquareMeters', e.target.value)}
                    />
                  </div>

                  <div className="filter-field">
                    <label>Metros máximos</label>
                    <input
                      type="number"
                      placeholder="999"
                      value={filters.maxSquareMeters}
                      onChange={(e) => handleFilterChange('maxSquareMeters', e.target.value)}
                    />
                  </div>

                  <div className="filter-field">
                    <label>Estado</label>
                    <CustomSelect
                      value={filters.estado}
                      onChange={(value) => handleFilterChange('estado', value)}
                      options={estadoOptions}
                      placeholder="Estado"
                    />
                  </div>

                  <div className="filter-field">
                    <label>Tipo de operación</label>
                    <CustomSelect
                      value={filters.tipoAnuncio}
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
              {loading ? 'Cargando...' : (
                filteredProperties.length === properties.length 
                  ? `${filteredProperties.length} viviendas disponibles`
                  : `${filteredProperties.length} de ${properties.length} viviendas (filtradas)`
              )}
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