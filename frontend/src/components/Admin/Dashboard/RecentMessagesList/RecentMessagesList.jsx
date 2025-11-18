import React from 'react';
import { Link } from 'react-router-dom';
import './RecentMessagesList.css';

/**
 * Componente de lista para mostrar mensajes recientes en el dashboard
 * @param {Array} messages - Array de mensajes a mostrar
 */
const RecentMessagesList = ({ messages = [] }) => {
  const getStatusBadge = (estado) => {
    const statusConfig = {
      'Nuevo': { label: 'Nuevo', class: 'status-nuevo' },
      'EnCurso': { label: 'En Curso', class: 'status-encurso' },
      'Cerrado': { label: 'Cerrado', class: 'status-cerrado' }
    };
    
    const config = statusConfig[estado] || { label: estado, class: 'status-default' };
    
    return <span className={`status-badge ${config.class}`}>{config.label}</span>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const now = new Date();
    const messageDate = new Date(dateString);
    const diffInHours = Math.floor((now - messageDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Hace menos de 1 hora';
    if (diffInHours < 24) return `Hace ${diffInHours} horas`;
    
    return messageDate.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const truncateText = (text, maxLength = 50) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
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
      {messages.map((message, index) => (
        <div key={message.id || `message-${index}`} className="message-item">
          <div className="message-header">
            <div className="message-sender">
              <h4 className="sender-name">{message.nombre}</h4>
              <p className="sender-email">{message.email}</p>
            </div>
            {getStatusBadge(message.estado)}
          </div>
          <h5 className="message-subject">
            {message.asunto || 'Sin asunto'}
          </h5>
          <p className="message-preview">
            {truncateText(message.descripcion)}
          </p>
          <div className="message-meta">
            <span className="message-date">{formatDate(message.fecha)}</span>
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