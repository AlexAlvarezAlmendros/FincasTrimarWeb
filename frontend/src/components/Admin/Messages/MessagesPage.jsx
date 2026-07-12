import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useMessages } from '../../../hooks/useMessages.js';
import './MessagesPage.css';

const STATUS = {
  Nuevo: { label: 'Nuevo', class: 'status-new', icon: 'circle' },
  EnCurso: { label: 'En curso', class: 'status-progress', icon: 'clock' },
  Cerrado: { label: 'Cerrado', class: 'status-closed', icon: 'check' },
};

const formatDate = (dateString) =>
  dateString
    ? new Date(dateString).toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

const truncate = (text, max = 90) => {
  if (!text) return '';
  return text.length > max ? `${text.substring(0, max)}…` : text;
};

// Construye un mailto: prellenado con Re:, saludo y cita del mensaje original
const buildReplyMailto = (msg) => {
  const to = msg.email || '';
  const subject = `Re: ${msg.asunto || 'Su consulta'}`;
  const fecha = formatDate(msg.fecha);
  const quoted = (msg.descripcion || '')
    .split('\n')
    .map((line) => `> ${line}`)
    .join('\n');
  const body = `Hola ${msg.nombre || ''},\n\n\n\n---\nEl ${fecha} escribiste:\n${quoted}`;
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

const StatusBadge = ({ estado }) => {
  const s = STATUS[estado] || { label: estado, class: 'status-default', icon: 'circle' };
  return (
    <span className={`status-badge ${s.class}`}>
      <FontAwesomeIcon icon={s.icon} /> {s.label}
    </span>
  );
};

// --- Estadísticas rápidas ---
const MessageStats = ({ stats }) => (
  <div className="message-stats">
    <div className="stat-card stat-card--new">
      <div className="stat-icon"><FontAwesomeIcon icon="envelope" /></div>
      <div className="stat-content">
        <div className="stat-number">{stats?.nuevo || 0}</div>
        <div className="stat-label">Nuevos</div>
      </div>
    </div>
    <div className="stat-card stat-card--progress">
      <div className="stat-icon"><FontAwesomeIcon icon="clock" /></div>
      <div className="stat-content">
        <div className="stat-number">{stats?.enCurso || 0}</div>
        <div className="stat-label">En curso</div>
      </div>
    </div>
    <div className="stat-card stat-card--closed">
      <div className="stat-icon"><FontAwesomeIcon icon="check" /></div>
      <div className="stat-content">
        <div className="stat-number">{stats?.cerrado || 0}</div>
        <div className="stat-label">Cerrados</div>
      </div>
    </div>
  </div>
);

// --- Filtros ---
const MessageFilters = ({ filters, onFiltersChange, stats }) => {
  const handleFilterChange = (key, value) => onFiltersChange({ [key]: value });
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
            <option value="Nuevo">Nuevos {stats?.nuevo ? `(${stats.nuevo})` : ''}</option>
            <option value="EnCurso">En curso {stats?.enCurso ? `(${stats.enCurso})` : ''}</option>
            <option value="Cerrado">Cerrados {stats?.cerrado ? `(${stats.cerrado})` : ''}</option>
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

// --- Lista de mensajes (columna izquierda) ---
const MessageList = ({ messages, loading, selectedId, onSelect }) => {
  if (loading) {
    return (
      <div className="message-list message-list--loading">
        <p>Cargando mensajes…</p>
      </div>
    );
  }
  if (messages.length === 0) {
    return (
      <div className="message-list message-list--empty">
        <FontAwesomeIcon icon="inbox" />
        <p>No se encontraron mensajes</p>
      </div>
    );
  }
  return (
    <div className="message-list" role="listbox" aria-label="Lista de mensajes">
      {messages.map((msg) => {
        const isUnread = msg.estado === 'Nuevo';
        const isActive = msg.id === selectedId;
        return (
          <button
            key={msg.id}
            type="button"
            role="option"
            aria-selected={isActive}
            className={`message-list-item${isActive ? ' message-list-item--active' : ''}${
              isUnread ? ' message-list-item--unread' : ''
            }`}
            onClick={() => onSelect(msg)}
          >
            <div className="message-list-item__top">
              {isUnread && <span className="message-unread-dot" aria-label="No leído" />}
              <span className="message-list-item__from">{msg.nombre || msg.email || 'Anónimo'}</span>
              <span className="message-list-item__date">{formatDate(msg.fecha)}</span>
            </div>
            <div className="message-list-item__subject">{msg.asunto || 'Sin asunto'}</div>
            <div className="message-list-item__preview">{truncate(msg.descripcion, 90)}</div>
          </button>
        );
      })}
    </div>
  );
};

// --- Panel de lectura (columna derecha) ---
const MessageDetail = ({ message, onReply, onToggleRead, onClose, onReopen, onDelete }) => {
  if (!message) {
    return (
      <div className="message-detail message-detail--empty">
        <FontAwesomeIcon icon="inbox" />
        <p>Selecciona un mensaje para leerlo</p>
      </div>
    );
  }

  return (
    <div className="message-detail">
      <div className="message-detail__header">
        <div className="message-detail__heading">
          <h2 className="message-detail__title">{message.asunto || 'Sin asunto'}</h2>
          <div className="message-detail__meta">
            <StatusBadge estado={message.estado} />
            <span className="message-detail__date">{formatDate(message.fecha)}</span>
          </div>
        </div>
        <div className="message-detail__actions">
          <a
            href={buildReplyMailto(message)}
            onClick={() => onReply(message)}
            className="msg-action-btn msg-action-btn--primary"
          >
            <FontAwesomeIcon icon="reply" /> Responder
          </a>
          {message.estado === 'Nuevo' && (
            <button type="button" className="msg-action-btn" onClick={() => onToggleRead(message)}>
              <FontAwesomeIcon icon="eye" /> Marcar leído
            </button>
          )}
          {message.estado === 'EnCurso' && (
            <button type="button" className="msg-action-btn" onClick={() => onToggleRead(message)}>
              <FontAwesomeIcon icon="eye-slash" /> Marcar no leído
            </button>
          )}
          {message.estado !== 'Cerrado' ? (
            <button type="button" className="msg-action-btn" onClick={() => onClose(message)}>
              <FontAwesomeIcon icon="check" /> Cerrar
            </button>
          ) : (
            <button type="button" className="msg-action-btn" onClick={() => onReopen(message)}>
              <FontAwesomeIcon icon="rotate-left" /> Reabrir
            </button>
          )}
          <button
            type="button"
            className="msg-action-btn msg-action-btn--danger"
            onClick={() => onDelete(message)}
          >
            <FontAwesomeIcon icon="trash" /> Borrar
          </button>
        </div>
      </div>

      <div className="message-detail__contact">
        <span className="message-detail__from">{message.nombre || 'Anónimo'}</span>
        <a href={`mailto:${message.email}`}>
          <FontAwesomeIcon icon="envelope" /> {message.email}
        </a>
        {message.telefono && (
          <a href={`tel:${message.telefono}`}>
            <FontAwesomeIcon icon="phone" /> {message.telefono}
          </a>
        )}
        {message.viviendaId && (
          <Link to={`/viviendas/${message.viviendaId}`} target="_blank" rel="noopener noreferrer">
            <FontAwesomeIcon icon="house" /> Ver vivienda
          </Link>
        )}
      </div>

      <div className="message-detail__body">{message.descripcion || 'Sin contenido.'}</div>
    </div>
  );
};

// --- Paginación ---
const MessagesPagination = ({ pagination, onPageChange }) => {
  if (pagination.totalPages <= 1) return null;

  const maxVisiblePages = 5;
  const currentPage = pagination.page;
  const totalPages = pagination.totalPages;

  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  if (endPage - startPage < maxVisiblePages - 1) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  const pages = [];
  for (let i = startPage; i <= endPage; i++) pages.push(i);

  return (
    <div className="pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="pagination-btn pagination-btn--prev"
      >
        <FontAwesomeIcon icon="angle-left" /> Anterior
      </button>
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`pagination-btn ${page === currentPage ? 'pagination-btn--active' : ''}`}
        >
          {page}
        </button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="pagination-btn pagination-btn--next"
      >
        Siguiente <FontAwesomeIcon icon="angle-right" />
      </button>
    </div>
  );
};

// --- Página principal (bandeja de entrada lista/detalle) ---
const MessagesPage = () => {
  const {
    messages,
    pagination,
    stats,
    isLoading: loading,
    error,
    filters,
    updateFilters,
    goToPage,
    refresh,
    fetchStats,
    markAsRead,
    markAsUnread,
    markAsClosed,
    reopenMessage,
    deleteMessage,
  } = useMessages({ pageSize: 20 });

  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const selected = messages.find((m) => m.id === selectedId) || null;

  const refreshStats = useCallback(() => {
    fetchStats().catch(() => {});
  }, [fetchStats]);

  // Seleccionar un mensaje lo marca como leído automáticamente si estaba "Nuevo"
  const handleSelect = useCallback(
    (msg) => {
      setSelectedId(msg.id);
      if (msg.estado === 'Nuevo') {
        markAsRead(msg.id).then(refreshStats).catch((e) => console.error(e));
      }
    },
    [markAsRead, refreshStats]
  );

  const handleToggleRead = useCallback(
    (msg) => {
      const action = msg.estado === 'Nuevo' ? markAsRead : markAsUnread;
      action(msg.id).then(refreshStats).catch((e) => console.error(e));
    },
    [markAsRead, markAsUnread, refreshStats]
  );

  const handleClose = useCallback(
    (msg) => markAsClosed(msg.id).then(refreshStats).catch((e) => console.error(e)),
    [markAsClosed, refreshStats]
  );

  const handleReopen = useCallback(
    (msg) => reopenMessage(msg.id).then(refreshStats).catch((e) => console.error(e)),
    [reopenMessage, refreshStats]
  );

  const handleDelete = useCallback(
    (msg) => {
      if (!window.confirm('¿Eliminar este mensaje? Esta acción no se puede deshacer.')) return;
      if (selectedId === msg.id) setSelectedId(null);
      deleteMessage(msg.id).then(refreshStats).catch((e) => console.error(e));
    },
    [deleteMessage, refreshStats, selectedId]
  );

  // Al pulsar "Responder" (mailto), marcar como leído si estaba nuevo
  const handleReply = useCallback(
    (msg) => {
      if (msg.estado === 'Nuevo') {
        markAsRead(msg.id).then(refreshStats).catch((e) => console.error(e));
      }
    },
    [markAsRead, refreshStats]
  );

  const handleFiltersChange = useCallback(
    (newFilters) => updateFilters(newFilters, { debounce: true, resetPagination: true }),
    [updateFilters]
  );

  return (
    <div className="messages-page">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">
            <span className="title-icon"><FontAwesomeIcon icon="envelope" /></span>
            Mensajes
          </h1>
          <p className="page-subtitle">Bandeja de entrada de los clientes</p>
        </div>
        <div className="header-actions">
          <button onClick={refresh} className="btn btn--secondary" disabled={loading}>
            <FontAwesomeIcon icon="refresh" /> Actualizar
          </button>
        </div>
      </div>

      <MessageStats stats={stats} />

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <span>{typeof error === 'string' ? error : 'Error al cargar los mensajes'}</span>
        </div>
      )}

      <div className="filters-section">
        <MessageFilters filters={filters} onFiltersChange={handleFiltersChange} stats={stats} />
      </div>

      <div className="results-header">
        <div className="results-count">
          {loading ? (
            <span>Cargando…</span>
          ) : (
            <span>
              {pagination.totalItems} {pagination.totalItems === 1 ? 'mensaje' : 'mensajes'}
              {filters.q && ` para "${filters.q}"`}
              {filters.estado && ` • ${STATUS[filters.estado]?.label || filters.estado}`}
            </span>
          )}
        </div>
      </div>

      <div className="messages-inbox">
        <div className="messages-inbox__list">
          <MessageList
            messages={messages}
            loading={loading}
            selectedId={selectedId}
            onSelect={handleSelect}
          />
          <MessagesPagination pagination={pagination} onPageChange={goToPage} />
        </div>
        <div className="messages-inbox__detail">
          <MessageDetail
            message={selected}
            onReply={handleReply}
            onToggleRead={handleToggleRead}
            onClose={handleClose}
            onReopen={handleReopen}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
