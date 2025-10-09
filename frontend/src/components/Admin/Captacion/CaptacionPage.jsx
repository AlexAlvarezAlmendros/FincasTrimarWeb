/**
 * Página de Gestión de Captación
 * Permite gestionar las comisiones y captadores de viviendas
 */

import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { DataTransformers } from '../../../types/vivienda.types.js';
import { useViviendas } from '../../../hooks/useViviendas.js';
import propertyService from '../../../services/propertyService.js';
import './CaptacionPage.css';

const CaptacionPage = () => {
  const { getAccessTokenSilently, user } = useAuth0();
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Filtros específicos para captación
  const [captacionFilters, setCaptacionFilters] = useState({
    captadoPor: '',
    estadoVenta: '', // Permitir filtrar por estado específico
    q: '',
    published: false, // Trabajamos con propiedades no publicadas
    pageSize: 50
  });

  // Hook para obtener viviendas con filtros de captación
  const {
    viviendas: properties,
    isLoading: loading,
    isError,
    error,
    updateFilters,
    refreshViviendas
  } = useViviendas(
    {
      // Filtros base estáticos para captación
      published: false, // Trabajamos con propiedades no publicadas (en proceso de captación)
      pageSize: 50,
      estadoVenta: 'Pendiente' // Estado inicial por defecto
    },
    {
      enableCache: false, // No usar cache para datos administrativos que cambian frecuentemente
      autoFetch: true,
      onError: (error) => {
        console.error('Error loading captación properties:', error);
      }
    }
  );

  // Sincronizar filtros iniciales una sola vez
  useEffect(() => {
    // Solo ejecutar al montar el componente si hay diferencias
    const initialFilters = {
      captadoPor: '',
      estadoVenta: 'Pendiente',
      q: '',
      published: false,
      pageSize: 50
    };
    
    setCaptacionFilters(initialFilters);
  }, []); // Array vacío = solo al montar

  // Estados para el formulario de edición
  const [editForm, setEditForm] = useState({
    comisionGanada: 0,
    captadoPor: '',
    porcentajeCaptacion: 0,
    fechaCaptacion: '',
    estadoVenta: 'Pendiente',
    nombrePropietario: '',
    telefonoPropietario: '',
    comentarios: ''
  });

  const openEditModal = (property) => {
    setSelectedProperty(property);
    setEditForm({
      comisionGanada: property.comisionGanada || 0,
      captadoPor: property.captadoPor || '',
      porcentajeCaptacion: property.porcentajeCaptacion || 0,
      fechaCaptacion: property.fechaCaptacion ? property.fechaCaptacion.split('T')[0] : '',
      estadoVenta: property.estadoVenta || 'Pendiente',
      nombrePropietario: property.nombrePropietario || '',
      telefonoPropietario: property.telefonoPropietario || '',
      comentarios: property.comentarios || ''
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedProperty(null);
    setEditForm({
      comisionGanada: 0,
      captadoPor: '',
      porcentajeCaptacion: 0,
      fechaCaptacion: '',
      estadoVenta: 'Pendiente',
      nombrePropietario: '',
      telefonoPropietario: '',
      comentarios: ''
    });
  };

  const handleSaveCaptacion = async () => {
    if (!selectedProperty) return;

    try {
      // Preparar datos para actualizar
      const updateData = {
        ...selectedProperty,
        ...editForm,
        fechaCaptacion: editForm.fechaCaptacion ? new Date(editForm.fechaCaptacion).toISOString() : null
      };

      const response = await propertyService.updateProperty(selectedProperty.id, updateData, getAccessTokenSilently);

      if (response.success) {
        // Refrescar la lista de propiedades
        refreshViviendas();
        closeEditModal();
        console.log('✅ Datos de captación actualizados correctamente');
      } else {
        throw new Error(response.error?.message || 'Error al actualizar');
      }
    } catch (err) {
      console.error('Error updating captacion:', err);
      // El error ya se maneja en el hook
    }
  };

  const handleFilterChange = (field, value) => {
    const newFilters = {
      ...captacionFilters,
      [field]: value,
      published: false, // Siempre mantener propiedades no publicadas
      pageSize: 50
    };
    
    setCaptacionFilters(newFilters);
    
    // Usar updateFilters del hook directamente
    updateFilters(newFilters, { 
      merge: false, // Reemplazar todos los filtros
      resetPagination: true,
      useSearch: true 
    });
  };

  const clearFilters = () => {
    const clearedFilters = {
      captadoPor: '',
      estadoVenta: 'Pendiente', // Volver al estado por defecto
      q: '',
      published: false,
      pageSize: 50
    };
    
    setCaptacionFilters(clearedFilters);
    updateFilters(clearedFilters, { 
      merge: false, 
      resetPagination: true,
      useSearch: true 
    });
  };

  // Calcular estadísticas
  const stats = {
    totalProperties: properties.length,
    captadas: properties.filter(p => p.captadoPor && p.captadoPor.trim() !== '').length,
    comisionTotal: properties.reduce((sum, p) => sum + (p.comisionGanada || 0), 0),
    porcentajePromedio: properties.length > 0 
      ? properties.reduce((sum, p) => sum + (p.porcentajeCaptacion || 0), 0) / properties.length
      : 0
  };

  if (loading && properties.length === 0) {
    return (
      <div className="captacion-page">
        <div className="loading-state">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Cargando propiedades...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="captacion-page">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">
            <i className="fas fa-handshake"></i>
            Gestión de Captación
          </h1>
          <p className="page-subtitle">
            Gestiona las comisiones y captadores de las viviendas
          </p>
        </div>
      </div>

      {(error || isError) && (
        <div className="alert alert-error">
          <strong>Error:</strong> {error?.message || error || 'Error al cargar propiedades'}
          <button onClick={() => {
            if (typeof error === 'object' && error.clearError) {
              error.clearError();
            }
          }} className="alert-close">×</button>
        </div>
      )}

      {/* Estadísticas */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-home"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.totalProperties}</h3>
            <p>Total Propiedades</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-user-check"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.captadas}</h3>
            <p>Captadas</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-percentage"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.comisionTotal.toFixed(1)}%</h3>
            <p>Comisión Total</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-chart-line"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.porcentajePromedio.toFixed(1)}%</h3>
            <p>% Promedio Captación</p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="filters-section">
        <div className="filters-grid">
          <div className="filter-group">
            <label htmlFor="filter-search">Buscar propiedad</label>
            <input
              id="filter-search"
              type="text"
              value={captacionFilters.q}
              onChange={(e) => handleFilterChange('q', e.target.value)}
              placeholder="Nombre, ubicación..."
              className="form-input"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="filter-captador">Captado por</label>
            <input
              id="filter-captador"
              type="text"
              value={captacionFilters.captadoPor}
              onChange={(e) => handleFilterChange('captadoPor', e.target.value)}
              placeholder="ID del captador..."
              className="form-input"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="filter-estado">Estado de captación</label>
            <select
              id="filter-estado"
              value={captacionFilters.estadoVenta}
              onChange={(e) => handleFilterChange('estadoVenta', e.target.value)}
              className="form-select"
            >
              <option value="Pendiente">Pendiente</option>
              <option value="Contactada">Contactada</option>
              <option value="Captada">Captada</option>
              <option value="Rechazada">Rechazada</option>
            </select>
          </div>

          <div className="filter-actions">
            <button 
              onClick={clearFilters}
              className="btn btn-outline"
            >
              <i className="fas fa-times"></i>
              Limpiar
            </button>
            
          </div>
        </div>
      </div>

      {/* Lista de propiedades */}
      <div className="properties-section">
        <div className="section-header">
          <h2>Propiedades ({properties.length})</h2>
        </div>

        {properties.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-search"></i>
            <p>No se encontraron propiedades con los filtros aplicados</p>
          </div>
        ) : (
          <div className="properties-table">
            <table>
              <thead>
                <tr>
                  <th>Propiedad</th>
                  <th>Estado</th>
                  <th>Captado Por</th>
                  <th>% Captación</th>
                  <th>Comisión</th>
                  <th>Fecha Captación</th>
                  <th>Propietario</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((property) => (
                  <tr key={property.id}>
                    <td>
                      <div className="property-info">
                        <strong>{property.name}</strong>
                        <small>{property.poblacion}, {property.provincia}</small>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge status-${property.estadoVenta?.toLowerCase()}`}>
                        {property.estadoVenta || 'Sin estado'}
                      </span>
                    </td>
                    <td>
                      <span className="captador">
                        {property.captadoPor || '-'}
                      </span>
                    </td>
                    <td>
                      <span className="percentage">
                        {property.porcentajeCaptacion || 0}%
                      </span>
                    </td>
                    <td>
                      <span className="commission">
                        {property.comisionGanada || 0}%
                      </span>
                    </td>
                    <td>
                      <span className="date">
                        {property.fechaCaptacion 
                          ? DataTransformers.formatDate(property.fechaCaptacion)
                          : '-'
                        }
                      </span>
                    </td>
                    <td>
                      <div className="owner-info">
                        {property.nombrePropietario ? (
                          <div>
                            <strong>{property.nombrePropietario}</strong>
                            {property.telefonoPropietario && (
                              <div>
                                <small>📞 {property.telefonoPropietario}</small>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="no-owner">Sin información</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <button
                        onClick={() => openEditModal(property)}
                        className="btn btn-sm btn-primary"
                        title="Editar captación"
                      >
						Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de edición */}
      {showEditModal && selectedProperty && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Editar Captación</h3>
              <button onClick={closeEditModal} className="modal-close">
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="property-summary">
                <h4>{selectedProperty.name}</h4>
                <p>{selectedProperty.poblacion}, {selectedProperty.provincia}</p>
                <p><strong>Precio:</strong> {DataTransformers.formatPrice(selectedProperty.price)}</p>
                <p><strong>Estado Actual:</strong> 
                  <span className={`status-badge status-${selectedProperty.estadoVenta?.toLowerCase()}`}>
                    {selectedProperty.estadoVenta || 'Sin estado'}
                  </span>
                </p>
                {(selectedProperty.nombrePropietario || selectedProperty.telefonoPropietario || selectedProperty.comentarios) && (
                  <div className="owner-info">
                    <strong>Propietario:</strong>
                    {selectedProperty.nombrePropietario && (
                      <span> {selectedProperty.nombrePropietario}</span>
                    )}
                    {selectedProperty.telefonoPropietario && (
                      <span> • 📞 {selectedProperty.telefonoPropietario}</span>
                    )}
                    {selectedProperty.comentarios && (
                      <div className="owner-comments">
                        <small><strong>Comentarios:</strong> {selectedProperty.comentarios}</small>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <form className="edit-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="captadoPor">Captado por (ID Usuario)</label>
                    <input
                      id="captadoPor"
                      type="text"
                      value={editForm.captadoPor}
                      onChange={(e) => setEditForm(prev => ({ ...prev, captadoPor: e.target.value }))}
                      placeholder="ID del usuario captador"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="fechaCaptacion">Fecha de Captación</label>
                    <input
                      id="fechaCaptacion"
                      type="date"
                      value={editForm.fechaCaptacion}
                      onChange={(e) => setEditForm(prev => ({ ...prev, fechaCaptacion: e.target.value }))}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group full-width">
                    <label htmlFor="estadoVenta">Estado de Captación</label>
                    <select
                      id="estadoVenta"
                      value={editForm.estadoVenta}
                      onChange={(e) => setEditForm(prev => ({ ...prev, estadoVenta: e.target.value }))}
                      className="form-select"
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="Contactada">Contactada</option>
                      <option value="Captada">Captada</option>
                      <option value="Rechazada">Rechazada</option>
                      <option value="Disponible">Disponible</option>
                      <option value="Reservada">Reservada</option>
                      <option value="Vendida">Vendida</option>
                      <option value="Cerrada">Cerrada</option>
                    </select>
                    <small className="form-help">
                      <strong>Estados:</strong> Pendiente → Contactada → Captada/Rechazada → Disponible → Reservada → Vendida → Cerrada
                    </small>
                  </div>
                </div>

                {/* Sección de información del propietario */}
                <div className="form-section">
                  <h5 className="section-title">
                    <i className="fas fa-user"></i>
                    Información del Propietario
                  </h5>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="nombrePropietario">Nombre del Propietario</label>
                      <input
                        id="nombrePropietario"
                        type="text"
                        value={editForm.nombrePropietario}
                        onChange={(e) => setEditForm(prev => ({ ...prev, nombrePropietario: e.target.value }))}
                        placeholder="Nombre completo del propietario"
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="telefonoPropietario">Teléfono de Contacto</label>
                      <input
                        id="telefonoPropietario"
                        type="tel"
                        value={editForm.telefonoPropietario}
                        onChange={(e) => setEditForm(prev => ({ ...prev, telefonoPropietario: e.target.value }))}
                        placeholder="Ej: +34 600 123 456"
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group full-width">
                      <label htmlFor="comentarios">Comentarios y Notas</label>
                      <textarea
                        id="comentarios"
                        value={editForm.comentarios}
                        onChange={(e) => setEditForm(prev => ({ ...prev, comentarios: e.target.value }))}
                        placeholder="Notas sobre la propiedad, conversaciones con el propietario, condiciones especiales, etc."
                        className="form-textarea"
                        rows="4"
                      />
                      <small className="form-help">
                        Información adicional sobre la propiedad o el trato con el propietario
                      </small>
                    </div>
                  </div>
                </div>

                {/* Sección de comisiones */}
                <div className="form-section">
                  <h5 className="section-title">
                    <i className="fas fa-percentage"></i>
                    Comisiones y Captación
                  </h5>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="porcentajeCaptacion">Porcentaje de Captación (%)</label>
                    <input
                      id="porcentajeCaptacion"
                      type="number"
                      value={editForm.porcentajeCaptacion}
                      onChange={(e) => setEditForm(prev => ({ ...prev, porcentajeCaptacion: parseFloat(e.target.value) || 0 }))}
                      min="0"
                      max="100"
                      step="0.1"
                      placeholder="0.0"
                      className="form-input"
                    />
                    <small className="form-help">
                      Porcentaje que se lleva el captador del precio de venta
                    </small>
                  </div>

                  <div className="form-group">
                    <label htmlFor="comisionGanada">Comisión Ganada (%)</label>
                    <input
                      id="comisionGanada"
                      type="number"
                      value={editForm.comisionGanada}
                      onChange={(e) => setEditForm(prev => ({ ...prev, comisionGanada: parseFloat(e.target.value) || 0 }))}
                      min="0"
                      max="100"
                      step="0.1"
                      placeholder="0.0"
                      className="form-input"
                    />
                    <small className="form-help">
                      Porcentaje de comisión total ganada en la venta
                    </small>
                  </div>
                </div>
                </div> {/* Cierre de form-section de comisiones */}

                {editForm.porcentajeCaptacion > 0 && selectedProperty.price > 0 && (
                  <div className="calculation-info">
                    <h4>Cálculo de Captación:</h4>
                    <p>
                      <strong>Comisión del Captador:</strong> {' '}
                      {DataTransformers.formatPrice((selectedProperty.price * editForm.porcentajeCaptacion) / 100)}
                      {' '}({editForm.porcentajeCaptacion}% de {DataTransformers.formatPrice(selectedProperty.price)})
                    </p>
                  </div>
                )}
              </form>
            </div>

            <div className="modal-footer">
              <button
                onClick={closeEditModal}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveCaptacion}
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Guardando...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save"></i>
                    Guardar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaptacionPage;