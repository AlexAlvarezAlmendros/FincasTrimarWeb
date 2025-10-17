import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import propertyService from '../../../services/propertyService.js';
import CaptacionEditModal from './CaptacionEditModal.jsx';
import CsvImportButton from './CsvImportButton.jsx';
import './CaptacionPage.css';

// Estados de captación válidos según el modelo de datos
const CAPTACION_STATES = {
  PENDIENTE: 'Pendiente',
  CONTACTADA: 'Contactada', 
  CAPTADA: 'Captada',
  RECHAZADA: 'Rechazada'
};

// Hook personalizado para datos de captación
const useCaptacion = () => {
  const { getAccessTokenSilently } = useAuth0();
  
  const [data, setData] = useState({
    properties: [],
    loading: true,
    error: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      itemsPerPage: 20
    },
    stats: {
      total: 0,
      pendiente: 0,
      contactada: 0,
      captada: 0,
      rechazada: 0
    }
  });

  const [filters, setFilters] = useState({
    search: '',
    estadoVenta: '', // Filtro por estado de captación
    sortBy: 'fechaCaptacion_desc', // fechaCaptacion_desc, fechaCaptacion_asc, name_asc, name_desc
    page: 1 // Página actual
  });

  // Cargar estadísticas globales (una sola vez al montar)
  useEffect(() => {
    fetchGlobalStats();
  }, []);

  // Cargar propiedades cuando cambien los filtros (página, estado, búsqueda u ordenación)
  useEffect(() => {
    fetchCaptacionProperties();
  }, [filters.page, filters.estadoVenta, filters.search, filters.sortBy]);

  const fetchGlobalStats = async () => {
    try {
      const token = await getAccessTokenSilently();
      
      // Obtener todas las viviendas en captación sin paginación (solo necesitamos contar)
      const responses = await Promise.all([
        propertyService.getCaptacionProperties({ token, estadoVenta: 'Pendiente', pageSize: 1 }),
        propertyService.getCaptacionProperties({ token, estadoVenta: 'Contactada', pageSize: 1 }),
        propertyService.getCaptacionProperties({ token, estadoVenta: 'Captada', pageSize: 1 }),
        propertyService.getCaptacionProperties({ token, estadoVenta: 'Rechazada', pageSize: 1 }),
        propertyService.getCaptacionProperties({ token, pageSize: 1 }) // Total (todos los estados)
      ]);

      const stats = {
        pendiente: responses[0].pagination?.total || 0,
        contactada: responses[1].pagination?.total || 0,
        captada: responses[2].pagination?.total || 0,
        rechazada: responses[3].pagination?.total || 0,
        total: responses[4].pagination?.total || 0
      };
      setData(prev => ({ ...prev, stats }));
    } catch (error) {
      console.error('❌ Error cargando estadísticas globales:', error);
      // No bloqueamos la UI si fallan las estadísticas
    }
  };

  const fetchCaptacionProperties = async () => {
    setData(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Obtener token de autenticación
      const token = await getAccessTokenSilently();
      
      // Llamar al servicio para obtener propiedades en estados de captación
      const response = await propertyService.getCaptacionProperties({ 
        token,
        estadoVenta: filters.estadoVenta,
        page: filters.page,
        pageSize: 20
      });
      
      if (!response.success) {
        throw new Error(response.error?.message || 'Error al cargar propiedades de captación');
      }

      const properties = response.data || [];
      
      // Aplicar filtros del frontend (búsqueda y ordenación)
      let filteredProperties = properties;
      
      if (filters.search) {
        filteredProperties = filteredProperties.filter(property => 
          (property.name || '').toLowerCase().includes(filters.search.toLowerCase()) ||
          (property.poblacion || '').toLowerCase().includes(filters.search.toLowerCase()) ||
          (property.captadoPor || '').toLowerCase().includes(filters.search.toLowerCase())
        );
      }

      // Aplicar ordenación
      switch (filters.sortBy) {
        case 'fechaCaptacion_desc':
          filteredProperties.sort((a, b) => 
            new Date(b.fechaCaptacion || b.createdAt) - new Date(a.fechaCaptacion || a.createdAt)
          );
          break;
        case 'fechaCaptacion_asc':
          filteredProperties.sort((a, b) => 
            new Date(a.fechaCaptacion || a.createdAt) - new Date(b.fechaCaptacion || b.createdAt)
          );
          break;
        case 'name_asc':
          filteredProperties.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
          break;
        case 'name_desc':
          filteredProperties.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
          break;
        default:
          break;
      }

      setData(prev => ({
        ...prev, // ✅ Preservar stats y otros datos previos
        properties: filteredProperties,
        loading: false,
        error: null,
        pagination: response.pagination || {
          currentPage: filters.page,
          totalPages: Math.ceil((response.pagination?.total || filteredProperties.length) / 20),
          totalItems: response.pagination?.total || filteredProperties.length,
          itemsPerPage: 20
        }
      }));
    } catch (error) {
      console.error('Error cargando propiedades de captación:', error);
      setData(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Error al cargar las propiedades de captación'
      }));
    }
  };

  const updateCaptacionData = async (propertyId, captacionData) => {
    try {
      const token = await getAccessTokenSilently();
      
      const response = await propertyService.updateCaptacionData(propertyId, captacionData, { token });
      
      if (!response.success) {
        throw new Error(response.error?.message || 'Error al actualizar datos de captación');
      }
      
      // Actualizar la propiedad en la lista local
      setData(prev => ({
        ...prev,
        properties: prev.properties.map(property => 
          property.id === propertyId 
            ? { ...property, ...captacionData }
            : property
        )
      }));
      
      return response.data;
    } catch (error) {
      console.error('Error updating captacion data:', error);
      throw error;
    }
  };

  const deleteProperty = async (propertyId) => {
    try {
      const response = await propertyService.deleteProperty(propertyId, getAccessTokenSilently);
      
      if (!response.success) {
        throw new Error(response.error?.message || 'Error al eliminar la propiedad');
      }
      
      // Eliminar la propiedad de la lista local
      setData(prev => ({
        ...prev,
        properties: prev.properties.filter(property => property.id !== propertyId),
        pagination: {
          ...prev.pagination,
          totalItems: prev.pagination.totalItems - 1
        }
      }));
      
      // Recargar estadísticas
      await fetchGlobalStats();
      
      return response.data;
    } catch (error) {
      console.error('Error deleting property:', error);
      throw error;
    }
  };

  // Función para cambiar filtros y resetear página
  const updateFilters = (newFilters) => {
    setFilters(prev => {
      const updated = { ...prev, ...newFilters };
      // Si cambian búsqueda o estado, resetear a página 1
      if (newFilters.search !== undefined || newFilters.estadoVenta !== undefined || newFilters.sortBy !== undefined) {
        if (newFilters.page === undefined) {
          updated.page = 1;
        }
      }
      return updated;
    });
  };

  return {
    ...data,
    filters,
    setFilters: updateFilters,
    updateCaptacionData,
    deleteProperty,
    refetch: fetchCaptacionProperties,
    refetchAll: async () => {
      await fetchGlobalStats();
      await fetchCaptacionProperties();
    },
    changePage: (newPage) => setFilters(prev => ({ ...prev, page: newPage }))
  };
};

