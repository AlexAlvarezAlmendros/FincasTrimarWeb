import { useState } from 'react';

/**
 * Hook personalizado para obtener estadísticas del panel de administración.
 * Por ahora solo expone el conteo de mensajes (pendiente de endpoint).
 */
export const useAdminStats = () => {
  const [stats] = useState({
    messagesCount: 0,
    loading: false,
    error: null
  });

  return stats;
};
