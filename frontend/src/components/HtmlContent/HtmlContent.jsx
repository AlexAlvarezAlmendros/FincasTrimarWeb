/**
 * Componente para mostrar contenido HTML de manera segura
 * Usado para mostrar descripciones con formato rich text
 */
import './HtmlContent.css';

const HtmlContent = ({ content, className = '', maxLines = null }) => {
  if (!content) {
    return null;
  }

  // Sanitización básica del HTML (remover scripts y elementos peligrosos)
  const sanitizeHtml = (html) => {
    // Lista de tags permitidos
    const allowedTags = [
      'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'strike', 's',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li',
      'blockquote', 'code', 'pre',
      'a'
    ];

    // Crear un elemento temporal para limpiar el HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // Remover elementos no permitidos
    const allElements = tempDiv.querySelectorAll('*');
    allElements.forEach(element => {
      if (!allowedTags.includes(element.tagName.toLowerCase())) {
        // Reemplazar el elemento con su contenido de texto
        element.replaceWith(element.textContent || '');
      } else {
        // Limpiar atributos peligrosos
        const attributes = [...element.attributes];
        attributes.forEach(attr => {
          if (attr.name.startsWith('on') || 
              attr.name === 'style' ||
              attr.name === 'class' ||
              (attr.name === 'href' && !attr.value.match(/^(https?:\/\/|mailto:)/))) {
            element.removeAttribute(attr.name);
          }
        });
      }
    });

    return tempDiv.innerHTML;
  };

  const sanitizedContent = sanitizeHtml(content);

  return (
    <div 
      className={`html-content ${className} ${maxLines ? 'line-clamp' : ''}`}
      style={maxLines ? { '--max-lines': maxLines } : {}}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
};

export default HtmlContent;