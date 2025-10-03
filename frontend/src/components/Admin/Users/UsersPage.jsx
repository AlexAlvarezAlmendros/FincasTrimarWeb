import React from 'react';
import './UsersPage.css';

const UsersPage = () => {
  return (
    <div className="users-page">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Gestión de Usuarios</h1>
          <p className="page-subtitle">
            Administra usuarios, roles y permisos del sistema
          </p>
        </div>
      </div>

      <div className="content-placeholder">
        <div className="placeholder-icon">👥</div>
        <h2>Página en construcción</h2>
        <p>
          La gestión de usuarios estará disponible próximamente. 
          Aquí podrás administrar usuarios, asignar roles y configurar permisos.
        </p>
      </div>
    </div>
  );
};

export default UsersPage;