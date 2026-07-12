import React from 'react';
import FormField from '../../../common/FormField';

/** Sección "Ubicación": provincia/población visibles, dirección exacta plegada. */
const LocationSection = ({ formData, updateField }) => (
  <div className="form-section">
    <h2 className="section-title">📍 Ubicación</h2>

    <div className="form-row">
      <FormField label="Provincia" htmlFor="provincia">
        <input
          id="provincia"
          type="text"
          value={formData.provincia}
          onChange={(e) => updateField('provincia', e.target.value)}
          placeholder="Ej: Barcelona"
          maxLength="100"
          className="form-input"
        />
      </FormField>

      <FormField label="Población" htmlFor="poblacion">
        <input
          id="poblacion"
          type="text"
          value={formData.poblacion}
          onChange={(e) => updateField('poblacion', e.target.value)}
          placeholder="Ej: Sitges"
          maxLength="100"
          className="form-input"
        />
      </FormField>
    </div>

    <details className="form-accordion">
      <summary className="form-accordion__summary">Dirección exacta (opcional)</summary>
      <div className="form-accordion__body">
        <div className="form-row">
          <FormField label="Calle" htmlFor="calle">
            <input
              id="calle"
              type="text"
              value={formData.calle}
              onChange={(e) => updateField('calle', e.target.value)}
              placeholder="Ej: Carrer del Mar"
              maxLength="100"
              className="form-input"
            />
          </FormField>

          <FormField label="Número" htmlFor="numero">
            <input
              id="numero"
              type="text"
              value={formData.numero}
              onChange={(e) => updateField('numero', e.target.value)}
              placeholder="Ej: 123 A"
              maxLength="20"
              className="form-input"
            />
          </FormField>
        </div>
      </div>
    </details>
  </div>
);

export default LocationSection;
