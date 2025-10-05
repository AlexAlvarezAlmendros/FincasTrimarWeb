import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './DraftsPage.css';

// Hook personalizado para datos de borradores
const useDrafts = () => {
  const [data, setData] = useState({
    drafts: [],
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
    sortBy: 'created_desc' // created_desc, created_asc, updated_desc, updated_asc
  });

  useEffect(() => {
    fetchDrafts();
  }, [filters]);

  const fetchDrafts = async () => {
    setData(prev => ({ ...prev, loading: true }));
    
    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Mock data - en producción vendría de la API
      const mockDrafts = [
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
          published: false,
          createdAt: '2024-09-30T15:30:00Z',
          updatedAt: '2024-10-01T09:15:00Z',
          completionPercentage: 85,
          missingFields: ['Imágenes', 'Descripción completa'],
          images: [
            'https://i.ibb.co/sample3.jpg'
          ]
        },
        {
          id: '5',
          name: 'Casa rural en Anoia rehabilitada',
          shortDescription: 'Perfecta para desconectar, con todos los servicios',
          price: 180000,
          rooms: 3,
          bathRooms: 2,
          garage: 0,
          squaredMeters: 140,
          provincia: 'Barcelona',
          poblacion: 'Capellades',
          tipoInmueble: 'Vivienda',
          tipoVivienda: 'Casa',
          tipoAnuncio: 'Venta',
          estadoVenta: 'Disponible',
          published: false,
          createdAt: '2024-09-27T16:20:00Z',
          updatedAt: '2024-09-29T10:30:00Z',
          completionPercentage: 60,
          missingFields: ['Imágenes', 'Descripción completa', 'Características'],
          images: [
            'https://i.ibb.co/sample7.jpg'
          ]
        },
        {
          id: '6',
          name: 'Oficina en zona comercial de Igualada',
          shortDescription: '',
          price: 120000,
          rooms: 0,
          bathRooms: 1,
          garage: 0,
          squaredMeters: 85,
          provincia: 'Barcelona',
          poblacion: 'Igualada',
          tipoInmueble: 'Oficina',
          tipoVivienda: 'Oficina',
          tipoAnuncio: 'Venta',
          estadoVenta: 'Disponible',
          published: false,
          createdAt: '2024-09-25T11:00:00Z',
          updatedAt: '2024-09-25T11:00:00Z',
          completionPercentage: 30,
          missingFields: ['Descripción breve', 'Descripción completa', 'Imágenes', 'Características'],
          images: []
        }
      ];

      // Aplicar filtros
      let filteredDrafts = mockDrafts;
      
      if (filters.search) {
        filteredDrafts = filteredDrafts.filter(draft => 
          draft.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          draft.poblacion.toLowerCase().includes(filters.search.toLowerCase())
        );
      }

      // Aplicar ordenación
      switch (filters.sortBy) {
        case 'created_desc':
          filteredDrafts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
        case 'created_asc':
          filteredDrafts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          break;
        case 'updated_desc':
          filteredDrafts.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
          break;
        case 'updated_asc':
          filteredDrafts.sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt));
          break;
        default:
          break;
      }

      setData({
        drafts: filteredDrafts,
        loading: false,
        error: null,
        pagination: {
          currentPage: 1,
          totalPages: Math.ceil(filteredDrafts.length / 10),
          totalItems: filteredDrafts.length,
          itemsPerPage: 10
        }
      });
    } catch (error) {
      setData(prev => ({
        ...prev,
        loading: false,
        error: 'Error al cargar los borradores'
      }));
    }
  };

  const publishDraft = async (draftId) => {
    try {
      // Simular llamada API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setData(prev => ({
        ...prev,
        drafts: prev.drafts.filter(draft => draft.id !== draftId)
      }));
    } catch (error) {
      console.error('Error publishing draft:', error);
    }
  };

  const deleteDraft = async (draftId) => {
    try {
      // Simular llamada API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setData(prev => ({
        ...prev,
        drafts: prev.drafts.filter(draft => draft.id !== draftId)
      }));
    } catch (error) {
      console.error('Error deleting draft:', error);
    }
  };

  const duplicateDraft = async (draftId) => {
    try {
      // Simular llamada API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const originalDraft = data.drafts.find(draft => draft.id === draftId);
      if (originalDraft) {
        const duplicatedDraft = {
          ...originalDraft,
          id: Date.now().toString(),
          name: `${originalDraft.name} (Copia)`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        setData(prev => ({
          ...prev,
          drafts: [duplicatedDraft, ...prev.drafts]
        }));
      }
    } catch (error) {
      console.error('Error duplicating draft:', error);
    }
  };

  return {
    ...data,
    filters,
    setFilters,
    publishDraft,
    deleteDraft,
    duplicateDraft,
    refetch: fetchDrafts
  };
};

