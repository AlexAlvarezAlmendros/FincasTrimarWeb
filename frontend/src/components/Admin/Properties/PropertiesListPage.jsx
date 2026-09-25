import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { useViviendas } from '../../../hooks/useViviendas.js';
import propertyService from '../../../services/propertyService.js';
import Pagination from '../../common/Pagination';
import './PropertiesListPage.css';

// Paginación y filtros del listado
const PAGE_SIZE_OPTIONS = [10, 25, 50];
const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_SORT = 'fechaPublicacion_desc';
const ESTADO_OPTIONS = ['Disponible', 'Reservada', 'Vendida'];
const SORT_OPTIONS = ['fechaPublicacion_desc', 'fechaPublicacion_asc', 'price_desc', 'price_asc'];
// Mismo tope que el backend (normalizePagination): más allá, página fuera de rango
const MAX_PAGE = 100000;

/**
 * Filtros del listado a partir de la query string (?page=2&q=…). La URL conserva
 * la página y los filtros al recargar y al volver desde la edición de una vivienda.
 * Lo que no es válido cae en los valores por defecto.
 */
export const filtersFromSearch = (search) => {
  const params = new URLSearchParams(search);
  const page = Number.parseInt(params.get('page'), 10);
  const pageSize = Number.parseInt(params.get('pageSize'), 10);
  const drafts = params.get('published') === 'false';
  const estadoVenta = params.get('estadoVenta');
  const sortBy = params.get('sortBy');

  return {
    q: params.get('q') || '',
    published: !drafts,
    includeDrafts: drafts,
    estadoVenta: ESTADO_OPTIONS.includes(estadoVenta) ? estadoVenta : '',
    sortBy: SORT_OPTIONS.includes(sortBy) ? sortBy : DEFAULT_SORT,
    page: Number.isFinite(page) && page >= 1 ? Math.min(page, MAX_PAGE) : 1,
    pageSize: PAGE_SIZE_OPTIONS.includes(pageSize) ? pageSize : DEFAULT_PAGE_SIZE
  };
};

/** Query string de los filtros (solo lo que difiere de los valores por defecto). */
export const searchFromFilters = (filters) => {
  const params = new URLSearchParams();
  if (filters.q) params.set('q', filters.q);
  if (filters.published === false) params.set('published', 'false');
  if (filters.estadoVenta) params.set('estadoVenta', filters.estadoVenta);
  if (filters.sortBy && filters.sortBy !== DEFAULT_SORT) params.set('sortBy', filters.sortBy);
  if (filters.page > 1) params.set('page', String(filters.page));
  if (filters.pageSize && filters.pageSize !== DEFAULT_PAGE_SIZE) params.set('pageSize', String(filters.pageSize));
  const query = params.toString();
  return query ? `?${query}` : '';
};

