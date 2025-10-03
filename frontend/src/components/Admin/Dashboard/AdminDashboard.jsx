import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import useDashboardData from '../../../hooks/admin/useDashboardData';
import MetricCard from './MetricCard';
import RecentPropertiesTable from './RecentPropertiesTable';
import RecentMessagesList from './RecentMessagesList';
import SalesSummary from './SalesSummary';
import './AdminDashboard.css';

/**
 * Componente principal del Dashboard de administración
 * Muestra métricas clave, propiedades recientes, mensajes y acciones rápidas
 */
const AdminDashboard = () => {
  const { user } = useAuth0();
  const { metrics, recentProperties, recentMessages, loading } = useDashboardData();

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner" aria-label="Cargando datos"></div>
        <p>Cargando datos del dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Welcome Section */}
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1 className="dashboard-title">
            ¡Bienvenido de vuelta, {user?.name?.split(' ')[0] || 'Usuario'}! 👋
          </h1>
          <p className="dashboard-subtitle">
            Aquí tienes un resumen de la actividad de tu inmobiliaria
          </p>
        </div>
        <div className="header-actions">
          <Link to="/admin/viviendas/crear" className="btn btn--primary">
            <span>➕</span> Nueva vivienda
          </Link>
        </div>
      </div>

      {/* Primary Metrics Cards */}
      <div className="metrics-grid">
        <MetricCard
          title="Ventas del Mes"
          value={`${(metrics.salesThisMonth / 1000).toFixed(0)}K€`}
          subtitle={`${metrics.propertiesSold} propiedades vendidas`}
          icon="💰"
          trend={{ 
            type: metrics.salesThisMonth > metrics.salesLastMonth ? 'up' : 'down', 
            text: `${((metrics.salesThisMonth - metrics.salesLastMonth) / metrics.salesLastMonth * 100).toFixed(1)}% vs mes anterior` 
          }}
          color="green"
        />
        <MetricCard
          title="Propiedades Vendidas"
          value={metrics.propertiesSold}
          subtitle="Este mes"
          icon="✅"
          trend={{ type: 'up', text: '+2 vs mes anterior' }}
          color="blue"
        />
        <MetricCard
          title="Reservadas"
          value={metrics.propertiesReserved}
          subtitle="En proceso de venta"
          icon="🔒"
          trend={{ type: 'up', text: '+1 esta semana' }}
          color="orange"
        />
        <MetricCard
          title="Disponibles"
          value={metrics.propertiesAvailable}
          subtitle="Listas para vender"
          icon="🏠"
          trend={{ type: 'up', text: '+5 esta semana' }}
          color="purple"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="secondary-metrics">
        <MetricCard
          title="Pendientes de Captar"
          value={metrics.propertiesPendingCapture}
          subtitle="Necesitan seguimiento"
          icon="📋"
          trend={{ type: 'down', text: '-3 desde la semana pasada' }}
          color="yellow"
        />
        <MetricCard
          title="Mensajes Pendientes"
          value={metrics.pendingMessages}
          subtitle="Requieren respuesta"
          icon="💬"
          trend={{ type: 'down', text: '-2 desde ayer' }}
          color="red"
        />
        <MetricCard
          title="Precio Promedio"
          value={`${(metrics.averagePrice / 1000).toFixed(0)}K€`}
          subtitle="Propiedades activas"
          icon="📊"
          trend={{ type: 'up', text: '+2.5% este trimestre' }}
          color="indigo"
        />
        <MetricCard
          title="Visitas Totales"
          value={metrics.totalViews.toLocaleString()}
          subtitle="Este mes"
          icon="👁️"
          trend={{ type: 'up', text: '+12% vs mes anterior' }}
          color="teal"
        />
      </div>

      {/* Sales Summary */}
      <SalesSummary metrics={metrics} />

      {/* Main Content Grid */}
      <div className="dashboard-content-grid">
        {/* Recent Properties */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">Propiedades Recientes</h2>
            <Link to="/admin/viviendas" className="section-link">
              Ver todas →
            </Link>
          </div>
          <div className="section-content">
            <RecentPropertiesTable properties={recentProperties} />
          </div>
        </div>

        {/* Recent Messages */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">Mensajes Recientes</h2>
            <Link to="/admin/mensajes" className="section-link">
              Ver todos →
            </Link>
          </div>
          <div className="section-content">
            <RecentMessagesList messages={recentMessages} />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h2 className="section-title">Acciones Rápidas</h2>
        <div className="quick-actions-grid">
          <Link to="/admin/viviendas/crear" className="quick-action-card">
            <div className="action-icon">➕</div>
            <h3>Crear Vivienda</h3>
            <p>Añadir nueva propiedad al catálogo</p>
          </Link>
          <Link to="/admin/mensajes/pendientes" className="quick-action-card">
            <div className="action-icon">📬</div>
            <h3>Revisar Mensajes</h3>
            <p>Responder consultas pendientes</p>
          </Link>
          <Link to="/admin/estadisticas" className="quick-action-card">
            <div className="action-icon">📊</div>
            <h3>Ver Estadísticas</h3>
            <p>Análisis detallado de rendimiento</p>
          </Link>
          <Link to="/admin/configuracion" className="quick-action-card">
            <div className="action-icon">⚙️</div>
            <h3>Configuración</h3>
            <p>Ajustar preferencias del sistema</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;