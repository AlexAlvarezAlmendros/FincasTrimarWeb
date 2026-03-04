import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import propertyService from '../../../services/propertyService.js';
import CaptacionEditModal from './CaptacionEditModal.jsx';
import CaptacionPropertyCard from './CaptacionPropertyCard.jsx';
import JsonImportButton from './JsonImportButton.jsx';
import useAgents from '../../../hooks/useAgents.js';
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
    agente: '', // Filtro por agente captador
    sortBy: 'fechaCaptacion_desc', // fechaCaptacion_desc, fechaCaptacion_asc, name_asc, name_desc, price_desc, price_asc
    page: 1 // Página actual
  });

  // Cargar estadísticas globales (una sola vez al montar)
  useEffect(() => {
    fetchGlobalStats();
  }, []);

  // Cargar propiedades cuando cambien los filtros (página, estado, búsqueda, agente u ordenación)
  useEffect(() => {
    fetchCaptacionProperties();
  }, [filters.page, filters.estadoVenta, filters.agente, filters.search, filters.sortBy]);

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
      
      // Preparar parámetros de búsqueda
      const searchParams = {
        token,
        estadoVenta: filters.estadoVenta,
        q: filters.search, // Búsqueda por texto
        sortBy: filters.sortBy, // Ordenación
        page: filters.page,
        pageSize: 20
      };

      // Manejar el filtro de agente:
      // - Si es "NoAsignado", enviamos un valor especial o flag
      // - Si es un agente específico, enviamos el nombre
      // - Si está vacío, no enviamos el parámetro (todos los agentes)
      if (filters.agente === 'NoAsignado') {
        searchParams.sinCaptador = true; // Flag especial para el backend
      } else if (filters.agente) {
        searchParams.captadoPor = filters.agente;
      }
      
      // Llamar al servicio para obtener propiedades en estados de captación
      const response = await propertyService.getCaptacionProperties(searchParams);
      
      if (!response.success) {
        throw new Error(response.error?.message || 'Error al cargar propiedades de captación');
      }

      const properties = response.data || [];

      setData(prev => ({
        ...prev, // ✅ Preservar stats y otros datos previos
        properties: properties,
        loading: false,
        error: null,
        pagination: response.pagination || {
          currentPage: filters.page,
          totalPages: Math.ceil((response.pagination?.total || properties.length) / 20),
          totalItems: response.pagination?.total || properties.length,
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
      // Si cambian búsqueda, estado, agente u ordenación, resetear a página 1
      if (newFilters.search !== undefined || 
          newFilters.estadoVenta !== undefined || 
          newFilters.agente !== undefined || 
          newFilters.sortBy !== undefined) {
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
const CaptacionFilters = ({ filters, onFiltersChange, agentes = [] }) => {
  const [searchInput, setSearchInput] = useState(filters.search);

  // Sincronizar con el filtro externo cuando se limpie
  useEffect(() => {
    if (filters.search === '' && searchInput !== '') {
      setSearchInput('');
    }
  }, [filters.search]);

  const handleFilterChange = (key, value) => {
    if (key === 'search') {
      // Solo actualizar el estado local del input, no ejecutar búsqueda aún
      setSearchInput(value);
    } else {
      // Para otros filtros, aplicar inmediatamente
      onFiltersChange({
        ...filters,
        [key]: value
      });
    }
  };

  // Ejecutar búsqueda al presionar Enter
  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      // Ahora sí, ejecutar la búsqueda llamando a onFiltersChange
      onFiltersChange({
        ...filters,
        search: searchInput,
        page: 1 // Resetear a página 1 cuando se hace una búsqueda
      });
    }
  };

  return (
    <div className="captacion-filters">
      <div className="filters-row">
        <div className="filter-group filter-group--search">
          <label htmlFor="search-input" className="filter-label">Buscar</label>
          <input
            id="search-input"
            type="text"
            placeholder="Buscar por nombre, ubicación... (Enter para buscar)"
            value={searchInput}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            onKeyPress={handleSearchKeyPress}
            className="search-input"
          />
        </div>
        
        <div className="filter-group">
          <label htmlFor="agente-select" className="filter-label">Agente</label>
          <select
            id="agente-select"
            value={filters.agente}
            onChange={(e) => handleFilterChange('agente', e.target.value)}
            className="filter-select"
          >
            <option value="">Todos</option>
            <option value="NoAsignado">No Asignado</option>
            {agentes.map(a => (
              <option key={a.id} value={a.nombre}>{a.nombre}</option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <label htmlFor="estado-select" className="filter-label">Estado</label>
          <select
            id="estado-select"
            value={filters.estadoVenta}
            onChange={(e) => handleFilterChange('estadoVenta', e.target.value)}
            className="filter-select"
          >
            <option value="">Todos</option>
            <option value={CAPTACION_STATES.PENDIENTE}>{CAPTACION_STATES.PENDIENTE}</option>
            <option value={CAPTACION_STATES.CONTACTADA}>{CAPTACION_STATES.CONTACTADA}</option>
            <option value={CAPTACION_STATES.CAPTADA}>{CAPTACION_STATES.CAPTADA}</option>
            <option value={CAPTACION_STATES.RECHAZADA}>{CAPTACION_STATES.RECHAZADA}</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label htmlFor="sort-select" className="filter-label">Ordenar</label>
          <select
            id="sort-select"
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="filter-select"
          >
            <option value="fechaCaptacion_desc">📅 Reciente</option>
            <option value="fechaCaptacion_asc">📅 Antigua</option>
            <option value="name_asc">🔤 A-Z</option>
            <option value="name_desc">🔤 Z-A</option>
            <option value="price_desc">💰 Mayor</option>
            <option value="price_asc">💰 Menor</option>
          </select>
        </div>
      </div>
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

  const { agentes } = useAgents(true); // Solo agentes activos

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
          <JsonImportButton onImportComplete={() => {
            // Recargar las propiedades y estadísticas después de importar
            refetchAll();
          }} />
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
        <CaptacionFilters filters={filters} onFiltersChange={setFilters} agentes={agentes} />
      </div>

      <div className="content-section">
        <div className="results-header">
          <div className="results-count">
            {pagination.totalItems} {pagination.totalItems === 1 ? 'propiedad' : 'propiedades'}
            {filters.search && ` para "${filters.search}"`}
            {filters.estadoVenta && ` en estado "${filters.estadoVenta}"`}
            {filters.agente && filters.agente === 'NoAsignado' && ` sin captador asignado`}
            {filters.agente && filters.agente !== 'NoAsignado' && ` captadas por ${filters.agente}`}
          </div>
          {(filters.search || filters.estadoVenta || filters.agente) && (
            <div className="active-filters-badge">
              {[filters.search, filters.estadoVenta, filters.agente].filter(Boolean).length} {[filters.search, filters.estadoVenta, filters.agente].filter(Boolean).length === 1 ? 'filtro activo' : 'filtros activos'}
            </div>
          )}
        </div>

        {properties.length === 0 ? (
          <div className="no-results">
            <div className="no-results-icon">🎯</div>
            <h3>No hay propiedades en captación</h3>
            <p>
              {filters.search || filters.estadoVenta || filters.agente
                ? 'No se encontraron propiedades que coincidan con los filtros seleccionados.' 
                : 'Aún no tienes propiedades en proceso de captación.'
              }
            </p>
            <div className="no-results-actions">
              {(filters.search || filters.estadoVenta || filters.agente) && (
                <button 
                  onClick={() => setFilters({ search: '', estadoVenta: '', agente: '', sortBy: 'fechaCaptacion_desc', page: 1 })}
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