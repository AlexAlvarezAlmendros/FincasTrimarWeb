import React, { useMemo } from 'react';
import FormField from '../../../common/FormField';
import RichTextEditor from '../../../RichTextEditor/index.js';
import { getPlainTextFromHtml } from '../../../../utils/htmlText.js';

/**
 * Sección "Información básica" del formulario de vivienda:
 * nombre, precio (validados inline), descripción breve y descripción completa.
 */
const BasicInfoSection = ({
  formData,
  updateField,
  handleFieldChange,
  handleFieldBlur,
  errors,
  touched,
  isCreating,
}) => {
  const descriptionLength = useMemo(
    () => getPlainTextFromHtml(formData.description).length,
    [formData.description]
  );

  return (
    <div className="form-section">
      <h2 className="section-title">📋 Información Básica</h2>

      <div className="form-row">
        <FormField
          label="Nombre de la vivienda"
          htmlFor="name"
          required
          error={touched.name && errors.name}
        >
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            onBlur={() => handleFieldBlur('name')}
            placeholder="Ej: Piso céntrico con terraza en el centro"
            className={`form-input ${touched.name && errors.name ? 'error' : ''}`}
          />
        </FormField>

        <FormField
          label="Precio"
          htmlFor="price"
          required
          error={touched.price && errors.price}
        >
          <input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) => handleFieldChange('price', e.target.value)}
            onBlur={() => handleFieldBlur('price')}
            placeholder="250000"
            min="0"
            className={`form-input ${touched.price && errors.price ? 'error' : ''}`}
          />
        </FormField>
      </div>

      <div className="form-row">
        <FormField
          label="Descripción breve"
          htmlFor="shortDescription"
          help={`Máximo 300 caracteres (${formData.shortDescription.length}/300)`}
        >
          <textarea
            id="shortDescription"
            value={formData.shortDescription}
            onChange={(e) => updateField('shortDescription', e.target.value)}
            placeholder="Amplio y luminoso piso en zona céntrica"
            maxLength="300"
            rows="2"
            className="form-textarea"
          />
        </FormField>
      </div>

      <div className="form-row">
        <FormField
          label="Descripción completa"
          htmlFor="description"
          help={`Editor de texto enriquecido - Máximo 2000 caracteres (${descriptionLength}/2000)`}
        >
          <RichTextEditor
            value={formData.description}
            onChange={(content) => {
              if (getPlainTextFromHtml(content).length <= 2000) {
                updateField('description', content);
              }
            }}
            placeholder="Describe en detalle las características de la vivienda, su estado, orientación, servicios cercanos..."
            disabled={isCreating}
            height="250px"
            error={descriptionLength > 2000 ? 'La descripción no puede exceder 2000 caracteres' : null}
          />
        </FormField>
      </div>
    </div>
  );
};

export default BasicInfoSection;
