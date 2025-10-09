import React from 'react';
import { useDashboardStats } from '../../hooks/useDashboard';
import StatCard from '../../components/dashboard/StatCard';
import MonthlyChart from '../../components/dashboard/MonthlyChart';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import './Dashboard.css';

/**
 * Página principal del dashboard administrativo
 * Muestra estadísticas generales y métricas de la aplicación
 */
const Dashboard = () => {
  const { stats, loading, error, refetch } = useDashboardStats();

  if (loading) {
    return (
      <div className="dashboard-loading">
        <LoadingSpinner />
        <p>Cargando estadísticas del dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <ErrorMessage 
          message="Error al cargar las estadísticas del dashboard"
          onRetry={refetch}
        />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="dashboard-empty">
        <p>No hay datos disponibles</p>
      </div>
    );
  }

  const { propertyStats, monthlySales, summary } = stats;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p className="dashboard-subtitle">
          Resumen ejecutivo y métricas principales
        </p>
      </div>

      {/* Tarjetas de estadísticas principales */}
      <div className="stats-grid">
        <StatCard
          title="Propiedades Disponibles"
          value={propertyStats.available}
          icon="🏠"
          color="green"
          description="Propiedades listas para vender"
        />
        
        <StatCard
          title="Propiedades Reservadas"
          value={propertyStats.reserved}
          icon="🔒"
          color="yellow"
          description="Propiedades en proceso"
        />
        
        <StatCard
          title="Propiedades Vendidas"
          value={propertyStats.sold}
          icon="✅"
          color="blue"
          description="Ventas completadas"
        />
        
        <StatCard
          title="Total Propiedades"
          value={propertyStats.total}
          icon="📊"
          color="purple"
          description="Total en el sistema"
        />
      </div>

      {/* Métricas de resumen */}
      <div className="summary-grid">
        <div className="summary-card">
          <h3>Ingresos Totales</h3>
          <p className="summary-value">
            {new Intl.NumberFormat('es-ES', {
              style: 'currency',
              currency: 'EUR'
            }).format(summary.totalRevenue || 0)}
          </p>
        </div>

        <div className="summary-card">
          <h3>Promedio Mensual</h3>
          <p className="summary-value">
            {new Intl.NumberFormat('es-ES', {
              style: 'currency',
              currency: 'EUR'
            }).format(summary.averageMonthlyRevenue || 0)}
          </p>
        </div>

        <div className="summary-card">
          <h3>Mejor Mes</h3>
          <p className="summary-value">
            {summary.bestMonth ? summary.bestMonth.monthName : 'N/A'}
          </p>
          {summary.bestMonth && (
            <p className="summary-detail">
              {new Intl.NumberFormat('es-ES', {
                style: 'currency',
                currency: 'EUR'
              }).format(summary.bestMonth.revenue)}
            </p>
          )}
        </div>

        <div className="summary-card">
          <h3>Crecimiento</h3>
          <p className={`summary-value ${summary.growthRate >= 0 ? 'positive' : 'negative'}`}>
            {summary.growthRate > 0 ? '+' : ''}{summary.growthRate.toFixed(1)}%
          </p>
          <p className="summary-detail">
            Comparado con el mes anterior
          </p>
        </div>
      </div>

      {/* Gráfico de ventas mensuales */}
      <div className="chart-section">
        <h2>Ventas Mensuales</h2>
        <div className="chart-container">
          <MonthlyChart data={monthlySales} />
        </div>
      </div>

      {/* Información adicional */}
      <div className="info-grid">
        <div className="info-card">
          <h3>Estado de Publicación</h3>
          <div className="info-stats">
            <div className="info-stat">
              <span className="info-label">Publicadas:</span>
              <span className="info-value">{propertyStats.published}</span>
            </div>
            <div className="info-stat">
              <span className="info-label">No Publicadas:</span>
              <span className="info-value">
                {propertyStats.total - propertyStats.published}
              </span>
            </div>
          </div>
        </div>

        <div className="info-card">
          <h3>Distribución por Estado</h3>
          <div className="info-stats">
            <div className="info-stat">
              <span className="info-label">Disponibles:</span>
              <span className="info-value">{propertyStats.available}</span>
            </div>
            <div className="info-stat">
              <span className="info-label">Reservadas:</span>
              <span className="info-value">{propertyStats.reserved}</span>
            </div>
            <div className="info-stat">
              <span className="info-label">Vendidas:</span>
              <span className="info-value">{propertyStats.sold}</span>
            </div>
            <div className="info-stat">
              <span className="info-label">Cerradas:</span>
              <span className="info-value">{propertyStats.closed}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;