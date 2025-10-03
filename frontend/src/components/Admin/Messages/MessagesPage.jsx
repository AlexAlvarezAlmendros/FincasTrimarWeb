import React from 'react';
import './MessagesPage.css';

const MessagesPage = () => {
  return (
    <div className="messages-page">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Gestión de Mensajes</h1>
          <p className="page-subtitle">
            Administra los mensajes de contacto de los clientes
          </p>
        </div>
      </div>

      <div className="content-placeholder">
        <div className="placeholder-icon">💬</div>
        <h2>Página en construcción</h2>
        <p>
          La gestión de mensajes estará disponible próximamente. 
          Aquí podrás ver y responder a las consultas de los clientes.
        </p>
      </div>
    </div>
  );
};

export default MessagesPage;