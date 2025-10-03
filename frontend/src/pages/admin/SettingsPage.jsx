import React from 'react';
import './AdminPage.css';

const SettingsPage = () => (
  <div className="admin-page">
    <div className="page-header">
      <h1>Configuración</h1>
      <p>Ajustes generales del sistema y preferencias</p>
    </div>
    
    <div className="page-content">
      <div className="construction-notice">
        <div className="construction-icon">⚙️</div>
        <h2>Página en construcción</h2>
        <p>Aquí podrás configurar todos los aspectos del sistema.</p>
        
        <div className="feature-list">
          <h3>Funcionalidades planificadas:</h3>
          <ul>
            <li>🏢 Información de la empresa</li>
            <li>📧 Configuración de emails</li>
            <li>🎨 Personalización de la web</li>
            <li>💰 Configuración de precios</li>
            <li>🔔 Notificaciones automáticas</li>
            <li>🔒 Configuración de seguridad</li>
            <li>🌐 Configuración SEO</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
);

export default SettingsPage;