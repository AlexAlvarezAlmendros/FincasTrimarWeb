import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Componente de imagen optimizado con lazy loading y alt descriptivo
 * Mejora SEO y performance (Core Web Vitals)
 */
const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  className = '',
  loading = 'lazy',
  priority = false,
  onLoad,
  onError,
  placeholder = '/img/placeholder.jpg',
  objectFit = 'cover'
}) => {
  const [imageSrc, setImageSrc] = useState(priority ? src : placeholder);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    // Si la imagen tiene prioridad, no usar lazy loading
    if (priority) {
      setImageSrc(src);
      return;
    }

    // Intersection Observer para lazy loading manual (más control)
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !imageLoaded) {
            setImageSrc(src);
          }
        });
      },
      {
        rootMargin: '50px', // Comenzar a cargar 50px antes de que sea visible
        threshold: 0.01
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        observer.unobserve(imgRef.current);
      }
    };
  }, [src, priority, imageLoaded]);

  const handleLoad = (e) => {
    setImageLoaded(true);
    if (onLoad) onLoad(e);
  };

  const handleError = (e) => {
    setImageError(true);
    setImageSrc(placeholder);
    if (onError) onError(e);
  };

  // Generar alt descriptivo si no se proporciona
  const generateAlt = () => {
    if (alt) return alt;
    
    // Intentar generar un alt desde la URL
    const filename = src.split('/').pop().split('.')[0];
    return filename.replace(/-|_/g, ' ');
  };

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={generateAlt()}
      width={width}
      height={height}
      loading={priority ? 'eager' : loading}
      className={`${className} ${imageLoaded ? 'loaded' : 'loading'} ${imageError ? 'error' : ''}`}
      onLoad={handleLoad}
      onError={handleError}
      style={{
        objectFit,
        transition: 'opacity 0.3s ease-in-out',
        opacity: imageLoaded ? 1 : 0.7
      }}
      // Atributo fetchpriority para imágenes críticas (LCP)
      fetchPriority={priority ? 'high' : 'auto'}
    />
  );
};

OptimizedImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  className: PropTypes.string,
  loading: PropTypes.oneOf(['lazy', 'eager']),
  priority: PropTypes.bool,
  onLoad: PropTypes.func,
  onError: PropTypes.func,
  placeholder: PropTypes.string,
  objectFit: PropTypes.oneOf(['cover', 'contain', 'fill', 'none', 'scale-down'])
};

export default OptimizedImage;
