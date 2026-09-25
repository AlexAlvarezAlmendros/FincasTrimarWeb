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

// Opción vacía: permite dejar (o volver a dejar) el campo sin valor
const EMPTY_OPTION = { value: '', label: 'Sin especificar' };

const PLANTA_TIPOS = ['Piso', 'Ático', 'Dúplex'];

/** Sección "Clasificación": tipo visible; estado/planta/anuncio/venta plegados. */
const ClassificationSection = ({ formData, updateField }) => {
  // El tipo de vivienda solo aplica a «Vivienda», y la planta a pisos, áticos y dúplex
  const showTipoVivienda = formData.tipoInmueble === TipoInmueble.VIVIENDA;
  const showPlanta = showTipoVivienda && PLANTA_TIPOS.includes(formData.tipoVivienda);

  // Al cambiar a un tipo que no es vivienda se limpian los campos que dejan de aplicar
  const handleTipoInmuebleChange = (value) => {
    updateField('tipoInmueble', value);
    if (value !== TipoInmueble.VIVIENDA) {
      updateField('tipoVivienda', '');
      updateField('planta', '');
    }
  };

  const handleTipoViviendaChange = (value) => {
    updateField('tipoVivienda', value);
    if (!PLANTA_TIPOS.includes(value)) updateField('planta', '');
  };

  return (
    <div className="form-section">
      <h2 className="section-title">🏷️ Clasificación</h2>

      <div className="form-row">
        <FormField label="Tipo de Inmueble" htmlFor="tipoInmueble">
          <CustomSelect
            value={formData.tipoInmueble}
            onChange={handleTipoInmuebleChange}
            options={toOptions(TipoInmueble)}
            placeholder="Seleccionar tipo de inmueble"
          />
        </FormField>

        {showTipoVivienda && (
          <FormField label="Tipo de Vivienda" htmlFor="tipoVivienda">
            <CustomSelect
              value={formData.tipoVivienda}
              onChange={handleTipoViviendaChange}
              options={toOptions(TipoVivienda)}
              placeholder="Seleccionar tipo de vivienda"
            />
          </FormField>
        )}
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
                options={[EMPTY_OPTION, ...toOptions(Estado)]}
                placeholder="Seleccionar estado"
              />
            </FormField>

            {showPlanta && (
              <FormField label="Planta" htmlFor="planta">
                <CustomSelect
                  value={formData.planta}
                  onChange={(v) => updateField('planta', v)}
                  options={[EMPTY_OPTION, ...toOptions(Planta)]}
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
};

export default ClassificationSection;
