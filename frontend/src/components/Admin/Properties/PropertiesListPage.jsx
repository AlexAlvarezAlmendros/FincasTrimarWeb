import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './PropertiesListPage.css';

// Hook personalizado para datos de viviendas
const useProperties = () => {
  const [data, setData] = useState({
    properties: [],
    loading: true,
    error: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      itemsPerPage: 10
    }
  });

  const [filters, setFilters] = useState({
    search: '',
    status: 'all', // all, published, draft, pending
    type: 'all', // all, vivienda, oficina, etc
    sortBy: 'created_desc' // created_desc, created_asc, price_desc, price_asc
  });

  useEffect(() => {
    fetchProperties();
  }, [filters]);

  const fetchProperties = async () => {
    setData(prev => ({ ...prev, loading: true }));
    
    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock data - en producción vendría de la API
      const mockProperties = [
        {
          id: '1',
          name: 'Piso reformado en centro de Igualada 102 m²',
          shortDescription: 'Precioso piso reformado en el centro histórico',
          price: 240000,
          rooms: 3,
          bathRooms: 2,
          garage: 0,
          squaredMeters: 102,
          provincia: 'Barcelona',
          poblacion: 'Igualada',
          tipoInmueble: 'Vivienda',
          tipoVivienda: 'Piso',
          tipoAnuncio: 'Venta',
          estadoVenta: 'Disponible',
          published: true,
          createdAt: '2024-10-01T10:00:00Z',
          updatedAt: '2024-10-01T10:00:00Z',
          views: 45,
          images: [
            'https://i.ibb.co/sample1.jpg',
            'https://i.ibb.co/sample2.jpg'
          ]
        },
        {
          id: '2',
          name: 'Chalet adosado en Sant Cugat del Vallès',
          shortDescription: 'Magnífico chalet con jardín y piscina privada',
          price: 450000,
          rooms: 4,
          bathRooms: 3,
          garage: 2,
          squaredMeters: 180,
          provincia: 'Barcelona',
          poblacion: 'Sant Cugat del Vallès',
          tipoInmueble: 'Vivienda',
          tipoVivienda: 'Chalet',
          tipoAnuncio: 'Venta',
          estadoVenta: 'Disponible',
          published: true,
          createdAt: '2024-09-30T15:30:00Z',
          updatedAt: '2024-10-01T09:15:00Z',
          views: 12,
          images: [
            'https://i.ibb.co/sample3.jpg'
          ]
        },
        {
          id: '3',
          name: 'Ático con terraza panorámica Barcelona',
          shortDescription: 'Exclusivo ático con vistas espectaculares',
          price: 580000,
          rooms: 3,
          bathRooms: 2,
          garage: 1,
          squaredMeters: 120,
          provincia: 'Barcelona',
          poblacion: 'Barcelona',
          tipoInmueble: 'Vivienda',
          tipoVivienda: 'Ático',
          tipoAnuncio: 'Venta',
          estadoVenta: 'Reservada',
          published: true,
          createdAt: '2024-09-29T09:15:00Z',
          updatedAt: '2024-09-30T14:20:00Z',
          views: 89,
          images: [
            'https://i.ibb.co/sample4.jpg',
            'https://i.ibb.co/sample5.jpg',
            'https://i.ibb.co/sample6.jpg'
          ]
        },
        {
          id: '4',
          name: 'Apartamento moderno en Sitges',
          shortDescription: 'A 200m de la playa, totalmente equipado',
          price: 320000,
          rooms: 2,
          bathrooms: 1,
          garage: 0,
          squaredMeters: 75,
          provincia: 'Barcelona',
          poblacion: 'Sitges',
          tipoInmueble: 'Vivienda',
          tipoVivienda: 'Piso',
          tipoAnuncio: 'Venta',
          estadoVenta: 'Disponible',
          published: true,
          createdAt: '2024-09-28T11:45:00Z',
          updatedAt: '2024-09-28T11:45:00Z',
          views: 67,
          images: []
        }
      ];

      // Aplicar filtros - mostrar solo propiedades publicadas
      let filteredProperties = mockProperties.filter(prop => prop.published);
      
      if (filters.search) {
        filteredProperties = filteredProperties.filter(prop => 
          prop.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          prop.poblacion.toLowerCase().includes(filters.search.toLowerCase())
        );
      }

      if (filters.status !== 'all') {
        if (filters.status === 'available') {
          filteredProperties = filteredProperties.filter(prop => prop.estadoVenta === 'Disponible');
        } else if (filters.status === 'reserved') {
          filteredProperties = filteredProperties.filter(prop => prop.estadoVenta === 'Reservada');
        } else if (filters.status === 'sold') {
          filteredProperties = filteredProperties.filter(prop => prop.estadoVenta === 'Vendida');
        }
      }

      // Aplicar ordenación
      switch (filters.sortBy) {
        case 'created_desc':
          filteredProperties.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
        case 'created_asc':
          filteredProperties.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          break;
        case 'price_desc':
          filteredProperties.sort((a, b) => b.price - a.price);
          break;
        case 'price_asc':
          filteredProperties.sort((a, b) => a.price - b.price);
          break;
        default:
          break;
      }

      setData({
        properties: filteredProperties,
        loading: false,
        error: null,
        pagination: {
          currentPage: 1,
          totalPages: Math.ceil(filteredProperties.length / 10),
          totalItems: filteredProperties.length,
          itemsPerPage: 10
        }
      });
    } catch (error) {
      setData(prev => ({
        ...prev,
        loading: false,
        error: 'Error al cargar las propiedades'
      }));
    }
  };

  const toggleReserveProperty = async (propertyId) => {
    try {
      // Simular llamada API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setData(prev => ({
        ...prev,
        properties: prev.properties.map(prop => {
          if (prop.id === propertyId) {
            const newStatus = prop.estadoVenta === 'Disponible' ? 'Reservada' : 'Disponible';
            return { ...prop, estadoVenta: newStatus };
          }
          return prop;
        })
      }));
    } catch (error) {
      console.error('Error toggling property reservation:', error);
    }
  };

  const markAsSold = async (propertyId) => {
    try {
      // Simular llamada API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setData(prev => ({
        ...prev,
        properties: prev.properties.map(prop =>
          prop.id === propertyId ? { ...prop, estadoVenta: 'Vendida' } : prop
        )
      }));
    } catch (error) {
      console.error('Error marking property as sold:', error);
    }
  };

  const unpublishProperty = async (propertyId) => {
    try {
      // Simular llamada API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setData(prev => ({
        ...prev,
        properties: prev.properties.filter(prop => prop.id !== propertyId)
      }));
    } catch (error) {
      console.error('Error unpublishing property:', error);
    }
  };

  return {
    ...data,
    filters,
    setFilters,
    toggleReserveProperty,
    markAsSold,
    unpublishProperty,
    refetch: fetchProperties
  };
};

