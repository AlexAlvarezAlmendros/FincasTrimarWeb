import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { useDashboardStats, useRecentProperties, useRecentMessages } from '../../../hooks/useDashboard';
import { useAdminStats } from '../../../hooks/useAdminStats';
import MetricCard from './MetricCard';
import RecentPropertiesTable from './RecentPropertiesTable';
import RecentMessagesList from './RecentMessagesList';
import LoadingSpinner from '../../common/LoadingSpinner';
import ErrorMessage from '../../common/ErrorMessage';
import './AdminDashboard.css';

/**
 * Componente principal del Dashboard de administración
 * Muestra métricas clave, propiedades recientes, mensajes y acciones rápidas
 */
const AdminDashboard = () => {
  const { user } = useAuth0();
  const { stats, loading, error, refetch } = useDashboardStats();
  const { properties: recentProperties, loading: loadingProperties } = useRecentProperties(4);
  const { messages: recentMessages, loading: loadingMessages } = useRecentMessages(2);
  const { messagesCount } = useAdminStats();

  if (loading) {
    return (
      <div className="dashboard-loading">
        <LoadingSpinner />
        <p>Cargando datos del dashboard...</p>
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

  const { propertyStats } = stats;

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

      {/* Métricas principales — solo datos reales del catálogo */}
      <div className="metrics-grid">
        <MetricCard
          title="Disponibles"
          value={propertyStats.available}
          subtitle="Listas para vender"
          icon="🏠"
          color="green"
        />
        <MetricCard
          title="Reservadas"
          value={propertyStats.reserved}
          subtitle="En proceso de venta"
          icon="🔒"
          color="orange"
        />
        <MetricCard
          title="Vendidas"
          value={propertyStats.sold}
          subtitle="Operaciones cerradas"
          icon="✅"
          color="blue"
        />
        <MetricCard
          title="Total propiedades"
          value={propertyStats.total}
          subtitle="En el sistema"
          icon="📋"
          color="purple"
        />
        <Link to="/admin/mensajes" className="metric-card-link">
          <MetricCard
            title="Mensajes pendientes"
            value={messagesCount}
            subtitle="Nuevos y en curso"
            icon="✉️"
            color="orange"
          />
        </Link>
      </div>


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
            {loadingProperties ? (
              <LoadingSpinner />
            ) : (
              <RecentPropertiesTable properties={recentProperties} />
            )}
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
            {loadingMessages ? (
              <LoadingSpinner />
            ) : (
              <RecentMessagesList messages={recentMessages} />
            )}
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
          <Link to="/admin/mensajes" className="quick-action-card">
            <div className="action-icon">📬</div>
            <h3>Revisar Mensajes</h3>
            <p>Responder consultas pendientes</p>
          </Link>
          <Link to="/admin/analiticas" className="quick-action-card">
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