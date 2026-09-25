import React from 'react';
import FormField from '../../../common/FormField';

/** Sección "Ubicación": provincia/población visibles, dirección exacta plegada. */
const LocationSection = ({ formData, handleFieldChange, handleFieldBlur, errors, touched }) => {
  const fieldError = (field) => (touched[field] && errors[field]) || null;

  // Campo de texto con validación inline (blur + revalidación en vivo)
  const renderInput = ({ name, label, placeholder, maxLength }) => (
    <FormField label={label} htmlFor={name} error={fieldError(name)}>
      <input
        id={name}
        type="text"
        value={formData[name]}
        onChange={(e) => handleFieldChange(name, e.target.value)}
        onBlur={() => handleFieldBlur(name)}
        placeholder={placeholder}
        maxLength={maxLength}
        aria-invalid={Boolean(fieldError(name))}
        className={`form-input ${fieldError(name) ? 'error' : ''}`}
      />
    </FormField>
  );

  return (
    <div className="form-section">
      <h2 className="section-title">📍 Ubicación</h2>

      <div className="form-row">
        {renderInput({ name: 'provincia', label: 'Provincia', placeholder: 'Ej: Barcelona', maxLength: 100 })}
        {renderInput({ name: 'poblacion', label: 'Población', placeholder: 'Ej: Sitges', maxLength: 100 })}
      </div>

      {/* Si falla la validación de calle/número, el formulario abre este bloque antes de enfocar */}
      <details className="form-accordion">
        <summary className="form-accordion__summary">Dirección exacta (opcional)</summary>
        <div className="form-accordion__body">
          <div className="form-row">
            {renderInput({ name: 'calle', label: 'Calle', placeholder: 'Ej: Carrer del Mar', maxLength: 100 })}
            {renderInput({ name: 'numero', label: 'Número', placeholder: 'Ej: 123 A', maxLength: 20 })}
          </div>
        </div>
      </details>
    </div>
  );
};

export default LocationSection;
