import React, { useState } from 'react';
import useAgents from '../../../hooks/useAgents.js';
import './UsersPage.css';

/**
 * Modal inline para crear / editar un agente
 */
const AgentModal = ({ agent, onSave, onClose }) => {
  const [nombre, setNombre] = useState(agent ? agent.nombre : '');
  const [activo, setActivo] = useState(agent ? agent.activo : true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (nombre.trim().length < 2) {
      setError('El nombre debe tener al menos 2 caracteres');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSave({ nombre: nombre.trim(), activo });
      onClose();
    } catch (err) {
      setError(err.message || 'Error al guardar el agente');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="agent-modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="agent-modal">
        <div className="agent-modal-header">
          <h3>{agent ? 'Editar Agente' : 'Nuevo Agente'}</h3>
          <button className="agent-modal-close" onClick={onClose} aria-label="Cerrar">×</button>
        </div>

        <form onSubmit={handleSubmit} className="agent-form">
          <div className="agent-form-group">
            <label htmlFor="agent-nombre" className="agent-form-label">
              Nombre *
            </label>
            <input
              id="agent-nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre del agente..."
              className={`agent-form-input ${error ? 'error' : ''}`}
              autoFocus
              disabled={saving}
            />
            {error && <span className="agent-form-error">{error}</span>}
          </div>

          {agent && (
            <div className="agent-form-group">
              <label className="agent-form-label">Estado</label>
              <div className="agent-toggle-row">
                <label className="agent-toggle">
                  <input
                    type="checkbox"
                    checked={activo}
                    onChange={(e) => setActivo(e.target.checked)}
                    disabled={saving}
                  />
                  <span className="agent-toggle-slider" />
                </label>
                <span className="agent-toggle-label">
                  {activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
          )}

          <div className="agent-modal-actions">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={onClose}
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={saving}
            >
              {saving ? 'Guardando...' : agent ? 'Guardar cambios' : 'Crear agente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/**
 * Fila de agente en la tabla
 */
const AgentRow = ({ agent, onEdit, onDelete }) => {
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(agent.id);
    } catch {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div className={`agent-row ${!agent.activo ? 'agent-row--inactive' : ''}`}>
      <div className="agent-row-name">
        <span className="agent-avatar">{agent.nombre.charAt(0).toUpperCase()}</span>
        <span className="agent-name">{agent.nombre}</span>
      </div>

      <div className="agent-row-status">
        <span className={`agent-status-badge ${agent.activo ? 'active' : 'inactive'}`}>
          {agent.activo ? 'Activo' : 'Inactivo'}
        </span>
      </div>

      <div className="agent-row-actions">
        <button
          className="agent-action-btn agent-action-btn--edit"
          onClick={() => onEdit(agent)}
          title="Editar agente"
        >
          ✏️
        </button>

        {confirmDelete ? (
          <div className="agent-delete-confirm">
            <span className="agent-delete-confirm-text">¿Eliminar?</span>
            <button
              className="agent-action-btn agent-action-btn--confirm-delete"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? '⏳' : '✓'}
            </button>
            <button
              className="agent-action-btn agent-action-btn--cancel"
              onClick={() => setConfirmDelete(false)}
              disabled={deleting}
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            className="agent-action-btn agent-action-btn--delete"
            onClick={() => setConfirmDelete(true)}
            title="Eliminar agente"
          >
            🗑️
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * Página de Gestión de Usuarios con sección de Agentes
 */
const UsersPage = () => {
  const {
    agentes,
    loading,
    error,
    createAgente,
    updateAgente,
    deleteAgente
  } = useAgents(false); // false → cargar todos, activos e inactivos

  const [modalOpen, setModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [actionError, setActionError] = useState('');

  const handleOpenCreate = () => {
    setEditingAgent(null);
    setActionError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (agent) => {
    setEditingAgent(agent);
    setActionError('');
    setModalOpen(true);
  };

  const handleSave = async (data) => {
    setActionError('');
    try {
      if (editingAgent) {
        await updateAgente(editingAgent.id, data);
      } else {
        await createAgente(data.nombre);
      }
    } catch (err) {
      setActionError(err.message || 'Error al guardar');
      throw err;
    }
  };

  const handleDelete = async (id) => {
    setActionError('');
    try {
      await deleteAgente(id);
    } catch (err) {
      setActionError(err.message || 'Error al eliminar');
      throw err;
    }
  };

  const activos = agentes.filter(a => a.activo);
  const inactivos = agentes.filter(a => !a.activo);

  return (
    <div className="users-page">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Gestión de Usuarios</h1>
          <p className="page-subtitle">Administra usuarios, roles y agentes del sistema</p>
        </div>
      </div>

      {/* ── Sección de Agentes ────────────────────── */}
      <section className="agents-section">
        <div className="agents-section-header">
          <div>
            <h2 className="agents-section-title">Agentes Captadores</h2>
            <p className="agents-section-subtitle">
              Los agentes aquí configurados aparecerán en el desplegable de la página de Captación.
            </p>
          </div>
          <button className="btn btn--primary" onClick={handleOpenCreate}>
            + Nuevo agente
          </button>
        </div>

        {actionError && (
          <div className="agent-action-error">⚠️ {actionError}</div>
        )}

        {loading ? (
          <div className="agents-loading">
            <div className="agents-spinner" />
            <span>Cargando agentes...</span>
          </div>
        ) : error ? (
          <div className="agents-error">
            <span>⚠️ {error}</span>
          </div>
        ) : agentes.length === 0 ? (
          <div className="agents-empty">
            <div className="agents-empty-icon">👤</div>
            <h3>No hay agentes configurados</h3>
            <p>Crea el primer agente para que aparezca en la página de Captación.</p>
            <button className="btn btn--primary" onClick={handleOpenCreate}>
              + Crear primer agente
            </button>
          </div>
        ) : (
          <div className="agents-list">
            <div className="agents-list-header">
              <span>Nombre</span>
              <span>Estado</span>
              <span>Acciones</span>
            </div>

            {activos.map(agent => (
              <AgentRow
                key={agent.id}
                agent={agent}
                onEdit={handleOpenEdit}
                onDelete={handleDelete}
              />
            ))}

            {inactivos.length > 0 && (
              <>
                <div className="agents-group-divider">Inactivos ({inactivos.length})</div>
                {inactivos.map(agent => (
                  <AgentRow
                    key={agent.id}
                    agent={agent}
                    onEdit={handleOpenEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </>
            )}
          </div>
        )}

        <div className="agents-summary">
          {activos.length} {activos.length === 1 ? 'agente activo' : 'agentes activos'}
          {inactivos.length > 0 && ` · ${inactivos.length} inactivo${inactivos.length > 1 ? 's' : ''}`}
        </div>
      </section>

      {/* ── Sección Usuarios Auth0 (futuro) ─────── */}
      <section className="users-section">
        <div className="users-section-header">
          <h2 className="users-section-title">Usuarios del sistema</h2>
        </div>
        <div className="content-placeholder">
          <div className="placeholder-icon">🔐</div>
          <h3>Gestión de usuarios Auth0</h3>
          <p>
            La gestión de usuarios y roles estará disponible próximamente.
          </p>
        </div>
      </section>

      {/* Modal crear / editar */}
      {modalOpen && (
        <AgentModal
          agent={editingAgent}
          onSave={handleSave}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
};

export default UsersPage;