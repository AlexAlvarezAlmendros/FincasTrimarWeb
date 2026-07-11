import React from 'react';
import FormField from '../../../common/FormField';
import CustomSelect from '../../../CustomSelect/CustomSelect.jsx';
import {
  TipoInmueble,
  TipoVivienda,
  Estado,
  Planta,
  TipoAnuncio,
  EstadoVenta,
} from '../../../../types/vivienda.types.js';

const toOptions = (enumObj) => Object.values(enumObj).map((v) => ({ value: v, label: v }));

const PLANTA_TIPOS = ['Piso', 'Ático', 'Dúplex'];

/** Sección "Clasificación": tipo visible; estado/planta/anuncio/venta plegados. */
const ClassificationSection = ({ formData, updateField }) => (
  <div className="form-section">
    <h2 className="section-title">🏷️ Clasificación</h2>

    <div className="form-row">
      <FormField label="Tipo de Inmueble" htmlFor="tipoInmueble">
        <CustomSelect
          value={formData.tipoInmueble}
          onChange={(v) => updateField('tipoInmueble', v)}
          options={toOptions(TipoInmueble)}
          placeholder="Seleccionar tipo de inmueble"
        />
      </FormField>

      <FormField label="Tipo de Vivienda" htmlFor="tipoVivienda">
        <CustomSelect
          value={formData.tipoVivienda}
          onChange={(v) => updateField('tipoVivienda', v)}
          options={toOptions(TipoVivienda)}
          placeholder="Seleccionar tipo de vivienda"
        />
      </FormField>
    </div>

    <details className="form-accordion">
      <summary className="form-accordion__summary">
        Clasificación avanzada (estado, planta, tipo de anuncio…)
      </summary>
      <div className="form-accordion__body">
        <div className="form-row">
          <FormField label="Estado" htmlFor="estado">
            <CustomSelect
              value={formData.estado}
              onChange={(v) => updateField('estado', v)}
              options={toOptions(Estado)}
              placeholder="Seleccionar estado"
            />
          </FormField>

          {PLANTA_TIPOS.includes(formData.tipoVivienda) && (
            <FormField label="Planta" htmlFor="planta">
              <CustomSelect
                value={formData.planta}
                onChange={(v) => updateField('planta', v)}
                options={toOptions(Planta)}
                placeholder="Seleccionar planta"
              />
            </FormField>
          )}
        </div>

        <div className="form-row">
          <FormField label="Tipo de Anuncio" htmlFor="tipoAnuncio">
            <CustomSelect
              value={formData.tipoAnuncio}
              onChange={(v) => updateField('tipoAnuncio', v)}
              options={toOptions(TipoAnuncio)}
              placeholder="Seleccionar tipo de anuncio"
            />
          </FormField>

          <FormField label="Estado de Venta" htmlFor="estadoVenta">
            <CustomSelect
              value={formData.estadoVenta}
              onChange={(v) => updateField('estadoVenta', v)}
              options={toOptions(EstadoVenta)}
              placeholder="Seleccionar estado de venta"
            />
          </FormField>
        </div>
      </div>
    </details>
  </div>
);

export default ClassificationSection;
