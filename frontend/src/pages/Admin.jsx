import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../components/Admin/AdminLayout/AdminLayout';
import AdminDashboard from '../components/Admin/Dashboard';

// Importar las nuevas pantallas de viviendas
import PropertiesListPage from '../components/Admin/Properties/PropertiesListPage';
import PropertyCreatePage from '../components/Admin/Properties/PropertyCreatePageNew';
import DraftsPage from '../components/Admin/Properties/DraftsPage';

// Importar otras páginas del admin
import MessagesPage from '../components/Admin/Messages/MessagesPage';
import AnalyticsPage from '../components/Admin/Analytics/AnalyticsPage';
import UsersPage from '../components/Admin/Users/UsersPage';
import SettingsPage from '../components/Admin/Settings/SettingsPage';

// Componentes de prueba temporales
import TestCreateProperty from '../components/TestCreateProperty';
import TestImageUpload from '../components/TestImageUpload';
import TestApiConnection from '../components/TestApiConnection';

// Componente principal que incluye el layout y las rutas
export default function Admin() {
  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<Navigate to="/admin" replace />} />
        
        {/* Rutas de viviendas separadas */}
        <Route path="viviendas" element={<PropertiesListPage />} />
        <Route path="viviendas/crear" element={<PropertyCreatePage />} />
        <Route path="viviendas/borradores" element={<DraftsPage />} />
        <Route path="viviendas/:id/edit" element={<PropertyCreatePage />} />
        
        {/* Rutas de prueba temporales */}
        <Route path="test-create" element={<TestCreateProperty />} />
        <Route path="test-images" element={<TestImageUpload />} />
        <Route path="test-api" element={<TestApiConnection />} />
        
        {/* Otras rutas del admin */}
        <Route path="mensajes" element={<MessagesPage />} />
        <Route path="mensajes/*" element={<MessagesPage />} />
        <Route path="analiticas" element={<AnalyticsPage />} />
        <Route path="usuarios" element={<UsersPage />} />
        <Route path="configuracion" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  );
}