// Componente de filtros
const DraftFilters = ({ filters, onFiltersChange }) => {
  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  return (
    <div className="draft-filters">
      <div className="filters-row">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Buscar borradores..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-group">
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="filter-select"
          >
            <option value="updated_desc">Actualizados recientemente</option>
            <option value="updated_asc">Actualizados hace más tiempo</option>
            <option value="created_desc">Creados recientemente</option>
            <option value="created_asc">Creados hace más tiempo</option>
          </select>
        </div>
      </div>
    </div>
  );
};

// Componente de tarjeta de borrador
const DraftCard = ({ 
  draft, 
  onPublish, 
  onDelete, 
  onDuplicate 
}) => {
  const [actionConfirm, setActionConfirm] = useState(null);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const getCompletionColor = (percentage) => {
    if (percentage >= 80) return 'high';
    if (percentage >= 50) return 'medium';
    return 'low';
  };

  const handleActionClick = (action) => {
    setActionConfirm(action);
  };

  const handleActionConfirm = () => {
    switch (actionConfirm) {
      case 'publish':
        onPublish(draft.id);
        break;
      case 'delete':
        onDelete(draft.id);
        break;
      default:
        break;
    }
    setActionConfirm(null);
  };

  const handleActionCancel = () => {
    setActionConfirm(null);
  };

  const canPublish = draft.completionPercentage >= 80;

  return (
    <div className="draft-card">
      <div className="draft-header">
        <div className="draft-image">
          {draft.images && draft.images.length > 0 ? (
            <img 
              src={draft.images[0]} 
              alt={draft.name}
              onError={(e) => {
                e.target.src = '/img/placeholder-house.jpg';
              }}
            />
          ) : (
            <div className="no-image">🏠</div>
          )}
        </div>
        
        <div className="draft-info">
          <h3 className="draft-title">{draft.name}</h3>
          {draft.shortDescription && (
            <p className="draft-description">{draft.shortDescription}</p>
          )}
          
          <div className="draft-meta">
            <span className="draft-type">{draft.tipoVivienda}</span>
            <span className="draft-location">{draft.poblacion}, {draft.provincia}</span>
            <span className="draft-price">{formatPrice(draft.price)}</span>
          </div>

          <div className="draft-specs">
            {draft.rooms > 0 && <span className="spec">🛏️ {draft.rooms}</span>}
            {draft.bathRooms > 0 && <span className="spec">🚿 {draft.bathRooms}</span>}
            {draft.garage > 0 && <span className="spec">🚗 {draft.garage}</span>}
            {draft.squaredMeters > 0 && <span className="spec">📐 {draft.squaredMeters}m²</span>}
          </div>
        </div>
      </div>

      <div className="draft-progress">
        <div className="progress-header">
          <span className="progress-label">Completado</span>
          <span className={`progress-percentage completion-${getCompletionColor(draft.completionPercentage)}`}>
            {draft.completionPercentage}%
          </span>
        </div>
        
        <div className="progress-bar">
          <div 
            className={`progress-fill completion-${getCompletionColor(draft.completionPercentage)}`}
            style={{ width: `${draft.completionPercentage}%` }}
          />
        </div>

        {draft.missingFields && draft.missingFields.length > 0 && (
          <div className="missing-fields">
            <span className="missing-label">Faltan:</span>
            <div className="missing-list">
              {draft.missingFields.map(field => (
                <span key={field} className="missing-field">{field}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="draft-dates">
        <div className="date-info">
          <span className="date-label">Creado:</span>
          <span className="date-value">{formatDate(draft.createdAt)}</span>
        </div>
        <div className="date-info">
          <span className="date-label">Actualizado:</span>
          <span className="date-value">{formatDate(draft.updatedAt)}</span>
        </div>
      </div>

      <div className="draft-actions">
        <Link 
          to={`/admin/viviendas/${draft.id}/edit`}
          className="action-btn action-btn--edit"
          title="Continuar editando"
        >
          ✏️ Editar
        </Link>
        
        <button
          onClick={() => onDuplicate(draft.id)}
          className="action-btn action-btn--duplicate"
          title="Duplicar borrador"
        >
          📋 Duplicar
        </button>

        {actionConfirm === 'publish' ? (
          <div className="action-confirm">
            <button
              onClick={handleActionConfirm}
              className="action-btn action-btn--confirm"
              disabled={!canPublish}
            >
              ✓ Confirmar
            </button>
            <button
              onClick={handleActionCancel}
              className="action-btn action-btn--cancel"
            >
              ✕ Cancelar
            </button>
          </div>
        ) : (
          <button
            onClick={() => handleActionClick('publish')}
            className={`action-btn action-btn--publish ${!canPublish ? 'disabled' : ''}`}
            disabled={!canPublish}
            title={canPublish ? 'Publicar vivienda' : 'Completar al menos 80% para publicar'}
          >
            🚀 Publicar
          </button>
        )}

        {actionConfirm === 'delete' ? (
          <div className="action-confirm">
            <button
              onClick={handleActionConfirm}
              className="action-btn action-btn--confirm-delete"
            >
              ✓ Eliminar
            </button>
            <button
              onClick={handleActionCancel}
              className="action-btn action-btn--cancel"
            >
              ✕ Cancelar
            </button>
          </div>
        ) : (
          <button
            onClick={() => handleActionClick('delete')}
            className="action-btn action-btn--delete"
            title="Eliminar borrador"
          >
            🗑️ Eliminar
          </button>
        )}
      </div>
    </div>
  );
};

// Componente principal
const DraftsPage = () => {
  const {
    drafts,
    loading,
    error,
    pagination,
    filters,
    setFilters,
    publishDraft,
    deleteDraft,
    duplicateDraft
  } = useDrafts();

  if (loading) {
    return (
      <div className="drafts-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando borradores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="drafts-page">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Borradores</h1>
          <p className="page-subtitle">
            Viviendas guardadas como borrador pendientes de completar y publicar
          </p>
        </div>
        <div className="header-actions">
          <Link to="/admin/viviendas" className="btn btn--secondary">
            📋 Ver publicadas
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
        <DraftFilters filters={filters} onFiltersChange={setFilters} />
      </div>

      <div className="content-section">
        <div className="results-header">
          <div className="results-count">
            {pagination.totalItems} {pagination.totalItems === 1 ? 'borrador' : 'borradores'}
            {filters.search && ` para "${filters.search}"`}
          </div>
          
          {pagination.totalItems > 0 && (
            <div className="completion-stats">
              <span className="stat-item">
                ✅ {drafts.filter(d => d.completionPercentage >= 80).length} listos para publicar
              </span>
              <span className="stat-item">
                ⏳ {drafts.filter(d => d.completionPercentage < 80).length} en progreso
              </span>
            </div>
          )}
        </div>

        {drafts.length === 0 ? (
          <div className="no-results">
            <div className="no-results-icon">📝</div>
            <h3>No hay borradores</h3>
            <p>
              {filters.search 
                ? 'No se encontraron borradores que coincidan con tu búsqueda.' 
                : 'Aún no tienes borradores guardados. Crea una nueva vivienda para empezar.'
              }
            </p>
            <div className="no-results-actions">
              {filters.search && (
                <button 
                  onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
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
          <div className="drafts-grid">
            {drafts.map(draft => (
              <DraftCard
                key={draft.id}
                draft={draft}
                onPublish={publishDraft}
                onDelete={deleteDraft}
                onDuplicate={duplicateDraft}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DraftsPage;