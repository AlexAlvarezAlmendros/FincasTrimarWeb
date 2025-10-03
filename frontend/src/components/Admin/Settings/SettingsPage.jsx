import React from 'react';
import './SettingsPage.css';

const SettingsPage = () => {
  return (
    <div className="settings-page">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Configuración</h1>
          <p className="page-subtitle">
            Ajusta las preferencias y configuraciones del sistema
          </p>
        </div>
      </div>

      <div className="content-placeholder">
        <div className="placeholder-icon">⚙️</div>
        <h2>Página en construcción</h2>
        <p>
          La configuración del sistema estará disponible próximamente. 
          Aquí podrás ajustar preferencias generales, configuraciones de email y integraciones.
        </p>
      </div>
    </div>
  );
};

export default SettingsPage;