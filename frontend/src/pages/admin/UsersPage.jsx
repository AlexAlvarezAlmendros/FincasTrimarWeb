import React from 'react';
import './AdminPage.css';

const UsersPage = () => (
  <div className="admin-page">
    <div className="page-header">
      <h1>Gestión de Usuarios</h1>
      <p>Administra usuarios, roles y permisos</p>
    </div>
    
    <div className="page-content">
      <div className="construction-notice">
        <div className="construction-icon">👥</div>
        <h2>Página en construcción</h2>
        <p>Esta sección permitirá gestionar todos los usuarios del sistema.</p>
        
        <div className="feature-list">
          <h3>Funcionalidades planificadas:</h3>
          <ul>
            <li>👤 Lista de usuarios registrados</li>
            <li>🔐 Gestión de roles y permisos</li>
            <li>✏️ Editar perfiles de usuario</li>
            <li>🚫 Suspender/activar cuentas</li>
            <li>📧 Invitaciones por email</li>
            <li>📊 Actividad de usuarios</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
);

export default UsersPage;