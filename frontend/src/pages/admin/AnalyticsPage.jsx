import React from 'react';
import './AdminPage.css';

const AnalyticsPage = () => (
  <div className="admin-page">
    <div className="page-header">
      <h1>Análisis y Estadísticas</h1>
      <p>Métricas detalladas y reportes de rendimiento</p>
    </div>
    
    <div className="page-content">
      <div className="construction-notice">
        <div className="construction-icon">📊</div>
        <h2>Página en construcción</h2>
        <p>Esta sección proporcionará análisis avanzados de tu inmobiliaria.</p>
        
        <div className="feature-list">
          <h3>Funcionalidades planificadas:</h3>
          <ul>
            <li>📈 Gráficos de ventas mensuales</li>
            <li>🏠 Rendimiento por tipo de propiedad</li>
            <li>📍 Análisis por ubicación</li>
            <li>👥 Comportamiento de usuarios</li>
            <li>📋 Reportes exportables</li>
            <li>🎯 Métricas de conversión</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
);

export default AnalyticsPage;