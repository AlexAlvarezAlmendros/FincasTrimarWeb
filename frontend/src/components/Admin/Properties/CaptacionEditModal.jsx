import React, { useState, useEffect } from 'react';
import './CaptacionEditModal.css';

// Estados de captación válidos
const CAPTACION_STATES = {
  PENDIENTE: 'Pendiente',
  CONTACTADA: 'Contactada',
  CAPTADA: 'Captada',
  RECHAZADA: 'Rechazada'
};

const CaptacionEditModal = ({ property, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    estadoVenta: '',
    fechaCaptacion: '',
    porcentajeCaptacion: '',
    captadoPor: '',
    comisionGanada: '',
    observaciones: ''
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Inicializar el formulario con los datos de la propiedad
  useEffect(() => {
    if (property) {
      setFormData({
        estadoVenta: property.estadoVenta || CAPTACION_STATES.PENDIENTE,
        fechaCaptacion: property.fechaCaptacion 
          ? new Date(property.fechaCaptacion).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        porcentajeCaptacion: property.porcentajeCaptacion || '',
        captadoPor: property.captadoPor || '',
        comisionGanada: property.comisionGanada || '',
        observaciones: property.observaciones || ''
      });
    }
  }, [property]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validar estado (requerido)
    if (!formData.estadoVenta) {
      newErrors.estadoVenta = 'El estado es requerido';
    }

    // Validar fecha de captación (requerida)
    if (!formData.fechaCaptacion) {
      newErrors.fechaCaptacion = 'La fecha de captación es requerida';
    }

    // Validar porcentaje de captación (opcional, pero si se incluye debe ser válido)
    if (formData.porcentajeCaptacion !== '') {
      const porcentaje = parseFloat(formData.porcentajeCaptacion);
      if (isNaN(porcentaje) || porcentaje < 0 || porcentaje > 100) {
        newErrors.porcentajeCaptacion = 'Debe ser un porcentaje entre 0 y 100';
      }
    }

    // Validar comisión ganada (opcional, pero si se incluye debe ser válida)
    if (formData.comisionGanada !== '') {
      const comision = parseFloat(formData.comisionGanada);
      if (isNaN(comision) || comision < 0 || comision > 100) {
        newErrors.comisionGanada = 'Debe ser un porcentaje entre 0 y 100';
      }
    }

    // Validar captado por (opcional, pero si se incluye no debe estar vacío)
    if (formData.captadoPor && formData.captadoPor.trim().length < 2) {
      newErrors.captadoPor = 'Debe tener al menos 2 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    
    try {
      // Preparar datos para enviar
      const captacionData = {
        estadoVenta: formData.estadoVenta,
        fechaCaptacion: formData.fechaCaptacion,
        porcentajeCaptacion: formData.porcentajeCaptacion ? parseFloat(formData.porcentajeCaptacion) : null,
        captadoPor: formData.captadoPor || null,
        comisionGanada: formData.comisionGanada ? parseFloat(formData.comisionGanada) : null,
        observaciones: formData.observaciones || null
      };

      await onSave(captacionData);
    } catch (error) {
      console.error('Error saving captacion data:', error);
      // El error se maneja en el componente padre
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (saving) return; // No permitir cerrar mientras se guarda
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!property) return null;

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="captacion-modal">
        <div className="modal-header">
          <h2 className="modal-title">Editar Captación</h2>
          <p className="modal-subtitle">{property.name}</p>
          <button 
            className="modal-close" 
            onClick={handleClose}
            disabled={saving}
            aria-label="Cerrar modal"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="captacion-form">
          <div className="form-section">
            <h3 className="section-title">Datos de Captación</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="estadoVenta" className="form-label">
                  Estado de Captación *
                </label>
                <select
                  id="estadoVenta"
                  value={formData.estadoVenta}
                  onChange={(e) => handleInputChange('estadoVenta', e.target.value)}
                  className={`form-select ${errors.estadoVenta ? 'error' : ''}`}
                  disabled={saving}
                >
                  <option value="">Seleccionar estado...</option>
                  {Object.entries(CAPTACION_STATES).map(([key, value]) => (
                    <option key={key} value={value}>{value}</option>
                  ))}
                </select>
                {errors.estadoVenta && (
                  <span className="error-text">{errors.estadoVenta}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="fechaCaptacion" className="form-label">
                  Fecha de Captación *
                </label>
                <input
                  type="date"
                  id="fechaCaptacion"
                  value={formData.fechaCaptacion}
                  onChange={(e) => handleInputChange('fechaCaptacion', e.target.value)}
                  className={`form-input ${errors.fechaCaptacion ? 'error' : ''}`}
                  disabled={saving}
                />
                {errors.fechaCaptacion && (
                  <span className="error-text">{errors.fechaCaptacion}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="captadoPor" className="form-label">
                  Captado Por
                </label>
                <input
                  type="text"
                  id="captadoPor"
                  value={formData.captadoPor}
                  onChange={(e) => handleInputChange('captadoPor', e.target.value)}
                  placeholder="Nombre del captador..."
                  className={`form-input ${errors.captadoPor ? 'error' : ''}`}
                  disabled={saving}
                />
                {errors.captadoPor && (
                  <span className="error-text">{errors.captadoPor}</span>
                )}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Comisiones</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="porcentajeCaptacion" className="form-label">
                  Porcentaje de Captación (%)
                </label>
                <input
                  type="number"
                  id="porcentajeCaptacion"
                  value={formData.porcentajeCaptacion}
                  onChange={(e) => handleInputChange('porcentajeCaptacion', e.target.value)}
                  placeholder="0.00"
                  min="0"
                  max="100"
                  step="0.01"
                  className={`form-input ${errors.porcentajeCaptacion ? 'error' : ''}`}
                  disabled={saving}
                />
                {errors.porcentajeCaptacion && (
                  <span className="error-text">{errors.porcentajeCaptacion}</span>
                )}
                <small className="form-help">
                  Porcentaje que se lleva el agente captador
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="comisionGanada" className="form-label">
                  Comisión Ganada (%)
                </label>
                <input
                  type="number"
                  id="comisionGanada"
                  value={formData.comisionGanada}
                  onChange={(e) => handleInputChange('comisionGanada', e.target.value)}
                  placeholder="0.00"
                  min="0"
                  max="100"
                  step="0.01"
                  className={`form-input ${errors.comisionGanada ? 'error' : ''}`}
                  disabled={saving}
                />
                {errors.comisionGanada && (
                  <span className="error-text">{errors.comisionGanada}</span>
                )}
                <small className="form-help">
                  Porcentaje total de comisión por la venta
                </small>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Observaciones</h3>
            
            <div className="form-row">
              <div className="form-group form-group--full">
                <label htmlFor="observaciones" className="form-label">
                  Notas y Comentarios
                </label>
                <textarea
                  id="observaciones"
                  value={formData.observaciones}
                  onChange={(e) => handleInputChange('observaciones', e.target.value)}
                  placeholder="Añade notas, comentarios o cualquier información relevante sobre esta vivienda..."
                  className="form-textarea"
                  rows="4"
                  disabled={saving}
                />
                <small className="form-help">
                  Información adicional sobre el estado, negociación o seguimiento
                </small>
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button 
              type="button" 
              className="btn btn--secondary"
              onClick={handleClose}
              disabled={saving}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn btn--primary"
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="btn-spinner"></span>
                  Guardando...
                </>
              ) : (
                'Guardar Cambios'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CaptacionEditModal;