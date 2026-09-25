/**
 * Componente de editor de texto enriquecido usando React Quill
 */
import { useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './RichTextEditor.css';

/**
 * `id` se pone en el contenedor (enfocable con tabIndex -1) para que el
 * formulario pueda hacer scroll/foco al campo cuando falla la validación.
 * onChange recibe (html, delta, source): source !== 'user' indica un cambio
 * programático (p. ej. Quill normalizando el HTML cargado).
 */
const RichTextEditor = ({ 
  id,
  value, 
  onChange, 
  onBlur,
  placeholder = "Escribe la descripción de la vivienda...", 
  disabled = false,
  error = null,
  height = "200px"
}) => {
  
  // Barra de herramientas mínima: lo justo para un anuncio inmobiliario
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        ['bold', 'italic'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['link'],
        ['clean'],
      ],
    },
    clipboard: {
      // Limpiar formato al pegar para evitar estilos no deseados
      matchVisual: false
    }
  }), []);

  // Formatos permitidos
  const formats = ['bold', 'italic', 'list', 'bullet', 'link'];

  return (
    <div
      id={id}
      tabIndex={id ? -1 : undefined}
      className={`rich-text-editor ${error ? 'error' : ''} ${disabled ? 'disabled' : ''}`}
    >
      <ReactQuill
        value={value || ''}
        onChange={onChange}
        onBlur={onBlur}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        readOnly={disabled}
        style={{
          height: height,
        }}
        theme="snow"
      />
      {error && (
        <div className="rich-text-error" role="alert">
          <FontAwesomeIcon icon="circle-exclamation" />
          {error}
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;