// Componente de filtros
const PropertyFilters = ({ filters, onFiltersChange }) => {
  const handleFilterChange = (key, value) => {
    onFiltersChange({
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
            value={filters.q || ''}
            onChange={(e) => handleFilterChange('q', e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-group">
          <select
            value={filters.published === false ? 'false' : 'true'}
            onChange={(e) => onFiltersChange({
              published: e.target.value === 'true',
              includeDrafts: e.target.value === 'false'
            })}
            className="filter-select"
          >
            <option value="true">Publicadas</option>
            <option value="false">Borradores</option>
          </select>
        </div>

        <div className="filter-group">
          <select
            value={filters.estadoVenta || ''}
            onChange={(e) => handleFilterChange('estadoVenta', e.target.value)}
            className="filter-select"
          >
            <option value="">Todos los estados</option>
            <option value="Disponible">Disponibles</option>
            <option value="Reservada">Reservadas</option>
            <option value="Vendida">Vendidas</option>
          </select>
        </div>

        <div className="filter-group">
          <select
            value={filters.sortBy || DEFAULT_SORT}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="filter-select"
          >
            <option value="fechaPublicacion_desc">Más recientes</option>
            <option value="fechaPublicacion_asc">Más antiguas</option>
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
  onPublish,
  onUnpublish,
  onDelete
}) => {
  const [actionConfirm, setActionConfirm] = useState(null);
  const location = useLocation();

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

    return (
      <div className="status-cell">
        <span className={`status-badge ${config.class}`}>{config.label}</span>
        {property.published === false && (
          <span className="status-badge status-draft">Borrador</span>
        )}
      </div>
    );
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
      case 'publish':
        onPublish(propertyId);
        break;
      case 'delete':
        onDelete(propertyId);
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
        <h3>No se encontraron viviendas</h3>
        <p>Ajusta los filtros o crea una nueva vivienda para empezar.</p>
        <div className="no-results-actions">
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
            <th className="col-status">Estado</th>
            <th className="col-actions">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {properties.map(property => (
            <tr key={property.id} className="property-row">
              <td className="col-image">
                <div className="property-image">
                  {property.mainImage ? (
                    <img 
                      src={property.mainImage} 
                      alt={property.name}
                      onError={(e) => {
                        e.target.src = '/img/placeholder-house.jpg';
                      }}
                    />
                  ) : property.imagenes && property.imagenes.length > 0 ? (
                    <img 
                      src={property.imagenes[0].url || property.imagenes[0]} 
                      alt={property.name}
                      onError={(e) => {
                        e.target.src = '/img/placeholder-house.jpg';
                      }}
                    />
                  ) : property.images && property.images.length > 0 ? (
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
                  <div className="property-meta">
                    <span className="property-type">{property.tipoVivienda}</span>
                    <span className="property-date">
                      {formatDate(property.fechaPublicacion || property.createdAt)}
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
              <td className="col-status">
                {getStatusBadge(property)}
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
                    state={{ listSearch: location.search }}
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

                  {property.published === false ? (
                    <button
                      onClick={() => onPublish(property.id)}
                      className="action-btn action-btn--publish"
                      title="Publicar"
                    >
                      📢
                    </button>
                  ) : actionConfirm?.propertyId === property.id && actionConfirm?.action === 'unpublish' ? (
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

                  {actionConfirm?.propertyId === property.id && actionConfirm?.action === 'delete' ? (
                    <div className="action-confirm">
                      <button
                        onClick={handleActionConfirm}
                        className="action-btn action-btn--confirm-delete"
                        title="Confirmar eliminación"
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
                      onClick={() => handleActionClick(property.id, 'delete')}
                      className="action-btn action-btn--delete"
                      title="Eliminar vivienda"
                    >
                      🗑️
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
  const { getAccessTokenSilently } = useAuth0();
  const location = useLocation();
  const navigate = useNavigate();

  // Filtros iniciales desde la URL (solo en el primer render; luego manda el hook)
  const [initialFilters] = useState(() => filtersFromSearch(location.search));
  const listTopRef = useRef(null);

  // Usar el hook real para obtener datos de la BBDD
  const {
    viviendas: properties,
    isLoading: loading,
    error,
    pagination,
    filters,
    updateFilters,
    goToPage,
    refreshViviendas
  } = useViviendas(
    initialFilters,
    {
      enableCache: false, // Deshabilitamos cache para el admin para tener datos frescos
      autoFetch: true,
      getAccessToken: getAccessTokenSilently, // cupo del rate limit por usuario, no por IP
      onError: (error) => {
        console.error('Error loading properties in admin:', error);
      },
      onSuccess: (data) => {
        console.log('Properties loaded in admin:', data.viviendas?.length || 0);
      }
    }
  );

  // Funciones para las acciones de la tabla
  const toggleReserveProperty = useCallback(async (propertyId) => {
    try {
      const property = properties.find(p => p.id === propertyId);
      if (!property) return;

      const newStatus = property.estadoVenta === 'Disponible' ? 'Reservada' : 'Disponible';
      
      await propertyService.updateProperty(propertyId, {
        estadoVenta: newStatus
      }, getAccessTokenSilently);

      // Refrescar la lista después del cambio
      refreshViviendas();
    } catch (error) {
      console.error('Error toggling property reservation:', error);
    }
  }, [properties, refreshViviendas, getAccessTokenSilently]);

  const markAsSold = useCallback(async (propertyId) => {
    try {
      await propertyService.updateProperty(propertyId, {
        estadoVenta: 'Vendida'
      }, getAccessTokenSilently);

      // Refrescar la lista después del cambio
      refreshViviendas();
    } catch (error) {
      console.error('Error marking property as sold:', error);
    }
  }, [refreshViviendas, getAccessTokenSilently]);

  const unpublishProperty = useCallback(async (propertyId) => {
    try {
      await propertyService.updateProperty(propertyId, {
        published: false
      }, getAccessTokenSilently);

      // Refrescar la lista después del cambio
      refreshViviendas();
    } catch (error) {
      console.error('Error unpublishing property:', error);
    }
  }, [refreshViviendas, getAccessTokenSilently]);

  const publishProperty = useCallback(async (propertyId) => {
    try {
      await propertyService.updateProperty(propertyId, {
        published: true
      }, getAccessTokenSilently);

      // Refrescar la lista después del cambio
      refreshViviendas();
    } catch (error) {
      console.error('Error publishing property:', error);
    }
  }, [refreshViviendas, getAccessTokenSilently]);

  const deleteProperty = useCallback(async (propertyId) => {
    try {
      console.log('🗑️ Eliminando vivienda:', propertyId);
      
      await propertyService.deleteProperty(propertyId, getAccessTokenSilently);
      
      console.log('✅ Vivienda eliminada correctamente');
      
      // Refrescar la lista después del cambio
      refreshViviendas();
    } catch (error) {
      console.error('❌ Error deleting property:', error);
      alert('Error al eliminar la vivienda: ' + error.message);
    }
  }, [refreshViviendas, getAccessTokenSilently]);

  // Función para manejar cambios en filtros: debounce solo al teclear en el
  // buscador; los selects cargan en el acto (la cabecera no mezcla el filtro
  // nuevo con el total anterior durante medio segundo)
  const handleFiltersChange = useCallback((newFilters) => {
    updateFilters(newFilters, { debounce: 'q' in newFilters, resetPagination: true });
  }, [updateFilters]);

  // Filtros → URL (replace: cambiar de página no llena el historial)
  const lastSearchRef = useRef(location.search);
  useEffect(() => {
    const next = searchFromFilters(filters);
    if (next !== lastSearchRef.current) {
      lastSearchRef.current = next;
      navigate({ search: next }, { replace: true });
    }
  }, [filters, navigate]);

  // URL → filtros cuando cambia desde fuera (enlace «Todas las viviendas» del
  // menú estando en otra página, atrás/adelante del navegador)
  useEffect(() => {
    if (location.search === lastSearchRef.current) return;
    const fromUrl = filtersFromSearch(location.search);
    // La misma consulta escrita de otra forma (al entrar con ?page=1&pageSize=10,
    // mientras el efecto anterior la reescribe a su forma canónica) no es un cambio
    if (searchFromFilters(fromUrl) === searchFromFilters(filters)) return;
    lastSearchRef.current = location.search;
    updateFilters(fromUrl, { resetPagination: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  // Página fuera de rango (se borró la última vivienda de la última página, o
  // ?page=99 en la URL): ir a la última página con resultados. Una sola vez por
  // respuesta: si la petición de corrección falla, `pagination` no cambia y no
  // se reintenta en bucle
  const correctedPaginationRef = useRef(null);
  useEffect(() => {
    const lastPage = Math.max(1, pagination.totalPages || 0);
    if (loading || properties.length > 0 || pagination.page <= lastPage) return;
    if (correctedPaginationRef.current === pagination) return;
    correctedPaginationRef.current = pagination;
    goToPage(lastPage);
  }, [loading, properties.length, pagination, goToPage]);

  // Al cambiar de página se sube al inicio del listado cuando ya han llegado las
  // filas: mientras carga, la tabla se sustituye por el spinner y el documento
  // encoge, así que un scroll inmediato se quedaba a medio camino
  const pendingScrollRef = useRef(false);
  useEffect(() => {
    if (loading || !pendingScrollRef.current) return;
    pendingScrollRef.current = false;
    listTopRef.current?.scrollIntoView({ block: 'start' });
  }, [loading]);

  const handlePageChange = useCallback((page) => {
    pendingScrollRef.current = true;
    goToPage(page);
  }, [goToPage]);

  const handlePageSizeChange = useCallback((pageSize) => {
    updateFilters({ pageSize }, { resetPagination: true });
  }, [updateFilters]);

  return (
    <div className="properties-list-page">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Viviendas</h1>
          <p className="page-subtitle">
            Gestiona tus propiedades: publicadas y borradores
          </p>
        </div>
        <div className="header-actions">
          <Link to="/admin/viviendas/crear" className="btn btn--primary">
            ➕ Nueva vivienda
          </Link>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <span>{typeof error === 'string' ? error : 'Error al cargar las propiedades'}</span>
        </div>
      )}

      <div className="filters-section">
        <PropertyFilters filters={filters} onFiltersChange={handleFiltersChange} />
      </div>

      <div className="content-section">
        <div className="results-header" ref={listTopRef}>
          <div className="results-count">
            {loading ? (
              <span>Cargando...</span>
            ) : (
              <span>
                {pagination.total || 0} {pagination.total === 1 ? 'vivienda' : 'viviendas'}
                {filters.published === false ? ' en borrador' : ' publicadas'}
                {filters.q && ` para "${filters.q}"`}
              </span>
            )}
          </div>
        </div>

        <PropertiesTable
          properties={properties}
          loading={loading}
          onToggleReserve={toggleReserveProperty}
          onMarkAsSold={markAsSold}
          onPublish={publishProperty}
          onUnpublish={unpublishProperty}
          onDelete={deleteProperty}
        />

        <Pagination
          // Mientras carga, lo pedido (el selector no vuelve al tamaño anterior);
          // después, lo que describe las filas mostradas
          page={(loading ? filters.page : pagination.page) || filters.page || 1}
          pageSize={(loading ? filters.pageSize : pagination.pageSize) || filters.pageSize || DEFAULT_PAGE_SIZE}
          total={pagination.total || 0}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          itemLabel="viviendas"
          disabled={loading}
          className="properties-pagination"
        />
      </div>
    </div>
  );
};

export default PropertiesListPage;