import React from 'react';
import './AnalyticsPage.css';

const AnalyticsPage = () => {
  return (
    <div className="analytics-page">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Analíticas</h1>
          <p className="page-subtitle">
            Análisis detallado del rendimiento de tu inmobiliaria
          </p>
        </div>
      </div>

      <div className="content-placeholder">
        <div className="placeholder-icon">📊</div>
        <h2>Página en construcción</h2>
        <p>
          Las analíticas avanzadas estarán disponibles próximamente. 
          Aquí podrás ver métricas detalladas, gráficos de rendimiento y reportes personalizados.
        </p>
      </div>
    </div>
  );
};

export default AnalyticsPage;