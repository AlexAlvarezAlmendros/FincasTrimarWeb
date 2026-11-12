import { Outlet } from 'react-router-dom';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import './Layout.css';

/**
 * Layout principal de la aplicación
 * Incluye Header, área de contenido principal y Footer
 */
const Layout = () => {
  return (
    <div className="layout">
      <a href="#contenido" className="skip-link">Saltar al contenido</a>

      {/* Header fijo en la parte superior */}
      <Header />

      {/* Contenido principal con scroll */}
      <main className="main-content" id="contenido">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Layout;
