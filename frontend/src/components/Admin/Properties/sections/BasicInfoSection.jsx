import React, { useMemo } from 'react';
import FormField from '../../../common/FormField';
import RichTextEditor from '../../../RichTextEditor/index.js';
import { htmlToPlainText } from '../../../../utils/htmlText.js';
import {
  DESCRIPTION_MAX,
  SHORT_DESCRIPTION_MAX,
  ValidationRules,
} from '../../../../types/viviendaForm.types.js';

/**
 * Sección "Información básica" del formulario de vivienda:
 * nombre, precio, descripción breve y descripción completa (todos con error inline).
 */
const BasicInfoSection = ({
  formData,
  handleFieldChange,
  handleFieldBlur,
  errors,
  touched,
  disabled,
}) => {
  // Mismo cálculo (texto plano) que la validación de la descripción
  const descriptionLength = useMemo(
    () => htmlToPlainText(formData.description).length,
    [formData.description]
  );

  const fieldError = (field) => (touched[field] && errors[field]) || null;

  // La descripción avisa en vivo al pasarse del límite, sin esperar al blur
  const descriptionError =
    fieldError('description') ||
    (descriptionLength > DESCRIPTION_MAX
      ? ValidationRules.description.validate(formData.description)
      : null);

  return (
    <div className="form-section">
      <h2 className="section-title">📋 Información Básica</h2>

      <div className="form-row">
        <FormField
          label="Nombre de la vivienda"
          htmlFor="name"
          required
          error={fieldError('name')}
        >
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            onBlur={() => handleFieldBlur('name')}
            placeholder="Ej: Piso céntrico con terraza en el centro"
            aria-invalid={Boolean(fieldError('name'))}
            className={`form-input ${fieldError('name') ? 'error' : ''}`}
          />
        </FormField>

        <FormField
          label="Precio"
          htmlFor="price"
          required
          error={fieldError('price')}
        >
          <input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) => handleFieldChange('price', e.target.value)}
            onBlur={() => handleFieldBlur('price')}
            placeholder="250000"
            min="0"
            aria-invalid={Boolean(fieldError('price'))}
            className={`form-input ${fieldError('price') ? 'error' : ''}`}
          />
        </FormField>
      </div>

      <div className="form-row">
        <FormField
          label="Descripción breve"
          htmlFor="shortDescription"
          error={fieldError('shortDescription')}
          help={`Máximo ${SHORT_DESCRIPTION_MAX} caracteres (${(formData.shortDescription || '').length}/${SHORT_DESCRIPTION_MAX})`}
        >
          <textarea
            id="shortDescription"
            value={formData.shortDescription}
            onChange={(e) => handleFieldChange('shortDescription', e.target.value)}
            onBlur={() => handleFieldBlur('shortDescription')}
            placeholder="Amplio y luminoso piso en zona céntrica"
            maxLength={SHORT_DESCRIPTION_MAX}
            rows="2"
            aria-invalid={Boolean(fieldError('shortDescription'))}
            className={`form-textarea ${fieldError('shortDescription') ? 'error' : ''}`}
          />
        </FormField>
      </div>

      <div className="form-row">
        {/* El error lo pinta el propio editor (así no se duplica); el contador sigue visible */}
        <FormField
          label="Descripción completa"
          htmlFor="description"
          help={`Editor de texto enriquecido - Máximo ${DESCRIPTION_MAX} caracteres (${descriptionLength}/${DESCRIPTION_MAX})`}
        >
          <RichTextEditor
            id="description"
            value={formData.description}
            // Siempre se guarda el cambio: descartarlo desincroniza Quill y revierte
            // lo escrito. Los cambios no hechos por el usuario (Quill normalizando el
            // HTML cargado) no cuentan como edición.
            onChange={(content, _delta, source) =>
              handleFieldChange('description', content, { programmatic: source !== 'user' })
            }
            onBlur={() => handleFieldBlur('description')}
            placeholder="Describe en detalle las características de la vivienda, su estado, orientación, servicios cercanos..."
            disabled={disabled}
            height="250px"
            error={descriptionError}
          />
        </FormField>
      </div>
    </div>
  );
};

export default BasicInfoSection;
