import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Componente que hace scroll al inicio de la página cuando cambia la ruta
 * Se debe incluir dentro de BrowserRouter
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll instantáneo al inicio de la página
    window.scrollTo(0, 0);
    
    // Alternativa con scroll suave (comentada)
    // window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [pathname]);

  return null; // Este componente no renderiza nada
};

export default ScrollToTop;
