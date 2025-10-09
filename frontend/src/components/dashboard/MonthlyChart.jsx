import React from 'react';
import './MonthlyChart.css';

/**
 * Componente de gráfico de ventas mensuales
 * Muestra un gráfico de barras simple con CSS
 */
const MonthlyChart = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="monthly-chart-empty">
        <p>No hay datos de ventas disponibles</p>
      </div>
    );
  }

  // Calcular valores máximos para escalar las barras
  const maxSales = Math.max(...data.map(item => item.sales || 0));
  const maxRevenue = Math.max(...data.map(item => item.revenue || 0));

  // Función para obtener la altura de la barra como porcentaje
  const getBarHeight = (value, max) => {
    if (max === 0) return 0;
    return Math.max((value / max) * 100, 2); // Mínimo 2% para visibilidad
  };

  // Formatear nombre del mes
  const formatMonthName = (monthName) => {
    if (!monthName) return '';
    const parts = monthName.split(' ');
    return parts[0]; // Solo el nombre del mes
  };

  return (
    <div className="monthly-chart">
      <div className="monthly-chart__legend">
        <div className="monthly-chart__legend-item">
          <div className="monthly-chart__legend-color monthly-chart__legend-color--sales"></div>
          <span>Ventas</span>
        </div>
        <div className="monthly-chart__legend-item">
          <div className="monthly-chart__legend-color monthly-chart__legend-color--revenue"></div>
          <span>Ingresos</span>
        </div>
      </div>

      <div className="monthly-chart__container">
        <div className="monthly-chart__bars">
          {data.map((item, index) => (
            <div key={item.month} className="monthly-chart__bar-group">
              <div className="monthly-chart__bars-container">
                {/* Barra de ventas */}
                <div
                  className="monthly-chart__bar monthly-chart__bar--sales"
                  style={{
                    height: `${getBarHeight(item.sales, maxSales)}%`
                  }}
                  title={`Ventas: ${item.sales}`}
                >
                  {item.sales > 0 && (
                    <span className="monthly-chart__bar-value">
                      {item.sales}
                    </span>
                  )}
                </div>

                {/* Barra de ingresos */}
                <div
                  className="monthly-chart__bar monthly-chart__bar--revenue"
                  style={{
                    height: `${getBarHeight(item.revenue, maxRevenue)}%`
                  }}
                  title={`Ingresos: ${new Intl.NumberFormat('es-ES', {
                    style: 'currency',
                    currency: 'EUR'
                  }).format(item.revenue || 0)}`}
                >
                  {item.revenue > 0 && (
                    <span className="monthly-chart__bar-value">
                      €{(item.revenue / 1000).toFixed(0)}k
                    </span>
                  )}
                </div>
              </div>

              {/* Label del mes */}
              <div className="monthly-chart__label">
                {formatMonthName(item.monthName)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Información adicional */}
      <div className="monthly-chart__info">
        <div className="monthly-chart__totals">
          <div className="monthly-chart__total">
            <span className="monthly-chart__total-label">Total Ventas:</span>
            <span className="monthly-chart__total-value">
              {data.reduce((sum, item) => sum + (item.sales || 0), 0)}
            </span>
          </div>
          <div className="monthly-chart__total">
            <span className="monthly-chart__total-label">Total Ingresos:</span>
            <span className="monthly-chart__total-value">
              {new Intl.NumberFormat('es-ES', {
                style: 'currency',
                currency: 'EUR'
              }).format(data.reduce((sum, item) => sum + (item.revenue || 0), 0))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyChart;