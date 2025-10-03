import React from 'react';
import './MetricCard.css';

/**
 * Componente de tarjeta de métrica para el dashboard
 * @param {string} title - Título de la métrica
 * @param {string|number} value - Valor principal de la métrica
 * @param {string} subtitle - Subtítulo descriptivo
 * @param {string} icon - Icono emoji para la métrica
 * @param {Object} trend - Objeto con información de tendencia
 * @param {string} color - Color temático de la tarjeta
 */
const MetricCard = ({ title, value, subtitle, icon, trend, color = 'blue' }) => {
  return (
    <div className={`metric-card metric-card--${color}`}>
      <div className="metric-header">
        <div className="metric-info">
          <h3 className="metric-title">{title}</h3>
          <div className="metric-value">{value}</div>
          {subtitle && <p className="metric-subtitle">{subtitle}</p>}
        </div>
        <div className="metric-icon">
          <span>{icon}</span>
        </div>
      </div>
      {trend && (
        <div className={`metric-trend metric-trend--${trend.type}`}>
          <span className="trend-indicator">
            {trend.type === 'up' ? '↗️' : trend.type === 'down' ? '↘️' : '➡️'}
          </span>
          <span className="trend-text">{trend.text}</span>
        </div>
      )}
    </div>
  );
};

export default MetricCard;