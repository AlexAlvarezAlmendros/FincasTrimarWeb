import React from 'react';
import FormField from '../../../common/FormField';

const NUMERIC_FIELDS = [
  { name: 'rooms', label: 'Habitaciones', min: 0, max: 50, placeholder: '3' },
  { name: 'bathRooms', label: 'Baños', min: 0, max: 20, placeholder: '2' },
  { name: 'garage', label: 'Garajes', min: 0, max: 10, placeholder: '1' },
  { name: 'squaredMeters', label: 'Metros cuadrados', min: 0, max: 10000, placeholder: '120' },
];

/** Sección "Características" del formulario: habitaciones, baños, garajes, m². */
const FeaturesSection = ({ formData, updateField }) => (
  <div className="form-section">
    <h2 className="section-title">🏠 Características</h2>

    <div className="form-row">
      {NUMERIC_FIELDS.map((f) => (
        <FormField key={f.name} label={f.label} htmlFor={f.name}>
          <input
            id={f.name}
            type="number"
            value={formData[f.name]}
            onChange={(e) => updateField(f.name, e.target.value)}
            min={f.min}
            max={f.max}
            placeholder={f.placeholder}
            className="form-input"
          />
        </FormField>
      ))}
    </div>
  </div>
);

export default FeaturesSection;
