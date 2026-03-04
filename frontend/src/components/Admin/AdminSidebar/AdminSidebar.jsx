import React from 'react';
import { Link } from 'react-router-dom';
import './AdminSidebar.css';
import { useUserRoles } from '../../../hooks/useUserRoles';

const AdminSidebar = ({ collapsed, onToggle, currentPath, draftsCount = 0, messagesCount = 0 }) => {
  const { isAdmin } = useUserRoles();

  const menuItems = [
    {
      id: 'dashboard',
      path: '/admin',
      icon: '📊',
      label: 'Dashboard',
      exact: true
    },
    {
      id: 'captacion-direct',
      path: '/admin/viviendas/captacion',
      icon: '🎯',
      label: 'Captación',
      nonAdminOnly: true
    },
    {
      id: 'properties',
      path: '/admin/viviendas',
      icon: '🏠',
      label: 'Gestionar Viviendas',
      badge: null,
      adminOnly: true,
      submenu: [
        { path: '/admin/viviendas', label: 'Todas las viviendas', icon: '📋' },
        { path: '/admin/viviendas/crear', label: 'Crear nueva', icon: '➕' },
        { path: '/admin/viviendas/borradores', label: 'Borradores', icon: '📝', badge: draftsCount > 0 ? draftsCount.toString() : null },
        { path: '/admin/viviendas/captacion', label: 'Captación', icon: '🎯' }
      ]
    },
    {
      id: 'messages',
      path: '/admin/mensajes',
      icon: '💬',
      label: 'Mensajes',
      badge: messagesCount > 0 ? messagesCount.toString() : null,
      adminOnly: true
    },
    {
      id: 'users',
      path: '/admin/usuarios',
      icon: '👥',
      label: 'Usuarios',
      adminOnly: true,
      submenu: [
        { path: '/admin/usuarios', label: 'Gestionar usuarios', icon: '⚙️' },
        { path: '/admin/usuarios/roles', label: 'Roles y permisos', icon: '🔐' }
      ]
    },
    {
      id: 'settings',
      path: '/admin/configuracion',
      icon: '⚙️',
      label: 'Configuración',
      adminOnly: true,
      submenu: [
        { path: '/admin/configuracion/general', label: 'General', icon: '🔧' },
        { path: '/admin/configuracion/email', label: 'Email', icon: '📧' },
        { path: '/admin/configuracion/integraciones', label: 'Integraciones', icon: '🔗' }
      ]
    }
  ];

  const isActiveItem = (item) => {
    if (item.exact) {
      return currentPath === item.path;
    }
    return currentPath.startsWith(item.path);
  };

  const hasActiveSubmenu = (item) => {
    return item.submenu?.some(subItem => currentPath.startsWith(subItem.path));
  };

  return (
    <aside className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Logo & Toggle */}
      <div className="sidebar-header">
        <Link to="/" className="sidebar-logo" title="Ir al sitio web">
          {collapsed ? (
            <span className="logo-icon">🏠</span>
          ) : (
            <div className="logo-full">
              <span className="logo-icon">🏠</span>
              <span className="logo-text">Fincas Trimar</span>
            </div>
          )}
        </Link>
        
        <button 
          className="sidebar-toggle"
          onClick={onToggle}
          aria-label={collapsed ? 'Expandir menú' : 'Contraer menú'}
          title={collapsed ? 'Expandir menú' : 'Contraer menú'}
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav" role="navigation" aria-label="Navegación de administración">
        <ul className="nav-list">
          {menuItems.filter(item => {
              if (item.adminOnly) return isAdmin;
              if (item.nonAdminOnly) return !isAdmin;
              return true;
            }).map(item => (
            <li key={item.id} className="nav-item">
              <Link
                to={item.path}
                className={`nav-link ${isActiveItem(item) || hasActiveSubmenu(item) ? 'active' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <span className="nav-icon" role="img" aria-label={item.label}>
                  {item.icon}
                </span>
                {!collapsed && (
                  <>
                    <span className="nav-text">{item.label}</span>
                    {item.badge && (
                      <span className="nav-badge" aria-label={`${item.badge} elementos`}>
                        {item.badge}
                      </span>
                    )}
                    {item.submenu && (
                      <span className={`nav-arrow ${hasActiveSubmenu(item) ? 'expanded' : ''}`}>
                        ▼
                      </span>
                    )}
                  </>
                )}
              </Link>
              
              {/* Submenu */}
              {!collapsed && item.submenu && hasActiveSubmenu(item) && (
                <ul className="nav-submenu">
                  {item.submenu.map(subItem => (
                    <li key={subItem.path} className="nav-subitem">
                      <Link
                        to={subItem.path}
                        className={`nav-sublink ${currentPath === subItem.path ? 'active' : ''}`}
                      >
                        <span className="nav-subicon" role="img">
                          {subItem.icon}
                        </span>
                        <span className="nav-subtext">{subItem.label}</span>
                        {subItem.badge && (
                          <span className="nav-subbadge" aria-label={`${subItem.badge} elementos`}>
                            {subItem.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="sidebar-footer">
          <div className="sidebar-version">
            <span className="version-label">Panel Admin</span>
            <span className="version-number">v1.1.0</span>
          </div>
        </div>
      )}
    </aside>
  );
};

export default AdminSidebar;