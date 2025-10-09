import React from 'react';
import './StatCard.css';

/**
 * Componente de tarjeta de estadística
 * Muestra una métrica con icono, valor y descripción
 */
const StatCard = ({ 
  title, 
  value, 
  icon, 
  color = 'blue', 
  description,
  trend,
  trendValue 
}) => {
  const formatValue = (val) => {
    if (typeof val === 'number') {
      return val.toLocaleString('es-ES');
    }
    return val;
  };

  return (
    <div className={`stat-card stat-card--${color}`}>
      <div className="stat-card__header">
        <div className="stat-card__icon">
          {icon}
        </div>
        {trend && (
          <div className={`stat-card__trend stat-card__trend--${trend}`}>
            <span className="stat-card__trend-value">
              {trend === 'up' ? '↗' : '↘'} {trendValue}
            </span>
          </div>
        )}
      </div>
      
      <div className="stat-card__content">
        <h3 className="stat-card__title">{title}</h3>
        <p className="stat-card__value">
          {formatValue(value)}
        </p>
        {description && (
          <p className="stat-card__description">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

export default StatCard;