import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../components/Admin/AdminLayout/AdminLayout';
import RequireAuth from '../components/RequireAuth';
import AdminDashboard from '../components/Admin/Dashboard';
import { useUserRoles } from '../hooks/useUserRoles';

// Importar las nuevas pantallas de viviendas
import PropertiesListPage from '../components/Admin/Properties/PropertiesListPage';
import PropertyCreatePage from '../components/Admin/Properties/PropertyCreatePage';
import DraftsPage from '../components/Admin/Properties/DraftsPage';
import CaptacionPage from '../components/Admin/Properties/CaptacionPage';

// Importar otras páginas del admin
import MessagesPage from '../components/Admin/Messages/MessagesPage';
import AnalyticsPage from '../components/Admin/Analytics/AnalyticsPage';
import UsersPage from '../components/Admin/Users/UsersPage';
import SettingsPage from '../components/Admin/Settings/SettingsPage';

// Redirige al dashboard solo si es admin; captador/seller van directo a captación
const DashboardIndex = () => {
  const { isAdmin } = useUserRoles();
  if (!isAdmin) return <Navigate to="/admin/viviendas/captacion" replace />;
  return <AdminDashboard />;
};

const adminOnly = (element) => (
  <RequireAuth roles={['AdminTrimar']}>{element}</RequireAuth>
);

// Componente principal que incluye el layout y las rutas
export default function Admin() {
  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<DashboardIndex />} />
        <Route path="dashboard" element={<Navigate to="/admin" replace />} />
        
        {/* Captación: accesible para todos (captador, seller, admin) */}
        <Route path="viviendas/captacion" element={<CaptacionPage />} />

        {/* Resto de viviendas: solo admin */}
        <Route path="viviendas" element={adminOnly(<PropertiesListPage />)} />
        <Route path="viviendas/crear" element={adminOnly(<PropertyCreatePage />)} />
        <Route path="viviendas/borradores" element={adminOnly(<DraftsPage />)} />
        <Route path="viviendas/:id/edit" element={adminOnly(<PropertyCreatePage />)} />
        
        {/* Otras rutas: solo admin */}
        <Route path="mensajes" element={adminOnly(<MessagesPage />)} />
        <Route path="mensajes/*" element={adminOnly(<MessagesPage />)} />
        <Route path="analiticas" element={adminOnly(<AnalyticsPage />)} />
        <Route path="usuarios" element={adminOnly(<UsersPage />)} />
        <Route path="configuracion" element={adminOnly(<SettingsPage />)} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  );
}