// Componente de filtros
const CaptacionFilters = ({ filters, onFiltersChange }) => {
  const [searchInput, setSearchInput] = useState(filters.search);

  // Debounce para el campo de búsqueda
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchInput !== filters.search) {
        onFiltersChange({
          ...filters,
          search: searchInput
        });
      }
    }, 500); // Esperar 500ms después de que el usuario deje de escribir

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  // Sincronizar con el filtro externo cuando se limpie
  useEffect(() => {
    if (filters.search === '' && searchInput !== '') {
      setSearchInput('');
    }
  }, [filters.search]);

  const handleFilterChange = (key, value) => {
    if (key === 'search') {
      setSearchInput(value);
    } else {
      onFiltersChange({
        ...filters,
        [key]: value
      });
    }
  };

  return (
    <div className="captacion-filters">
      <div className="filters-row">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Buscar por nombre, ubicación o captador..."
            value={searchInput}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-group">
          <select
            value={filters.estadoVenta}
            onChange={(e) => handleFilterChange('estadoVenta', e.target.value)}
            className="filter-select"
          >
            <option value="">Todos los estados</option>
            <option value={CAPTACION_STATES.PENDIENTE}>{CAPTACION_STATES.PENDIENTE}</option>
            <option value={CAPTACION_STATES.CONTACTADA}>{CAPTACION_STATES.CONTACTADA}</option>
            <option value={CAPTACION_STATES.CAPTADA}>{CAPTACION_STATES.CAPTADA}</option>
            <option value={CAPTACION_STATES.RECHAZADA}>{CAPTACION_STATES.RECHAZADA}</option>
          </select>
        </div>
        
        <div className="filter-group">
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="filter-select"
          >
            <option value="fechaCaptacion_desc">Captación más reciente</option>
            <option value="fechaCaptacion_asc">Captación más antigua</option>
            <option value="name_asc">Nombre A-Z</option>
            <option value="name_desc">Nombre Z-A</option>
          </select>
        </div>
      </div>
    </div>
  );
};

