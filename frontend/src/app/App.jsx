import { Auth0Provider } from '@auth0/auth0-react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import Home from '../pages/Home';
import Listado from '../pages/Listado';
import Detalle from '../pages/Detalle';
import Vender from '../pages/Vender';
import Contacto from '../pages/Contacto';
import Admin from '../pages/Admin';
import NotFound from '../pages/NotFound';
import RequireAuth from '../components/RequireAuth';
import AuthWrapper from '../components/Auth/AuthWrapper';

export default function App() {
  return (
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        scope: "openid profile email"
      }}
      cacheLocation="localstorage"
      useRefreshTokens={true}
    >
      <AuthWrapper>
        <BrowserRouter>
          <Routes>
          {/* Todas las rutas principales usan el Layout */}
          {/* Rutas públicas con Layout principal */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="viviendas" element={<Listado />} />
            <Route path="viviendas/:id" element={<Detalle />} />
            <Route path="vender" element={<Vender />} />
            <Route path="contacto" element={<Contacto />} />
          </Route>

          {/* Rutas de administración con su propio Layout */}
          <Route 
            path="/admin/*" 
            element={
              <RequireAuth roles={["Admin", "Seller"]}>
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
  );
}