// Componente de filtros
const PropertyFilters = ({ filters, onFiltersChange }) => {
  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  return (
    <div className="property-filters">
      <div className="filters-row">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Buscar por nombre o ciudad..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-group">
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="filter-select"
          >
            <option value="all">Todos los estados</option>
            <option value="available">Disponibles</option>
            <option value="reserved">Reservadas</option>
            <option value="sold">Vendidas</option>
          </select>
        </div>

        <div className="filter-group">
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="filter-select"
          >
            <option value="created_desc">Más recientes</option>
            <option value="created_asc">Más antiguas</option>
            <option value="price_desc">Precio mayor a menor</option>
            <option value="price_asc">Precio menor a mayor</option>
          </select>
        </div>
      </div>
    </div>
  );
};

// Componente de la tabla de propiedades
const PropertiesTable = ({ 
  properties, 
  loading, 
  onToggleReserve,
  onMarkAsSold, 
  onUnpublish 
}) => {
  const [actionConfirm, setActionConfirm] = useState(null);

  const getStatusBadge = (property) => {
    const statusConfig = {
      'Disponible': { label: 'Disponible', class: 'status-available' },
      'Reservada': { label: 'Reservada', class: 'status-reserved' },
      'Vendida': { label: 'Vendida', class: 'status-sold' }
    };

    const config = statusConfig[property.estadoVenta] || { 
      label: property.estadoVenta, 
      class: 'status-default' 
    };

    return <span className={`status-badge ${config.class}`}>{config.label}</span>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleActionClick = (propertyId, action) => {
    setActionConfirm({ propertyId, action });
  };

  const handleActionConfirm = () => {
    const { propertyId, action } = actionConfirm;
    
    switch (action) {
      case 'sold':
        onMarkAsSold(propertyId);
        break;
      case 'unpublish':
        onUnpublish(propertyId);
        break;
      default:
        break;
    }
    
    setActionConfirm(null);
  };

  const handleActionCancel = () => {
    setActionConfirm(null);
  };

  if (loading) {
    return (
      <div className="table-loading">
        <div className="loading-spinner"></div>
        <p>Cargando propiedades...</p>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="no-results">
        <div className="no-results-icon">🏠</div>
        <h3>No se encontraron propiedades publicadas</h3>
        <p>Las propiedades publicadas aparecerán aquí una vez que estén disponibles.</p>
        <div className="no-results-actions">
          <Link to="/admin/viviendas/borradores" className="btn btn--secondary">
            📝 Ver borradores
          </Link>
          <Link to="/admin/viviendas/crear" className="btn btn--primary">
            ➕ Crear nueva vivienda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="properties-table-container">
      <table className="properties-table">
        <thead>
          <tr>
            <th className="col-image">Imagen</th>
            <th className="col-name">Propiedad</th>
            <th className="col-location">Ubicación</th>
            <th className="col-price">Precio</th>
            <th className="col-specs">Especificaciones</th>
            <th className="col-status">Estado</th>
            <th className="col-stats">Estadísticas</th>
            <th className="col-actions">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {properties.map(property => (
            <tr key={property.id} className="property-row">
              <td className="col-image">
                <div className="property-image">
                  {property.images && property.images.length > 0 ? (
                    <img 
                      src={property.images[0]} 
                      alt={property.name}
                      onError={(e) => {
                        e.target.src = '/img/placeholder-house.jpg';
                      }}
                    />
                  ) : (
                    <div className="no-image">🏠</div>
                  )}
                </div>
              </td>
              <td className="col-name">
                <div className="property-info">
                  <h4 className="property-title">{property.name}</h4>
                  <p className="property-description">{property.shortDescription}</p>
                  <div className="property-meta">
                    <span className="property-type">{property.tipoVivienda}</span>
                    <span className="property-date">
                      {formatDate(property.createdAt)}
                    </span>
                  </div>
                </div>
              </td>
              <td className="col-location">
                <div className="location-info">
                  <span className="city">{property.poblacion}</span>
                  <span className="province">{property.provincia}</span>
                </div>
              </td>
              <td className="col-price">
                <div className="price-info">
                  <span className="price">{formatPrice(property.price)}</span>
                  <span className="operation">{property.tipoAnuncio}</span>
                </div>
              </td>
              <td className="col-specs">
                <div className="specs-grid">
                  <span className="spec-item">🛏️ {property.rooms}</span>
                  <span className="spec-item">🚿 {property.bathrooms}</span>
                  <span className="spec-item">🚗 {property.garage}</span>
                  <span className="spec-item">📐 {property.squaredMeters}m²</span>
                </div>
              </td>
              <td className="col-status">
                {getStatusBadge(property)}
              </td>
              <td className="col-stats">
                <div className="stats-info">
                  <span className="views">👁️ {property.views}</span>
                  <span className="updated">
                    Act: {formatDate(property.updatedAt)}
                  </span>
                </div>
              </td>
              <td className="col-actions">
                <div className="action-buttons">
                  <Link 
                    to={`/viviendas/${property.id}`}
                    target="_blank"
                    className="action-btn action-btn--view"
                    title="Ver en web"
                  >
                    👁️
                  </Link>
                  <Link 
                    to={`/admin/viviendas/${property.id}/edit`}
                    className="action-btn action-btn--edit"
                    title="Editar"
                  >
                    ✏️
                  </Link>
                  
                  {property.estadoVenta !== 'Vendida' && (
                    <button
                      onClick={() => onToggleReserve(property.id)}
                      className={`action-btn ${property.estadoVenta === 'Reservada' ? 'action-btn--unreserve' : 'action-btn--reserve'}`}
                      title={property.estadoVenta === 'Reservada' ? 'Marcar como disponible' : 'Marcar como reservada'}
                    >
                      {property.estadoVenta === 'Reservada' ? '🔓' : '🔒'}
                    </button>
                  )}

                  {property.estadoVenta !== 'Vendida' && (
                    <>
                      {actionConfirm?.propertyId === property.id && actionConfirm?.action === 'sold' ? (
                        <div className="action-confirm">
                          <button
                            onClick={handleActionConfirm}
                            className="action-btn action-btn--confirm-sold"
                            title="Confirmar venta"
                          >
                            ✓
                          </button>
                          <button
                            onClick={handleActionCancel}
                            className="action-btn action-btn--cancel"
                            title="Cancelar"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleActionClick(property.id, 'sold')}
                          className="action-btn action-btn--sold"
                          title="Marcar como vendida"
                        >
                          💰
                        </button>
                      )}
                    </>
                  )}

                  {actionConfirm?.propertyId === property.id && actionConfirm?.action === 'unpublish' ? (
                    <div className="action-confirm">
                      <button
                        onClick={handleActionConfirm}
                        className="action-btn action-btn--confirm-unpublish"
                        title="Confirmar despublicar"
                      >
                        ✓
                      </button>
                      <button
                        onClick={handleActionCancel}
                        className="action-btn action-btn--cancel"
                        title="Cancelar"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleActionClick(property.id, 'unpublish')}
                      className="action-btn action-btn--unpublish"
                      title="Despublicar"
                    >
                      📴
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Componente principal
const PropertiesListPage = () => {
  const {
    properties,
    loading,
    error,
    pagination,
    filters,
    setFilters,
    toggleReserveProperty,
    markAsSold,
    unpublishProperty
  } = useProperties();

  return (
    <div className="properties-list-page">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Viviendas Publicadas</h1>
          <p className="page-subtitle">
            Gestiona las propiedades que están actualmente en el mercado
          </p>
        </div>
        <div className="header-actions">
          <Link to="/admin/viviendas/borradores" className="btn btn--secondary">
            📝 Ver borradores
          </Link>
          <Link to="/admin/viviendas/crear" className="btn btn--primary">
            ➕ Nueva vivienda
          </Link>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <div className="filters-section">
        <PropertyFilters filters={filters} onFiltersChange={setFilters} />
      </div>

      <div className="content-section">
        <div className="results-header">
          <div className="results-count">
            {loading ? (
              <span>Cargando...</span>
            ) : (
              <span>
                {pagination.totalItems} {pagination.totalItems === 1 ? 'propiedad publicada' : 'propiedades publicadas'}
                {filters.search && ` para "${filters.search}"`}
              </span>
            )}
          </div>
        </div>

        <PropertiesTable
          properties={properties}
          loading={loading}
          onToggleReserve={toggleReserveProperty}
          onMarkAsSold={markAsSold}
          onUnpublish={unpublishProperty}
        />
      </div>
    </div>
  );
};

export default PropertiesListPage;