// Componente de tarjeta de propiedad en captación
const CaptacionPropertyCard = ({ 
  property, 
  onEdit,
  onDelete
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(property.id);
    } catch (error) {
      console.error('Error al eliminar propiedad:', error);
      alert('Error al eliminar la propiedad. Por favor, intenta de nuevo.');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };
  const formatDate = (dateString) => {
    if (!dateString) return 'Sin fecha';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const getStateColor = (estado) => {
    switch (estado) {
      case CAPTACION_STATES.PENDIENTE:
        return 'pending';
      case CAPTACION_STATES.CONTACTADA:
        return 'contacted';
      case CAPTACION_STATES.CAPTADA:
        return 'captured';
      case CAPTACION_STATES.RECHAZADA:
        return 'rejected';
      default:
        return 'pending';
    }
  };

  const getCommissionDisplay = (comision, porcentaje) => {
    if (comision && porcentaje) {
      return `${comision}% (${porcentaje}%)`;
    }
    if (comision) {
      return `${comision}%`;
    }
    return 'No definida';
  };

  return (
    <div className="captacion-card">
      <div className="captacion-header">
        <div className="captacion-image">
          {property.mainImage ? (
            <img 
              src={property.mainImage} 
              alt={property.name}
              onError={(e) => {
                e.target.src = '/img/placeholder-house.jpg';
              }}
            />
          ) : (
            <div className="no-image">🏠</div>
          )}
        </div>
        
        <div className="captacion-info">
          <h3 className="captacion-title">{property.name}</h3>
          {property.shortDescription && (
            <p className="captacion-description">{property.shortDescription}</p>
          )}
          
          <div className="captacion-meta">
            <span className="captacion-type">{property.tipoVivienda}</span>
            <span className="captacion-location">{property.poblacion}, {property.provincia}</span>
            <span className="captacion-price">{formatPrice(property.price)}</span>
          </div>

          <div className="captacion-specs">
            {property.rooms > 0 && <span className="spec">🛏️ {property.rooms}</span>}
            {property.bathRooms > 0 && <span className="spec">🚿 {property.bathRooms}</span>}
            {property.garage > 0 && <span className="spec">🚗 {property.garage}</span>}
            {property.squaredMeters > 0 && <span className="spec">📐 {property.squaredMeters}m²</span>}
          </div>
        </div>
      </div>

      <div className="captacion-status">
        <div className="status-row">
          <span className="status-label">Estado:</span>
          <span className={`status-badge status-${getStateColor(property.estadoVenta)}`}>
            {property.estadoVenta || CAPTACION_STATES.PENDIENTE}
          </span>
        </div>
        
        <div className="captacion-details">
          <div className="detail-item">
            <span className="detail-label">Fecha captación:</span>
            <span className="detail-value">{formatDate(property.fechaCaptacion)}</span>
          </div>
          
          {property.captadoPor && (
            <div className="detail-item">
              <span className="detail-label">Captado por:</span>
              <span className="detail-value">{property.captadoPor}</span>
            </div>
          )}
          
          <div className="detail-item">
            <span className="detail-label">Comisión:</span>
            <span className="detail-value">
              {getCommissionDisplay(property.comisionGanada, property.porcentajeCaptacion)}
            </span>
          </div>
        </div>
      </div>

      <div className="captacion-actions">
        {property.urlReferencia ? (
          <a 
            href={property.urlReferencia}
            target="_blank"
            rel="noopener noreferrer"
            className="action-btn action-btn--view"
            title="Ver propiedad en portal externo"
          >
            👁️ Ver
          </a>
        ) : (
          <button
            disabled
            className="action-btn action-btn--view action-btn--disabled"
            title="No hay URL disponible"
          >
            👁️ Ver
          </button>
        )}
        
        <button
          onClick={() => onEdit(property)}
          className="action-btn action-btn--edit"
          title="Editar datos de captación"
        >
          ✏️ Editar
        </button>

        <Link
          to={`/admin/viviendas/${property.id}/edit`}
          className="action-btn action-btn--publish"
          title="Modificar vivienda (añadir más imágenes y completar datos)"
        >
          ✏️ Modificar
        </Link>

        <button
          onClick={handleDeleteClick}
          className="action-btn action-btn--delete"
          title="Eliminar propiedad"
          disabled={isDeleting}
        >
          {isDeleting ? '⏳' : '🗑️'} Eliminar
        </button>
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="delete-confirm-overlay" onClick={handleCancelDelete}>
          <div className="delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="delete-confirm-header">
              <span className="delete-confirm-icon">⚠️</span>
              <h3>¿Eliminar propiedad?</h3>
            </div>
            <div className="delete-confirm-content">
              <p>¿Estás seguro de que deseas eliminar esta propiedad?</p>
              <p className="delete-confirm-property-name">{property.name}</p>
              <p className="delete-confirm-warning">Esta acción no se puede deshacer.</p>
            </div>
            <div className="delete-confirm-actions">
              <button 
                onClick={handleCancelDelete}
                className="delete-confirm-btn delete-confirm-btn--cancel"
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button 
                onClick={handleConfirmDelete}
                className="delete-confirm-btn delete-confirm-btn--delete"
                disabled={isDeleting}
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente de paginación
const Pagination = ({ currentPage, totalPages, onPageChange, totalItems }) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 7;
    
    if (totalPages <= maxVisible) {
      // Mostrar todas las páginas si son pocas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Mostrar páginas con elipsis
      if (currentPage <= 3) {
        // Cerca del inicio
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Cerca del final
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        // En el medio
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      <button
        className="pagination-btn pagination-prev"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Página anterior"
      >
        ← Anterior
      </button>

      <div className="pagination-numbers">
        {getPageNumbers().map((page, index) => (
          page === '...' ? (
            <span key={`ellipsis-${index}`} className="pagination-ellipsis">
              ...
            </span>
          ) : (
            <button
              key={page}
              className={`pagination-number ${currentPage === page ? 'active' : ''}`}
              onClick={() => onPageChange(page)}
              aria-label={`Página ${page}`}
              aria-current={currentPage === page ? 'page' : undefined}
            >
              {page}
            </button>
          )
        ))}
      </div>

      <button
        className="pagination-btn pagination-next"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Página siguiente"
      >
        Siguiente →
      </button>

      <div className="pagination-info">
        Página {currentPage} de {totalPages} ({totalItems} {totalItems === 1 ? 'resultado' : 'resultados'})
      </div>
    </div>
  );
};

// Componente principal
const CaptacionPage = () => {
  const {
    properties,
    loading,
    error,
    pagination,
    stats,
    filters,
    setFilters,
    updateCaptacionData,
    deleteProperty,
    refetch,
    refetchAll,
    changePage
  } = useCaptacion();

  const [editingProperty, setEditingProperty] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEditProperty = (property) => {
    setEditingProperty(property);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingProperty(null);
    setIsModalOpen(false);
  };

  const handleSaveCaptacion = async (captacionData) => {
    try {
      await updateCaptacionData(editingProperty.id, captacionData);
      handleCloseModal();
    } catch (error) {
      console.error('Error saving captacion data:', error);
      // Aquí podrías mostrar un mensaje de error al usuario
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    try {
      await deleteProperty(propertyId);
    } catch (error) {
      console.error('Error deleting property:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="captacion-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando propiedades de captación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="captacion-page">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Captación</h1>
          <p className="page-subtitle">
            Gestión de propiedades en proceso de captación
          </p>
        </div>
        <div className="header-actions">
          <Link to="/admin/viviendas" className="btn btn--secondary">
            📋 Ver todas
          </Link>
          <CsvImportButton onImportComplete={() => {
            // Recargar las propiedades y estadísticas después de importar
            refetchAll();
          }} />
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

      {/* Estadísticas */}
      <div className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats?.total || 0}</div>
            <div className="stat-label">Total</div>
          </div>
          <div className="stat-card stat-pending">
            <div className="stat-value">{stats?.pendiente || 0}</div>
            <div className="stat-label">Pendientes</div>
          </div>
          <div className="stat-card stat-contacted">
            <div className="stat-value">{stats?.contactada || 0}</div>
            <div className="stat-label">Contactadas</div>
          </div>
          <div className="stat-card stat-captured">
            <div className="stat-value">{stats?.captada || 0}</div>
            <div className="stat-label">Captadas</div>
          </div>
          <div className="stat-card stat-rejected">
            <div className="stat-value">{stats?.rechazada || 0}</div>
            <div className="stat-label">Rechazadas</div>
          </div>
        </div>
      </div>

      <div className="filters-section">
        <CaptacionFilters filters={filters} onFiltersChange={setFilters} />
      </div>

      <div className="content-section">
        <div className="results-header">
          <div className="results-count">
            {pagination.totalItems} {pagination.totalItems === 1 ? 'propiedad' : 'propiedades'}
            {filters.search && ` para "${filters.search}"`}
            {filters.estadoVenta && ` en estado "${filters.estadoVenta}"`}
          </div>
        </div>

        {properties.length === 0 ? (
          <div className="no-results">
            <div className="no-results-icon">🎯</div>
            <h3>No hay propiedades en captación</h3>
            <p>
              {filters.search || filters.estadoVenta
                ? 'No se encontraron propiedades que coincidan con los filtros seleccionados.' 
                : 'Aún no tienes propiedades en proceso de captación.'
              }
            </p>
            <div className="no-results-actions">
              {(filters.search || filters.estadoVenta) && (
                <button 
                  onClick={() => setFilters({ search: '', estadoVenta: '', sortBy: 'fechaCaptacion_desc', page: 1 })}
                  className="btn btn--secondary"
                >
                  🔄 Limpiar filtros
                </button>
              )}
              <Link to="/admin/viviendas/crear" className="btn btn--primary">
                ➕ Crear nueva vivienda
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="captacion-grid">
              {properties.map(property => (
                <CaptacionPropertyCard
                  key={property.id}
                  property={property}
                  onEdit={handleEditProperty}
                  onDelete={handleDeleteProperty}
                />
              ))}
            </div>

            {/* Paginación */}
            <Pagination
              currentPage={filters.page}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalItems}
              onPageChange={changePage}
            />
          </>
        )}
      </div>

      {/* Modal de edición */}
      {isModalOpen && editingProperty && (
        <CaptacionEditModal
          property={editingProperty}
          onSave={handleSaveCaptacion}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default CaptacionPage;