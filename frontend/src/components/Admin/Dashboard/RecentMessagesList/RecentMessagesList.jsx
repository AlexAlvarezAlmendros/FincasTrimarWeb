import React from 'react';
import { Link } from 'react-router-dom';
import './RecentMessagesList.css';

/**
 * Componente de lista para mostrar mensajes recientes en el dashboard
 * @param {Array} messages - Array de mensajes a mostrar
 */
const RecentMessagesList = ({ messages }) => {
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'Pendiente', class: 'status-pending' },
      responded: { label: 'Respondido', class: 'status-responded' },
      closed: { label: 'Cerrado', class: 'status-closed' }
    };
    
    const config = statusConfig[status] || { label: status, class: 'status-default' };
    
    return <span className={`status-badge ${config.class}`}>{config.label}</span>;
  };

  const formatDate = (dateString) => {
    const now = new Date();
    const messageDate = new Date(dateString);
    const diffInHours = Math.floor((now - messageDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Hace menos de 1 hora';
    if (diffInHours < 24) return `Hace ${diffInHours} horas`;
    return messageDate.toLocaleDateString('es-ES');
  };

  if (!messages || messages.length === 0) {
    return (
      <div className="empty-state">
        <p>No hay mensajes recientes para mostrar</p>
      </div>
    );
  }

  return (
    <div className="message-list">
      {messages.map(message => (
        <div key={message.id} className="message-item">
          <div className="message-header">
            <div className="message-sender">
              <h4 className="sender-name">{message.name}</h4>
              <p className="sender-email">{message.email}</p>
            </div>
            {getStatusBadge(message.status)}
          </div>
          <h5 className="message-subject">{message.subject}</h5>
          <div className="message-meta">
            <span className="message-date">{formatDate(message.createdAt)}</span>
            <Link 
              to={`/admin/mensajes/${message.id}`}
              className="message-link"
            >
              Ver mensaje →
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecentMessagesList;