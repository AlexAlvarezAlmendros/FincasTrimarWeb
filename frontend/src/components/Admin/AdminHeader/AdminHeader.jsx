import React, { useState, useEffect, useRef } from 'react';
import './AdminHeader.css';

const AdminHeader = ({ user, onMenuToggle, onLogout, sidebarCollapsed }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  // Referencias para los dropdowns
  const userMenuRef = useRef(null);
  const notificationRef = useRef(null);

  const notifications = [
    {
      id: 1,
      type: 'message',
      title: 'Nuevo mensaje de contacto',
      description: 'Juan Pérez pregunta sobre el piso en Igualada',
      time: 'Hace 5 min',
      unread: true
    },
    {
      id: 2,
      type: 'property',
      title: 'Vivienda publicada',
      description: 'Chalet en Sant Cugat ahora está visible',
      time: 'Hace 1 hora',
      unread: true
    },
    {
      id: 3,
      type: 'system',
      title: 'Backup completado',
      description: 'Copia de seguridad realizada correctamente',
      time: 'Hace 2 horas',
      unread: false
    }
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleDropdownToggle = () => {
    setDropdownOpen(prev => !prev);
    setNotificationsOpen(false);
  };

  const handleNotificationsToggle = () => {
    setNotificationsOpen(prev => !prev);
    setDropdownOpen(false);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'message': return '💬';
      case 'property': return '🏠';
      case 'system': return '⚙️';
      default: return '🔔';
    }
  };

  // Manejar clics fuera de los dropdowns y tecla Escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Cerrar dropdown de usuario si se hace clic fuera
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      
      // Cerrar dropdown de notificaciones si se hace clic fuera
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      // Cerrar dropdowns al presionar Escape
      if (event.key === 'Escape') {
        setDropdownOpen(false);
        setNotificationsOpen(false);
      }
    };

    // Solo agregar los listeners si algún dropdown está abierto
    if (dropdownOpen || notificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [dropdownOpen, notificationsOpen]);

  return (
    <header className="admin-header">
      <div className="header-left">
        {/* Mobile Menu Toggle */}
        <button 
          className="mobile-menu-toggle"
          onClick={onMenuToggle}
          aria-label="Alternar menú de navegación"
        >
          ☰
        </button>
        
        {/* Page Title - Dynamic based on route */}
        <div className="page-breadcrumb">
          <h1 className="page-title">Panel de Administración</h1>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li><a href="/admin">Inicio</a></li>
              <li className="current">Dashboard</li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="header-right">
        {/* Notifications */}
        <div className="notification-container" ref={notificationRef}>
          <button 
            className={`notification-btn ${notificationsOpen ? 'active' : ''}`}
            onClick={handleNotificationsToggle}
            aria-label={`Notificaciones${unreadCount > 0 ? ` (${unreadCount} sin leer)` : ''}`}
          >
            <span className="notification-icon">🔔</span>
            {unreadCount > 0 && (
              <span className="notification-badge" aria-label={`${unreadCount} notificaciones sin leer`}>
                {unreadCount}
              </span>
            )}
          </button>
          
          {notificationsOpen && (
            <div className="notification-dropdown">
              <div className="dropdown-header">
                <h3>Notificaciones</h3>
                <button className="mark-all-read">Marcar todas como leídas</button>
              </div>
              
              <div className="notification-list">
                {notifications.map(notification => (
                  <div 
                    key={notification.id} 
                    className={`notification-item ${notification.unread ? 'unread' : ''}`}
                  >
                    <div className="notification-icon-wrapper">
                      <span className="notification-type-icon">
                        {getNotificationIcon(notification.type)}
                      </span>
                    </div>
                    <div className="notification-content">
                      <h4 className="notification-title">{notification.title}</h4>
                      <p className="notification-description">{notification.description}</p>
                      <span className="notification-time">{notification.time}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="dropdown-footer">
                <a href="/admin/notificaciones">Ver todas las notificaciones</a>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="user-menu" ref={userMenuRef}>
          <button 
            className={`user-btn ${dropdownOpen ? 'active' : ''}`}
            onClick={handleDropdownToggle}
            aria-label="Menú de usuario"
            aria-expanded={dropdownOpen}
          >
            <div className="user-info">
              {!sidebarCollapsed && (
                <div className="user-details">
                  <span className="user-name">{user?.name || 'Usuario'}</span>
                  <span className="user-role">Administrador</span>
                </div>
              )}
              <div className="user-avatar">
                {user?.picture ? (
                  <img src={user.picture} alt={user.name} />
                ) : (
                  <span className="avatar-placeholder">👤</span>
                )}
              </div>
              <span className="dropdown-arrow">▼</span>
            </div>
          </button>

          {dropdownOpen && (
            <div className="user-dropdown">
              <div className="dropdown-header">
                <div className="user-profile">
                  <div className="profile-avatar">
                    {user?.picture ? (
                      <img src={user.picture} alt={user.name} />
                    ) : (
                      <span className="avatar-placeholder">👤</span>
                    )}
                  </div>
                  <div className="profile-info">
                    <h4>{user?.name || 'Usuario'}</h4>
                    <p>{user?.email}</p>
                    <span className="user-badge">Administrador</span>
                  </div>
                </div>
              </div>
              
              <div className="dropdown-menu">
                <a href="/admin/perfil" className="dropdown-item">
                  <span className="item-icon">👤</span>
                  <span>Mi perfil</span>
                </a>
                <a href="/admin/configuracion" className="dropdown-item">
                  <span className="item-icon">⚙️</span>
                  <span>Configuración</span>
                </a>
                <a href="/admin/ayuda" className="dropdown-item">
                  <span className="item-icon">❓</span>
                  <span>Ayuda</span>
                </a>
                <div className="dropdown-divider"></div>
                <button onClick={onLogout} className="dropdown-item logout-btn">
                  <span className="item-icon">🚪</span>
                  <span>Cerrar sesión</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;