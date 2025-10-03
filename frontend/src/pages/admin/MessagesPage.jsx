import React from 'react';
import './AdminPage.css';

const MessagesPage = () => (
  <div className="admin-page">
    <div className="page-header">
      <h1>Gestión de Mensajes</h1>
      <p>Administra las consultas y mensajes de los clientes</p>
    </div>
    
    <div className="page-content">
      <div className="construction-notice">
        <div className="construction-icon">🚧</div>
        <h2>Página en construcción</h2>
        <p>Esta sección estará disponible próximamente. Aquí podrás gestionar todos los mensajes de contacto.</p>
        
        <div className="feature-list">
          <h3>Funcionalidades planificadas:</h3>
          <ul>
            <li>📬 Lista de mensajes pendientes</li>
            <li>✅ Marcar mensajes como respondidos</li>
            <li>📊 Filtros por estado y fecha</li>
            <li>📝 Respuestas rápidas</li>
            <li>🔔 Notificaciones automáticas</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
);

export default MessagesPage;