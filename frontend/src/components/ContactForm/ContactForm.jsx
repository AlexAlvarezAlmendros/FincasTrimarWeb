import React from 'react';
import PropTypes from 'prop-types';
import useContactForm from '../hooks/useContactForm';

/**
 * Componente base reutilizable para formularios de contacto
 */
const ContactForm = ({
  viviendaId = null,
  initialData = {},
  showPhone = true,
  showSubjectSelect = true,
  subjectOptions = [
    { value: 'comprar', label: 'Quiero comprar' },
    { value: 'vender', label: 'Quiero vender' },
    { value: 'alquilar', label: 'Quiero alquilar' },
    { value: 'valoracion', label: 'Solicitar valoración' },
    { value: 'informacion', label: 'Solicitar información' },
    { value: 'otro', label: 'Otro' }
  ],
  submitButtonText = 'ENVIAR MENSAJE',
  className = '',
  onSuccess = null,
  onError = null,
  placeholder = {
    nombre: 'Tu nombre completo',
    email: 'tu@email.com',
    telefono: 'Tu número de teléfono',
    asunto: 'Selecciona un asunto',
    descripcion: 'Cuéntanos en qué podemos ayudarte...'
  }
}) => {
  const {
    formData,
    isSubmitting,
    submitMessage,
    errors,
    updateField,
    submitForm,
    showSuccess,
    showError
  } = useContactForm({
    initialData,
    viviendaId,
    onSuccess,
    onError
  });

  // Mapear descripcion a mensaje para la UI (compatibilidad con diseño existente)
  const handleDescriptionChange = (value) => {
    updateField('descripcion', value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submitForm();
  };

  return (
    <form onSubmit={handleSubmit} className={`contact-form-contacto ${className}`}>
      {/* Primera fila: Nombre y Email */}
      <div className="form-row-contacto">
        <div className="form-group-contacto">
          <label htmlFor="nombre">Nombre *</label>
          <input
            type="text"
            id="nombre"
            value={formData.nombre}
            onChange={(e) => updateField('nombre', e.target.value)}
            placeholder={placeholder.nombre}
            required
            disabled={isSubmitting}
            className={errors.nombre ? 'error' : ''}
          />
          {errors.nombre && (
            <span className="field-error">{errors.nombre}</span>
          )}
        </div>

        <div className="form-group-contacto">
          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => updateField('email', e.target.value)}
            placeholder={placeholder.email}
            required
            disabled={isSubmitting}
            className={errors.email ? 'error' : ''}
          />
          {errors.email && (
            <span className="field-error">{errors.email}</span>
          )}
        </div>
      </div>

      {/* Segunda fila: Teléfono y Asunto */}
      <div className="form-row-contacto">
        {showPhone && (
          <div className="form-group-contacto">
            <label htmlFor="telefono">Teléfono</label>
            <input
              type="tel"
              id="telefono"
              value={formData.telefono}
              onChange={(e) => updateField('telefono', e.target.value)}
              placeholder={placeholder.telefono}
              disabled={isSubmitting}
              className={errors.telefono ? 'error' : ''}
            />
            {errors.telefono && (
              <span className="field-error">{errors.telefono}</span>
            )}
          </div>
        )}

        <div className="form-group-contacto">
          <label htmlFor="asunto">Asunto *</label>
          {showSubjectSelect ? (
            <select
              id="asunto"
              value={formData.asunto}
              onChange={(e) => updateField('asunto', e.target.value)}
              required
              disabled={isSubmitting}
              className={errors.asunto ? 'error' : ''}
            >
              <option value="">{placeholder.asunto}</option>
              {subjectOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              id="asunto"
              value={formData.asunto}
              onChange={(e) => updateField('asunto', e.target.value)}
              placeholder={placeholder.asunto}
              required
              disabled={isSubmitting}
              className={errors.asunto ? 'error' : ''}
            />
          )}
          {errors.asunto && (
            <span className="field-error">{errors.asunto}</span>
          )}
        </div>
      </div>

      {/* Mensaje */}
      <div className="form-group-contacto">
        <label htmlFor="mensaje">Mensaje *</label>
        <textarea
          id="mensaje"
          rows="5"
          value={formData.descripcion}
          onChange={(e) => handleDescriptionChange(e.target.value)}
          placeholder={placeholder.descripcion}
          required
          disabled={isSubmitting}
          className={errors.descripcion ? 'error' : ''}
        />
        {errors.descripcion && (
          <span className="field-error">{errors.descripcion}</span>
        )}
      </div>

      {/* Botón de envío */}
      <button 
        type="submit" 
        className="submit-button"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Enviando...' : submitButtonText}
      </button>

      {/* Mensajes de estado */}
      {submitMessage && (
        <div className={`submit-message ${showError ? 'submit-message--error' : 'submit-message--success'}`}>
          {submitMessage}
        </div>
      )}
    </form>
  );
};

ContactForm.propTypes = {
  viviendaId: PropTypes.string,
  initialData: PropTypes.object,
  showPhone: PropTypes.bool,
  showSubjectSelect: PropTypes.bool,
  subjectOptions: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired
  })),
  submitButtonText: PropTypes.string,
  className: PropTypes.string,
  onSuccess: PropTypes.func,
  onError: PropTypes.func,
  placeholder: PropTypes.shape({
    nombre: PropTypes.string,
    email: PropTypes.string,
    telefono: PropTypes.string,
    asunto: PropTypes.string,
    descripcion: PropTypes.string
  })
};

export default ContactForm;
