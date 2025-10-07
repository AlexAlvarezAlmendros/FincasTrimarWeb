import React from 'react';
import DOMPurify from 'dompurify';

/**
 * Componente para renderizar HTML de forma segura
 * Sanitiza el contenido HTML para prevenir XSS
 * 
 * @param {Object} props
 * @param {string} props.content - Contenido HTML a renderizar
 * @param {string} props.className - Clases CSS adicionales
 * @param {string} props.tag - Tag HTML a usar (default: 'div')
 * @param {Object} props.allowedTags - Tags permitidos (opcional)
 */
const SafeHtmlRenderer = ({ 
  content, 
  className = '', 
  tag: Tag = 'div',
  allowedTags = null,
  ...props 
}) => {
  // Configuración de sanitización
  const sanitizeConfig = {
    ALLOWED_TAGS: allowedTags || [
      'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'span',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li',
      'a', 'blockquote',
      'img', 'figure', 'figcaption',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'hr', 'div'
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel', 'title',
      'alt', 'src', 'width', 'height',
      'class', 'id', 'style'
    ],
    ALLOW_DATA_ATTR: false,
    FORBID_SCRIPT: true,
    FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover']
  };

  // Sanitizar el contenido HTML
  const sanitizedContent = React.useMemo(() => {
    if (!content) return '';
    
    try {
      return DOMPurify.sanitize(content, sanitizeConfig);
    } catch (error) {
      console.error('Error sanitizing HTML content:', error);
      // Fallback: mostrar texto plano
      return content.replace(/<[^>]*>/g, '');
    }
  }, [content]);

  // Si no hay contenido, no renderizar nada
  if (!sanitizedContent) {
    return null;
  }

  return (
    <Tag
      className={`safe-html ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      {...props}
    />
  );
};

export default SafeHtmlRenderer;