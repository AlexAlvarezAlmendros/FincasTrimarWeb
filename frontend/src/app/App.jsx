import { Auth0Provider } from '@auth0/auth0-react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from '@/pages/Home';
import Listado from '@/pages/Listado';
import Detalle from '@/pages/Detalle';
import Vender from '@/pages/Vender';
import Contacto from '@/pages/Contacto';
import Admin from '@/pages/Admin';
import RequireAuth from '@/components/RequireAuth';

export default function App() {
  return (
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        scope: "openid profile email read:viviendas write:viviendas read:mensajes write:mensajes"
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/viviendas" element={<Listado />} />
          <Route path="/viviendas/:id" element={<Detalle />} />
          <Route path="/vender" element={<Vender />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route 
            path="/admin" 
            element={
              <RequireAuth roles={["Admin", "Seller"]}>
                <Admin />
              </RequireAuth>
            } 
          />
        </Routes>
      </BrowserRouter>
    </Auth0Provider>
  );
}