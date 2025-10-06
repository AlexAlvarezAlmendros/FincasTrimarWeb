/**
 * Componente de editor de texto enriquecido usando React Quill
 */
import { useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './RichTextEditor.css';

const RichTextEditor = ({ 
  value, 
  onChange, 
  placeholder = "Escribe la descripción de la vivienda...", 
  disabled = false,
  error = null,
  height = "200px"
}) => {
  
  // Configuración de la barra de herramientas
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        ['blockquote', 'code-block'],
        ['link'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'align': [] }],
        ['clean']
      ],
    },
    clipboard: {
      // Limpiar formato al pegar para evitar estilos no deseados
      matchVisual: false
    }
  }), []);

  // Formatos permitidos
  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent',
    'blockquote', 'code-block',
    'link',
    'color', 'background',
    'align'
  ];

  return (
    <div className={`rich-text-editor ${error ? 'error' : ''} ${disabled ? 'disabled' : ''}`}>
      <ReactQuill
        value={value || ''}
        onChange={onChange}
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
        <div className="rich-text-error">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;