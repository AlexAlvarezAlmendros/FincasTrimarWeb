import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useMessages } from '../../../hooks/useMessages.js';
import messageService from '../../../services/messageService.js';
import './MessagesPage.css';

// Componente de filtros
const MessageFilters = ({ filters, onFiltersChange, stats }) => {
  const handleFilterChange = (key, value) => {
    onFiltersChange({
      [key]: value
    });
  };

  return (
    <div className="message-filters">
      <div className="filters-row">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Buscar por nombre, email o mensaje..."
            value={filters.q || ''}
            onChange={(e) => handleFilterChange('q', e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-group">
          <select
            value={filters.estado || ''}
            onChange={(e) => handleFilterChange('estado', e.target.value)}
            className="filter-select"
          >
            <option value="">Todos los estados</option>
            <option value="Nuevo">
              Nuevos {stats?.nuevo ? `(${stats.nuevo})` : ''}
            </option>
            <option value="EnCurso">
              En curso {stats?.enCurso ? `(${stats.enCurso})` : ''}
            </option>
            <option value="Cerrado">
              Cerrados {stats?.cerrado ? `(${stats.cerrado})` : ''}
            </option>
          </select>
        </div>

        <div className="filter-group">
          <select
            value={filters.pinned === null ? '' : filters.pinned.toString()}
            onChange={(e) => {
              const value = e.target.value;
              handleFilterChange('pinned', value === '' ? null : value === 'true');
            }}
            className="filter-select"
          >
            <option value="">Todos</option>
            <option value="true">Solo fijados</option>
            <option value="false">No fijados</option>
          </select>
        </div>

        <div className="filter-group">
          <select
            value={filters.sortBy || 'fecha_desc'}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="filter-select"
          >
            <option value="fecha_desc">Más recientes</option>
            <option value="fecha_asc">Más antiguos</option>
            <option value="estado_asc">Por estado</option>
          </select>
        </div>
      </div>
    </div>
  );
};

// Componente de estadísticas rápidas
const MessageStats = ({ stats }) => {
  return (
    <div className="message-stats">
      <div className="stat-card stat-card--new">
        <div className="stat-icon">🆕</div>
        <div className="stat-content">
          <div className="stat-number">{stats?.nuevo || 0}</div>
          <div className="stat-label">Nuevos</div>
        </div>
      </div>
      
      <div className="stat-card stat-card--progress">
        <div className="stat-icon">⏳</div>
        <div className="stat-content">
          <div className="stat-number">{stats?.enCurso || 0}</div>
          <div className="stat-label">En curso</div>
        </div>
      </div>
      
      <div className="stat-card stat-card--closed">
        <div className="stat-icon">✅</div>
        <div className="stat-content">
          <div className="stat-number">{stats?.cerrado || 0}</div>
          <div className="stat-label">Cerrados</div>
        </div>
      </div>
      
      <div className="stat-card stat-card--pinned">
        <div className="stat-icon">📌</div>
        <div className="stat-content">
          <div className="stat-number">{stats?.fijados || 0}</div>
          <div className="stat-label">Fijados</div>
        </div>
      </div>
    </div>
  );
};

// Componente de la tabla de mensajes
const MessagesTable = ({ 
  messages, 
  loading, 
  onMarkAsRead,
  onMarkAsClosed, 
  onTogglePin,
  onDelete 
}) => {
  const [actionConfirm, setActionConfirm] = useState(null);
  const [expandedMessage, setExpandedMessage] = useState(null);

  const getStatusBadge = (message) => {
    const statusConfig = {
      'Nuevo': { label: 'Nuevo', class: 'status-new', icon: '🆕' },
      'EnCurso': { label: 'En curso', class: 'status-progress', icon: '⏳' },
      'Cerrado': { label: 'Cerrado', class: 'status-closed', icon: '✅' }
    };

    const config = statusConfig[message.estado] || { 
      label: message.estado, 
      class: 'status-default',
      icon: '❓'
    };

    return (
      <span className={`status-badge ${config.class}`}>
        <span className="status-icon">{config.icon}</span>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  const handleActionClick = (messageId, action) => {
    setActionConfirm({ messageId, action });
  };

  const handleActionConfirm = () => {
    const { messageId, action } = actionConfirm;
    
    switch (action) {
      case 'delete':
        onDelete(messageId);
        break;
      case 'close':
        onMarkAsClosed(messageId);
        break;
      default:
        break;
    }
    
    setActionConfirm(null);
  };

  const handleActionCancel = () => {
    setActionConfirm(null);
  };

  const toggleMessageExpansion = (messageId) => {
    setExpandedMessage(expandedMessage === messageId ? null : messageId);
  };

  if (loading) {
    return (
      <div className="table-loading">
        <div className="loading-spinner"></div>
        <p>Cargando mensajes...</p>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="no-results">
        <div className="no-results-icon">💬</div>
        <h3>No se encontraron mensajes</h3>
        <p>Los mensajes de contacto aparecerán aquí cuando los clientes envíen consultas.</p>
      </div>
    );
  }

  return (
    <div className="messages-table-container">
      <table className="messages-table">
        <thead>
          <tr>
            <th className="col-status">Estado</th>
            <th className="col-contact">Contacto</th>
            <th className="col-subject">Asunto</th>
            <th className="col-message">Mensaje</th>
            <th className="col-property">Vivienda</th>
            <th className="col-date">Fecha</th>
            <th className="col-actions">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {messages.map(message => (
            <tr 
              key={message.id} 
              className={`message-row ${message.estado === 'Nuevo' ? 'message-row--new' : ''} ${message.pinned ? 'message-row--pinned' : ''}`}
            >
              <td className="col-status">
                <div className="status-content">
                  {getStatusBadge(message)}
                  {message.pinned && (
                    <span className="pin-indicator" title="Mensaje fijado">📌</span>
                  )}
                </div>
              </td>
              
              <td className="col-contact">
                <div className="contact-info">
                  <div className="contact-name">{message.nombre}</div>
                  <div className="contact-email">
                    <a href={`mailto:${message.email}`}>{message.email}</a>
                  </div>
                  {message.telefono && (
                    <div className="contact-phone">
                      <a href={`tel:${message.telefono}`}>{message.telefono}</a>
                    </div>
                  )}
                </div>
              </td>
              
              <td className="col-subject">
                <div className="subject-content">
                  {message.asunto || 'Sin asunto'}
                </div>
              </td>
              
              <td className="col-message">
                <div className="message-content">
                  <div className="message-text">
                    {truncateText(message.descripcion, 80)}
                  </div>
                  {message.descripcion && message.descripcion.length > 80 && (
                    <button
                      onClick={() => toggleMessageExpansion(message.id)}
                      className="expand-btn"
                    >
                      {expandedMessage === message.id ? 'Ver menos' : 'Ver más'}
                    </button>
                  )}
                  {expandedMessage === message.id && (
                    <div className="message-expanded">
                      {message.descripcion}
                    </div>
                  )}
                </div>
              </td>
              
              <td className="col-property">
                {message.viviendaId ? (
                  <Link 
                    to={`/viviendas/${message.viviendaId}`}
                    target="_blank"
                    className="property-link"
                    title="Ver vivienda"
                  >
                    🏠 Ver vivienda
                  </Link>
                ) : (
                  <span className="no-property">Consulta general</span>
                )}
              </td>
              
              <td className="col-date">
                <div className="date-info">
                  {formatDate(message.fecha)}
                </div>
              </td>
              
              <td className="col-actions">
                <div className="action-buttons">
                  {message.estado === 'Nuevo' && (
                    <button
                      onClick={() => onMarkAsRead(message.id)}
                      className="action-btn action-btn--read"
                      title="Marcar como leído"
                    >
                      👁️
                    </button>
                  )}

                  <button
                    onClick={() => onTogglePin(message.id, !message.pinned)}
                    className={`action-btn ${message.pinned ? 'action-btn--unpin' : 'action-btn--pin'}`}
                    title={message.pinned ? 'Quitar de fijados' : 'Fijar mensaje'}
                  >
                    {message.pinned ? '📌' : '📍'}
                  </button>

                  {message.estado !== 'Cerrado' && (
                    <>
                      {actionConfirm?.messageId === message.id && actionConfirm?.action === 'close' ? (
                        <div className="action-confirm">
                          <button
                            onClick={handleActionConfirm}
                            className="action-btn action-btn--confirm-close"
                            title="Confirmar cerrar"
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
                          onClick={() => handleActionClick(message.id, 'close')}
                          className="action-btn action-btn--close"
                          title="Marcar como cerrado"
                        >
                          ✅
                        </button>
                      )}
                    </>
                  )}

                  {actionConfirm?.messageId === message.id && actionConfirm?.action === 'delete' ? (
                    <div className="action-confirm">
                      <button
                        onClick={handleActionConfirm}
                        className="action-btn action-btn--confirm-delete"
                        title="Confirmar eliminar"
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
                      onClick={() => handleActionClick(message.id, 'delete')}
                      className="action-btn action-btn--delete"
                      title="Eliminar mensaje"
                    >
                      �️
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

// Componente de paginación
const MessagesPagination = ({ pagination, onPageChange }) => {
  if (pagination.totalPages <= 1) return null;

  const pages = [];
  const maxVisiblePages = 5;
  const currentPage = pagination.page;
  const totalPages = pagination.totalPages;

  // Calcular rango de páginas a mostrar
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  // Ajustar si no hay suficientes páginas al final
  if (endPage - startPage < maxVisiblePages - 1) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="pagination">
      <button 
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="pagination-btn pagination-btn--prev"
      >
        ← Anterior
      </button>

      {startPage > 1 && (
        <>
          <button 
            onClick={() => onPageChange(1)}
            className="pagination-btn"
          >
            1
          </button>
          {startPage > 2 && <span className="pagination-dots">...</span>}
        </>
      )}

      {pages.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`pagination-btn ${page === currentPage ? 'pagination-btn--active' : ''}`}
        >
          {page}
        </button>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="pagination-dots">...</span>}
          <button 
            onClick={() => onPageChange(totalPages)}
            className="pagination-btn"
          >
            {totalPages}
          </button>
        </>
      )}

      <button 
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="pagination-btn pagination-btn--next"
      >
        Siguiente →
      </button>
    </div>
  );
};

// Componente principal
const MessagesPage = () => {
  const [messageStats, setMessageStats] = useState(null);

  // Hook para obtener mensajes
  const {
    messages,
    pagination,
    isLoading: loading,
    error,
    filters,
    updateFilters,
    markAsRead,
    markAsClosed,
    togglePin,
    deleteMessage,
    goToPage,
    refreshMessages
  } = useMessages({
    pageSize: 20
  });

  // Funciones para las acciones de la tabla
  const handleMarkAsRead = useCallback(async (messageId) => {
    try {
      await markAsRead(messageId);
      // Refrescar estadísticas después del cambio
      loadMessageStats();
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  }, [markAsRead]);

  const handleMarkAsClosed = useCallback(async (messageId) => {
    try {
      await markAsClosed(messageId);
      // Refrescar estadísticas después del cambio
      loadMessageStats();
    } catch (error) {
      console.error('Error marking message as closed:', error);
    }
  }, [markAsClosed]);

  const handleTogglePin = useCallback(async (messageId, pinned) => {
    try {
      await togglePin(messageId, pinned);
      // Refrescar estadísticas después del cambio
      loadMessageStats();
    } catch (error) {
      console.error('Error toggling message pin:', error);
    }
  }, [togglePin]);

  const handleDelete = useCallback(async (messageId) => {
    try {
      await deleteMessage(messageId);
      // Refrescar estadísticas después del cambio
      loadMessageStats();
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  }, [deleteMessage]);

  const handleFiltersChange = useCallback((newFilters) => {
    updateFilters(newFilters, { debounce: true, resetPagination: true });
  }, [updateFilters]);

  const handleExport = useCallback(async () => {
    try {
      const blob = await messageService.exportMessages(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mensajes_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting messages:', error);
    }
  }, [filters]);

  // Cargar estadísticas de mensajes
  const loadMessageStats = useCallback(async () => {
    try {
      const response = await messageService.getMessageStats();
      setMessageStats(response.data);
    } catch (error) {
      console.error('Error loading message stats:', error);
    }
  }, []);

  // Cargar estadísticas al montar el componente
  React.useEffect(() => {
    loadMessageStats();
  }, [loadMessageStats]);

  return (
    <div className="messages-page">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">
            <span className="title-icon">💬</span>
            Gestión de Mensajes
          </h1>
          <p className="page-subtitle">
            Administra los mensajes de contacto de los clientes
          </p>
        </div>
        <div className="header-actions">
          <button 
            onClick={handleExport}
            className="btn btn--secondary"
            disabled={loading}
          >
            <span>📊</span> Exportar CSV
          </button>
          <button 
            onClick={refreshMessages}
            className="btn btn--secondary"
            disabled={loading}
          >
            <span>🔄</span> Actualizar
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <MessageStats stats={messageStats} />

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <span>{typeof error === 'string' ? error : 'Error al cargar los mensajes'}</span>
        </div>
      )}

      <div className="filters-section">
        <MessageFilters 
          filters={filters} 
          onFiltersChange={handleFiltersChange}
          stats={messageStats}
        />
      </div>

      <div className="content-section">
        <div className="results-header">
          <div className="results-count">
            {loading ? (
              <span>Cargando...</span>
            ) : (
              <span>
                {pagination.totalItems} {pagination.totalItems === 1 ? 'mensaje' : 'mensajes'}
                {filters.q && ` para "${filters.q}"`}
                {filters.estado && ` • Estado: ${filters.estado}`}
              </span>
            )}
          </div>
        </div>

        <MessagesTable
          messages={messages}
          loading={loading}
          onMarkAsRead={handleMarkAsRead}
          onMarkAsClosed={handleMarkAsClosed}
          onTogglePin={handleTogglePin}
          onDelete={handleDelete}
        />

        <MessagesPagination
          pagination={pagination}
          onPageChange={goToPage}
        />
      </div>
    </div>
  );
};

export default MessagesPage;