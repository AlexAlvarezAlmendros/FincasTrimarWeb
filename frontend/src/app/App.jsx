import { Auth0Provider } from '@auth0/auth0-react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Layout from '../components/Layout/Layout';
import Home from '../pages/Home';
import Listado from '../pages/Listado';
import Detalle from '../pages/Detalle';
import Vender from '../pages/Vender';
import Contacto from '../pages/Contacto';
import PoliticaPrivacidad from '../pages/PoliticaPrivacidad';
import Cookies from '../pages/Cookies';
import TerminosUso from '../pages/TerminosUso';
import Admin from '../pages/Admin';
import NotFound from '../pages/NotFound';
import RequireAuth from '../components/RequireAuth';
import AuthWrapper from '../components/Auth/AuthWrapper';
import ScrollToTop from '../components/ScrollToTop/ScrollToTop';
import CookieBanner from '../components/CookieBanner/CookieBanner';
import { AUTH0_CONFIG } from '../config/auth0.config';

export default function App() {
  return (
    <HelmetProvider>
      <Auth0Provider
        domain={AUTH0_CONFIG.provider.domain}
        clientId={AUTH0_CONFIG.provider.clientId}
        authorizationParams={{
          redirect_uri: window.location.origin,
          ...AUTH0_CONFIG.authorizationParams
        }}
        cacheLocation={AUTH0_CONFIG.provider.cacheLocation}
        useRefreshTokens={AUTH0_CONFIG.provider.useRefreshTokens}
        useRefreshTokensFallback={AUTH0_CONFIG.provider.useRefreshTokensFallback}
      >
        <AuthWrapper>
          <BrowserRouter>
            <ScrollToTop />
            <CookieBanner />
            <Routes>
            {/* Todas las rutas principales usan el Layout */}
            {/* Rutas públicas con Layout principal */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="viviendas" element={<Listado />} />
              <Route path="viviendas/:id" element={<Detalle />} />
              <Route path="vender" element={<Vender />} />
              <Route path="contacto" element={<Contacto />} />
              <Route path="politica-privacidad" element={<PoliticaPrivacidad />} />
              <Route path="cookies" element={<Cookies />} />
              <Route path="terminos-uso" element={<TerminosUso />} />
            </Route>

            {/* Rutas de administración con su propio Layout */}
            <Route 
              path="/admin/*" 
              element={
                <RequireAuth roles={["AdminTrimar", "SellerTrimar"]}>
                  <Admin />
                </RequireAuth>
              } 
            />
            
            {/* Rutas adicionales sin Layout si es necesario */}
            {/* <Route path="/login" element={<LoginPage />} /> */}
            
            {/* Ruta 404 */}
            <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthWrapper>
      </Auth0Provider>
    </HelmetProvider>
  );
}