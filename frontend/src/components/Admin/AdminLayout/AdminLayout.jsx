import React, { useState } from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { useUserRoles } from '../../../hooks/useUserRoles';
import { useAdminStats } from '../../../hooks/useAdminStats';
import AdminSidebar from '../AdminSidebar/AdminSidebar';
import AdminHeader from '../AdminHeader/AdminHeader';
import './AdminLayout.css';

const AdminLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user, logout } = useAuth0();
  const location = useLocation();
  const { isAdmin } = useUserRoles();
  const { messagesCount } = useAdminStats();

  // Solo AdminTrimar tiene acceso al panel de administración
  if (!isAdmin) {
    console.warn('❌ Acceso denegado al panel de administración');
    return <Navigate to="/" replace />;
  }

  const handleSidebarToggle = () => {
    setSidebarCollapsed(prev => !prev);
  };

  const handleLogout = () => {
    logout({ 
      logoutParams: { 
        returnTo: window.location.origin 
      } 
    });
  };

  return (
    <div className={`admin-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Sidebar */}
      <AdminSidebar
        collapsed={sidebarCollapsed}
        onToggle={handleSidebarToggle}
        currentPath={location.pathname}
        messagesCount={messagesCount}
      />
      
      {/* Main Content Area */}
      <div className="admin-main">
        {/* Header */}
        <AdminHeader 
          user={user}
          onMenuToggle={handleSidebarToggle}
          onLogout={handleLogout}
          sidebarCollapsed={sidebarCollapsed}
        />
        
        {/* Content */}
        <main className="admin-content">
          <div className="admin-content-inner">
            <Outlet />
          </div>
        </main>
      </div>
      
      {/* Mobile Overlay */}
      {!sidebarCollapsed && (
        <div 
          className="mobile-overlay" 
          onClick={handleSidebarToggle}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default AdminLayout;