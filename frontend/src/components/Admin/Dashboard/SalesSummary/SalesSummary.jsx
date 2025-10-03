import React from 'react';
import './SalesSummary.css';

/**
 * Componente de resumen de ventas para el dashboard
 * @param {Object} metrics - Métricas de ventas y rendimiento
 */
const SalesSummary = ({ metrics }) => {
  const {
    totalRevenue,
    averagePrice,
    salesThisMonth
  } = metrics;

  const monthlyTarget = 200000; // Meta mensual en euros
  const progressPercentage = Math.min((salesThisMonth / monthlyTarget) * 100, 100);

  return (
    <div className="sales-summary-section">
      <div className="summary-card">
        <h3>Resumen de Ventas</h3>
        <div className="summary-stats">
          <div className="stat-item">
            <span className="stat-label">Total Ingresos:</span>
            <span className="stat-value">{(totalRevenue / 1000).toFixed(0)}K€</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Precio Medio:</span>
            <span className="stat-value">{(averagePrice / 1000).toFixed(0)}K€</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Objetivo Mes:</span>
            <span className="stat-value">{(monthlyTarget / 1000).toFixed(0)}K€</span>
          </div>
          <div className="progress-bar">
            <div className="progress-label">
              Progreso del mes: {progressPercentage.toFixed(0)}%
            </div>
            <div className="progress-track">
              <div 
                className="progress-fill" 
                style={{ width: `${progressPercentage}%` }}
                role="progressbar"
                aria-valuenow={progressPercentage}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Progreso de ventas: ${progressPercentage.toFixed(0)}%`}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesSummary;