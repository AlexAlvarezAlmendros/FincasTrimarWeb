import React from 'react';
import FormField from '../../../common/FormField';

// Sin `max` nativo: el navegador bloquearía el envío en silencio con datos reales
// (terrenos, naves…). Los topes los valida FormValidator y se muestran inline.
const NUMERIC_FIELDS = [
  { name: 'rooms', label: 'Habitaciones', placeholder: '3' },
  { name: 'bathRooms', label: 'Baños', placeholder: '2' },
  { name: 'garage', label: 'Garajes', placeholder: '1' },
  { name: 'squaredMeters', label: 'Metros cuadrados', placeholder: '120' },
];

/** Sección "Características" del formulario: habitaciones, baños, garajes, m². */
const FeaturesSection = ({ formData, handleFieldChange, handleFieldBlur, errors, touched }) => (
  <div className="form-section">
    <h2 className="section-title">🏠 Características</h2>

    <div className="form-row">
      {NUMERIC_FIELDS.map((f) => {
        const error = (touched[f.name] && errors[f.name]) || null;
        return (
          <FormField key={f.name} label={f.label} htmlFor={f.name} error={error}>
            <input
              id={f.name}
              type="number"
              value={formData[f.name]}
              onChange={(e) => handleFieldChange(f.name, e.target.value)}
              onBlur={() => handleFieldBlur(f.name)}
              min="0"
              placeholder={f.placeholder}
              aria-invalid={Boolean(error)}
              className={`form-input ${error ? 'error' : ''}`}
            />
          </FormField>
        );
      })}
    </div>
  </div>
);

export default FeaturesSection;
