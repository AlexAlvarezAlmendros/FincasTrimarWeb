import React, { useState, useEffect, useRef } from 'react';
import './AdminHeader.css';

const AdminHeader = ({ user, onMenuToggle, onLogout, sidebarCollapsed }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // Referencia para el dropdown de usuario
  const userMenuRef = useRef(null);

  const handleDropdownToggle = () => {
    setDropdownOpen(prev => !prev);
  };

  // Manejar clics fuera del dropdown y tecla Escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Cerrar dropdown de usuario si se hace clic fuera
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      // Cerrar dropdown al presionar Escape
      if (event.key === 'Escape') {
        setDropdownOpen(false);
      }
    };

    // Solo agregar los listeners si el dropdown está abierto
    if (dropdownOpen) {
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
  }, [dropdownOpen]);

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